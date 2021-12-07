import React, { ReactElement } from "react";
import { Switch, RouteProps } from "@webiny/react-router";

interface SortRoutesProps {
    children: React.ReactNode[];
}

export const SortRoutes = ({ children }: SortRoutesProps) => {
    // We cannot call `sort` on the array returned by the `plugins.byType` call - it is read-only.
    const routes = (children as ReactElement<RouteProps>[]).filter(Boolean).sort((a, b) => {
        const pathA = (a.props.path as string) || "*";
        const pathB = (b.props.path as string) || "*";

        // This will sort paths at the very bottom of the list
        if (pathA === "/" && pathB === "*") {
            return -1;
        }

        // This will push * and / to the bottom of the list
        if (pathA === "*" || pathA === "/") {
            return 1;
        }

        // This will push * and / to the bottom of the list
        if (["*", "/"].includes(pathB)) {
            return -1;
        }

        return 0;
    });

    return (
        <Switch>
            {routes.map(route => React.cloneElement(route, { key: route.key }))}
        </Switch>
    );
};
