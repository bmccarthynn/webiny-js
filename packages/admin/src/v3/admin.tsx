import React, {
    createContext,
    useContext,
    useMemo,
    useState,
    useCallback,
    cloneElement,
    useEffect,
    FunctionComponentElement,
    ComponentType,
    ReactElement
} from "react";
import { Route, BrowserRouter, RouteProps } from "@webiny/react-router";
import { set } from "dot-prop-immutable";
import { NotFound as DefaultNotFound } from "./index";
import { SortRoutes as SortRoutes } from "./components/SortRoutes";

export const compose = (...fns) => {
    return Base => {
        return fns.reduceRight((Component, hoc) => hoc(Component), Base);
    };
};

const AdminContext = createContext(null);
AdminContext.displayName = "AdminContext";

export const useAdmin = () => {
    return useContext(AdminContext);
};

export const Extension = ({ element }) => {
    const { addExtension } = useAdmin();

    useEffect(() => {
        addExtension(element);
    }, [element]);
    return null;
};

export const Provider = ({ component }) => {
    const { addProvider } = useAdmin();

    useEffect(() => {
        addProvider(component);
    }, []);

    return null;
};

export interface HigherOrderComponent {
    (Component: React.ComponentType<any>): React.ComponentType<any>;
}

export interface ComposeProps {
    component: React.ComponentType<any> & { original: React.ComponentType<any> };
    with: HigherOrderComponent | HigherOrderComponent[];
}

export const Compose = (props: ComposeProps) => {
    const { addComponentWrappers } = useAdmin();

    useEffect(() => {
        if (typeof props.component.original === "undefined") {
            console.warn(
                `You must make your component "<${props.component.displayName}>" composable, by using the makeComposable() function!`
            );

            return;
        }

        const hocs = Array.isArray(props.with) ? props.with : [props.with];
        addComponentWrappers(props.component.original, hocs);
    }, []);

    return null;
};

const useComponent = Component => {
    const { wrappers } = useAdmin();
    const recipe = wrappers.get(Component);

    if (!recipe) {
        return Component;
    }

    return recipe.component;
};

export function makeComposable<TProps>(name, Component: React.ComponentType<TProps>) {
    const Proxy = (props: TProps & { children?: unknown }) => {
        const WrappedComponent = useComponent(Component);

        return <WrappedComponent {...props}>{props.children}</WrappedComponent>;
    };

    Component.displayName = name;

    Proxy.original = Component;
    Proxy.displayName = `Proxy<${name}>`;

    return Proxy;
}

export const Routes = ({ children }) => {
    const { addRoute } = useAdmin();

    useEffect(() => {
        React.Children.forEach(children, child => {
            addRoute(child);
        });
    }, []);

    return null;
};

const MenuContext = createContext(null);
MenuContext.displayName = "MenuContext";

const useMenu = () => {
    return useContext(MenuContext);
};

export interface MenuProps {
    id: string;
    label: string;
    path?: string;
    icon?: JSX.Element;
    onClick?: () => void;
    testId?: string;
    children?: React.ReactNode | React.ReactNode[];
}

export interface MenuData extends MenuProps {
    children: MenuData[];
}

export const Menu = ({ children, ...props }: MenuProps) => {
    const [state, setState] = useState({ ...props, children: [] });
    const admin = useAdmin();
    const menu = useMenu();

    useEffect(() => {
        if (menu) {
            menu.setMenu(state.id, state);
        } else {
            admin.setMenu(state.id, state);
        }
    }, [state]);

    const context = {
        setMenu(id, props) {
            setState(menu => {
                const childIndex = menu.children.findIndex(ch => ch.id === id);
                if (childIndex === -1) {
                    return {
                        ...menu,
                        children: [...menu.children, { ...props }]
                    };
                }
                return {
                    ...menu,
                    children: set(menu.children, childIndex, curr => ({ ...curr, ...props }))
                };
            });
        }
    };

    if (!children) {
        return null;
    }

    return <MenuContext.Provider value={context}>{children}</MenuContext.Provider>;
};

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

interface State {
    routes: ReactElement<RouteProps>[];
    installers: any[];
    menus: MenuData[];
    extensions: JSX.Element[];
    wrappers: Map<
        ComponentType<any>,
        { component: ComponentType<any>; wrappers: HigherOrderComponent[] }
    >;
    providers: JSX.Element[];
}

interface AdminProps {
    Dashboard?: React.ComponentType<any>;
    NotFound?: React.ComponentType<any>;
    children?: React.ReactNode | React.ReactNode[];
}

export const Admin = ({ Dashboard, NotFound, children }: AdminProps) => {
    const [state, setState] = useState<State>({
        routes: [
            <Route key="/" path="/" exact>
                {Dashboard ? <Dashboard /> : <WelcomeScreen />}
            </Route>,
            <Route key={"*"} path="*">
                {NotFound ? <NotFound /> : <DefaultNotFound />}
            </Route>
        ],
        installers: [],
        menus: [],
        extensions: [],
        wrappers: new Map(),
        providers: []
    });

    const setMenu = useCallback((id, menu) => {
        setState(state => {
            const index = state.menus.findIndex(m => m.id === id);

            return {
                ...state,
                menus:
                    index > -1
                        ? [...state.menus.slice(0, index), menu, ...state.menus.slice(index + 1)]
                        : [...state.menus, menu]
            };
        });
    }, []);

    const addRoute = useCallback((route: FunctionComponentElement<RouteProps>) => {
        setState(state => {
            return {
                ...state,
                routes: [...state.routes, route]
            };
        });
    }, []);

    const addProvider = useCallback(component => {
        setState(state => {
            return {
                ...state,
                providers: [...state.providers, component]
            };
        });
    }, []);

    const addExtension = useCallback(element => {
        setState(state => {
            return {
                ...state,
                extensions: [...state.extensions, element]
            };
        });
    }, []);

    const addComponentWrappers = useCallback((component, hocs) => {
        setState(state => {
            const wrappers = new Map(state.wrappers);
            const recipe = wrappers.get(component) || { component: null, wrappers: [] };

            const newHOCs = [...(recipe.wrappers || []), ...hocs];
            const NewComponent = compose(...[...newHOCs].reverse())(component);

            wrappers.set(component, {
                component: NewComponent,
                wrappers: newHOCs
            });
            return { ...state, wrappers };
        });
    }, []);

    const adminContext = useMemo(
        () => ({
            ...state,
            setMenu,
            addRoute,
            addProvider,
            addExtension,
            addComponentWrappers
        }),
        [state]
    );

    const AdminRouter = useMemo(
        () =>
            function AdminRouter() {
                return (
                    <SortRoutes key={state.routes.length}>
                        {state.routes.map((route, key) => cloneElement(route, { key }))}
                    </SortRoutes>
                );
            },
        [state.routes, Dashboard, NotFound]
    );

    const App = useMemo(
        () => compose(...(state.providers || []))(AdminRouter),
        [state.providers, AdminRouter]
    );

    App.displayName = "AdminAppRenderer";

    return (
        <AdminContext.Provider value={adminContext}>
            {children}
            <BrowserRouter>
                {state.extensions.map((ext, key) => cloneElement(ext, { key }))}
                <App />
            </BrowserRouter>
        </AdminContext.Provider>
    );
};

Admin.displayName = "Admin";
