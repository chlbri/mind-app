# @bemedev/mind-machine

State machine visualization and orchestration UI library for
[Solid.js](https://www.solidjs.com/) applications, built on top of
[`@bemedev/mind-flow`](https://www.npmjs.com/package/@bemedev/mind-flow).

`@bemedev/mind-machine` turns a
[`@bemedev/app`](https://www.npmjs.com/package/@bemedev/app) state machine (or an
existing flow history) into an interactive diagram, with git-like history,
localStorage persistence, and ready-to-use editing panels.

## Features

- **`FlowMachine` Component**: One component orchestrating state machine diagrams,
  parsing a machine configuration into default nodes and edges.
- **Machine Parsing**: `parseMachineToGraph` flattens states (atomic, compound,
  parallel), `on` / `after` / `always` transitions, hierarchy relations, entry/exit
  actions, activities, and actors into flowchart nodes and edges.
- **History Sources**: Render from a `@bemedev/app` machine, a flowchart history
  array, a persisted payload, or a raw `{ nodes, edges }` configuration.
- **localStorage Persistence**: Pass a single key or an array of key parts (composite
  key) to automatically restore and persist the flow history.
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
pnpm add solid-js @bemedev/app
```

## Quick Start

Import the `FlowMachine` component and include the stylesheet:

```tsx
import { FlowMachine } from '@bemedev/mind-machine';
import '@bemedev/mind-machine/style.css';

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
      <FlowMachine history={machine} localKeys='machine-flow-config' />
    </div>
  );
};
```

## Storage Keys

The `localKeys` prop accepts a single key or an array of key parts:

```tsx
// Single key: used directly
<FlowMachine history={machine} localKeys='machine-flow-config' />

// Composite key: parts are joined with '-'
<FlowMachine history={machine} localKeys={['order', 'payment']} />
```

The canvas restores the persisted history when a value exists under the derived key,
otherwise it falls back to the `history` prop. Without `localKeys`, nothing is
persisted. Empty histories are never persisted, so a configured diagram is not
replaced by a blank canvas on reload.

You can also rely on storage only:

```tsx
// Restore mode: no default configuration, localStorage only
<FlowMachine localKeys='machine-flow-config' />
```

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

- **Components**: `FlowMachine`, `StateMachineNode`, `StateMachineNodeSelected`,
  `StateMachineEditPanel`, `StateMachineEdge`, `StateMachineEdgeMiddle`,
  `TransitionModal`, `PrincipalPanel`, `HistoryControlsAddons`, `AtomicFiligrane`,
  `ActorInputs`, `ActivityInputs`, `GuardsInput`
- **Parsing**: `parseMachineToGraph`, `Principal`, `Principal.unique`
- **Configuration**: `configFromHistory`, `MachineConfigFrom`
- **Storage**: `getStorageKey`, `readHistory`, `writeHistory`,
  `createHistoryPersister`
- **Rules**: `machineEdgesAllowed`, `canDeleteGuard`, `DEFAULT_NODE_DATA`
- **Transitions**: `normalizeGuards`, `formatGuard`, `formatGuards`,
  `areGuardsEqual`, `checkTransitionConflict`, `getTransitionsFromState`
- **Helpers**: `createHandles`, `toList`, `monoLength`, `dispatchArray`,
  `isDirectChildOfPrincipal`
- **Signals**: `edgeFilters`, `activeActorNode`, `activeAddTransitionEdge`

## License

MIT
