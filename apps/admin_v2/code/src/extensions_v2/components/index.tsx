import React from "react";
import { Dashboard, NotFound } from "../../components";

export const withComponents = () => Component => {
    return function WithComponents({ children, ...props }) {
        return (
            <Component {...props} components={{ ...props.components, Dashboard, NotFound }}>
                {children}
            </Component>
        );
    };
};
