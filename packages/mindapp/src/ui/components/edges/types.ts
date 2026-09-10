import type { Accessor, Component } from 'solid-js';

import type { Data, Vector } from '#services/main.machine.typings';

/**
 * Properties passed to custom edge middle overlay components.
 *
 * @template | {@linkcode Data} `D` - Type of the custom data associated with the
 *   edge.
 */
export type EdgeMiddleProps<D extends Data = Data> = {
  /** Accessor to the edge vector coordinates of type {@linkcode Vector}. */
  vector: Accessor<Vector | undefined>;
  /** Unique identifier of the edge. */
  id: string;
  /** Custom data payload attached to the edge. */
  data?: D;
  /** Accessor indicating whether the edge is currently selected. */
  selected: Accessor<boolean>;
};

/**
 * Properties for rendering an SVG connection edge between two points.
 *
 * @template | {@linkcode Data} `D` - Type of the custom data associated with the
 *   edge.
 */
export type EdgeProps<D extends Data = Data> = {
  /** Unique identifier of the edge. */
  id: string;
  /** Whether this is a temporary edge currently being dragged. */
  isNew?: boolean;
  /** Custom data attached to the edge. */
  data?: D;
  /** Component to render at the middle point of the edge. */
  middle?: Component<EdgeMiddleProps<D>>;
  /** SVG stroke color or expression. */
  stroke?: string;
  /** SVG stroke-dasharray attribute for styling dashed edges. */
  strokeDasharray?: string;
};
