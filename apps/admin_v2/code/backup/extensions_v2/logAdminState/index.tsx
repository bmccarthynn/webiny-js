import React, { useEffect } from "react";
import { useAdmin } from "@webiny/admin/v2";

const Logger = () => {
    const admin = useAdmin();

    useEffect(() => {
        console.log("Admin context changed", admin);
    }, [admin]);

    return null;
};

export const logAdminState = () => Component => {
    return function LogAdminState({ children, ...props }) {
        props.services = [...(props.services || []), <Logger key={"logger"}/>];
        return <Component {...props}>{children}</Component>;
    };
};
