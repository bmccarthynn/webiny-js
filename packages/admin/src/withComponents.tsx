import React from "react";

export const withComponents = components => Component => {
    const WithComponents = ({ children, ...props }) => {
        return (
            <Component {...props} components={{ ...(props.components || {}), ...components }}>
                {children}
            </Component>
        );
    };

    return WithComponents;
};
