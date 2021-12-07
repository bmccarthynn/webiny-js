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
    export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & {
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
//
// declare module "@webiny/admin/types" {
//     interface ComponentMap {
//         Layout: React.ComponentType<{ title: string }>;
//         Button: React.ComponentType<{ children: string }>
//     }
// }
