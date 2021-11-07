import React from "react";
import { useAdmin } from "@webiny/admin";

export const Layout = ({ children }) => {
    const {
        menus,
        components: { Navigation }
    } = useAdmin();
    return (
        <div>
            <nav>Layout</nav>
            <div style={{ display: "flex" }}>
                <div style={{ flexBasis: 200 }}>
                    <Navigation menus={menus} />
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};
