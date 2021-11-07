import React, {
    createContext,
    useContext,
    useMemo,
    useState,
    useCallback,
    cloneElement
} from "react";
import { Route, Routes, BrowserRouter } from "react-router-v6";
import { compose } from "./compose";
import { Menu } from "./Menu";
import { Layout } from "~/components/Layout";
import { Navigation } from "~/components/Navigation";
import { Menu as MenuComponent } from "~/components/Menu";

interface ComponentMap {
    [key: string]: React.ComponentType<any>;
}

export interface AdminContextValue {
    components: ComponentMap;
    menus: JSX.Element[];
    routes: JSX.Element[];
    installers: any[];
    providers: any[];
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

const AdminRouter = ({ routes = [] }) => {
    const {
        components: { Dashboard, NotFound }
    } = useAdmin();

    return (
        <Routes>
            {routes.map((route, key) => cloneElement(route, { key }))}
            <Route path="/" element={Dashboard ? <Dashboard /> : <WelcomeScreen />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

const initializeState = ({
    components = {},
    menus = [],
    ...props
}: AdminProps): Required<AdminProps> => {
    return {
        routes: props.routes || [],
        providers: props.providers || [],
        installers: props.installers || [],
        components: {
            ...components,
            Layout: components.Layout || Layout,
            Navigation: components.Navigation || Navigation,
            Menu: components.Menu || MenuComponent
        },
        menus: [...menus, <Menu key="dashboard" text={"Dashboard"} path={"/"} />]
    };
};

interface AdminProps {
    routes: JSX.Element[];
    components?: ComponentMap;
    menus?: JSX.Element[];
    installers?: any[];
    providers?: any[];
}

export const Admin = (props: AdminProps) => {
    const [state, setState] = useState<Required<AdminProps>>(initializeState(props));

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

    const Router = useMemo(() => compose(...state.providers)(AdminRouter), [state.providers]);

    return (
        <AdminContext.Provider value={adminContext}>
            <BrowserRouter>
                <Router routes={state.routes} />
            </BrowserRouter>
        </AdminContext.Provider>
    );
};
