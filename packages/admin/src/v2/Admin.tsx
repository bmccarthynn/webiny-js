import React, {
    createContext,
    useContext,
    useMemo,
    useState,
    useCallback,
    cloneElement
} from "react";
import { Route, Routes, BrowserRouter } from "react-router-v6";
import { Layout } from "~/components/Layout";
import { Navigation } from "~/components/Navigation";
import { Menu as MenuComponent } from "~/components/Menu";
import { compose } from "./compose";
import { ComponentMap } from "~/types";

export interface AdminContext {
    components: ComponentMap;
    setComponents: (setter: (components: ComponentMap) => ComponentMap) => void;
    menus: JSX.Element[];
    routes: JSX.Element[];
    installers: any[];
}

const AdminContext = createContext<AdminContext>(null);
AdminContext.displayName = "AdminContext";

export const useAdmin = () => {
    return useContext(AdminContext);
};


export function useComponents(): [ComponentMap, AdminContext["setComponents"]] {
    const { components, setComponents } = useAdmin();

    return [components, setComponents];
}

const WelcomeScreen = () => {
    return (
        <div
            style={{
                backgroundColor: "#fa5723",
                height: "100vh",
                padding: 20,
                color: "#fff"
            }}
        >
            <h2>Welcome to Webiny Admin app!</h2>
        </div>
    );
};

const initializeState = (props: AdminProps): Required<AdminProps> => {
    return {
        routes: props.routes || [],
        installers: props.installers || [],
        components: props.components,
        menus: props.menus || [],
        services: props.services || []
    };
};

interface AdminProps {
    routes: JSX.Element[];
    components: ComponentMap;
    menus: JSX.Element[];
    installers: any[];
    services: JSX.Element[];
}

interface BootstrapProps {
    modules?: any[];
}

const defaultComponents = {
    Layout,
    Navigation,
    Menu: MenuComponent
};

export const Admin = (props: BootstrapProps) => {
    const Bootstrap = useMemo(() => compose(...props.modules)(App), [props.modules]);

    return <Bootstrap components={defaultComponents} />;
};

const App = (props: AdminProps) => {
    const [state, setState] = useState<Required<AdminProps>>(initializeState(props));

    const { components, routes = [] } = props;
    const { Dashboard, NotFound } = components;

    const setComponents = useCallback(setter => {
        setState(state => ({ ...state, components: setter(state.components) }));
    }, []);

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
            addRoute,
            setComponents
        }),
        [state]
    );

    return (
        <AdminContext.Provider value={adminContext}>
            {state.services}
            <BrowserRouter>
                <Routes>
                    {routes.map((route, key) => cloneElement(route, { key }))}
                    <Route path="/" element={Dashboard ? <Dashboard /> : <WelcomeScreen />} />
                    <Route path="*" element={NotFound ? <NotFound /> : null} />
                </Routes>
            </BrowserRouter>
        </AdminContext.Provider>
    );
};
