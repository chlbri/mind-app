import { createState } from '@bemedev/app-solidjs';
import type { inferT } from '@bemedev/app/typings';
import { type Component, type JSX, onCleanup, onMount } from 'solid-js';

import { DEFAULT_NODES } from '../../services/main.machine.data';
import type {
  edgeJSON,
  NodeData,
  NodeProps,
} from '../../services/main.machine.typings';
import { useFlow } from './FlowChart.context';
import { NodesBoard } from './NodesBoard';

export type { NodeProps, NodeData };

/** Serialized edge properties type inferred from schema {@linkcode edgeJSON}. */
export type EdgeProps = inferT<typeof edgeJSON>;

/** Overlay panel slots positioned around the flowchart canvas. */
export type FlowPanels = {
  /** Top-left corner overlay panel slot. */
  topLeft?: JSX.Element;
  /** Top-right corner overlay panel slot. */
  topRight?: JSX.Element;
  /** Bottom-left corner overlay panel slot. */
  bottomLeft?: JSX.Element;
};

/**
 * Configuration options and callback handlers for the {@linkcode FlowChart}
 * component.
 *
 * @template | {@linkcode NodeData} `D` - Custom node data dictionary type extending
 *   {@linkcode NodeData}.
 */
export type FlowProps<D extends NodeData = NodeData> = {
  /** Initial flowchart state configuration with nodes and edges. */
  config?: {
    nodes?: (NodeProps<D> & { id: string })[];
    edges?: (EdgeProps & { id: string })[];
  };
  /** Custom node component to render inside each flowchart node. */
  nodeComponent?: Component<D>;
  /** Alias for {@linkcode nodeComponent}. */
  NodeComponent?: Component<D>;
  /** Default data for new nodes created in the flowchart. */
  defaultData?: D;
  /** Custom overlay panels positioned around the canvas. */
  panels?: FlowPanels;
  /**
   * Callback triggered when a new node is created.
   *
   * @param node - The created node object of type {@linkcode NodeProps}.
   */
  onNodeAdded?: (node: NodeProps<D>) => void;
  /**
   * Callback triggered when a node is deleted.
   *
   * @param nodeId - The identifier of the deleted node.
   */
  onNodeDeleted?: (nodeId: string) => void;
  /**
   * Callback triggered when an edge is created.
   *
   * @param edge - The created edge object of type {@linkcode EdgeProps}.
   */
  onEdgeAdded?: (edge: EdgeProps) => void;
  /**
   * Callback triggered when an edge is deleted.
   *
   * @param edgeId - The identifier of the deleted edge.
   */
  onEdgeDeleted?: (edgeId: string) => void;
};

// const PARENT_CHILD_GAP_WIDTH = 75;

/**
 * Flowchart board canvas component that renders interactive nodes, edges, pan/zoom,
 * and toolbar controls.
 *
 * @template | {@linkcode NodeData} `D` - Custom node data dictionary type extending
 *   {@linkcode NodeData}.
 *
 * @param props - Flowchart configuration and event handlers of type
 *   {@linkcode FlowProps}.
 *
 * @returns The rendered Solid component.
 *
 * @see {@linkcode NodesBoard}, {@linkcode useFlow}, {@linkcode DEFAULT_NODES}
 */
export const FlowChart = <D extends NodeData = NodeData>(
  props: FlowProps<D>,
): JSX.Element => {
  const primaryNodes = props.config?.nodes ?? DEFAULT_NODES;
  const primaryEdges = props.config?.edges;
  const service = useFlow();
  const hasNewEdge = createState(service, { selector: s => !!s.context.newEdge });
  onCleanup(service.pause);

  onMount(() => {
    service.resume();
    service.send({
      type: 'CONFIGURE',
      payload: {
        nodes: primaryNodes,
        edges: primaryEdges ?? [],
        defaultData: props.defaultData,
      },
    });
  });

  return (
    <div
      class='relative h-full w-full'
      onMouseUp={() => service.send('CLEAR_NEW_EDGE')}
      onMouseMove={({ clientX, clientY }) => {
        if (hasNewEdge())
          service.send({
            type: 'MOVE_NEW_EDGE',
            payload: { x: clientX, y: clientY },
          });
      }}
    >
      <div
        class='relative h-full w-full bg-white bg-size-[30px_30px]'
        style={{
          cursor: hasNewEdge() ? 'inherit' : 'crosshair',
          'background-image':
            'radial-gradient(circle, #b8b8b8bf 1px, rgba(0, 0, 0, 0) 1px)',
        }}
      >
        <NodesBoard
          panels={props.panels}
          nodeComponent={props.nodeComponent ?? props.NodeComponent}
        />
      </div>
    </div>
  );
};
