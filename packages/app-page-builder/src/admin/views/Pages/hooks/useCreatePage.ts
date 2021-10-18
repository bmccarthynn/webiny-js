import { useCallback } from "react";
import { useMutation } from "@apollo/react-hooks";
import { CREATE_PAGE } from "~/admin/graphql/pages";
import * as GQLCache from "~/admin/views/Pages/cache";
import { useSnackbar } from "@webiny/app-admin/hooks/useSnackbar";
import { useRouter } from "@webiny/react-router";

const useCreatePage = ({ setLoadingLabel, clearLoadingLabel, closeDialog }) => {
    const [create] = useMutation(CREATE_PAGE);
    const { showSnackbar } = useSnackbar();
    const { history } = useRouter();

    const createPageMutation = useCallback(async ({ slug: category }) => {
        try {
            setLoadingLabel();
            const res = await create({
                variables: { category },
                update(cache, { data }) {
                    if (data.pageBuilder.createPage.error) {
                        return;
                    }

                    GQLCache.addPageToListCache(cache, data.pageBuilder.createPage.data);
                }
            });

            clearLoadingLabel();
            closeDialog();

            const { error, data } = res.data.pageBuilder.createPage;
            if (error) {
                showSnackbar(error.message);
            } else {
                history.push(`/page-builder/editor/${encodeURIComponent(data.id)}`);
            }
        } catch (e) {
            showSnackbar(e.message);
        }
    }, []);

    return {
        createPageMutation
    };
};
export default useCreatePage;
