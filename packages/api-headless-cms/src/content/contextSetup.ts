import { CmsContext } from "~/types";
import WebinyError from "@webiny/error";
import { ContextPlugin } from "@webiny/handler";
import {
    CmsParametersPlugin,
    CmsParametersPluginResponse
} from "~/content/plugins/CmsParametersPlugin";

const getParameters = async (context: CmsContext): Promise<CmsParametersPluginResponse> => {
    const plugins = context.plugins.byType<CmsParametersPlugin>(CmsParametersPlugin.type);

    for (const plugin of plugins) {
        const result = await plugin.getParameters(context);
        if (result !== null) {
            return result;
        }
    }
    throw new WebinyError(
        "Could not determine locale and/or type of the CMS.",
        "CMS_LOCALE_AND_TYPE_ERROR"
    );
};

export default () => {
    return new ContextPlugin<CmsContext>(async context => {
        if (context.http?.request?.method === "OPTIONS") {
            return;
        }

        const { type, locale } = await getParameters(context);

        const systemLocale = context.i18n.getLocale(locale);
        if (!systemLocale) {
            throw new WebinyError(`There is no locale "${locale}" in the system.`);
        }

        context.cms = {
            ...((context.cms || {}) as any),
            type,
            locale,
            getLocale: () => systemLocale,
            READ: type === "read",
            PREVIEW: type === "preview",
            MANAGE: type === "manage"
        } as any;
    });
};
