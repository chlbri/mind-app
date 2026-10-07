import type { ContextFrom } from '@bemedev/app';
import type { NotUndefined } from '@bemedev/app/bemedev';
import type { Component, JSX } from 'solid-js';
import type { Group, Mesh } from 'three';

import type { machine } from '#services/main.machine';
import type { Data, Edge, Node, Point3D } from '#services/main.machine.typings';

import type { WithFlow } from '../Flow.context';

/**
 * Subset of the state machine context exposed for external registration and
 * inspection.
 *
 * @see {@linkcode machine}
 */
export type Context = Pick<
  ContextFrom<typeof machine>,
  'data' | 'selected' | 'zoom' | 'editing' | 'history' | 'historyIndex' | 'physics'
>;

/** Overlay panel slots positioned around the 3D canvas. */
export type FlowPanels = {
  /** Top-left corner overlay panel slot component of type {@linkcode Component}. */
  topLeft?: Component<WithFlow>;
  /** Top-right corner overlay panel slot component of type {@linkcode Component}. */
  topRight?: Component<WithFlow>;
  /** Bottom-left corner overlay panel slot component of type {@linkcode Component}. */
  bottomLeft?: Component<WithFlow>;
};

/**
 * Custom 3D node renderer populating the three.js group of a node.
 *
 * Receives the node entity and the group created by the scene; it can add models,
 * animations or any custom three.js content to it. Invoked whenever the node data
 * changes; manage children idempotently (e.g. by naming and replacing them).
 *
 * @template | {@linkcode Data} `N` - Custom node data dictionary type extending type
 *   {@linkcode Data}.
 */
export type Node3DComponent<N extends Data = Data> = (
  props: Node<N> & { selected: boolean; group: Group },
) => void;

/**
 * Custom 3D edge renderer decorating the three.js mesh of an edge.
 *
 * Invoked whenever the edge data changes; the mesh geometry is already updated by
 * the scene, custom content should manage its children idempotently.
 *
 * @template | {@linkcode Data} `E` - Custom edge data dictionary type extending type
 *   {@linkcode Data}.
 */
export type Edge3DComponent<E extends Data = Data> = (
  props: Edge<E> & {
    id: string;
    from3d: Point3D;
    to3d: Point3D;
    selected: boolean;
    mesh: Mesh;
  },
) => void;

/**
 * Configuration options and callback handlers for the 3D {@linkcode Scene} component.
 *
 * @template | {@linkcode Data} `N` - Custom node data dictionary type extending type
 *   {@linkcode Data}.
 * @template | {@linkcode Data} `E` - Custom edge data dictionary type extending type
 *   {@linkcode Data}.
 */
export type FlowProps<N extends Data = Data, E extends Data = Data> = {
  /** Optional child elements rendered inside the flow context provider. */
  children?: JSX.Element;
  /** Optional delay in milliseconds before mounting the 3D canvas. */
  delay?: number;
  /** Initial flowchart state configuration with nodes and edges. */
  config?: { nodes?: Node<N>[]; edges?: (Edge<E> & { id: string })[] };
  /** Custom 3D node renderer of type {@linkcode Node3DComponent}. */
  Node?: Node3DComponent<N>;
  /** Custom 3D edge renderer of type {@linkcode Edge3DComponent}. */
  Edge?: Edge3DComponent<E>;
  /** Default data for new nodes created in the flowchart. */
  defaultData?: N;
  /** Custom overlay panels positioned around the canvas. */
  panels?: FlowPanels;
  /** Whether the force-directed physics simulation runs on mount, defaults to `true`. */
  physics?: boolean;
  /**
   * Layout dimensions of the scene: `3` for full 3D space, `2` to lock the physics
   * layout, node dragging and the ground grid to the `XY` plane (flat mindmap
   * layout). Defaults to `3`.
   */
  dimensions?: 2 | 3;
  /** Initial camera 3D position of type {@linkcode Point3D}. */
  cameraPosition?: Point3D;

  /**
   * Custom predicate determining whether an edge connection between two nodes is
   * permitted.
   *
   * @param first - The source node entity of type {@linkcode Node}.
   * @param second - The target node entity of type {@linkcode Node}.
   *
   * @returns `true` if the edge connection is allowed, `false` otherwise.
   */
  edgesAllowed?: (first: Node<N>, second: Node<N>) => boolean;

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
 * Configuration options and callback handlers for the 3D {@linkcode Scene} component,
 * augmented with the required flow value.
 *
 * @template | {@linkcode Data} `N` - Custom node data dictionary type extending type
 *   {@linkcode Data}.
 * @template | {@linkcode Data} `E` - Custom edge data dictionary type extending type
 *   {@linkcode Data}.
 */
export type SceneProps<N extends Data = Data, E extends Data = Data> = FlowProps<
  N,
  E
> &
  WithFlow;

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
