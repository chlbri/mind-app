# @bemedev/mind-flow

Flow Chart and diagramming UI library for [Solid.js](https://www.solidjs.com/)
applications.

## Features

- **Interactive Canvas**: Drag-and-drop nodes and interactive connecting edges.
- **State Machine Powered**: State management built with `@bemedev/app`.
- **Zoom & Controls**: Built-in zoom in/out, reset, and node creation toolbar.
- **Dynamic Edge Creation**: Interactive drag-to-connect endpoints between nodes.
- **Type-Safe**: Full TypeScript definitions for nodes, edges, and configuration
  handlers.

## Installation

```bash
# Using pnpm
pnpm add @bemedev/mind-flow

# Peer dependencies
pnpm add solid-js @bemedev/app @bemedev/app-solidjs @thisbeyond/solid-dnd
```

## Quick Start

Import the `Flow` component and include the CSS stylesheet:

```tsx
import { Flow } from '@bemedev/mind-flow';
import '@bemedev/mind-flow/style.css';

export const FlowDemo = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Flow />
    </div>
  );
};
```

## Custom Configuration

You can provide initial node and edge configurations, as well as callback handlers:

```tsx
import { Flow, type NodeProps, type EdgeProps } from '@bemedev/mind-flow';
import type { ComponentProps } from 'solid-js';
import '@bemedev/mind-flow/style.css';

type FlowProps = ComponentProps<typeof Flow>;

const config: FlowProps['config'] = {
  nodes: [
    {
      id: 'node-1',
      data: { label: 'Start', content: 'Starting point of workflow' },
      input: false,
      position: { x: 100, y: 100 },
    },
    {
      id: 'node-2',
      data: { label: 'Process', content: 'Step 1 processing' },
      input: true,
      position: { x: 400, y: 100 },
    },
  ],
  edges: [{ id: 'edge-1', from: 'node-1', to: 'node-2' }],
};

export const CustomFlow = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Flow
        config={config}
        onNodeAdded={node => console.log('Node added:', node)}
        onNodeDeleted={nodeId => console.log('Node deleted:', nodeId)}
        onEdgeAdded={edge => console.log('Edge added:', edge)}
        onEdgeDeleted={edgeId => console.log('Edge deleted:', edgeId)}
      />
    </div>
  );
};
```

## Exports

- **`Flow`**: Root Solid.js flowchart component wrapping context provider and canvas.
- **`NodeProps`**: Inferred type definition for node elements.
- **`EdgeProps`**: Inferred type definition for edge connections.
- **`CLASSES`**: Array of Tailwind CSS safelist class names used in the UI.

## License

[MIT](LICENSE)
