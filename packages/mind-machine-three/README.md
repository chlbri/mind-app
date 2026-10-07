# @bemedev/mind-machine-three

3D state machine visualization and orchestration UI library for
[Solid.js](https://www.solidjs.com/) applications, built on top of
[`@bemedev/mind-flow-three`](../mindapp-three) and rendered with
[three.js](https://threejs.org/).

## Features

- **3D State Machine Diagrams**: Every state of a `@bemedev/app` machine becomes a
  three.js box node colored by classification (atomic, compound, parallel), connected
  by curved tube edges colored by transition category.
- **Four Edge Categories**: `on`, `after`, `always` and `child_parent` transitions
  are rendered with distinct colors, labels and hierarchy styling.
- **Force-Directed Layout**: The scene runs the `@bemedev/mind-flow-three` physics
  simulation, laying out the machine graph in 3D space and settling automatically.
- **Custom 3D Node and Edge Renderers**: `StateMachineNode3D` and
  `StateMachineEdge3D` populate the three.js objects with state metadata, initial
  badges, actor badges and midpoint transition labels.
- **Machine Parser**: `parseMachineToGraph` flattens nested, compound and parallel
  states into 3D nodes and edges, auto-laid out on rank columns, rows and hierarchy
  layers.
- **Git-Like History & Time Travel**: Built-in undo, redo and checkout controls
  through the `HistoryControls` overlay panel.
- **Principal Panel**: The root machine node is rendered in a top-right HTML panel
  instead of the scene, keeping the machine summary always visible.
- **Isolated Contexts**: Every `createContext()` call creates a dedicated engine and
  Solid context, so multiple machines coexist in the same application.
- **Transition Validation**: Guard and transition conflict detection helpers
  (`checkTransitionConflict`, `normalizeGuards`).
- **Valibot Schema Validation**: Runtime data contracts for nodes, edges, actors,
  activities and persisted payloads.

## Installation

```bash
# Using pnpm
pnpm add @bemedev/mind-machine-three

# Peer dependencies
pnpm add solid-js three @bemedev/app @bemedev/mind-flow-three
pnpm add valibot
```

## Quick Start

Import the `createContext` factory and include the CSS stylesheet:

```tsx
import { createContext } from '@bemedev/mind-machine-three';
import '@bemedev/mind-machine-three/style.css';

const [, FlowMachine] = createContext();

const machineConfig = {
  id: 'orderProcess',
  initial: 'cart',
  states: {
    cart: { on: { CHECKOUT: '/payment' } },
    payment: { after: { TIMEOUT: '/cart' } },
  },
};

export const MachineDemo = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <FlowMachine history={machineConfig} />
    </div>
  );
};
```

`createContext` returns a tuple with the `useFlow` hook and the `FlowMachine`
component, bound to an isolated context so several machines can coexist. Every other
component receives the hook result as a `flow` prop, while custom children read it
with the hook.

## Accepted `history` Sources

The required `history` prop accepts any of the following:

- A `@bemedev/app` state machine configuration or machine instance, parsed with
  `parseMachineToGraph` into default 3D nodes and edges.
- A scene history array of type `typings.HistoryEntry[]`, reconstructed at its last
  commit.
- A persisted payload `{ history, historyIndex }`, reconstructed at `historyIndex`.
- A scene configuration `{ nodes, edges }`, used as-is.

## Persistence

Persistence is delegated to the consumer: read the stored history before mounting,
pass it as `history`, and persist the registered context through `register`:

```tsx
import { createContext } from '@bemedev/mind-machine-three';
import { valibot } from '@bemedev/mind-machine-three';

const [, FlowMachine] = createContext();

<FlowMachine
  history={readStoredPayload()}
  register={context => writeStoredPayload(context)}
/>;
```

## License

MIT © [chlbri](https://bemedev.vercel.app)
