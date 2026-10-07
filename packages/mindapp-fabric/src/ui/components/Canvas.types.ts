import type { ContextFrom } from '@bemedev/app';
import type { NotUndefined } from '@bemedev/app/bemedev';
import type { FabricObject, Path, Rect, Textbox } from 'fabric';
import type { Component, JSX } from 'solid-js';

import type { machine } from '#services/main.machine';
import type {
  Data,
  Edge,
  EdgeExtremeties,
  HandlePosition,
  HandleType,
  Node,
  NodeHandles_T,
  NodeProps,
} from '#services/main.machine.typings';

import type { WithFlow } from '../Flow.context';

export type {
  Data,
  Edge,
  EdgeExtremeties,
  HandlePosition,
  HandleType,
  Node,
  NodeHandles_T,
  NodeProps,
};

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

/** Overlay panel slots positioned around the fabric canvas. */
export type FlowPanels = {
  /** Top-left corner overlay panel slot component of type {@linkcode Component}. */
  topLeft?: Component<WithFlow>;
  /** Top-right corner overlay panel slot component of type {@linkcode Component}. */
  topRight?: Component<WithFlow>;
  /** Bottom-left corner overlay panel slot component of type {@linkcode Component}. */
  bottomLeft?: Component<WithFlow>;
};

/**
 * Custom fabric renderer decorating the canvas objects of a node.
 *
 * Receives the node entity, the managed node body `rect` and its `label`, and may
 * return additional fabric objects. Returned objects are positioned by the canvas
 * using their `left`/`top` as offsets from the node's top-left corner, tracked for
 * updates and disposed when the node is removed.
 *
 * @template | {@linkcode Data} `N` - Custom node data dictionary type extending type
 *   {@linkcode Data}.
 */
export type NodeFabricComponent<N extends Data = Data> = (
  props: NodeProps<N> & {
    id: string;
    selected: boolean;
    rect: Rect;
    label: Textbox;
  },
) => FabricObject[] | void;

/**
 * Custom fabric renderer decorating the canvas objects of an edge.
 *
 * Receives the edge entity and the managed edge `path`, and may return additional
 * fabric objects positioned with their `left`/`top` as offsets from the edge path
 * origin.
 *
 * @template | {@linkcode Data} `E` - Custom edge data dictionary type extending type
 *   {@linkcode Data}.
 */
export type EdgeFabricComponent<E extends Data = Data> = (
  props: Edge<E> & { id: string; selected: boolean; path: Path },
) => FabricObject[] | void;

/**
 * Configuration options and callback handlers for the fabric {@linkcode Flow}
 * component.
 *
 * @template | {@linkcode Data} `N` - Custom node data dictionary type extending type
 *   {@linkcode Data}.
 * @template | {@linkcode Data} `E` - Custom edge data dictionary type extending type
 *   {@linkcode Data}.
 */
export type FlowProps<N extends Data = Data, E extends Data = Data> = {
  /** Optional child elements rendered inside the flow context provider. */
  children?: JSX.Element;
  /** Optional delay in milliseconds before mounting the fabric canvas. */
  delay?: number;
  /** Initial flowchart state configuration with nodes and edges. */
  config?: { nodes?: Node<N>[]; edges?: (Edge<E> & { id: string })[] };
  /** Custom fabric node renderer of type {@linkcode NodeFabricComponent}. */
  Node?: NodeFabricComponent<N>;
  /** Custom fabric edge renderer of type {@linkcode EdgeFabricComponent}. */
  Edge?: EdgeFabricComponent<E>;
  /** Default data for new nodes created in the flowchart. */
  defaultData?: N;
  /** Custom overlay panels positioned around the canvas. */
  panels?: FlowPanels;
  /** Canvas background color, defaults to `#ffffff`. */
  background?: string;
  /** Whether the canvas draws its dot grid background, defaults to `true`. */
  grid?: boolean;
  /** Whether the canvas draws node connection handles, defaults to `true`. */
  handles?: boolean;
  /** Whether the canvas draws the zoom controls overlay, defaults to `true`. */
  controls?: boolean;

  /**
   * Custom predicate determining whether an edge connection between two nodes is
   * permitted.
   *
   * @param first - The source node entity of type {@linkcode Node}.
   * @param second - The target node entity of type {@linkcode Node}.
   * @param edge - Edge extremities specifying connection points and handle indices
   *   of type {@linkcode EdgeExtremeties}.
   *
   * @returns `true` if the edge connection is allowed, `false` otherwise.
   */
  edgesAllowed?: (first: Node<N>, second: Node<N>, edge: EdgeExtremeties) => boolean;

  /**
   * Callback triggered when a new node is created.
   *
   * @param node - The created node entity of type {@linkcode Node}.
   */
  onNodeAdded?: (node: Node<N>) => void;
  /**
   * Callback triggered when a node is deleted.
   *
   * @param nodeId - The identifier of the deleted node.
   */
  onNodeDeleted?: (nodeId: string) => void;
  /**
   * Callback triggered when an edge is created.
   *
   * @param edge - The created edge entity of type {@linkcode Edge}.
   */
  onEdgeAdded?: (edge: Edge<E> & { id: string }) => void;
  /**
   * Callback triggered when an edge is deleted.
   *
   * @param edgeId - The identifier of the deleted edge.
   */
  onEdgeDeleted?: (edgeId: string) => void;
  /** Optional custom controls addon component of type {@linkcode Component}. */
  controlsAddons?: Component<WithFlow>;
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
 * Configuration options and callback handlers for the fabric canvas component,
 * augmented with the required flow value.
 *
 * @template | {@linkcode Data} `N` - Custom node data dictionary type extending type
 *   {@linkcode Data}.
 * @template | {@linkcode Data} `E` - Custom edge data dictionary type extending type
 *   {@linkcode Data}.
 */
export type FabricCanvasProps<
  N extends Data = Data,
  E extends Data = Data,
> = FlowProps<N, E> & WithFlow;

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
