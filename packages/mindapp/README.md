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

You can provide initial node and edge configurations, generic custom node data,
custom node components, overlay panels, and callback handlers:

```tsx
import { Flow, EditPanel, type NodeProps, type EdgeProps } from '@bemedev/mind-flow';
import type { Component, ComponentProps } from 'solid-js';
import '@bemedev/mind-flow/style.css';

type CustomData = { label?: string; content?: string; category?: string };

const CustomNode: Component<CustomData> = props => {
  return (
    <div class='p-3'>
      <div class='font-bold text-blue-600'>{props.label}</div>
      <div class='text-sm text-gray-600'>{props.content}</div>
      {props.category && (
        <span class='mt-1 inline-block rounded bg-gray-100 px-1 text-xs'>
          {props.category}
        </span>
      )}
    </div>
  );
};

type CustomFlowProps = ComponentProps<typeof Flow<CustomData>>;

const config: CustomFlowProps['config'] = {
  nodes: [
    {
      id: 'node-1',
      data: {
        label: 'Start',
        content: 'Starting point of workflow',
        category: 'Trigger',
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'node-2',
      data: { label: 'Process', content: 'Step 1 processing', category: 'Action' },
      position: { x: 400, y: 100 },
    },
  ],
  edges: [{ id: 'edge-1', from: 'node-1', to: 'node-2' }],
};

export const CustomFlow = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Flow<CustomData>
        config={config}
        component={CustomNode}
        panels={{
          topRight: () => (
            <EditPanel<CustomData>
              children={hooks => (
                <div>
                  <input
                    value={hooks.editing()?.data.label ?? ''}
                    onInput={e => hooks.updateField('label', e.currentTarget.value)}
                  />
                </div>
              )}
            />
          ),
        }}
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
- **`FlowChart`**: Flowchart canvas component for custom embedding inside existing
  context.
- **`Provider`**, **`useFlow`**: Solid context provider and hook for accessing the
  state machine service.
- **`EditPanel`**: Configurable overlay panel component for editing active node data.
- **`Panels`**: Overlay container component rendering custom canvas panels.
- **`NodeProps`**: Generic type definition for node elements (`NodeProps<D>`).
- **`EdgeProps`**: Type definition for edge connections.
- **`FlowProps`**: Generic props configuration type for `Flow` and `FlowChart`.
- **`EditPanelProps`**, **`EditPanelChildProps`**: Types for `EditPanel` and its
  children accessor helpers.
- **`CLASSES`**: Array of Tailwind CSS safelist class names used in the UI.
- **`mouseOut`**, **`clickOutside`**, **`resize`**: Custom Solid.js directives for
  focus/hover handling, outside click detection, and node dimension observation.
- **`clamp`**: Number boundary constraint helper.

## License

[MIT](LICENSE)
