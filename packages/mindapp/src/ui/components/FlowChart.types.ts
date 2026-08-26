import type { NotUndefined } from '@bemedev/app/bemedev';
import type { Component, JSX } from 'solid-js';

import type { EdgeProps } from '#services/main.machine.typings';

import type { NodeData, NodeProps } from './FlowChart';

/** Overlay panel slots positioned around the flowchart canvas. */
export type FlowPanels = {
  /** Top-left corner overlay panel slot. */
  topLeft?: JSX.Element | Component;
  /** Top-right corner overlay panel slot. */
  topRight?: JSX.Element | Component;
  /** Bottom-left corner overlay panel slot. */
  bottomLeft?: JSX.Element | Component;
};

/**
 * Configuration options and callback handlers for the {@linkcode FlowChart}
 * component.
 *
 * @template | {@linkcode NodeData} `D` - Custom node data dictionary type extending
 *   {@linkcode NodeData}.
 */
export type FlowProps<D extends NodeData = NodeData> = {
  delay?: number;
  /** Initial flowchart state configuration with nodes and edges. */
  config?: {
    nodes?: (NodeProps<D> & { id: string })[];
    edges?: (EdgeProps & { id: string })[];
  };
  /** Custom node component to render inside each flowchart node. */
  component?: Component<D>;

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

export type ConfigFrom<D extends NodeData = NodeData> = NotUndefined<
  FlowProps<D>['config']
>;

export type NodesFrom<D extends NodeData> = NotUndefined<ConfigFrom<D>['nodes']>;
export type EdgesFrom<D extends NodeData> = NotUndefined<ConfigFrom<D>['edges']>;
