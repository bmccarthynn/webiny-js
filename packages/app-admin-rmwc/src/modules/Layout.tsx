import React, { Fragment } from "react";
import Helmet from "react-helmet";
import {
    Compose,
    LayoutRenderer,
    LayoutProps,
    Brand,
    Search,
    LocaleSelector,
    UserMenu,
    Navigation,
    Tags
} from "@webiny/app-admin";
import { TopAppBarPrimary, TopAppBarSection } from "@webiny/ui/TopAppBar";

const RMWCLayout = () => {
    return function RMWCLayout({ title, children }: LayoutProps) {
        return (
            <Fragment>
                {title ? <Helmet title={title} /> : null}
                <Tags tags={{ location: "appBar" }}>
                    <TopAppBarPrimary fixed>
                        <TopAppBarSection style={{ width: "25%" }} alignStart>
                            <Brand />
                        </TopAppBarSection>
                        <TopAppBarSection style={{ width: "50%" }}>
                            <Search />
                        </TopAppBarSection>
                        <TopAppBarSection style={{ width: "25%" }} alignEnd>
                            <LocaleSelector />
                            <UserMenu />
                        </TopAppBarSection>
                    </TopAppBarPrimary>
                </Tags>
                <div style={{ paddingTop: 67 }}>{children}</div>
                <Navigation />
            </Fragment>
        );
    };
};

export const Layout = () => {
    return <Compose component={LayoutRenderer} with={RMWCLayout} />;
};
