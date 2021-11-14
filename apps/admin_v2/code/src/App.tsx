import React from "react";
import { compose, Admin, withComponents } from "@webiny/admin";
import { Dashboard, NotFound, Menu, Navigation } from "./components";
import { withNavigation } from "./extensions/navigation";

import "./App.scss";

// Compose an application
export const App = compose(
    // Define default components
    withComponents({ Dashboard, NotFound, Navigation, Menu }),
    // Add Navigation extension,
    withNavigation({ title: "Webiny" }),
    // Add a GraphQL client
    // withGraphQL({
    //   client: "default apollo client",
    // }),
    Component => {
        return function ABC({ children, ...props }) {
            props.menus = [props.menus[1], props.menus[0]].filter(Boolean);
            props.menus.unshift({ label: "Home" });
            return <Component {...props}>{children}</Component>;
        };
    }
)(Admin);
