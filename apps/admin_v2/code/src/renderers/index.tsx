import React, { Fragment } from "react";
import { Compose } from "@webiny/admin/v3";
import { MenuItem } from "../Navigation";
import { MenuGroupRenderer } from "./MenuGroupRenderer";
import { MenuSectionItemRenderer } from "./MenuSectionItemRenderer";

export const NavigationRenderers = () => {
    return (
        <Fragment>
            <Compose component={MenuItem} with={MenuGroupRenderer} />
            <Compose component={MenuItem} with={MenuSectionItemRenderer} />
        </Fragment>
    );
};
