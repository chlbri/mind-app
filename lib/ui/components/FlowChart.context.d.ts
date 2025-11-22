import { Point } from '../../services/main.types';
type Dimensions = {
    width: number;
    height: number;
    output: Point;
    input?: Point;
};
export type Edge = {
    from: string;
    x0: number;
    y0: number;
    x1: number;
    y1: number;
};
export declare const Provider: import('solid-js').ParentComponent, useFlow: () => {
    readonly dimensions: readonly [import('solid-js').Accessor<Record<string, Dimensions>>, import('solid-js').Setter<Record<string, Dimensions>>];
    readonly newEdge: import('solid-js').Signal<Edge | undefined>;
    readonly board: import('solid-js').Signal<Point | undefined>;
    readonly edgesPositions: readonly [import('solid-js').Accessor<Record<string, {
        readonly x0: number;
        readonly y0: number;
        readonly x1: number;
        readonly y1: number;
    }>>, import('solid-js').Setter<Record<string, {
        readonly x0: number;
        readonly y0: number;
        readonly x1: number;
        readonly y1: number;
    }>>];
    readonly service: {
        readonly contains: (...values: string[]) => () => boolean;
        readonly context: <R = {
            data?: {
                nodes: {
                    [x: string]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: number]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: symbol]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: number]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: symbol]: {
                        readonly from: string;
                        readonly to: string;
                    };
                };
            } | undefined;
            selected?: string | undefined;
            updatingUI?: boolean | undefined;
        }>(accessor?: ((state: {
            data?: {
                nodes: {
                    [x: string]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: number]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: symbol]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: number]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: symbol]: {
                        readonly from: string;
                        readonly to: string;
                    };
                };
            } | undefined;
            selected?: string | undefined;
            updatingUI?: boolean | undefined;
        }) => R) | undefined, equals?: ((prev: R, next: R) => boolean) | undefined) => import('solid-js').Accessor<R>;
        readonly dispose: () => Promise<void>;
        readonly dps: () => string[];
        readonly matches: (...values: string[]) => () => boolean;
        readonly pause: () => void;
        readonly reducer: <T>(accessor: (state: import('@bemedev/app-ts').State<{
            data?: {
                nodes: {
                    [x: string]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: number]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: symbol]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: number]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: symbol]: {
                        readonly from: string;
                        readonly to: string;
                    };
                };
            } | undefined;
            selected?: string | undefined;
            updatingUI?: boolean | undefined;
        }, import('@bemedev/app-ts/lib/events').ToEvents<{
            CONFIGURE: {
                nodes: {
                    [x: string]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: number]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: symbol]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: number]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: symbol]: {
                        readonly from: string;
                        readonly to: string;
                    };
                };
            };
            CONFIGURE_EMPTY: {};
            MOVE: {
                readonly id: string;
                readonly x: number;
                readonly y: number;
            };
            MOVE_IMMEDIATE: {
                readonly id: string;
                readonly x: number;
                readonly y: number;
            };
            ADD_CHILD: string;
            ADD_SIBLING: string;
            DELETE: string;
            SELECT: string;
            DESELECT: {};
            ADD_EDGE: {
                readonly from: string;
                readonly to: string;
            };
        }, {}>> | {
            context: {
                data?: {
                    nodes: {
                        [x: string]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                        [x: number]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                        [x: symbol]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                    };
                    edges: {
                        [x: string]: {
                            readonly from: string;
                            readonly to: string;
                        };
                        [x: number]: {
                            readonly from: string;
                            readonly to: string;
                        };
                        [x: symbol]: {
                            readonly from: string;
                            readonly to: string;
                        };
                    };
                } | undefined;
                selected?: string | undefined;
                updatingUI?: boolean | undefined;
            };
            status: import('@bemedev/app-ts').WorkingStatus;
            value: import('@bemedev/app-ts/lib/states').StateValue;
            event: import('@bemedev/app-ts/lib/events').ToEvents<{
                CONFIGURE: {
                    nodes: {
                        [x: string]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                        [x: number]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                        [x: symbol]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                    };
                    edges: {
                        [x: string]: {
                            readonly from: string;
                            readonly to: string;
                        };
                        [x: number]: {
                            readonly from: string;
                            readonly to: string;
                        };
                        [x: symbol]: {
                            readonly from: string;
                            readonly to: string;
                        };
                    };
                };
                CONFIGURE_EMPTY: {};
                MOVE: {
                    readonly id: string;
                    readonly x: number;
                    readonly y: number;
                };
                MOVE_IMMEDIATE: {
                    readonly id: string;
                    readonly x: number;
                    readonly y: number;
                };
                ADD_CHILD: string;
                ADD_SIBLING: string;
                DELETE: string;
                SELECT: string;
                DESELECT: {};
                ADD_EDGE: {
                    readonly from: string;
                    readonly to: string;
                };
            }, {}>;
            tags?: (string | readonly string[]) | undefined;
        }) => T) => <R = T>(accessor?: ((state: T) => R) | undefined, equals?: ((prev: R, next: R) => boolean) | undefined) => import('solid-js').Accessor<R>;
        readonly resume: () => void;
        readonly select: <D = {
            context: {
                data?: {
                    nodes: {
                        [x: string]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                        [x: number]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                        [x: symbol]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                    };
                    edges: {
                        [x: string]: {
                            readonly from: string;
                            readonly to: string;
                        };
                        [x: number]: {
                            readonly from: string;
                            readonly to: string;
                        };
                        [x: symbol]: {
                            readonly from: string;
                            readonly to: string;
                        };
                    };
                } | undefined;
                selected?: string | undefined;
                updatingUI?: boolean | undefined;
            };
            status: import('@bemedev/app-ts').WorkingStatus;
            value: import('@bemedev/app-ts/lib/states').StateValue;
            event: import('@bemedev/app-ts/lib/events').ToEvents<{
                CONFIGURE: {
                    nodes: {
                        [x: string]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                        [x: number]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                        [x: symbol]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                    };
                    edges: {
                        [x: string]: {
                            readonly from: string;
                            readonly to: string;
                        };
                        [x: number]: {
                            readonly from: string;
                            readonly to: string;
                        };
                        [x: symbol]: {
                            readonly from: string;
                            readonly to: string;
                        };
                    };
                };
                CONFIGURE_EMPTY: {};
                MOVE: {
                    readonly id: string;
                    readonly x: number;
                    readonly y: number;
                };
                MOVE_IMMEDIATE: {
                    readonly id: string;
                    readonly x: number;
                    readonly y: number;
                };
                ADD_CHILD: string;
                ADD_SIBLING: string;
                DELETE: string;
                SELECT: string;
                DESELECT: {};
                ADD_EDGE: {
                    readonly from: string;
                    readonly to: string;
                };
            }, {}>;
            tags?: (string | readonly string[]) | undefined;
        } & {
            [x: `context.data.nodes.${string}.input`]: unknown;
            [x: `context.data.nodes.${string}.position.x`]: unknown;
            [x: `context.data.nodes.${string}.position.y`]: unknown;
            [x: `context.data.nodes.${string}.position`]: unknown;
            [x: `context.data.nodes.${string}.data.content`]: unknown;
            [x: `context.data.nodes.${string}.data.label`]: unknown;
            [x: `context.data.nodes.${string}.data`]: unknown;
            [x: `context.data.nodes.${string}`]: unknown;
            [x: `context.data.edges.${string}.from`]: unknown;
            [x: `context.data.edges.${string}.to`]: unknown;
            [x: `context.data.edges.${string}`]: unknown;
            context: {
                data?: {
                    nodes: {
                        [x: string]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                        [x: number]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                        [x: symbol]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                    };
                    edges: {
                        [x: string]: {
                            readonly from: string;
                            readonly to: string;
                        };
                        [x: number]: {
                            readonly from: string;
                            readonly to: string;
                        };
                        [x: symbol]: {
                            readonly from: string;
                            readonly to: string;
                        };
                    };
                } | undefined;
                selected?: string | undefined;
                updatingUI?: boolean | undefined;
            };
            "context.data.nodes": {
                [x: string]: {
                    readonly position: {
                        readonly x: number;
                        readonly y: number;
                    };
                    readonly data: {
                        readonly content: string;
                        readonly label?: string | undefined;
                    };
                    readonly input: boolean;
                };
                [x: number]: {
                    readonly position: {
                        readonly x: number;
                        readonly y: number;
                    };
                    readonly data: {
                        readonly content: string;
                        readonly label?: string | undefined;
                    };
                    readonly input: boolean;
                };
                [x: symbol]: {
                    readonly position: {
                        readonly x: number;
                        readonly y: number;
                    };
                    readonly data: {
                        readonly content: string;
                        readonly label?: string | undefined;
                    };
                    readonly input: boolean;
                };
            };
            "context.data.edges": {
                [x: string]: {
                    readonly from: string;
                    readonly to: string;
                };
                [x: number]: {
                    readonly from: string;
                    readonly to: string;
                };
                [x: symbol]: {
                    readonly from: string;
                    readonly to: string;
                };
            };
            "context.data": {
                nodes: {
                    [x: string]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: number]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: symbol]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: number]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: symbol]: {
                        readonly from: string;
                        readonly to: string;
                    };
                };
            };
            "context.selected": string;
            "context.updatingUI": boolean;
        }, K extends Extract<keyof D, string> = Extract<keyof D, string>, R = D[K]>(selector: K, equals?: ((prev: NoInfer<R>, next: NoInfer<R>) => boolean) | undefined) => import('solid-js').Accessor<R>;
        readonly send: (_event: "CONFIGURE_EMPTY" | "DESELECT" | {
            type: "CONFIGURE_EMPTY";
            payload: {};
        } | {
            type: "CONFIGURE";
            payload: {
                nodes: {
                    [x: string]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: number]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: symbol]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: number]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: symbol]: {
                        readonly from: string;
                        readonly to: string;
                    };
                };
            };
        } | {
            type: "MOVE";
            payload: {
                readonly id: string;
                readonly x: number;
                readonly y: number;
            };
        } | {
            type: "MOVE_IMMEDIATE";
            payload: {
                readonly id: string;
                readonly x: number;
                readonly y: number;
            };
        } | {
            type: "ADD_CHILD";
            payload: string;
        } | {
            type: "ADD_SIBLING";
            payload: string;
        } | {
            type: "ADD_EDGE";
            payload: {
                readonly from: string;
                readonly to: string;
            };
        } | {
            type: "DELETE";
            payload: string;
        } | {
            type: "SELECT";
            payload: string;
        } | {
            type: "DESELECT";
            payload: {};
        }) => void;
        readonly start: () => Promise<void>;
        readonly state: <T = {
            context: {
                data?: {
                    nodes: {
                        [x: string]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                        [x: number]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                        [x: symbol]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                    };
                    edges: {
                        [x: string]: {
                            readonly from: string;
                            readonly to: string;
                        };
                        [x: number]: {
                            readonly from: string;
                            readonly to: string;
                        };
                        [x: symbol]: {
                            readonly from: string;
                            readonly to: string;
                        };
                    };
                } | undefined;
                selected?: string | undefined;
                updatingUI?: boolean | undefined;
            };
            status: import('@bemedev/app-ts').WorkingStatus;
            value: import('@bemedev/app-ts/lib/states').StateValue;
            event: import('@bemedev/app-ts/lib/events').ToEvents<{
                CONFIGURE: {
                    nodes: {
                        [x: string]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                        [x: number]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                        [x: symbol]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                    };
                    edges: {
                        [x: string]: {
                            readonly from: string;
                            readonly to: string;
                        };
                        [x: number]: {
                            readonly from: string;
                            readonly to: string;
                        };
                        [x: symbol]: {
                            readonly from: string;
                            readonly to: string;
                        };
                    };
                };
                CONFIGURE_EMPTY: {};
                MOVE: {
                    readonly id: string;
                    readonly x: number;
                    readonly y: number;
                };
                MOVE_IMMEDIATE: {
                    readonly id: string;
                    readonly x: number;
                    readonly y: number;
                };
                ADD_CHILD: string;
                ADD_SIBLING: string;
                DELETE: string;
                SELECT: string;
                DESELECT: {};
                ADD_EDGE: {
                    readonly from: string;
                    readonly to: string;
                };
            }, {}>;
            tags?: (string | readonly string[]) | undefined;
        }>(accessor?: ((state: import('@bemedev/app-ts').State<{
            data?: {
                nodes: {
                    [x: string]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: number]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: symbol]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: number]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: symbol]: {
                        readonly from: string;
                        readonly to: string;
                    };
                };
            } | undefined;
            selected?: string | undefined;
            updatingUI?: boolean | undefined;
        }, import('@bemedev/app-ts/lib/events').ToEvents<{
            CONFIGURE: {
                nodes: {
                    [x: string]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: number]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: symbol]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: number]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: symbol]: {
                        readonly from: string;
                        readonly to: string;
                    };
                };
            };
            CONFIGURE_EMPTY: {};
            MOVE: {
                readonly id: string;
                readonly x: number;
                readonly y: number;
            };
            MOVE_IMMEDIATE: {
                readonly id: string;
                readonly x: number;
                readonly y: number;
            };
            ADD_CHILD: string;
            ADD_SIBLING: string;
            DELETE: string;
            SELECT: string;
            DESELECT: {};
            ADD_EDGE: {
                readonly from: string;
                readonly to: string;
            };
        }, {}>> | {
            context: {
                data?: {
                    nodes: {
                        [x: string]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                        [x: number]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                        [x: symbol]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                    };
                    edges: {
                        [x: string]: {
                            readonly from: string;
                            readonly to: string;
                        };
                        [x: number]: {
                            readonly from: string;
                            readonly to: string;
                        };
                        [x: symbol]: {
                            readonly from: string;
                            readonly to: string;
                        };
                    };
                } | undefined;
                selected?: string | undefined;
                updatingUI?: boolean | undefined;
            };
            status: import('@bemedev/app-ts').WorkingStatus;
            value: import('@bemedev/app-ts/lib/states').StateValue;
            event: import('@bemedev/app-ts/lib/events').ToEvents<{
                CONFIGURE: {
                    nodes: {
                        [x: string]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                        [x: number]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                        [x: symbol]: {
                            readonly position: {
                                readonly x: number;
                                readonly y: number;
                            };
                            readonly data: {
                                readonly content: string;
                                readonly label?: string | undefined;
                            };
                            readonly input: boolean;
                        };
                    };
                    edges: {
                        [x: string]: {
                            readonly from: string;
                            readonly to: string;
                        };
                        [x: number]: {
                            readonly from: string;
                            readonly to: string;
                        };
                        [x: symbol]: {
                            readonly from: string;
                            readonly to: string;
                        };
                    };
                };
                CONFIGURE_EMPTY: {};
                MOVE: {
                    readonly id: string;
                    readonly x: number;
                    readonly y: number;
                };
                MOVE_IMMEDIATE: {
                    readonly id: string;
                    readonly x: number;
                    readonly y: number;
                };
                ADD_CHILD: string;
                ADD_SIBLING: string;
                DELETE: string;
                SELECT: string;
                DESELECT: {};
                ADD_EDGE: {
                    readonly from: string;
                    readonly to: string;
                };
            }, {}>;
            tags?: (string | readonly string[]) | undefined;
        }) => T) | undefined, equals?: ((prev: T, next: T) => boolean) | undefined) => import('solid-js').Accessor<T>;
        readonly status: () => import('@bemedev/app-ts').WorkingStatus;
        readonly stop: () => void;
        readonly subscribe: import('@bemedev/app-ts').AddSubscriber_F<{
            CONFIGURE: {
                nodes: {
                    [x: string]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: number]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: symbol]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: number]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: symbol]: {
                        readonly from: string;
                        readonly to: string;
                    };
                };
            };
            CONFIGURE_EMPTY: {};
            MOVE: {
                readonly id: string;
                readonly x: number;
                readonly y: number;
            };
            MOVE_IMMEDIATE: {
                readonly id: string;
                readonly x: number;
                readonly y: number;
            };
            ADD_CHILD: string;
            ADD_SIBLING: string;
            DELETE: string;
            SELECT: string;
            DESELECT: {};
            ADD_EDGE: {
                readonly from: string;
                readonly to: string;
            };
        }, {}, {
            data?: {
                nodes: {
                    [x: string]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: number]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: symbol]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: number]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: symbol]: {
                        readonly from: string;
                        readonly to: string;
                    };
                };
            } | undefined;
            selected?: string | undefined;
            updatingUI?: boolean | undefined;
        }>;
        readonly tags: () => string | readonly string[] | undefined;
        readonly value: () => import('@bemedev/app-ts/lib/states').StateValue;
        readonly values: string[];
        readonly addOptions: import('@bemedev/app-ts').AddOptions_F<{
            CONFIGURE: {
                nodes: {
                    [x: string]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: number]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: symbol]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: number]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: symbol]: {
                        readonly from: string;
                        readonly to: string;
                    };
                };
            };
            CONFIGURE_EMPTY: {};
            MOVE: {
                readonly id: string;
                readonly x: number;
                readonly y: number;
            };
            MOVE_IMMEDIATE: {
                readonly id: string;
                readonly x: number;
                readonly y: number;
            };
            ADD_CHILD: string;
            ADD_SIBLING: string;
            DELETE: string;
            SELECT: string;
            DESELECT: {};
            ADD_EDGE: {
                readonly from: string;
                readonly to: string;
            };
        }, {}, {
            generatedId: string | null;
            nodes?: {
                readonly position: {
                    readonly x: number;
                    readonly y: number;
                };
                readonly data: {
                    readonly label: string | undefined;
                    readonly content: string;
                };
                readonly input: boolean;
                readonly id: string;
            }[] | undefined;
            edges?: {
                readonly from: string;
                readonly to: string;
                readonly id: string;
            }[] | undefined;
        }, {
            data?: {
                nodes: {
                    [x: string]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: number]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: symbol]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: number]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: symbol]: {
                        readonly from: string;
                        readonly to: string;
                    };
                };
            } | undefined;
            selected?: string | undefined;
            updatingUI?: boolean | undefined;
        }, import('@bemedev/app-ts').MachineOptions<{
            readonly __tsSchema: {
                readonly targets: Exclude<import('../../services/main.machine.gen')._AllPaths["machine"], "/">;
                readonly states: {
                    readonly idle: {
                        readonly targets: Exclude<import('../../services/main.machine.gen')._AllPaths["machine"], "/idle">;
                    };
                    readonly working: {
                        readonly targets: Exclude<import('../../services/main.machine.gen')._AllPaths["machine"], "/working">;
                    };
                };
                readonly initial: "idle" | "working";
            };
            readonly initial: "idle";
            readonly states: {
                readonly idle: {
                    readonly on: {
                        readonly CONFIGURE: {
                            readonly actions: readonly ["configure"];
                            readonly target: "/working";
                        };
                        readonly CONFIGURE_EMPTY: "/working";
                    };
                };
                readonly working: {
                    readonly on: {
                        readonly MOVE: {
                            readonly actions: readonly ["moveNode", "buildArrays", "buildUI"];
                        };
                        readonly MOVE_IMMEDIATE: {
                            readonly actions: readonly [{
                                readonly name: "buildImmediateUI";
                                readonly description: "Must be in the ui";
                            }];
                        };
                        readonly ADD_CHILD: {
                            readonly actions: readonly ["generateID", {
                                readonly name: "placeChild";
                                readonly description: "Must be in the ui";
                            }, "linkChild", "buildArrays", "buildUI"];
                        };
                        readonly ADD_SIBLING: {
                            readonly actions: readonly ["generateID", {
                                readonly name: "placeSibling";
                                readonly description: "Must be in the ui";
                            }, "linkSibling", "buildArrays", "buildUI"];
                        };
                        readonly ADD_EDGE: {
                            readonly actions: readonly ["addEdge", "buildArrays", "buildUI"];
                        };
                        readonly DELETE: {
                            readonly actions: readonly ["delete", "buildArrays", "buildUI"];
                        };
                        readonly SELECT: {
                            readonly actions: readonly ["select"];
                        };
                        readonly DESELECT: {
                            readonly actions: readonly ["deselect"];
                        };
                    };
                };
            };
        }, {
            CONFIGURE: {
                nodes: {
                    [x: string]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: number]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: symbol]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: number]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: symbol]: {
                        readonly from: string;
                        readonly to: string;
                    };
                };
            };
            CONFIGURE_EMPTY: {};
            MOVE: {
                readonly id: string;
                readonly x: number;
                readonly y: number;
            };
            MOVE_IMMEDIATE: {
                readonly id: string;
                readonly x: number;
                readonly y: number;
            };
            ADD_CHILD: string;
            ADD_SIBLING: string;
            DELETE: string;
            SELECT: string;
            DESELECT: {};
            ADD_EDGE: {
                readonly from: string;
                readonly to: string;
            };
        }, {}, {
            generatedId: string | null;
            nodes?: {
                readonly position: {
                    readonly x: number;
                    readonly y: number;
                };
                readonly data: {
                    readonly label: string | undefined;
                    readonly content: string;
                };
                readonly input: boolean;
                readonly id: string;
            }[] | undefined;
            edges?: {
                readonly from: string;
                readonly to: string;
                readonly id: string;
            }[] | undefined;
        }, {
            data?: {
                nodes: {
                    [x: string]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: number]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                    [x: symbol]: {
                        readonly position: {
                            readonly x: number;
                            readonly y: number;
                        };
                        readonly data: {
                            readonly content: string;
                            readonly label?: string | undefined;
                        };
                        readonly input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: number]: {
                        readonly from: string;
                        readonly to: string;
                    };
                    [x: symbol]: {
                        readonly from: string;
                        readonly to: string;
                    };
                };
            } | undefined;
            selected?: string | undefined;
            updatingUI?: boolean | undefined;
        }>>;
    };
};
export {};
//# sourceMappingURL=FlowChart.context.d.ts.map