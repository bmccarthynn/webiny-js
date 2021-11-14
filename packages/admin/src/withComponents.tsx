import React from "react";
import { Layout } from "./components/Layout";

const defaultComponents = {
    Layout
}

export const withComponents = components => Component => {
    const WithComponents = ({ children, ...props }) => {
        return (
            <Component {...props} components={{ ...defaultComponents, ...(props.components || {}), ...components }}>
                {children}
            </Component>
        );
    };

    return WithComponents;
};
