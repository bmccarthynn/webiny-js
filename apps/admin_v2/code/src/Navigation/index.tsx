import React, { Fragment, useCallback, useContext, useMemo, useState } from "react";
import { Link, Route, useLocation } from "@webiny/react-router";
import { Drawer } from "@webiny/ui/Drawer";
import Hamburger from "./Hamburger";
import { Compose, Routes, Layout, Provider, useAdmin, Navigation, Menu } from "@webiny/admin/v3";
import { ReactComponent as Logo } from "./webiny-logo.svg";
import { MenuData, makeComposable } from "@webiny/admin/v3";

const NavigationContext = React.createContext(null);
NavigationContext.displayName = "NavigationContext";

export function useNavigation() {
    return useContext(NavigationContext);
}

/* Add Custom Layout*/
function Sidebar() {
    const [visible, setVisible] = useNavigation();
    const { menus } = useAdmin();

    const hideDrawer = useCallback(() => {
        setVisible(false);
    }, []);

    return (
        <Drawer modal open={visible} onClose={hideDrawer}>
            <Navigation menus={menus} />
        </Drawer>
    );
}

function createSection() {
    return function WithHamburger() {
        return (
            <Fragment>
                <Hamburger />
                <Logo style={{ width: 100 }} />
            </Fragment>
        );
    };
}

const createNavLayout = () => {
    return function NavLayout(Layout) {
        return function CustomLayout({ children, ...props }) {
            const Section = createSection();
            return (
                <Layout {...props} leftSection={<Section />}>
                    <Sidebar />
                    {children}
                </Layout>
            );
        };
    };
};

const NavigationProvider = Component => {
    return function NavigationProvider(props: unknown) {
        const [visible, setVisible] = useState(false);

        const context = useMemo(() => [visible, setVisible], [visible]);

        return (
            <NavigationContext.Provider value={context}>
                <Component {...props} />
            </NavigationContext.Provider>
        );
    };
};

export interface MenuItemProps {
    menu: MenuData;
    depth: number;
}

export const MenuItem = makeComposable<MenuItemProps>("MenuItem", ({ menu, depth }) => {
    const [, setVisible] = useNavigation();
    const style = { paddingLeft: depth > 0 ? 10 : 0 };
    const { pathname } = useLocation();
    const { id, path, label, children } = menu;

    if (path) {
        const isActive = pathname === path;
        return (
            <li key={id} style={style}>
                <Link to={path} onClick={() => setVisible(false)}>
                    {isActive ? "> " : null}
                    {label}
                </Link>
            </li>
        );
    }

    if (children) {
        return (
            <li key={id}>
                {label}
                <ul>
                    {children.map(menu => (
                        <MenuItem key={menu.id} depth={depth + 1} menu={menu} />
                    ))}
                </ul>
            </li>
        );
    }

    return (
        <li key={id} style={style}>
            {label}
        </li>
    );
});

const NavigationRenderer = () => {
    return function MyNavigation({ menus }) {
        return (
            <Fragment>
                {menus.map(menu => (
                    <MenuItem key={menu.id} depth={0} menu={menu} />
                ))}
            </Fragment>
        );
    };
};

const MenuSorter = Navigation => {
    return function MenuSorter({ menus }) {
        menus = menus.sort((a, b) => {
            return a.label.localeCompare(b.label);
        });

        return <Navigation menus={menus} />;
    };
};

export const NavigationPlugin = () => {
    const NavLayout = createNavLayout();

    return (
        <Fragment>
            <Compose component={Layout} with={NavLayout} />
            <Compose component={Navigation} with={[NavigationRenderer, MenuSorter]} />
            <Provider component={NavigationProvider} />
            <Menu id="myApp" label={"My app"}>
                <Menu id="myApp.products" label={"Products"} path={"/products"} />
                <Menu id="myApp.products2" label={"Variations"} path={"/variations"} />
            </Menu>
            <Menu id="ecommerce" label={"E-Commerce"}>
                <Menu id="ecommerce.products" label={"Groups"} path={"/groups"} />
            </Menu>
            <Routes>
                <Route path={"/products"}>
                    <Layout>My App - Products</Layout>
                </Route>
                <Route path={"/variations"}>
                    <Layout>My App - Variations</Layout>
                </Route>
            </Routes>
        </Fragment>
    );
};
