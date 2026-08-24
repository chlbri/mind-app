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
export const nodeOffset = type(({ optional, use }) => ({
  input: optional(use(point)),
  output: use(point),
}));

/** Schema definition for edge extremities. */
export const extremities = type({ from: 'string', to: 'string' });

/**
 * Schema definition for a serialized flowchart node entity.
 *
 * @see {@linkcode point}
 */
export const nodeJSON = type(({ optional, use }) => ({
  position: use(point),
  data: { label: optional('string'), content: 'string' },
  input: 'boolean',
}));

/**
 * Schema definition for a serialized flowchart edge entity.
 *
 * @see {@linkcode extremities}
 */
export const edgeJSON = extremities;

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
