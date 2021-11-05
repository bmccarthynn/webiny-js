import React from "react";
import { compose, Admin, withComponents } from "@webiny/admin";
import { Dashboard, NotFound, Menu, Navigation, Layout } from "./components";
import "./App.scss";


// Compose an application
export const App = compose(
    // // Define default components
    withComponents({ Dashboard, NotFound, Layout, Navigation, Menu })
    // // Add a GraphQL client
    // withGraphQL({
    //   client: "default apollo client",
    // }),
)(Admin);
