import React, { useEffect } from "react";
import { useAdmin } from "@webiny/admin/v2";

export const logAdminState = () => Component => {
    return function LogAdminState({ children, ...props }) {
        const admin = useAdmin();

        useEffect(() => {
            console.log("Admin context changed", admin);
        }, [admin]);

        return <Component {...props}>{children}</Component>;
    };
};
