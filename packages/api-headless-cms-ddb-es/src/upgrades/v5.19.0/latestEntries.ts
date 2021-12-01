import WebinyError from "@webiny/error";
import { Client } from "@elastic/elasticsearch";
import { CmsEntry } from "@webiny/api-headless-cms/types";
import { SearchBody as esSearchBody } from "elastic-ts";
import { createLatestType } from "~/operations/entry";

const ES_ITEMS_LIMIT = 1000;

export interface Params {
    elasticsearch: Client;
    index: string;
}

interface CreateElasticsearchQueryParams {
    index: string;
    after?: any;
}
interface CreateElasticsearchQueryResponse {
    index: string;
    body: esSearchBody;
}
const createElasticsearchQuery = (
    params: CreateElasticsearchQueryParams
): CreateElasticsearchQueryResponse => {
    const { index, after } = params;
    return {
        index,
        body: {
            query: {
                bool: {
                    must: [
                        {
                            term: {
                                "__type.keyword": createLatestType()
                            }
                        }
                    ]
                }
            },
            size: ES_ITEMS_LIMIT + 1,
            // eslint-disable-next-line
            search_after: after || undefined
        }
    };
};

export const fetchLatestEntries = async (params: Params): Promise<CmsEntry[]> => {
    const { elasticsearch, index } = params;

    try {
        return await execSearch({ index, elasticsearch }, []);
    } catch (ex) {
        throw new WebinyError(
            `Failed to fetch latest entries from the Elasticsearch.`,
            "LATEST_ENTRIES_ERROR",
            {
                ...(ex.data || {}),
                index
            }
        );
    }
};

interface ExecSearchParams {
    elasticsearch: Client;
    index: string;
    after?: any;
}
const execSearch = async (params: ExecSearchParams, items: CmsEntry[]): Promise<CmsEntry[]> => {
    const { elasticsearch, index, after } = params;
    const response = await elasticsearch.search(createElasticsearchQuery({ index, after }));
    if (!response || !response.body || !response.body.hits) {
        throw new WebinyError(
            `Missing response, body or hits in Elasticsearch result.`,
            "RESPONSE_ERROR",
            {
                response,
                index,
                after
            }
        );
    }
    const { hits } = response.body.hits;

    const entries = hits.map(entry => entry._source);
    const totalEntries = entries.length;
    if (totalEntries === 0) {
        return items;
    }

    const hasMoreItems = totalEntries > ES_ITEMS_LIMIT;
    if (!hasMoreItems) {
        return entries.concat(items);
    }
    /**
     * Remove the last loaded entry so we do not have doubles.
     */
    entries.pop();

    const nextAfter = totalEntries > 0 ? hits[totalEntries - 1].sort : null;
    return execSearch(
        {
            ...params,
            after: nextAfter
        },
        entries.concat(items)
    );
};
