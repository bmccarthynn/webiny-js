import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { Route, Routes, BrowserRouter, Outlet } from "react-router-v6";
import { compose } from "./compose";
import { Menu } from "./Menu";

interface ComponentMap {
    [key: string]: React.ComponentType<any>;
}

export interface AdminContextValue {
    components: ComponentMap;
    /* Menus for main navigation */
    menus: typeof Menu[];
    routes: typeof Route[];
    clients: {
        /* GraphQL clients */
    };
    installers: any[];
    /* Application installers */
    providers: any[];
    /* React context providers */
}

const AdminContext = createContext<AdminContextValue>(null);
AdminContext.displayName = "AdminContext";

export const useAdmin = () => {
    return useContext(AdminContext);
};

const WelcomeScreen = () => {
    return (
        <div
            style={{
                height: "100vh",
                padding: 20,
                color: "white"
            }}
        >
            <h2>Welcome to Webiny Admin app!</h2>
        </div>
    );
};

const I18N = () => {
    return <Outlet />;
};

const AdminRouter = ({ routes }) => {
    const {
        components: { Dashboard, NotFound }
    } = useAdmin();

    return (
        <Routes>
            <Route path="/" element={Dashboard ? <Dashboard /> : <WelcomeScreen />} />
            <Route path={"i18n"}>
                <Route path={""} element={<h2>Locales Index</h2>} />
                <Route path={"locales"} element={<h2>Locales List</h2>} />
                <Route path={"locales/:id"} element={<h2>Locales Form</h2>} />
            </Route>
            <Route path="i18n">
                <Route path={"settings"} element={<h2>Locales Settings</h2>} />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export const Admin = ({
    routes = [],
    menus = [],
    components = {},
    clients = {},
    installers = {},
    providers = []
}) => {
    const [state, setState] = useState({
        components,
        clients,
        routes,
        menus: [...menus, <Menu key="dashboard" text={"Dashboard"} path={"/"} />],
        installers: [],
        providers: []
    });

    const addMenu = useCallback((...menus) => {
        setState(state => {
            return {
                ...state,
                menus: [...state.menus, ...menus]
            };
        });
    }, []);

    const addRoute = useCallback(route => {
        setState(state => {
            return {
                ...state,
                routes: [...state.routes, route]
            };
        });
    }, []);

    const adminContext = useMemo(
        () => ({
            ...state,
            addMenu,
            addRoute
        }),
        [state]
    );

    return (
        <AdminContext.Provider value={adminContext}>
            <BrowserRouter>
                <AdminRouter routes={state.routes} />
            </BrowserRouter>
        </AdminContext.Provider>
    );
};
