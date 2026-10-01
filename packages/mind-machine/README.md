# @bemedev/mind-machine

State machine visualization and orchestration UI library for
[Solid.js](https://www.solidjs.com/) applications, built on top of
[`@bemedev/mind-flow`](https://www.npmjs.com/package/@bemedev/mind-flow).

`@bemedev/mind-machine` turns a
[`@bemedev/app`](https://www.npmjs.com/package/@bemedev/app) state machine (or an
existing flow history) into an interactive diagram, with git-like history and
ready-to-use editing panels.

## Features

- **`FlowMachine` Component**: One component orchestrating state machine diagrams,
  parsing a machine configuration into default nodes and edges.
- **Machine Parsing**: `parseMachineToGraph` flattens states (atomic, compound,
  parallel), `on` / `after` / `always` transitions, hierarchy relations, entry/exit
  actions, activities, and actors into flowchart nodes and edges.
- **History Sources**: Render from a `@bemedev/app` machine, a flowchart history
  array, a persisted payload, or a raw `{ nodes, edges }` configuration.
- **Consumer-managed Persistence**: Read the stored history yourself, pass it as the
  required `history` prop, and persist each commit through the `register` callback.
- **Transition Tooling**: Guard formatting, normalization, equality checks, and
  conflict detection helpers.
- **Ready-to-use Panels**: Transition modal, state editor, principal node panel,
  actor/activity/guard inputs, history controls (undo, redo, commit, checkout).
- **Type-Safe**: Full TypeScript definitions for machine node data, edge data, and
  parsing utilities.

## Installation

```bash
# Using pnpm
pnpm add @bemedev/mind-machine

# Peer dependencies
pnpm add solid-js @bemedev/app valibot @bemedev/app-valibot

# Styling peer dependencies
pnpm add tailwindcss @tailwindcss/vite tailwindcss-animate tw-animate-css
```

## Quick Start

Import the context factory and include the stylesheet:

```tsx
import { createContext } from '@bemedev/mind-machine';
import '@bemedev/mind-machine/style.css';

const [, FlowMachine] = createContext();

const machine = {
  initial: 'idle',
  states: {
    idle: { on: { START: '/running' } },
    running: { after: { '3000ms': '/idle' } },
  },
};

export const MachineDemo = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* A machine configuration provides the default nodes and edges */}
      <FlowMachine history={machine} />
    </div>
  );
};
```

`createContext` returns a tuple with the `useFlow` hook and the `FlowMachine`
component. The component is not exported directly: obtain it from the factory. All
other machine components receive the hook result as a `flow` prop.

## Persistence

The `history` prop is required, and persistence is delegated to the consumer. Read
the stored payload before mounting, pass it as `history`, and persist each commit
through the `register` callback:

```tsx
import { createContext } from '@bemedev/mind-machine';

const [, FlowMachine] = createContext();

export const MachineDemo = () => {
  const stored = readHistory();

  return (
    <FlowMachine
      history={stored ?? machine}
      register={({ history, historyIndex }) =>
        writeHistory({ history, historyIndex })
      }
    />
  );
};
```

The package never touches storage itself: without a `register` callback nothing is
persisted, and `readHistory` / `writeHistory` above stand for your own storage layer.
Keep the empty-history guard there so a configured diagram is never replaced by a
blank canvas on reload.

## Custom Machine Contexts

Call `createContext` to get a fresh, isolated pair — useful to manage several
independent machine diagrams in the same application:

```tsx
import { createContext } from '@bemedev/mind-machine';

const [, FlowMachine] = createContext();

export const MachineDemo = () => <FlowMachine history={machine} />;
```

Every other component (nodes, edges, panels, inputs) receives the hook result as a
`flow` prop, so it can also be rendered outside of the `FlowMachine` subtree, as long
as a flow value is provided.

## Parsing Machines

Use `parseMachineToGraph` to build flowchart nodes and edges yourself:

```ts
import { parseMachineToGraph } from '@bemedev/mind-machine';

const { nodes, edges } = parseMachineToGraph(
  {
    initial: 'cart',
    states: { cart: { on: { CHECKOUT: '/payment' } }, payment: {} },
  },
  // Optional manual layout positions
  { '/cart': { x: 50, y: 140 }, '/payment': { x: 380, y: 140 } },
);
```

## Main Exports

- **Context**: `createContext` (returns `[useFlow, FlowMachine]`)
- **Components**: `StateMachineNode`, `StateMachineNodeSelected`,
  `StateMachineEditPanel`, `StateMachineEdge`, `StateMachineEdgeMiddle`,
  `TransitionModal`, `PrincipalPanel`, `HistoryControlsAddons`, `AtomicFiligrane`,
  `ActorInputs`, `ActivityInputs`, `GuardsInput` — all requiring the `flow` prop
- **Parsing**: `parseMachineToGraph`, `Principal`, `Principal.unique`
- **Configuration**: `configFromHistory`, `MachineConfigFrom`
- **Rules**: `machineEdgesAllowed`, `canDeleteGuard`, `DEFAULT_NODE_DATA`
- **Transitions**: `normalizeGuards`, `formatGuard`, `formatGuards`,
  `areGuardsEqual`, `checkTransitionConflict`, `getTransitionsFromState`
- **Helpers**: `createHandles`, `toList`, `monoLength`, `dispatchArray`,
  `isDirectChildOfPrincipal`
- **Signals**: `edgeFilters`, `activeActorNode`, `activeAddTransitionEdge`
- **Valibot Schemas**: `valibot` namespace with `nodeData`, `edgeData`,
  `machineNode`, `machineEdge`, `machineDiff` and `historyModel` schemas
- **Panel Lifecycle**: `useClose`, `PanelHooks_P`

## License

MIT
