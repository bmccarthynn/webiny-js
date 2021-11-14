import React, { Dispatch, SetStateAction, useContext, useEffect, useMemo, useState } from "react";
import { useComponents } from "@webiny/admin/v2";
import { NotFound } from "../../components";
import { Link } from "react-router-v6";

interface Widget {
    id: string;
    component: React.ComponentType<any>;
}

interface DashboardContext {
    widgets: Widget[];
    setWidgets: Dispatch<SetStateAction<Widget[]>>;
}

const DashboardContext = React.createContext<DashboardContext>(null);
DashboardContext.displayName = "DashboardContext";

export const useDashboard = () => {
    return useContext(DashboardContext);
};

export const Dashboard = () => {
    const [{ Layout }] = useComponents();
    const { widgets } = useDashboard();

    return (
        <Layout>
            <h2>Dashboard</h2>
            <Link to={"/random-route"}>Take me somewhere</Link>
            <h3>Widgets</h3>
            {widgets.map((w, i) => React.createElement(w.component, { key: i }))}
        </Layout>
    );
};

export const setupComponents = () => Component => {
    return function ComponentsModule({ children, ...props }) {
        const [, setComponents] = useComponents();
        const [widgets, setWidgets] = useState<Widget[]>([]);

        useEffect(() => {
            setComponents(prev => ({ ...prev, Dashboard, NotFound }));
        }, []);

        const context = useMemo(() => ({ widgets, setWidgets }), [widgets]);

        return (
            <DashboardContext.Provider value={context}>
                <Component {...props}>{children}</Component>
            </DashboardContext.Provider>
        );
    };
};
