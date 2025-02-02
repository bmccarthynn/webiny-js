import React from "react";
import styled from "@emotion/styled";
import { Typography } from "@webiny/ui/Typography";
import { Link } from "@webiny/react-router";
import { createNewEntryUrl } from "./createEntryUrl";
import { i18n } from "@webiny/app/i18n";

const t = i18n.ns("app-headless-cms/admin/fields/ref");

const missingEntryLabel = t`If you can't find the intended reference value in the target model,
         please close this dialog and populate the {newEntryLink} in the target model first.`;

const HelpTextTypography = styled(Typography)`
    & {
        display: inline-block;
        color: var(--mdc-theme-text-secondary-on-background) !important;
    }
`;

const MissingEntryHelpText: React.FC<{ refModelId: string }> = ({ refModelId }) => {
    return (
        <HelpTextTypography use={"caption"}>
            {missingEntryLabel({
                newEntryLink: (
                    <Link to={createNewEntryUrl(refModelId)} target={"_blank"}>{t`entry`}</Link>
                )
            })}
        </HelpTextTypography>
    );
};

export default MissingEntryHelpText;
