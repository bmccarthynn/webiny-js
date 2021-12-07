import React, { Fragment, useEffect, useState } from "react";
import { RecoilRoot, atom, useRecoilState } from "recoil";
import { Drawer } from "@webiny/ui/Drawer";
import Hamburger from "./Hamburger";

export const navigationAtom = atom({
    key: "navigationAtom",
    default: false
});

export function useNavigation() {
    return useRecoilState(navigationAtom);
}

/* Add Custom Layout*/

function Navigation() {
    const [visible, setVisible] = useNavigation();

    return (
        <Drawer modal open={visible} onClose={() => setVisible(false)}>
            Menu content
        </Drawer>
    );
}

function createSection(title: string) {
    return function WithHamburger() {
        return (
            <Fragment>
                <Hamburger />
                {title}
            </Fragment>
        );
    };
}

function wrapLayout(Layout, { title }) {
    return function CustomLayout({ children }) {
        const Section = createSection(title);
        return (
            <Layout LeftSection={Section}>
                <Navigation />
                {children}
            </Layout>
        );
    };
}

interface NavigationConfig {
    title: string;
}

export const withNavigation =
    ({ title }: NavigationConfig) =>
    Component => {
        return function WithNavigation({ children, ...props }) {
            const [menus, setMenus] = useState([]);
            props.components.Layout = wrapLayout(props.components.Layout, { title });

            props.components.NotFound = function NotFound() {
                return (
                    <props.components.Layout>
                        <div>Nista od ribe!</div>
                    </props.components.Layout>
                );
            };
            
            useEffect(() => {
                setTimeout(() => {
                    setMenus([{ label: "Menu 1", path: "/" }, { label: "Menu 2", path: "/" }]);
                }, 1000);
            }, []);

            return (
                <RecoilRoot>
                    <Component {...props} menus={[...props.menus || [], ...menus]}>{children}</Component>
                </RecoilRoot>
            );
        };
    };
