import * as types from "@webiny/admin/types";
import { ComponentType, FunctionComponent, SVGProps } from "react";

declare module "*.md" {
    const md: string;
    export default md;
}

declare module "*.png" {
    const png: string;
    export default png;
}

declare module "*.jpg" {
    const jpg: string;
    export default jpg;
}

declare module "*.svg" {
    export const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement> & {
        alt?: string;
    }>;

    const src: string;
    export default src;
}
// @ts-ignore
declare global {
    // eslint-disable-next-line
    namespace JSX {
        interface IntrinsicElements {
            "ssr-cache": {
                class?: string;
                id?: string;
            };
        }
    }
}

declare module "@webiny/admin/types" {
    interface ComponentMap {
        Layout: ComponentType<types.ComponentProps<{ title: string }>>;
        Dashboard: ComponentType<{ children: string }>;
        Button: ComponentType<{ children: string }>
    }
}

declare module "@webiny/admin/types" {
    type CustomLayoutProps = React.ComponentProps<types.ComponentMap["Layout"]>
    
    interface ComponentMap {
        Layout: ComponentType<CustomLayoutProps>, 
        ui: {
            Alert: ComponentType<{ children: string }>;
        }
    }
}
