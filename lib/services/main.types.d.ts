import { inferT } from '@bemedev/app-ts/lib/utils/typings';
export type Point = {
    x: number;
    y: number;
};
export declare const point: {
    x: "number";
    y: "number";
};
export type NodeOffset = {
    input?: Point;
    output: Point;
};
export declare const nodeOffset: {
    input: import('@bemedev/app-ts/lib/utils/typings').Maybe<{
        x: "number";
        y: "number";
    }>;
    output: {
        x: "number";
        y: "number";
    };
};
export type Extremities = {
    from: string;
    to: string;
};
export declare const extremities: {
    from: "string";
    to: "string";
};
export type NodeJSON = {
    id: string;
    position: Point;
    data: {
        label?: string;
        content: any;
    };
    input: boolean;
};
export declare const nodeJSON: {
    position: {
        x: "number";
        y: "number";
    };
    data: {
        label: import('@bemedev/app-ts/lib/utils/typings').Maybe<"string">;
        content: "string";
    };
    input: "boolean";
};
export type EdgeJSON = Extremities;
export declare const edgeJSON: {
    from: "string";
    to: "string";
};
export type EdgeVector = {
    from: string;
    x0: number;
    y0: number;
    x1: number;
    y1: number;
};
export declare const dimensions: {
    width: "number";
    height: "number";
    id: "string";
    output: {
        x: "number";
        y: "number";
    };
    input: import('@bemedev/app-ts/lib/utils/typings').Maybe<{
        x: "number";
        y: "number";
    }>;
};
export declare const vector: {
    x0: "number";
    y0: "number";
    x1: "number";
    y1: "number";
};
export type Vector = inferT<typeof vector>;
//# sourceMappingURL=main.types.d.ts.map