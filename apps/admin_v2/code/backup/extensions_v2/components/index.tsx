import React from "react";
import { Dashboard, NotFound } from "../../components";

const Button = ({ onClick, children }) => {
    return <button onClick={onClick}>{children}</button>;
};

export const withComponents = () => Component => {
    return function WithComponents({ children, ...props }) {
        return (
            <Component {...props} components={{ ...props.components, Dashboard, NotFound, Button }}>
                {children}
            </Component>
        );
    };
};
