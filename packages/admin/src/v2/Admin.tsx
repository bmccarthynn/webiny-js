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
import { compose } from "~/compose";

interface ComponentMap {
    [key: string]: React.ComponentType<any>;
}

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

const initializeState = ({
    components = {},
    menus = [],
    ...props
}: AdminProps): Required<AdminProps> => {
    return {
        routes: props.routes || [],
        installers: props.installers || [],
        components: {
            ...components,
            Layout: components.Layout || Layout,
            Navigation: components.Navigation || Navigation,
            Menu: components.Menu || MenuComponent
        },
        menus: [...menus],
        modules: props.modules || []
    };
};

interface AdminProps {
    routes?: JSX.Element[];
    components?: ComponentMap;
    menus?: JSX.Element[];
    installers?: any[];
    modules?: any[];
}

export const Admin = (props: AdminProps) => {
    const [state, setState] = useState<Required<AdminProps>>(initializeState(props));

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

    const Renderer = useMemo(() => compose(...state.modules)(Aggregator), [state.modules]);

    return (
        <AdminContext.Provider value={adminContext}>
            <Renderer />
        </AdminContext.Provider>
    );
};

const Aggregator = ({ components, routes = [] }) => {
    const { Dashboard, NotFound } = components;

    return (
        <BrowserRouter>
            <Routes>
                {routes.map((route, key) => cloneElement(route, { key }))}
                <Route path="/" element={Dashboard ? <Dashboard /> : <WelcomeScreen />} />
                <Route path="*" element={NotFound ? <NotFound /> : null} />
            </Routes>
        </BrowserRouter>
    );
};
