import React from "react";
import { Admin, Layout } from "@webiny/admin/v3";
import { NavigationPlugin } from "./Navigation";
import { NavigationRenderers } from "./renderers";
import "./App.scss";

const Dashboard = () => {
    return <Layout>Dashboard</Layout>;
};

const NotFound = () => {
    return <Layout>Not Found</Layout>;
};

export const App = () => {
    return (
        <Admin Dashboard={Dashboard} NotFound={NotFound}>
            <NavigationPlugin />
            <NavigationRenderers />
        </Admin>
    );
};
