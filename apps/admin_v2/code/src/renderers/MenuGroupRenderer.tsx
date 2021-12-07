import React, { ComponentType, Fragment, useCallback } from "react";
import { css } from "emotion";
import { Transition } from "react-transition-group";
import classNames from "classnames";
import { Link } from "@webiny/react-router";
import { List, ListItem, ListItemGraphic, ListItemMeta } from "@webiny/ui/List";
import { IconButton } from "@webiny/ui/Button";
import { ReactComponent as UpIcon } from "./assets/round-keyboard_arrow_up-24px.svg";
import { ReactComponent as DownIcon } from "./assets/round-keyboard_arrow_down-24px.svg";
import { MenuItem, MenuItemProps, useNavigation } from "../Navigation";

const defaultStyle = {
    transform: "translateY(-20px)",
    opacity: 0,
    transitionProperty: "transform, opacity",
    transitionTimingFunction: "cubic-bezier(0, 0, .2, 1)",
    transitionDuration: "100ms",
    willChange: "opacity, transform"
};

const transitionStyles = {
    entering: { transform: "translateY(-20px)", opacity: 0 },
    entered: { transform: "translateY(0px)", opacity: 1 }
};

const menuTitle = css({
    ".mdc-drawer &.mdc-list": {
        borderBottom: "1px solid var(--mdc-theme-on-background)",
        padding: 0,
        ".mdc-list-item": {
            margin: 0,
            padding: "0 15px",
            height: "48px",
            width: "100%",
            fontWeight: 600,
            boxSizing: "border-box"
        }
    }
});

const menuTitleActive = css({
    backgroundColor: "var(--mdc-theme-background)"
});

export const MenuGroupRenderer = (ComposedMenuItem: ComponentType<MenuItemProps>) => {
    return function MenuGroup({ menu, depth }: MenuItemProps) {
        const [visible, setVisible] = useNavigation();
        const hasChildren = menu.children && menu.children.length > 0;
        const isExpanded = true;

        const hideMenu = useCallback(() => setVisible(false), []);


        if (!hasChildren) {
            return <ComposedMenuItem menu={menu} depth={depth} />;
        }

        const withLink = content => {
            return (
                <Link to={menu.path} data-testid={menu.testId} onClick={menu.onClick || hideMenu}>
                    {content}
                </Link>
            );
        };

        const menuItem = (
            <List className={classNames(menuTitle, { [menuTitleActive]: isExpanded })}>
                <ListItem
                    data-testid={menu.testId}
                    onClick={() => {
                        // if (typeof menu.onClick === "function") {
                        //     menu.onClick(() => element.toggleElement());
                        // } else {
                        //     element.toggleElement();
                        // }
                    }}
                >
                    {menu.icon && (
                        <ListItemGraphic>
                            <IconButton icon={menu.icon} />
                        </ListItemGraphic>
                    )}

                    {menu.label}

                    {hasChildren ? (
                        <ListItemMeta>
                            <IconButton icon={isExpanded ? <UpIcon /> : <DownIcon />} />
                        </ListItemMeta>
                    ) : null}
                </ListItem>
            </List>
        );
        
        return (
            <Fragment>
                {menu.path ? withLink(menuItem) : menuItem}
                {hasChildren ? (
                    <Transition in={isExpanded} timeout={100} appear unmountOnExit>
                        {state => (
                            <div style={{ ...defaultStyle, ...transitionStyles[state] }}>
                                {menu.children.map(menu => (
                                    <MenuItem key={menu.id} menu={menu} depth={depth + 1} />
                                ))}
                            </div>
                        )}
                    </Transition>
                ) : null}
            </Fragment>
        );
    };
};
