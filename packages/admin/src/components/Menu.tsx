import React from "react";
import { cloneElement, Children } from "react";
import { Link } from "react-router-v6";

export const Menu = ({ text, path, children }) => {
    const menus = Children.toArray(children) as React.ReactElement<any>[];
    return (
        <li>
            {path ? <Link to={path}>{text}</Link> : text}
            {children ? (
                <ul>{menus.map((menu, index) => cloneElement(menu, { key: index }))}</ul>
            ) : null}
        </li>
    );
};
