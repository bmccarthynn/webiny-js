import React from "react";
import { makeComposable, MenuData } from "~/v3";

export interface NavigationProps {
    menus: MenuData[];
    children?: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Navigation = makeComposable<NavigationProps>("Navigation", props => {
    return <span>Navigation not implemented!</span>;
});
