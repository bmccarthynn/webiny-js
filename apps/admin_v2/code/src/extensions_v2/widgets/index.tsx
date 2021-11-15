import React, { useEffect } from "react";
import { useCallback } from "react";
import { useDashboard } from "../dashboard";

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
                    component: () => (
                        <div>
                            Widget #2 <button onClick={addMore}>Add more widgets</button>
                        </div>
                    )
                }
            ]);
        }, []);

        return <Component {...props}>{children}</Component>;
    };
};
