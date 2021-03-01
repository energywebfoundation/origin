declare module '*.scss' {
    const content: any;
    export default content;
}
declare module '*.json' {
    const value: any;
    export default value;
}

declare module "\*.svg" {
    import React = require("react");
    export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default src;
}

declare module '*.png' {
    const value: any;
    export default value;
}

declare module '*.css' {
    const value: any;
    export default value;
}
