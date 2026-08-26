import { type } from '@bemedev/app/bemedev';
import type { inferT } from '@bemedev/app/typings';

/** Schema definition for 2D coordinates `(x, y)`. */
export const point = type({ x: 'number', y: 'number' });

/** 2D coordinate point type inferred from schema {@linkcode point}. */
export type Point = inferT<typeof point>;

/**
 * Schema definition for node handle offsets (input and output).
 *
 * @see {@linkcode point}
 */
export const nodeOffset = type(({ use }) => ({
  input: use(point),
  output: use(point),
}));

/** Schema definition for edge extremities. */
export const extremities = type({ from: 'string', to: 'string' });

/** Schema definition for primitive values allowed in node data. */
export const nodeDataValue = type(({ union }) =>
  union('string', 'boolean', 'number'),
);

/**
 * Schema definition for serialized node data dictionary.
 *
 * @see {@linkcode nodeDataValue}
 */
export const data = type(({ record, use }) => record(use(nodeDataValue)));

/** Serialized node data dictionary type inferred from schema {@linkcode data}. */
export type NodeData = Record<string, string | boolean | number>;

/**
 * Schema definition for a serialized flowchart node entity.
 *
 * @see {@linkcode point}, {@linkcode data}
 */
export const nodeJSON = type(({ use }) => ({
  position: use(point),
  data: use(data),
}));

/**
 * Serialized node properties type inferred from schema {@linkcode nodeJSON}.
 *
 * @template | {@linkcode NodeData} `D` - Custom data properties type extending
 *   {@linkcode NodeData}.
 */
export type NodeProps<D extends NodeData = NodeData> = { position: Point; data: D };

/**
 * Schema definition for a serialized flowchart edge entity.
 *
 * @see {@linkcode extremities}
 */
export const edgeJSON = extremities;

/** Serialized edge properties type inferred from schema {@linkcode edgeJSON}. */
export type EdgeProps = inferT<typeof edgeJSON>;

/**
 * Schema definition for layout dimensions and connection points of a node.
 *
 * @see {@linkcode point}
 */
export const dimension = type(({ optional, use }) => ({
  width: 'number',
  height: 'number',
  output: use(point),
  input: optional(use(point)),
  inputOffset: optional(use(point)),
  outputOffset: optional(use(point)),
}));

/** Node layout dimension type inferred from schema {@linkcode dimension}. */
export type Dimension = inferT<typeof dimension>;

/**
 * Schema definition for a 2D line vector representing edge coordinates `(x0, y0)` to
 * `(x1, y1)`.
 */
export const vector = type({
  x0: 'number',
  y0: 'number',
  x1: 'number',
  y1: 'number',
});

/** 2D vector coordinate type inferred from schema {@linkcode vector}. */
export type Vector = inferT<typeof vector>;

/**
 * Schema definition for an ongoing new connection edge creation preview between
 * source node and cursor position.
 *
 * @see {@linkcode vector}
 */
export const newEdge = type(({ intersection, use }) =>
  intersection({ from: 'string' }, use(vector)),
);

/** Ongoing new connection edge preview type inferred from schema {@linkcode newEdge}. */
export type Edge = inferT<typeof newEdge>;

/** Schema definition for flowchart board geometry and container scroll dimensions. */
export const board = type(({ optional }) => ({
  self: { left: 'number', top: 'number', width: 'number', height: 'number' },

  parent: optional({
    scrollLeft: 'number',
    scrollTop: 'number',
    height: 'number',
    width: 'number',
  }),
}));

/** Flowchart board layout type inferred from schema {@linkcode board}. */
export type Board = inferT<typeof board>;
