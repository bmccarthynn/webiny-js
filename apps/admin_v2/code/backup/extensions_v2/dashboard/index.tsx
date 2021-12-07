import React, { Dispatch, SetStateAction, useContext, useMemo, useState } from "react";
import { useComponents } from "@webiny/admin/v2";
import { Link } from "react-router-v6";
import { useCallback } from "react";

export interface Widget {
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

const CustomDashboard = () => {
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

export const withDashboard = () => Component => {
    return function WithDashboard({ children, ...props }) {
        const [widgets, setWidgets] = useState<Widget[]>([]);
        const [custom, setCustom] = useState(true);

        const context = useMemo(() => ({ widgets, setWidgets }), [widgets]);

        const toggleDashboardComponent = useCallback(() => setCustom(!custom), [custom]);

        const Dashboard = custom ? CustomDashboard : props.components.Dashboard;

        return (
            <DashboardContext.Provider value={context}>
                <button
                    style={{ position: "fixed", zIndex: 100 }}
                    onClick={toggleDashboardComponent}
                >
                    Toggle dashboard
                </button>
                <Component {...props} components={{ ...props.components, Dashboard }}>
                    {children}
                </Component>
            </DashboardContext.Provider>
        );
    };
};
