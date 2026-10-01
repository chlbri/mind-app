# @bemedev/mind-flow

Flow Chart and diagramming UI library for [Solid.js](https://www.solidjs.com/)
applications.

## Features

- **Interactive Canvas**: Drag-and-drop nodes and interactive connecting edges.
- **Isolated Contexts**: Every `createContext()` call creates a dedicated engine and
  Solid context, so multiple flows coexist in the same application.
- **State Machine Powered**: State management built with `@bemedev/app`.
- **Git-Like History & Time Travel**: Built-in undo, redo, checkout, and commit
  history tracking with delta diff calculation.
- **Valibot Schema Validation**: Runtime data contracts and schema parsing powered by
  Valibot.
- **Zoom & Controls**: Built-in zoom in/out, reset, and node creation toolbar with
  customizable `controlsAddons`.
- **Dynamic Edge Creation**: Interactive drag-to-connect endpoints between nodes.
- **Edge Validation**: Guarded connection rules via `edgesAllowed` predicate.
- **Contextual Actions**: Customizable action toolbars rendered above selected nodes.
- **State Synchronization**: Context observation via `register` callback to track
  data, edges, zoom, selection, and history.
- **Type-Safe**: Full TypeScript definitions for nodes, edges, and configuration
  handlers.

## Installation

```bash
# Using pnpm
pnpm add @bemedev/mind-flow

# Peer dependencies
pnpm add solid-js @bemedev/app @bemedev/app-solidjs @thisbeyond/solid-dnd
pnpm add valibot
```

## Quick Start

Import the `createContext` factory and include the CSS stylesheet:

```tsx
import { createContext } from '@bemedev/mind-flow';
import '@bemedev/mind-flow/style.css';

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

## Custom Configuration

You can provide initial node and edge configurations, generic custom node data,
custom node components, overlay panels, and callback handlers:

```tsx
import {
  createContext,
  EditPanel,
  type NodeProps,
  type EdgeProps,
  type WithFlow,
} from '@bemedev/mind-flow';
import type { Component, ComponentProps } from 'solid-js';
import '@bemedev/mind-flow/style.css';

const [, Flow] = createContext();

type CustomData = { label?: string; content?: string; category?: string };

const CustomNode: Component<CustomData & WithFlow> = props => {
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
        Node={CustomNode}
        edgesAllowed={(source, target) => source.id !== target.id}
        panels={{
          topRight: panel => (
            <EditPanel<CustomData>
              flow={panel.flow}
              children={hooks => (
                <div>
                  <input
                    value={hooks.editingNode()?.data.label ?? ''}
                    onInput={e => hooks.updateField('label', e.currentTarget.value)}
                  />
                </div>
              )}
            />
          ),
        }}
        controlsAddons={() => (
          <button
            type='button'
            class='flex size-9 cursor-pointer items-center justify-center rounded-lg bg-emerald-600 text-white shadow'
            onClick={() => console.log('Custom action')}
            title='Custom action'
          >
            ★
          </button>
        )}
        onNodeAdded={node => console.log('Node added:', node)}
        onNodeDeleted={nodeId => console.log('Node deleted:', nodeId)}
        onEdgeAdded={edge => console.log('Edge added:', edge)}
        onEdgeDeleted={edgeId => console.log('Edge deleted:', edgeId)}
        register={context => console.log('Context update:', context)}
      />
    </div>
  );
};
```

## Exports

- **`createContext`**: Factory returning the `[useFlow, Flow]` tuple — an isolated
  Solid context with its accessor hook and root `Flow` component. The `Flow`
  component is not exported directly.
- **`createFlowService`**, **`FlowContext`**, **`WithFlow`**: Flow engine factory,
  its value type, and the `{ flow }` property bag injected into every flow component.
- **`FlowChart`**: Flowchart canvas component for custom embedding, requiring the
  `flow` prop.
- **`EditPanel`**: Configurable overlay panel component for editing active node data,
  requiring the `flow` prop.
- **`Panels`**: Overlay container component rendering custom canvas panels.
- **`EdgesBoard`**, **`EdgesBoardProps`**: SVG board overlay component and prop type
  rendering active connecting edges.
- **`EdgeCursive`**, **`EdgeStraight`**: Built-in curved (cubic bezier) and straight
  SVG edge components.
- **`FactoryEdge`**, **`FactoryProps`**: Higher-order component factory and options
  for creating custom SVG edges.
- **`createDraw`**: Helper creating type-safe SVG path draw functions for custom
  edges.
- **`MiddleDelete`**: Default middle overlay component providing edge deletion
  interaction.
- **`useEdge`**: Hook providing reactive state, computed vectors, and styling for
  edges.
- **`useClose`**, **`PanelHooks_P`**: Hook and options for managing panel closing
  transitions, hover timeouts, and outside-click dismissal.
- **`NodeProps`**: Generic type definition for node elements (`NodeProps<D>`).
- **`NodeHandles_T`**, **`nodeHandles`**: Type and schema for configuring node
  handles per side with custom colors and types.
- **`DefaultNodeSelected`**, **`DefaultNodeSelected_Props`**: Floating action toolbar
  component and prop types for selected nodes.
- **`NodesBoardControls`**, **`NodesControlsProps`**, **`DefaultControlsAddons`**:
  Viewport navigation toolbar controls component, prop types, and default root node
  creation addon button.
- **`EdgeProps`**: Type definition for edge connections (`EdgeProps<D>`).
- **`EdgeMiddleProps`**: Type definition for edge middle overlay components
  (`EdgeMiddleProps<D>`).
- **`EdgeExtremeties`**: Type representing edge connection endpoints with handle
  positions and indices.
- **`FlowProps`**: Generic props configuration type for `Flow` and `FlowChart`.
- **`Context`**: Type representing the observable flowchart context slice (`data`,
  `selected`, `zoom`, `editing`, `history`, `historyIndex`).
- **`ConfigFrom`**, **`NodesFrom`**, **`EdgesFrom`**: Type helpers extracting
  inferred config, nodes, and edges structures from `FlowProps`.
- **`calculateDiff`**, **`reconstructState`**, **`squashOldestCommit`**,
  **`MAX_HISTORY_SIZE`**: History engine utilities for computing delta diffs,
  replaying commits, and capping history depth.
- **`deepPartial`**, **`byFunction`**, **`soa`**, **`DeepPartial`**,
  **`DeepPartialSchema`**: Valibot schema helpers for constructing recursive partial
  and single-or-array schemas.
- **`Hook`**: Headless lifecycle atom component for executing callbacks during
  rendering.
- **`typings`**: Namespace exporting all Valibot schemas and inferred types
  (`FlowchartData`, `FlowchartDiff`, `HistoryEntry`, `CommitPayload`,
  `FlowchartNode`, `FlowchartEdge`, etc.).
- **`EditPanelProps`**, **`EditPanelChildProps`**: Types for `EditPanel` and its
  children accessor helpers.
- **`handlePosition`**, **`HandlePosition`**: Schema and type for node handle
  placement borders (`top`, `right`, `bottom`, `left`).
- **`handleType`**, **`HandleType`**: Schema and type for node connection handle
  classification (`'input'`, `'output'`, `'none'`).
- **`CLASSES`**: Array of Tailwind CSS safelist class names used in the UI.
- **`mouseOut`**, **`clickOutside`**, **`resize`**: Custom Solid.js directives for
  focus/hover handling, outside click detection, and node dimension observation.
- **`clamp`**: Number boundary constraint helper.
- **`cn`**: Utility for merging class names.

## License

[MIT](LICENSE)
