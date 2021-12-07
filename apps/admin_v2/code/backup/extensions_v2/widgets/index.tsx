import React, { useEffect } from "react";
import { useCallback } from "react";
import { useDashboard } from "../dashboard";
import { useAdmin } from "@webiny/admin/v2";

const CustomButton = ({ onClick, children }) => {
    return (
        <button onClick={onClick} style={{ backgroundColor: "red", color: "white" }}>
            {children}
        </button>
    );
};

const SetCustomButton = () => {
    const { components, setComponents } = useAdmin();
    const {
        Button,
        Layout,
        Dashboard,
        ui: { Alert }
    } = components;

    const replaceButton = () => {
        setComponents(components => ({
            ...components,
            Button: CustomButton
        }));
    };

    return (
        <div style={{ position: "fixed", bottom: 50, right: 50 }}>
            <Button onClick={replaceButton}>Replace Button</Button>
        </div>
    );
};

export const withWidgets = () => Component => {
    return function WithWidgets({ children, ...props }) {
        const { setWidgets } = useDashboard();

        const addMore = useCallback(() => {
            const id = Date.now();

            setWidgets(widgets => [
                ...widgets,
                { id: `dynamic-widget-${id}`, component: () => <div>Dynamic widget #{id}</div> }
            ]);
        }, []);

        useEffect(() => {
            setWidgets(widgets => [
                ...widgets,
                { id: "custom-widget-1", component: () => <div>Widget #1</div> },
                {
                    id: "custom-widget-2",
                    component: () => {
                        const {
                            components: { Button }
                        } = useAdmin();
                        return (
                            <div>
                                Widget #2 <Button onClick={addMore}>Add more widgets</Button>
                            </div>
                        );
                    }
                }
            ]);
        }, []);

        props.services.push(<SetCustomButton key={"custom-button"} />);

        return <Component {...props}>{children}</Component>;
    };
};
