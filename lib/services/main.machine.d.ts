export declare const buildEdgeId: (out: string, _in: string) => string;
export declare const buildNodeID: (generated: string | null) => string;
export declare const machine: import('@bemedev/app-ts').Machine<{
    readonly __tsSchema: {
        readonly targets: Exclude<import('./main.machine.gen')._AllPaths["machine"], "/">;
        readonly states: {
            readonly idle: {
                readonly targets: Exclude<import('./main.machine.gen')._AllPaths["machine"], "/idle">;
            };
            readonly construction: {
                readonly targets: Exclude<import('./main.machine.gen')._AllPaths["machine"], "/construction">;
            };
            readonly working: {
                readonly targets: Exclude<import('./main.machine.gen')._AllPaths["machine"], "/working">;
            };
        };
        readonly initial: "idle" | "construction" | "working";
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
        readonly construction: {
            readonly always: {
                readonly actions: readonly ["buildArrays", "buildUI"];
                readonly target: "/working";
            };
        };
        readonly working: {
            readonly on: {
                readonly MOVE: {
                    readonly actions: readonly ["moveNode", "buildArrays", "buildUI"];
                    readonly target: "/construction";
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
                    }, "linkChild"];
                    readonly target: "/construction";
                };
                readonly ADD_SIBLING: {
                    readonly actions: readonly ["generateID", {
                        readonly name: "placeSibling";
                        readonly description: "Must be in the ui";
                    }, "linkSibling"];
                    readonly target: "/construction";
                };
                readonly ADD_EDGE: {
                    readonly actions: readonly ["addEdge"];
                    readonly target: "/construction";
                };
                readonly DELETE: {
                    readonly actions: readonly ["delete"];
                    readonly target: "/construction";
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
}, {}, import('@bemedev/app-ts').MachineOptions<{
    readonly __tsSchema: {
        readonly targets: Exclude<import('./main.machine.gen')._AllPaths["machine"], "/">;
        readonly states: {
            readonly idle: {
                readonly targets: Exclude<import('./main.machine.gen')._AllPaths["machine"], "/idle">;
            };
            readonly construction: {
                readonly targets: Exclude<import('./main.machine.gen')._AllPaths["machine"], "/construction">;
            };
            readonly working: {
                readonly targets: Exclude<import('./main.machine.gen')._AllPaths["machine"], "/working">;
            };
        };
        readonly initial: "idle" | "construction" | "working";
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
        readonly construction: {
            readonly always: {
                readonly actions: readonly ["buildArrays", "buildUI"];
                readonly target: "/working";
            };
        };
        readonly working: {
            readonly on: {
                readonly MOVE: {
                    readonly actions: readonly ["moveNode", "buildArrays", "buildUI"];
                    readonly target: "/construction";
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
                    }, "linkChild"];
                    readonly target: "/construction";
                };
                readonly ADD_SIBLING: {
                    readonly actions: readonly ["generateID", {
                        readonly name: "placeSibling";
                        readonly description: "Must be in the ui";
                    }, "linkSibling"];
                    readonly target: "/construction";
                };
                readonly ADD_EDGE: {
                    readonly actions: readonly ["addEdge"];
                    readonly target: "/construction";
                };
                readonly DELETE: {
                    readonly actions: readonly ["delete"];
                    readonly target: "/construction";
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
//# sourceMappingURL=main.machine.d.ts.map