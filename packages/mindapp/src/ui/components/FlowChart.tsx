import { useState } from '@bemedev/app-solidjs';
import type { inferT } from '@bemedev/app/typings';
import { Component, onCleanup, onMount } from 'solid-js';

import type { edgeJSON, nodeJSON } from '../../services/main.typings';
import { useFlow } from './FlowChart.context';
import { DEFAULT_NODES } from './FlowChart.data';
import { NodesBoard } from './NodesBoard';

/** Serialized node properties type inferred from schema {@linkcode nodeJSON}. */
export type NodeProps = inferT<typeof nodeJSON>;

/** Serialized edge properties type inferred from schema {@linkcode edgeJSON}. */
export type EdgeProps = inferT<typeof edgeJSON>;

/**
 * Configuration options and callback handlers for the {@linkcode FlowChart}
 * component.
 */
export type FlowProps = {
  /** Initial flowchart state configuration with nodes and edges. */
  config?: {
    nodes?: (NodeProps & { id: string })[];
    edges?: (EdgeProps & { id: string })[];
  };
  /**
   * Callback triggered when a new node is created.
   *
   * @param node - The created node object of type {@linkcode NodeProps}.
   */
  onNodeAdded?: (node: NodeProps) => void;
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
 * @param props - Flowchart configuration and event handlers of type
 *   {@linkcode FlowProps}.
 *
 * @returns The rendered Solid component.
 */
export const FlowChart: Component<FlowProps> = props => {
  const primaryNodes = props.config?.nodes ?? DEFAULT_NODES;
  const primaryEdges = props.config?.edges;

  const { service } = useFlow();

  const hasNewEdge = useState(service, { selector: s => !!s.context.newEdge });

  onMount(() => {
    service.send({
      type: 'CONFIGURE',
      payload: { nodes: primaryNodes, edges: primaryEdges ?? [] },
    });
  });

  onCleanup(service.stop);

  return (
    <div
      class='relative h-full w-full'
      onMouseUp={() => service.send('CLEAR_NEW_EDGE')}
      onMouseMove={event => {
        service.send({
          type: 'MOVE_NEW_EDGE',
          payload: { x: event.clientX, y: event.clientY },
        });
      }}
      style={{}}
    >
      <div
        class='relative h-full w-full bg-white bg-size-[30px_30px]'
        style={{
          cursor: hasNewEdge() ? 'inherit' : 'crosshair',
          'background-image':
            'radial-gradient(circle, #b8b8b8bf 1px, rgba(0, 0, 0, 0) 1px)',
        }}
      >
        <NodesBoard />
      </div>
    </div>
  );
};
