import type { ContextFrom } from '@bemedev/app';
import type { NotUndefined } from '@bemedev/app/bemedev';
import type { Component, JSX } from 'solid-js';

import type { machine } from '#services/main.machine';
import type { Edge, EdgeExtremeties, Node } from '#services/main.machine.typings';

import type { EdgeProps } from './edges/types';
import type { Data, NodeProps } from './FlowChart';
import type { NodeComponentProps } from './nodes/Node';

/**
 * Subset of the state machine context exposed for external registration and
 * inspection.
 *
 * @see {@linkcode machine}
 */
export type Context = Pick<
  ContextFrom<typeof machine>,
  'data' | 'selected' | 'zoom' | 'editing' | 'history' | 'historyIndex'
>;

/** Overlay panel slots positioned around the flowchart canvas. */
export type FlowPanels = {
  /** Top-left corner overlay panel slot component of type {@linkcode Component}. */
  topLeft?: Component;
  /** Top-right corner overlay panel slot component of type {@linkcode Component}. */
  topRight?: Component;
  /** Bottom-left corner overlay panel slot component of type {@linkcode Component}. */
  bottomLeft?: Component;
};

/**
 * Configuration options and callback handlers for the {@linkcode FlowChart}
 * component.
 *
 * @template | {@linkcode Data} `N` - Custom node data dictionary type extending type
 *   {@linkcode Data}.
 * @template | {@linkcode Data} `E` - Custom edge data dictionary type extending type
 *   {@linkcode Data}.
 */
export type FlowProps<N extends Data = Data, E extends Data = Data> = {
  /** Optional child elements rendered inside the flowchart context provider. */
  children?: JSX.Element;
  /** Optional delay in milliseconds before mounting the flowchart canvas. */
  delay?: number;
  /** Initial flowchart state configuration with nodes and edges. */
  config?: { nodes?: Node<N>[]; edges?: (Edge<E> & { id: string })[] };
  /** Custom node component to render inside each flowchart node. */
  Node?: Component<N>;

  /** Custom component rendered above the selected node for contextual actions. */
  NodeSelected?: NodeComponentProps<N>['Selected'];

  /**
   * Custom predicate determining whether an edge connection between two nodes is
   * permitted.
   *
   * @param first - The source node object.
   * @param second - The target node object.
   * @param edge - Edge extremities specifying connection points and handle indices
   *   of type {@linkcode EdgeExtremeties}.
   *
   * @returns `true` if the edge connection is allowed, `false` otherwise.
   */
  edgesAllowed?: (
    first: NodeProps<N> & { id: string },
    second: NodeProps<N> & { id: string },
    edge: EdgeExtremeties,
  ) => boolean;

  /** Custom edge component to render inside each flowchart edge. */
  Edge?: Component<EdgeProps<E>>;

  /** Default data for new nodes created in the flowchart. */
  defaultData?: N;
  /** Custom overlay panels positioned around the canvas. */
  panels?: FlowPanels;
  /**
   * Callback triggered when a new node is created.
   *
   * @param node - The created node object of type {@linkcode NodeProps}.
   */
  onNodeAdded?: (node: NodeProps<N>) => void;
  /**
   * Callback triggered when a node is deleted.
   *
   * @param nodeId - The identifier of the deleted node.
   */
  onNodeDeleted?: (nodeId: string) => void;
  /**
   * Callback triggered when an edge is created.
   *
   * @param edge - The created edge object of type {@linkcode Edge}.
   */
  onEdgeAdded?: (edge: Edge) => void;
  /**
   * Callback triggered when an edge is deleted.
   *
   * @param edgeId - The identifier of the deleted edge.
   */
  onEdgeDeleted?: (edgeId: string) => void;
  /** Optional custom controls addon component of type {@linkcode Component}. */
  controlsAddons?: Component;
  /**
   * Callback invoked whenever the state machine context changes across working
   * states.
   *
   * @param context - The current state machine context subset of type
   *   {@linkcode Context}.
   */
  register?: (context: Context) => void;
};

/**
 * Type alias extracting the non-undefined flowchart configuration object.
 *
 * @template | {@linkcode Data} `N` - Custom node data dictionary type extending type
 *   {@linkcode Data}.
 * @template | {@linkcode Data} `E` - Custom edge data dictionary type extending type
 *   {@linkcode Data}.
 */
export type ConfigFrom<N extends Data = Data, E extends Data = Data> = NotUndefined<
  FlowProps<N, E>['config']
>;

/**
 * Type alias extracting the non-undefined list of nodes from flowchart
 * configuration.
 *
 * @template | {@linkcode Data} `N` - Custom node data dictionary type extending type
 *   {@linkcode Data}.
 */
export type NodesFrom<N extends Data = Data> = NotUndefined<
  ConfigFrom<N, any>['nodes']
>;

/**
 * Type alias extracting the non-undefined list of edges from flowchart
 * configuration.
 *
 * @template | {@linkcode Data} `E` - Custom edge data dictionary type extending type
 *   {@linkcode Data}.
 */
export type EdgesFrom<E extends Data = Data> = NotUndefined<
  ConfigFrom<any, E>['edges']
>;
