import React, { Fragment } from "react";
import { TopAppBarPrimary, TopAppBarSection, TopAppBarTitle } from "@webiny/ui/TopAppBar";
import { makeComposable } from "~/v3";

export interface LayoutProps {
    children: React.ReactNode;
    leftSection?: React.ComponentType<any>;
    title?: string;
}

export const Layout = makeComposable<LayoutProps>("Layout", ({ children, leftSection, title }) => {
    const defaultLeftSection = <LayoutLeftSection title={title || "Webiny"} />;

    return (
        <Fragment>
            <TopAppBarPrimary fixed>
                <TopAppBarSection>{leftSection || defaultLeftSection}</TopAppBarSection>
                {/*<TopAppBarSection>Center Section</TopAppBarSection>*/}
                {/*<TopAppBarSection>Right Section</TopAppBarSection>*/}
            </TopAppBarPrimary>
            <div style={{ paddingTop: 67 }}>{children}</div>
        </Fragment>
    );
});

export const LayoutLeftSection = function LeftSection({ title }) {
    return <TopAppBarTitle>{title || "Webiny"}</TopAppBarTitle>;
};
