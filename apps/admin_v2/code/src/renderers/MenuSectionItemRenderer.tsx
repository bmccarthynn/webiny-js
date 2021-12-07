import React, { useCallback } from "react";
import { css } from "emotion";
import { Link } from "@webiny/react-router";
import { List, ListItem } from "@webiny/ui/List";
import { MenuItemProps, useNavigation } from "../Navigation";

const linkStyle = css({
    color: "var(--mdc-theme-text-primary-on-background)",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: "100%",
    outline: "none",
    paddingLeft: 65,
    "&:hover": {
        textDecoration: "none"
    }
});

const submenuItems = css({
    ".mdc-drawer &.mdc-list-item": {
        paddingLeft: 0,
        margin: 0,
        padding: 0
    }
});

const submenuList = css({
    "&.mdc-list": {
        padding: 0
    }
});

export const MenuSectionItemRenderer = MenuItem => {
    return function MenuSectionItem({ menu, depth }: MenuItemProps) {
        const [, setVisible] = useNavigation();
        const hideMenu = useCallback(() => setVisible(false), []);

        if (depth === 0 && !Boolean(menu.path)) {
            return <MenuItem menu={menu} depth={depth} />;
        }
        

        return (
            <List className={submenuList}>
                <ListItem className={submenuItems} data-testid={menu.testId}>
                    {menu.path ? (
                        <Link
                            className={linkStyle}
                            to={menu.path}
                            onClick={menu.onClick || hideMenu}
                        >
                            {menu.label}
                        </Link>
                    ) : (
                        <span onClick={menu.onClick || null} className={linkStyle}>
                            {menu.label}
                        </span>
                    )}
                </ListItem>
            </List>
        );
    };
};
