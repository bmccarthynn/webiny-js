import React, { Fragment } from "react";
// import { useAdmin } from "~/index";
import { TopAppBarPrimary, TopAppBarTitle, TopAppBarSection } from "@webiny/ui/TopAppBar";

interface LayoutProps {
    LeftSection: React.ComponentType<any>;
    children: React.ReactNode;
}

export const Layout = (props: LayoutProps) => {
    const { LeftSection, children } = props;

    const defaultLeftSection = <TopAppBarTitle>Webiny</TopAppBarTitle>;

    return (
        <Fragment>
            <TopAppBarPrimary fixed>
                <TopAppBarSection>
                    {LeftSection ? (
                        <LeftSection>{defaultLeftSection}</LeftSection>
                    ) : (
                        defaultLeftSection
                    )}
                </TopAppBarSection>
                <TopAppBarSection>Center Section</TopAppBarSection>
                <TopAppBarSection>Right Section</TopAppBarSection>
            </TopAppBarPrimary>
            <div style={{ paddingTop: 67 }}>
                {children}
            </div>
            
        </Fragment>
    );
};
