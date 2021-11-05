import React from "react";
import { useAdmin } from "~/Admin";

export const Menu = props => {
    // props = { text, path, icon, children }
    const { components } = useAdmin();

    if (!components.Menu) {
        throw new Error(
            "Menu component is not available! Please configure a Menu component using the `withComponents` HOF."
        );
    }

    const MenuComponent = components.Menu;

    return <MenuComponent {...props} />;
};
