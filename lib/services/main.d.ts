export declare const buildService: (machine?: import('@bemedev/app-ts').Machine<{
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
        position: {
            x: number;
            y: number;
        };
        data: {
            content: string;
            label?: string | undefined;
        };
        input: boolean;
        id: string;
    }[] | undefined;
    edges?: {
        from: string;
        to: string;
        id: string;
    }[] | undefined;
}, {
    data?: {
        nodes: {
            [x: string]: {
                position: {
                    x: number;
                    y: number;
                };
                data: {
                    content: string;
                    label?: string | undefined;
                };
                input: boolean;
            };
            [x: number]: {
                position: {
                    x: number;
                    y: number;
                };
                data: {
                    content: string;
                    label?: string | undefined;
                };
                input: boolean;
            };
            [x: symbol]: {
                position: {
                    x: number;
                    y: number;
                };
                data: {
                    content: string;
                    label?: string | undefined;
                };
                input: boolean;
            };
        };
        edges: {
            [x: string]: {
                from: string;
                to: string;
            };
            [x: number]: {
                from: string;
                to: string;
            };
            [x: symbol]: {
                from: string;
                to: string;
            };
        };
    } | undefined;
    selected?: string | undefined;
    updatingUI?: boolean | undefined;
}, {
    CONFIGURE: {
        nodes: {
            [x: string]: {
                position: {
                    x: number;
                    y: number;
                };
                data: {
                    content: string;
                    label?: string | undefined;
                };
                input: boolean;
            };
            [x: number]: {
                position: {
                    x: number;
                    y: number;
                };
                data: {
                    content: string;
                    label?: string | undefined;
                };
                input: boolean;
            };
            [x: symbol]: {
                position: {
                    x: number;
                    y: number;
                };
                data: {
                    content: string;
                    label?: string | undefined;
                };
                input: boolean;
            };
        };
        edges: {
            [x: string]: {
                from: string;
                to: string;
            };
            [x: number]: {
                from: string;
                to: string;
            };
            [x: symbol]: {
                from: string;
                to: string;
            };
        };
    };
    CONFIGURE_EMPTY: {};
    MOVE: {
        id: string;
        x: number;
        y: number;
    };
    MOVE_IMMEDIATE: {
        id: string;
        x: number;
        y: number;
    };
    ADD_CHILD: string;
    ADD_SIBLING: string;
    DELETE: string;
    SELECT: string;
    DESELECT: {};
    ADD_EDGE: {
        from: string;
        to: string;
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
                position: {
                    x: number;
                    y: number;
                };
                data: {
                    content: string;
                    label?: string | undefined;
                };
                input: boolean;
            };
            [x: number]: {
                position: {
                    x: number;
                    y: number;
                };
                data: {
                    content: string;
                    label?: string | undefined;
                };
                input: boolean;
            };
            [x: symbol]: {
                position: {
                    x: number;
                    y: number;
                };
                data: {
                    content: string;
                    label?: string | undefined;
                };
                input: boolean;
            };
        };
        edges: {
            [x: string]: {
                from: string;
                to: string;
            };
            [x: number]: {
                from: string;
                to: string;
            };
            [x: symbol]: {
                from: string;
                to: string;
            };
        };
    };
    CONFIGURE_EMPTY: {};
    MOVE: {
        id: string;
        x: number;
        y: number;
    };
    MOVE_IMMEDIATE: {
        id: string;
        x: number;
        y: number;
    };
    ADD_CHILD: string;
    ADD_SIBLING: string;
    DELETE: string;
    SELECT: string;
    DESELECT: {};
    ADD_EDGE: {
        from: string;
        to: string;
    };
}, {}, {
    generatedId: string | null;
    nodes?: {
        position: {
            x: number;
            y: number;
        };
        data: {
            content: string;
            label?: string | undefined;
        };
        input: boolean;
        id: string;
    }[] | undefined;
    edges?: {
        from: string;
        to: string;
        id: string;
    }[] | undefined;
}, {
    data?: {
        nodes: {
            [x: string]: {
                position: {
                    x: number;
                    y: number;
                };
                data: {
                    content: string;
                    label?: string | undefined;
                };
                input: boolean;
            };
            [x: number]: {
                position: {
                    x: number;
                    y: number;
                };
                data: {
                    content: string;
                    label?: string | undefined;
                };
                input: boolean;
            };
            [x: symbol]: {
                position: {
                    x: number;
                    y: number;
                };
                data: {
                    content: string;
                    label?: string | undefined;
                };
                input: boolean;
            };
        };
        edges: {
            [x: string]: {
                from: string;
                to: string;
            };
            [x: number]: {
                from: string;
                to: string;
            };
            [x: symbol]: {
                from: string;
                to: string;
            };
        };
    } | undefined;
    selected?: string | undefined;
    updatingUI?: boolean | undefined;
}>>) => {
    readonly contains: (...values: string[]) => () => boolean;
    readonly context: <R = {
        data?: {
            nodes: {
                [x: string]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: number]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: symbol]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
            };
            edges: {
                [x: string]: {
                    from: string;
                    to: string;
                };
                [x: number]: {
                    from: string;
                    to: string;
                };
                [x: symbol]: {
                    from: string;
                    to: string;
                };
            };
        } | undefined;
        selected?: string | undefined;
        updatingUI?: boolean | undefined;
    }>(accessor?: ((state: {
        data?: {
            nodes: {
                [x: string]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: number]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: symbol]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
            };
            edges: {
                [x: string]: {
                    from: string;
                    to: string;
                };
                [x: number]: {
                    from: string;
                    to: string;
                };
                [x: symbol]: {
                    from: string;
                    to: string;
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
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: number]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: symbol]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
            };
            edges: {
                [x: string]: {
                    from: string;
                    to: string;
                };
                [x: number]: {
                    from: string;
                    to: string;
                };
                [x: symbol]: {
                    from: string;
                    to: string;
                };
            };
        } | undefined;
        selected?: string | undefined;
        updatingUI?: boolean | undefined;
    }, import('@bemedev/app-ts/lib/events').ToEvents<{
        CONFIGURE: {
            nodes: {
                [x: string]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: number]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: symbol]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
            };
            edges: {
                [x: string]: {
                    from: string;
                    to: string;
                };
                [x: number]: {
                    from: string;
                    to: string;
                };
                [x: symbol]: {
                    from: string;
                    to: string;
                };
            };
        };
        CONFIGURE_EMPTY: {};
        MOVE: {
            id: string;
            x: number;
            y: number;
        };
        MOVE_IMMEDIATE: {
            id: string;
            x: number;
            y: number;
        };
        ADD_CHILD: string;
        ADD_SIBLING: string;
        DELETE: string;
        SELECT: string;
        DESELECT: {};
        ADD_EDGE: {
            from: string;
            to: string;
        };
    }, {}>> | {
        context: {
            data?: {
                nodes: {
                    [x: string]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                    [x: number]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                    [x: symbol]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        from: string;
                        to: string;
                    };
                    [x: number]: {
                        from: string;
                        to: string;
                    };
                    [x: symbol]: {
                        from: string;
                        to: string;
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
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                    [x: number]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                    [x: symbol]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        from: string;
                        to: string;
                    };
                    [x: number]: {
                        from: string;
                        to: string;
                    };
                    [x: symbol]: {
                        from: string;
                        to: string;
                    };
                };
            };
            CONFIGURE_EMPTY: {};
            MOVE: {
                id: string;
                x: number;
                y: number;
            };
            MOVE_IMMEDIATE: {
                id: string;
                x: number;
                y: number;
            };
            ADD_CHILD: string;
            ADD_SIBLING: string;
            DELETE: string;
            SELECT: string;
            DESELECT: {};
            ADD_EDGE: {
                from: string;
                to: string;
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
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                    [x: number]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                    [x: symbol]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        from: string;
                        to: string;
                    };
                    [x: number]: {
                        from: string;
                        to: string;
                    };
                    [x: symbol]: {
                        from: string;
                        to: string;
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
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                    [x: number]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                    [x: symbol]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        from: string;
                        to: string;
                    };
                    [x: number]: {
                        from: string;
                        to: string;
                    };
                    [x: symbol]: {
                        from: string;
                        to: string;
                    };
                };
            };
            CONFIGURE_EMPTY: {};
            MOVE: {
                id: string;
                x: number;
                y: number;
            };
            MOVE_IMMEDIATE: {
                id: string;
                x: number;
                y: number;
            };
            ADD_CHILD: string;
            ADD_SIBLING: string;
            DELETE: string;
            SELECT: string;
            DESELECT: {};
            ADD_EDGE: {
                from: string;
                to: string;
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
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                    [x: number]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                    [x: symbol]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        from: string;
                        to: string;
                    };
                    [x: number]: {
                        from: string;
                        to: string;
                    };
                    [x: symbol]: {
                        from: string;
                        to: string;
                    };
                };
            } | undefined;
            selected?: string | undefined;
            updatingUI?: boolean | undefined;
        };
        "context.data": {
            nodes: {
                [x: string]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: number]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: symbol]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
            };
            edges: {
                [x: string]: {
                    from: string;
                    to: string;
                };
                [x: number]: {
                    from: string;
                    to: string;
                };
                [x: symbol]: {
                    from: string;
                    to: string;
                };
            };
        } | undefined;
        "context.data.nodes": {
            [x: string]: {
                position: {
                    x: number;
                    y: number;
                };
                data: {
                    content: string;
                    label?: string | undefined;
                };
                input: boolean;
            };
            [x: number]: {
                position: {
                    x: number;
                    y: number;
                };
                data: {
                    content: string;
                    label?: string | undefined;
                };
                input: boolean;
            };
            [x: symbol]: {
                position: {
                    x: number;
                    y: number;
                };
                data: {
                    content: string;
                    label?: string | undefined;
                };
                input: boolean;
            };
        };
        "context.data.edges": {
            [x: string]: {
                from: string;
                to: string;
            };
            [x: number]: {
                from: string;
                to: string;
            };
            [x: symbol]: {
                from: string;
                to: string;
            };
        };
        "context.selected": string | undefined;
        "context.updatingUI": boolean | undefined;
    }, K extends Extract<keyof D, string> = Extract<keyof D, string>, R = D[K]>(selector: K, equals?: ((prev: NoInfer<R>, next: NoInfer<R>) => boolean) | undefined) => import('solid-js').Accessor<R>;
    readonly send: (_event: "CONFIGURE_EMPTY" | "DESELECT" | {
        type: "CONFIGURE_EMPTY";
        payload: {};
    } | {
        type: "CONFIGURE";
        payload: {
            nodes: {
                [x: string]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: number]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: symbol]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
            };
            edges: {
                [x: string]: {
                    from: string;
                    to: string;
                };
                [x: number]: {
                    from: string;
                    to: string;
                };
                [x: symbol]: {
                    from: string;
                    to: string;
                };
            };
        };
    } | {
        type: "MOVE";
        payload: {
            id: string;
            x: number;
            y: number;
        };
    } | {
        type: "MOVE_IMMEDIATE";
        payload: {
            id: string;
            x: number;
            y: number;
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
            from: string;
            to: string;
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
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                    [x: number]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                    [x: symbol]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        from: string;
                        to: string;
                    };
                    [x: number]: {
                        from: string;
                        to: string;
                    };
                    [x: symbol]: {
                        from: string;
                        to: string;
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
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                    [x: number]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                    [x: symbol]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        from: string;
                        to: string;
                    };
                    [x: number]: {
                        from: string;
                        to: string;
                    };
                    [x: symbol]: {
                        from: string;
                        to: string;
                    };
                };
            };
            CONFIGURE_EMPTY: {};
            MOVE: {
                id: string;
                x: number;
                y: number;
            };
            MOVE_IMMEDIATE: {
                id: string;
                x: number;
                y: number;
            };
            ADD_CHILD: string;
            ADD_SIBLING: string;
            DELETE: string;
            SELECT: string;
            DESELECT: {};
            ADD_EDGE: {
                from: string;
                to: string;
            };
        }, {}>;
        tags?: (string | readonly string[]) | undefined;
    }>(accessor?: ((state: import('@bemedev/app-ts').State<{
        data?: {
            nodes: {
                [x: string]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: number]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: symbol]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
            };
            edges: {
                [x: string]: {
                    from: string;
                    to: string;
                };
                [x: number]: {
                    from: string;
                    to: string;
                };
                [x: symbol]: {
                    from: string;
                    to: string;
                };
            };
        } | undefined;
        selected?: string | undefined;
        updatingUI?: boolean | undefined;
    }, import('@bemedev/app-ts/lib/events').ToEvents<{
        CONFIGURE: {
            nodes: {
                [x: string]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: number]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: symbol]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
            };
            edges: {
                [x: string]: {
                    from: string;
                    to: string;
                };
                [x: number]: {
                    from: string;
                    to: string;
                };
                [x: symbol]: {
                    from: string;
                    to: string;
                };
            };
        };
        CONFIGURE_EMPTY: {};
        MOVE: {
            id: string;
            x: number;
            y: number;
        };
        MOVE_IMMEDIATE: {
            id: string;
            x: number;
            y: number;
        };
        ADD_CHILD: string;
        ADD_SIBLING: string;
        DELETE: string;
        SELECT: string;
        DESELECT: {};
        ADD_EDGE: {
            from: string;
            to: string;
        };
    }, {}>> | {
        context: {
            data?: {
                nodes: {
                    [x: string]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                    [x: number]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                    [x: symbol]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        from: string;
                        to: string;
                    };
                    [x: number]: {
                        from: string;
                        to: string;
                    };
                    [x: symbol]: {
                        from: string;
                        to: string;
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
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                    [x: number]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                    [x: symbol]: {
                        position: {
                            x: number;
                            y: number;
                        };
                        data: {
                            content: string;
                            label?: string | undefined;
                        };
                        input: boolean;
                    };
                };
                edges: {
                    [x: string]: {
                        from: string;
                        to: string;
                    };
                    [x: number]: {
                        from: string;
                        to: string;
                    };
                    [x: symbol]: {
                        from: string;
                        to: string;
                    };
                };
            };
            CONFIGURE_EMPTY: {};
            MOVE: {
                id: string;
                x: number;
                y: number;
            };
            MOVE_IMMEDIATE: {
                id: string;
                x: number;
                y: number;
            };
            ADD_CHILD: string;
            ADD_SIBLING: string;
            DELETE: string;
            SELECT: string;
            DESELECT: {};
            ADD_EDGE: {
                from: string;
                to: string;
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
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: number]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: symbol]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
            };
            edges: {
                [x: string]: {
                    from: string;
                    to: string;
                };
                [x: number]: {
                    from: string;
                    to: string;
                };
                [x: symbol]: {
                    from: string;
                    to: string;
                };
            };
        };
        CONFIGURE_EMPTY: {};
        MOVE: {
            id: string;
            x: number;
            y: number;
        };
        MOVE_IMMEDIATE: {
            id: string;
            x: number;
            y: number;
        };
        ADD_CHILD: string;
        ADD_SIBLING: string;
        DELETE: string;
        SELECT: string;
        DESELECT: {};
        ADD_EDGE: {
            from: string;
            to: string;
        };
    }, {}, {
        data?: {
            nodes: {
                [x: string]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: number]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: symbol]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
            };
            edges: {
                [x: string]: {
                    from: string;
                    to: string;
                };
                [x: number]: {
                    from: string;
                    to: string;
                };
                [x: symbol]: {
                    from: string;
                    to: string;
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
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: number]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: symbol]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
            };
            edges: {
                [x: string]: {
                    from: string;
                    to: string;
                };
                [x: number]: {
                    from: string;
                    to: string;
                };
                [x: symbol]: {
                    from: string;
                    to: string;
                };
            };
        };
        CONFIGURE_EMPTY: {};
        MOVE: {
            id: string;
            x: number;
            y: number;
        };
        MOVE_IMMEDIATE: {
            id: string;
            x: number;
            y: number;
        };
        ADD_CHILD: string;
        ADD_SIBLING: string;
        DELETE: string;
        SELECT: string;
        DESELECT: {};
        ADD_EDGE: {
            from: string;
            to: string;
        };
    }, {}, {
        generatedId: string | null;
        nodes?: {
            position: {
                x: number;
                y: number;
            };
            data: {
                content: string;
                label?: string | undefined;
            };
            input: boolean;
            id: string;
        }[] | undefined;
        edges?: {
            from: string;
            to: string;
            id: string;
        }[] | undefined;
    }, {
        data?: {
            nodes: {
                [x: string]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: number]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: symbol]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
            };
            edges: {
                [x: string]: {
                    from: string;
                    to: string;
                };
                [x: number]: {
                    from: string;
                    to: string;
                };
                [x: symbol]: {
                    from: string;
                    to: string;
                };
            };
        } | undefined;
        selected?: string | undefined;
        updatingUI?: boolean | undefined;
    }, import('@bemedev/app-ts').MachineOptions<{
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
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: number]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: symbol]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
            };
            edges: {
                [x: string]: {
                    from: string;
                    to: string;
                };
                [x: number]: {
                    from: string;
                    to: string;
                };
                [x: symbol]: {
                    from: string;
                    to: string;
                };
            };
        };
        CONFIGURE_EMPTY: {};
        MOVE: {
            id: string;
            x: number;
            y: number;
        };
        MOVE_IMMEDIATE: {
            id: string;
            x: number;
            y: number;
        };
        ADD_CHILD: string;
        ADD_SIBLING: string;
        DELETE: string;
        SELECT: string;
        DESELECT: {};
        ADD_EDGE: {
            from: string;
            to: string;
        };
    }, {}, {
        generatedId: string | null;
        nodes?: {
            position: {
                x: number;
                y: number;
            };
            data: {
                content: string;
                label?: string | undefined;
            };
            input: boolean;
            id: string;
        }[] | undefined;
        edges?: {
            from: string;
            to: string;
            id: string;
        }[] | undefined;
    }, {
        data?: {
            nodes: {
                [x: string]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: number]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
                [x: symbol]: {
                    position: {
                        x: number;
                        y: number;
                    };
                    data: {
                        content: string;
                        label?: string | undefined;
                    };
                    input: boolean;
                };
            };
            edges: {
                [x: string]: {
                    from: string;
                    to: string;
                };
                [x: number]: {
                    from: string;
                    to: string;
                };
                [x: symbol]: {
                    from: string;
                    to: string;
                };
            };
        } | undefined;
        selected?: string | undefined;
        updatingUI?: boolean | undefined;
    }>>;
};
//# sourceMappingURL=main.d.ts.map