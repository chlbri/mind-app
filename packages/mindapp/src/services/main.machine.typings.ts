import { type, type DeepPartial, type NOmit } from '@bemedev/app/bemedev';
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

/** Schema definition for node handle placement positions. */
export const handlePosition = type(({ litterals }) =>
  litterals('top', 'right', 'bottom', 'left'),
);

/**
 * Available node container sides for handle placement inferred from schema
 * {@linkcode handlePosition}.
 */
export type HandlePosition = inferT<typeof handlePosition>;

/**
 * Schema definition for edge extremities, supporting optional handle positions and
 * indices.
 */
export const extremities = type(({ optional, use }) => ({
  from: 'string',
  to: 'string',
  toPosition: optional(use(handlePosition)),
  toIndex: optional('number'),
  fromPosition: optional(use(handlePosition)),
  fromIndex: optional('number'),
}));

/** Edge extremities definition inferred from schema {@linkcode extremities}. */
export type EdgeExtremeties = inferT<typeof extremities>;

/** Schema definition for serialized node data dictionary. */
export const data = type(({ record }) => record('any'));

/** Serialized node data dictionary type. */
export type Data = inferT<typeof data>;

/** Schema definition for node connection handle classification. */
export const handleType = type(({ litterals }) =>
  litterals('input', 'output', 'none'),
);

/**
 * Classification of a node connection handle as input, output, or none (programmatic
 * only) inferred from schema {@linkcode handleType}.
 */
export type HandleType = inferT<typeof handleType>;

/** Schema definition for custom handle configuration with optional color. */
export const handleConfig = type(({ use, optional }) => ({
  type: use(handleType),
  color: optional('string'),
}));

/** Handle configuration object with type and optional color styling. */
export type HandleConfig = inferT<typeof handleConfig>;

/**
 * Schema definition for node handles partitioned by side.
 *
 * @see {@linkcode handleConfig}
 */
export const nodeHandles = type(({ use, partial, array }) => {
  const top = array(use(handleConfig));
  return partial({ top, right: top, left: top, bottom: top });
});

/**
 * Handle configurations per side of a node container.
 *
 * @see {@linkcode nodeHandles}
 */
export type NodeHandles_T = inferT<typeof nodeHandles>;

/**
 * Schema definition for a serialized flowchart node entity.
 *
 * @see {@linkcode point}, {@linkcode data}, -- type {@linkcode NodeHandles_T}
 */
export const nodeJSON = type(({ use, optional }) => ({
  position: use(point),
  data: use(data),
  handles: optional(use(nodeHandles)),
}));

/**
 * Serialized node properties type inferred from schema {@linkcode nodeJSON}.
 *
 * @template | {@linkcode Data} `D` - Custom data properties type extending
 *   {@linkcode Data}.
 *
 * @see -- type {@linkcode Point}, -- type {@linkcode NodeHandles_T}
 */
export type NodeProps<D extends Data = Data> = {
  position: Point;
  data?: D;
  handles?: NodeHandles_T;
};

/**
 * Serialized flowchart node entity with identifier.
 *
 * @template | {@linkcode Data} `D` - Custom data properties type extending
 *   {@linkcode Data}.
 *
 * @see -- type {@linkcode NodeProps}
 */
export type Node<D extends Data = Data> = NodeProps<D> & { id: string };

/**
 * Function predicate to determine whether an edge creation between two nodes should
 * be excluded.
 *
 * @template | {@linkcode Data} `N` - Custom node data properties type extending
 *   {@linkcode Data}.
 *
 * @param from - The source node entity of type {@linkcode Node}.
 * @param to - The destination node entity of type {@linkcode Node}.
 *
 * @returns `true` if the edge creation should be excluded, `false` otherwise.
 *
 * @see -- type {@linkcode Node}
 */
export type ExcludeEdge<N extends Data = Data> = (
  from: Node<N>,
  to: Node<N>,
) => boolean;

/**
 * Schema definition for a serialized flowchart edge entity.
 *
 * @see {@linkcode extremities}
 */
export const edgeJSON = type(({ use, intersection, optional }) =>
  intersection({ data: optional(use(data)) }, use(extremities)),
);

/** Serialized edge properties type inferred from schema {@linkcode edgeJSON}. */
export type Edge<E extends Data = Data> = NOmit<inferT<typeof edgeJSON>, 'data'> & {
  data?: E;
};

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
  intersection(
    { from: 'string', fromPosition: use(handlePosition), fromIndex: 'number' },

    use(vector),
  ),
);

/** Ongoing new connection edge preview type inferred from schema {@linkcode newEdge}. */
export type NewEdge = inferT<typeof newEdge>;

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

/**
 * Schema definition for flowchart data containing nodes and edges.
 *
 * @see {@linkcode nodeJSON}, {@linkcode edgeJSON}
 */
export const flowchartData = type(({ use, array }) => ({
  nodes: array({ ...use(nodeJSON), id: 'string' }),
  edges: array({ ...use(edgeJSON), id: 'string' }),
}));

/** Flowchart data structure inferred from schema {@linkcode flowchartData}. */
export type FlowchartData = inferT<typeof flowchartData>;

export type FlowchartNode = FlowchartData['nodes'][number];
export type FlowchartEdge = FlowchartData['edges'][number];

export const diff = type(({ array, partial, custom }) => {
  const node = custom<DeepPartial<FlowchartNode>>();
  const edge = custom<DeepPartial<FlowchartEdge>>();
  const removeds = array('string');

  return partial({
    nodes: partial({ addeds: node, updateds: node, removeds }),
    edges: partial({ addeds: edge, updateds: edge, removeds }),
  });
});

export const historyEntry = type(({ optional, use }) => ({
  data: optional(use(flowchartData)),
  diff: optional(use(diff)),
  date: 'number',
}));

/** Delta modifications for nodes and edges between commits. */
export type FlowchartDiff = inferT<typeof diff>;

/**
 * Git-like history entry type supporting base snapshot (index 0) and delta diffs
 * (index 1..n).
 */
export type HistoryEntry = inferT<typeof historyEntry>;
