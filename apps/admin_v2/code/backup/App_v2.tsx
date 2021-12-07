import React from "react";
import { Admin } from "@webiny/admin/v2";

import "./App.scss";
import { logAdminState } from "./extensions_v2/logAdminState";
import { withComponents } from "./extensions_v2/components";
import { withApolloClient } from "./extensions_v2/apolloClient";
import { withNavigation } from "./extensions_v2/navigation";
import { withDashboard } from "./extensions_v2/dashboard";
import { withWidgets } from "./extensions_v2/widgets";

export const App = () => {
    return (
        <Admin
            modules={[
                logAdminState(),
                withComponents(),
                withApolloClient(),
                withNavigation({ title: "Webiny Enhanced" }),
                withDashboard(),
                withWidgets()
            ]}
        />
    );
};
