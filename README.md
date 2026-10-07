# Mind App Monorepo

Flow Chart UI library and interactive showroom application built with
[Solid.js](https://www.solidjs.com/).

## Monorepo Structure

This project is organized as a pnpm monorepo containing the following workspaces:

- **[`packages/mindapp`](packages/mindapp)** (`@bemedev/mind-flow`) - The Flow Chart
  UI library
  - `src/services/` - State management and business logic with `@bemedev/app`
  - `src/ui/components/` - Solid.js components (`Flow`, `NodesBoard`, `Edges`,
    interactive canvas)
  - `src/helpers/` - Utility functions, context helpers, and point calculations
  - `src/index.ts` - Public API exports
- **[`packages/mind-machine`](packages/mind-machine)** (`@bemedev/mind-machine`) -
  State machine visualization library built on `@bemedev/mind-flow`
  - `src/FlowMachine.tsx` - Core component orchestrating machine diagrams
  - `src/parser.ts` - `@bemedev/app` machine to flowchart parser
  - `src/components/` - Nodes, edges, panels, and transition tooling
- **[`packages/mindapp-three`](packages/mindapp-three)** (`@bemedev/mind-flow-three`)
  - Interactive 3D flow chart engine rendered with [three.js](https://threejs.org/)
    and driven by a force-directed physics simulation
  - `src/services/` - State management and business logic with `@bemedev/app`
  - `src/ui/components/` - Solid.js components (`Flow`, `Scene`, `Panels`) with the
    WebGL renderer, orbit controls and raycasted interactions
  - `src/ui/globals/physics/` - `ForceSimulation3D` force-directed layout engine
  - `src/ui/globals/three/` - three.js factories (label sprites, node boxes, tube
    edges)
- **[`packages/mind-machine-three`](packages/mind-machine-three)**
  (`@bemedev/mind-machine-three`) - 3D state machine visualization library built on
  `@bemedev/mind-flow-three`
  - `src/FlowMachine.tsx` - Core component orchestrating 3D machine diagrams
  - `src/parser.ts` - `@bemedev/app` machine to 3D graph parser
  - `src/components/` - 3D nodes, 3D edges, and overlay panels
- **[`apps/showroom`](apps/showroom)** (`mind-app-showroom`) - Interactive showroom
  application demonstrating the library
  - `src/routes/` - TanStack Router application routes and interactive demos
  - `src/globals/` - Shared utilities, types, and UI components

## Development

```bash
# Install dependencies
pnpm install

# Run showroom development server
pnpm --filter mind-app-showroom dev

# Build all packages and applications
pnpm run build

# Run test suites across monorepo
pnpm run test

# Format and lint code
pnpm run lint
```

## Library Usage

Install the `@bemedev/mind-flow` package and peer dependencies:

```bash
pnpm add @bemedev/mind-flow solid-js @bemedev/app @bemedev/app-solidjs @thisbeyond/solid-dnd
```

Import `Flow` and the accompanying stylesheet:

```tsx
import { Flow } from '@bemedev/mind-flow';
import '@bemedev/mind-flow/style.css';

export const Demo = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Flow />
    </div>
  );
};
```

See [`packages/mindapp/README.md`](packages/mindapp/README.md) for full
documentation, custom configurations, and API references.

## Machine Usage

Install the `@bemedev/mind-machine` package and peer dependencies:

```bash
pnpm add @bemedev/mind-machine solid-js @bemedev/app
```

Import `FlowMachine` and the accompanying stylesheet:

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

export const Demo = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <FlowMachine history={machine} localKeys='machine-flow-config' />
    </div>
  );
};
```

See [`packages/mind-machine/README.md`](packages/mind-machine/README.md) for full
documentation, parsing utilities, and API references.

## 3D Flow Usage

Install the `@bemedev/mind-flow-three` package and peer dependencies:

```bash
pnpm add @bemedev/mind-flow-three solid-js three @bemedev/app @bemedev/app-solidjs
```

Import `createContext` and the accompanying stylesheet:

```tsx
import { createContext } from '@bemedev/mind-flow-three';
import '@bemedev/mind-flow-three/style.css';

const [, Flow] = createContext();

export const Demo = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Flow />
    </div>
  );
};
```

See [`packages/mindapp-three/README.md`](packages/mindapp-three/README.md) for full
documentation, custom 3D renderers, and the physics simulation API.

## 3D Machine Usage

Install the `@bemedev/mind-machine-three` package and peer dependencies:

```bash
pnpm add @bemedev/mind-machine-three solid-js three @bemedev/app @bemedev/mind-flow-three
```

Import `createContext` and the accompanying stylesheet:

```tsx
import { createContext } from '@bemedev/mind-machine-three';
import '@bemedev/mind-machine-three/style.css';

const [, FlowMachine] = createContext();

const machine = {
  initial: 'idle',
  states: {
    idle: { on: { START: '/running' } },
    running: { after: { '3000ms': '/idle' } },
  },
};

export const Demo = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <FlowMachine history={machine} />
    </div>
  );
};
```

See [`packages/mind-machine-three/README.md`](packages/mind-machine-three/README.md)
for full documentation and 3D rendering components.
