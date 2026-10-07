# @bemedev/mind-flow-three

Interactive 3D flow chart and visualization engine for
[Solid.js](https://www.solidjs.com/) applications, rendered with
[three.js](https://threejs.org/) and driven by a force-directed physics simulation.

## Features

- **3D WebGL Canvas**: Nodes and edges rendered as three.js objects (boxes, label
  sprites, Bézier tube edges) inside a WebGL scene with grid, lights and orbit
  controls.
- **Force-Directed Physics**: A custom 3D simulation lays out the graph with
  repulsion, edge springs, centering and damping; dragged nodes are pinned and the
  layout can be toggled at runtime.
- **Isolated Contexts**: Every `createContext()` call creates a dedicated engine and
  Solid context, so multiple flows coexist in the same application.
- **State Machine Powered**: State management built with `@bemedev/app`.
- **Git-Like History & Time Travel**: Built-in undo, redo, checkout, and commit
  history tracking with delta diff calculation.
- **User Interactions**: Raycasted node selection and dragging along a camera-facing
  plane, orbit/pan/dolly camera controls, and zoom synchronization with the machine
  state.
- **Custom 3D Content**: `Node` and `Edge` renderers receive the three.js group and
  mesh, so consumers can add 3D models, animations and custom materials.
- **Valibot Schema Validation**: Runtime data contracts and schema parsing powered by
  Valibot.
- **State Synchronization**: Context observation via `register` callback to track
  data, edges, zoom, selection, physics, and history.
- **Type-Safe**: Full TypeScript definitions for nodes, edges, and configuration
  handlers.

## Installation

```bash
# Using pnpm
pnpm add @bemedev/mind-flow-three

# Peer dependencies
pnpm add solid-js three @bemedev/app @bemedev/app-solidjs
pnpm add valibot
```

## Quick Start

Import the `createContext` factory and include the CSS stylesheet:

```tsx
import { createContext } from '@bemedev/mind-flow-three';
import '@bemedev/mind-flow-three/style.css';

const [, Flow] = createContext();

export const FlowDemo = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Flow />
    </div>
  );
};
```

`createContext` returns a tuple with the `useFlow` hook and the `Flow` component,
bound to an isolated context so several flows can coexist. Every other component
receives the hook result as a `flow` prop, while custom children read it with the
hook.

## Custom 3D Nodes and Edges

Provide `Node` and `Edge` renderers to populate the three.js objects with custom
models, animations and materials:

```tsx
import { createContext } from '@bemedev/mind-flow-three';
import { BoxGeometry, Mesh, MeshStandardMaterial } from 'three';

const [useFlow, Flow] = createContext();

const Node = ({ group, data }) => {
  const existing = group.getObjectByName('custom-box');
  if (existing) return;

  const mesh = new Mesh(
    new BoxGeometry(2, 2, 2),
    new MeshStandardMaterial({ color: data.color ?? '#38bdf8' }),
  );
  mesh.name = 'custom-box';
  group.add(mesh);
};

export const CustomFlow = () => (
  <Flow Node={Node} config={{ nodes: [], edges: [] }} />
);
```

## Physics Simulation

The force-directed simulation runs by default and settles automatically. Toggle it at
runtime, pin nodes, or apply simulated positions in batch:

```tsx
const { send } = useFlow();

send({ type: 'TOGGLE_PHYSICS' });
send({ type: 'PIN_NODE', payload: { id: 'node-0', fixed: true } });
send({ type: 'APPLY_PHYSICS', payload: simulation.positions() });
```

## License

MIT © [chlbri](https://bemedev.vercel.app)
