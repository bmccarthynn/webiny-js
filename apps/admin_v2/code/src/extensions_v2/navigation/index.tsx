import React, { Fragment, useCallback, useEffect } from "react";
import { RecoilRoot, atom, useRecoilState } from "recoil";
import { Drawer } from "@webiny/ui/Drawer";
import Hamburger from "./Hamburger";
import { useComponents } from "@webiny/admin/v2";
import { useDashboard } from "../components";

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
            const [, setComponents] = useComponents();
            const { setWidgets } = useDashboard();

            const addMore = useCallback(() => {
                const id = Date.now();

                setWidgets(widgets => [
                    ...widgets,
                    { id: `dynamic-widget-${id}`, component: () => <div>Dynamic widget #{id}</div> }
                ]);
            }, []);

            useEffect(() => {
                setComponents(prev => ({ ...prev, Layout: wrapLayout(prev.Layout, { title }) }));
                setWidgets(widgets => [
                    ...widgets,
                    { id: "custom-widget-1", component: () => <div>Widget #1</div> },
                    {
                        id: "custom-widget-2",
                        component: () => (
                            <div>
                                Widget #2 <button onClick={addMore}>Add more widgets</button>
                            </div>
                        )
                    }
                ]);
            }, []);

            return (
                <RecoilRoot>
                    <Component {...props}>{children}</Component>
                </RecoilRoot>
            );
        };
    };
