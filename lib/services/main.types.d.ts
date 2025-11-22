import { inferT } from '@bemedev/app-ts/lib/utils/typings';
export type Point = {
    x: number;
    y: number;
};
export declare const point: {
    readonly x: "number";
    readonly y: "number";
};
export type NodeOffset = {
    input?: Point;
    output: Point;
};
export declare const nodeOffset: {
    readonly input: import('@bemedev/app-ts/lib/utils/typings').Maybe<{
        readonly x: "number";
        readonly y: "number";
    }>;
    readonly output: {
        readonly x: "number";
        readonly y: "number";
    };
};
export type Extremities = {
    from: string;
    to: string;
};
export declare const extremities: {
    readonly from: "string";
    readonly to: "string";
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
    readonly position: {
        readonly x: "number";
        readonly y: "number";
    };
    readonly data: {
        readonly label: import('@bemedev/app-ts/lib/utils/typings').Maybe<"string">;
        readonly content: "string";
    };
    readonly input: "boolean";
};
export type EdgeJSON = Extremities;
export declare const edgeJSON: {
    readonly from: "string";
    readonly to: "string";
};
export type EdgeVector = {
    from: string;
    x0: number;
    y0: number;
    x1: number;
    y1: number;
};
export declare const dimensions: {
    readonly width: "number";
    readonly height: "number";
    readonly id: "string";
    readonly output: {
        readonly x: "number";
        readonly y: "number";
    };
    readonly input: import('@bemedev/app-ts/lib/utils/typings').Maybe<{
        readonly x: "number";
        readonly y: "number";
    }>;
};
export declare const vector: {
    readonly x0: "number";
    readonly y0: "number";
    readonly x1: "number";
    readonly y1: "number";
};
export type Vector = inferT<typeof vector>;
//# sourceMappingURL=main.types.d.ts.map