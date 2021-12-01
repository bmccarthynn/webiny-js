import { UpgradePlugin } from "@webiny/api-upgrade/types";
import { CmsContext, CmsEntry, CmsModel, CmsModelField } from "@webiny/api-headless-cms/types";
import { HeadlessCmsStorageOperations } from "~/types";
import configurations from "~/configurations";
import { fetchLatestEntries } from "./latestEntries";
import WebinyError from "@webiny/error";
import { queryAll, QueryAllParams } from "@webiny/db-dynamodb/utils/query";
import { createPartitionKey } from "~/operations/entry/keys";
import { PluginsContainer } from "@webiny/plugins";
import { compress } from "@webiny/api-elasticsearch/compression";
import { createLatestType, createPublishedType, createType } from "~/operations/entry";
import lodashOmit from "lodash.omit";
import { cleanupItem } from "@webiny/db-dynamodb/utils/cleanup";
import { prepareEntryToIndex } from "~/helpers";
import { entryFromStorageTransform } from "@webiny/api-headless-cms/content/plugins/utils/entryStorage";
import lodashCloneDeep from "lodash.clonedeep";
import { parseIdentifier } from "@webiny/utils";

const getEntryData = (entry: CmsEntry) => {
    return {
        ...lodashOmit(entry, ["PK", "SK", "published", "latest"]),
        TYPE: createType(),
        __type: createType()
    };
};

const getESLatestEntryData = async (plugins: PluginsContainer, entry: CmsEntry) => {
    return compress(plugins, {
        ...getEntryData(entry),
        latest: true,
        TYPE: createLatestType(),
        __type: createLatestType()
    });
};

const getESPublishedEntryData = async (plugins: PluginsContainer, entry: CmsEntry) => {
    return compress(plugins, {
        ...getEntryData(entry),
        published: true,
        TYPE: createPublishedType(),
        __type: createPublishedType()
    });
};

type DbItem<T> = T & {
    PK: string;
    SK: string | "P" | "L";
    TYPE: string;
    GSI1_PK?: string;
    GSI1_SK?: string;
};

const transformRefFields = (
    fields: CmsModelField[],
    input: Record<string, any>
): Record<string, any> => {
    const output: Record<string, any> = {
        ...input
    };
    /**
     * Go through all the fields received and transform the ref values.
     * We only do the top level because nested object filtering is not supported anyways.
     */
    for (const field of fields) {
        const fieldId = field.fieldId;
        if (!input[fieldId] || field.type !== "ref") {
            continue;
        }
        /**
         * Multiple values ref field
         */
        if (field.multipleValues === true) {
            const value = output[fieldId];
            /**
             * No point in going further if value is not array
             */
            if (Array.isArray(value) === false) {
                continue;
            }
            const values = value.map(ref => {
                const id = ref.id || ref.entryId;
                if (!id) {
                    return null;
                }
                const { id: entryId } = parseIdentifier(id);
                return {
                    modelId: ref.modelId,
                    id,
                    entryId
                };
            });
            output[fieldId] = values.filter(Boolean);
            continue;
        }
        /**
         * Single ref value field.
         */
        const value = output[fieldId];
        const id = value.id || value.entryId;
        const { id: entryId } = parseIdentifier(id);
        output[fieldId] = {
            id,
            entryId,
            modelId: value.modelId
        };
    }
    return output;
};
/**
 * We do not check object fields because filtering is possible only on the top level of the model.
 */
const getReferenceFields = (model: CmsModel): CmsModelField[] => {
    return model.fields.filter(field => {
        return field.type === "ref";
    });
};

export default (): UpgradePlugin<CmsContext> => ({
    type: "api-upgrade",
    name: "api-upgrade-5.18.1",
    app: "headless-cms",
    version: "5.18.1",
    async apply(context): Promise<void> {
        const tenant = context.tenancy.getCurrentTenant().id;
        const locales = context.i18n.getLocales();
        const so = context.cms.storageOperations as HeadlessCmsStorageOperations;

        const entryEntity = so.getEntities().entries;
        const elasticsearchEntryEntity = so.getEntities().entriesEs;

        /**
         * ## STEP 1
         * We need to find all the models.
         */
        const modelResults = await Promise.all<CmsModel[]>(
            locales.map(locale => {
                return so.models.list({
                    where: {
                        tenant,
                        locale: locale.code
                    }
                });
            })
        );
        const models: CmsModel[] = modelResults.reduce((collection, items) => {
            return collection.concat(items);
        }, [] as CmsModel[]);
        /**
         * No need to go further if there are no models.
         */
        if (models.length === 0) {
            return;
        }

        const indexes: Record<string, string> = {};

        const referenceFieldsByModel: Record<string, CmsModelField[]> = {};

        const elasticsearchLatestRecords: CmsEntry[] = [];
        for (const model of models) {
            const refFields = getReferenceFields(model);
            if (refFields.length === 0) {
                continue;
            }

            referenceFieldsByModel[model.modelId] = refFields;

            const { index } = configurations.es({ model });
            if (!!indexes[model.modelId]) {
                continue;
            }

            indexes[model.modelId] = index;

            const results = await fetchLatestEntries({
                elasticsearch: so.elasticsearch,
                index
            });
            elasticsearchLatestRecords.push(...results);
        }
        /**
         * No need to go further if there are no entries.
         */
        if (elasticsearchLatestRecords.length === 0) {
            return;
        }

        /**
         * Now we need to go and get all the existing entries in the DynamoDB table.
         */
        const dynamoDbRecords: DbItem<CmsEntry>[] = [];
        for (const entry of elasticsearchLatestRecords) {
            const queryAllParams: QueryAllParams = {
                partitionKey: createPartitionKey(entry),
                entity: entryEntity,
                options: {
                    gte: " "
                }
            };
            try {
                const items = await queryAll<CmsEntry>(queryAllParams);

                for (const item of items) {
                    dynamoDbRecords.push(item);
                }
            } catch (ex) {
                throw new WebinyError("Message failed querying entry records.", "QUERY_ALL_ERROR", {
                    partitionKey: queryAllParams.partitionKey,
                    entry: entry.id
                });
            }
        }

        const regularBatchItems = [];
        const elasticsearchBatchItems = [];
        /**
         * Then we need to go through all of the entries and upgrade them.
         */
        for (const storageEntry of dynamoDbRecords) {
            if (!storageEntry.PK || !storageEntry.SK) {
                continue;
            }
            const fields = referenceFieldsByModel[storageEntry.modelId];
            if (!fields) {
                console.log(`Could not determine ref fields for model "${storageEntry.modelId}".`);
                continue;
            } else if (fields.length === 0) {
                /**
                 * It should not come to this point.
                 */
                continue;
            }
            storageEntry.values = transformRefFields(fields, storageEntry.values);
            if (storageEntry.SK !== "L" && storageEntry.SK !== "P") {
                regularBatchItems.push(
                    entryEntity.putBatch({
                        ...storageEntry,
                        webinyVersion: context.WEBINY_VERSION
                    })
                );
                continue;
            }

            const index = indexes[storageEntry.modelId];
            if (!index) {
                console.log(
                    `Could not determine index for entry modelId "${storageEntry.modelId}".`
                );
                continue;
            }
            const model = models.find(model => model.modelId === storageEntry.modelId);
            if (!model) {
                console.log(
                    `Could not determine model for entry modelId "${storageEntry.modelId}".`
                );
                continue;
            }
            const rawEntry = await entryFromStorageTransform(
                context,
                model,
                cleanupItem(entryEntity, storageEntry)
            );

            const preparedEntryData = prepareEntryToIndex({
                plugins: context.plugins,
                model,
                entry: lodashCloneDeep(rawEntry),
                storageEntry: lodashCloneDeep(storageEntry)
            });

            let elasticsearchData;
            if (storageEntry.SK === "L") {
                elasticsearchData = getESLatestEntryData(context.plugins, preparedEntryData);
            } else {
                elasticsearchData = getESPublishedEntryData(context.plugins, preparedEntryData);
            }
            elasticsearchBatchItems.push(
                elasticsearchEntryEntity.putBatch({
                    index,
                    PK: storageEntry.PK,
                    SK: storageEntry.SK,
                    data: elasticsearchData
                })
            );
        }
        throw new WebinyError(`We have ${dynamoDbRecords.length} records in DynamoDB.`, "DDB", {
            entries: dynamoDbRecords.map(entry => {
                return {
                    PK: entry.PK,
                    SK: entry.SK
                };
            }),
            elasticsearchBatchItems: elasticsearchBatchItems.length,
            regularBatchItems: regularBatchItems.length
        });
    }
});
