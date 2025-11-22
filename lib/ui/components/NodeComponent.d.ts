import { Component } from 'solid-js';
declare module 'solid-js' {
    namespace JSX {
        interface Directives {
            draggable: any;
        }
    }
}
type Props = {
    id: string;
    x: number;
    y: number;
    label?: string;
    content: string;
    input: boolean;
};
export declare const NodeComponent: Component<Props>;
export {};
//# sourceMappingURL=NodeComponent.d.ts.map