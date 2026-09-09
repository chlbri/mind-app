import type { NotUndefined } from '@bemedev/app/bemedev';
import type { Component } from 'solid-js';

import type { Edge } from '#services/main.machine.typings';

import type { EdgeProps } from './edges/types';
import type { Data, NodeProps } from './FlowChart';

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
 * @template | Type {@linkcode Data} `D` - Custom node data dictionary type extending
 *   type {@linkcode Data}.
 */
export type FlowProps<N extends Data = Data, E extends Data = Data> = {
  /** Optional delay in milliseconds before mounting the flowchart canvas. */
  delay?: number;
  /** Initial flowchart state configuration with nodes and edges. */
  config?: {
    nodes?: (NodeProps<N> & { id: string })[];
    edges?: (Edge<E> & { id: string })[];
  };
  /** Custom node component to render inside each flowchart node. */
  Node?: Component<N>;

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
};

/**
 * Type alias extracting the non-undefined flowchart configuration object.
 *
 * @template | Type {@linkcode Data} `D` - Custom node data dictionary type extending
 *   type {@linkcode Data}.
 */
export type ConfigFrom<D extends Data = Data> = NotUndefined<FlowProps<D>['config']>;

/**
 * Type alias extracting the non-undefined list of nodes from flowchart
 * configuration.
 *
 * @template | Type {@linkcode Data} `D` - Custom node data dictionary type extending
 *   type {@linkcode Data}.
 */
export type NodesFrom<D extends Data> = NotUndefined<ConfigFrom<D>['nodes']>;

/**
 * Type alias extracting the non-undefined list of edges from flowchart
 * configuration.
 *
 * @template | Type {@linkcode Data} `D` - Custom node data dictionary type extending
 *   type {@linkcode Data}.
 */
export type EdgesFrom<D extends Data> = NotUndefined<ConfigFrom<D>['edges']>;
