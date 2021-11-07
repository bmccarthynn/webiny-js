import React from "react";
import { cloneElement } from "react";

export const Navigation = ({ menus }) => {
    return <ul>{menus.map((menu, index) => cloneElement(menu, { key: index }))}</ul>;
};
