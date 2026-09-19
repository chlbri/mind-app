import * as v from 'valibot';

import { byFunction, deepPartial, type DeepPartial } from '../helpers/valibot';

/** Schema definition for 2D coordinates `(x, y)`. */
export const point = v.object({ x: v.number(), y: v.number() });

/** 2D coordinate point type inferred from schema {@linkcode point}. */
export type Point = v.InferOutput<typeof point>;

/**
 * Schema definition for node handle offsets (input and output).
 *
 * @see {@linkcode point}
 */
export const nodeOffset = v.object({ input: point, output: point });

/** Node handle offsets type inferred from schema {@linkcode nodeOffset}. */
export type NodeOffset = v.InferOutput<typeof nodeOffset>;

/** Schema definition for node handle placement positions. */
export const handlePosition = v.picklist(['top', 'right', 'bottom', 'left']);

/**
 * Available node container sides for handle placement inferred from schema
 * {@linkcode handlePosition}.
 */
export type HandlePosition = v.InferOutput<typeof handlePosition>;

/**
 * Schema definition for edge extremities, supporting optional handle positions and
 * indices.
 */
export const extremities = v.object({
  from: v.string(),
  to: v.string(),
  toPosition: v.optional(handlePosition),
  toIndex: v.optional(v.number()),
  fromPosition: v.optional(handlePosition),
  fromIndex: v.optional(v.number()),
});

/** Edge extremities definition inferred from schema {@linkcode extremities}. */
export type EdgeExtremeties = v.InferOutput<typeof extremities>;

/** Schema definition for serialized node data dictionary. */
export const data = v.record(v.string(), v.any());

/** Serialized node data dictionary type. */
export type Data = v.InferOutput<typeof data>;

/** Schema definition for node connection handle classification. */
export const handleType = v.picklist(['input', 'output', 'none']);

/**
 * Classification of a node connection handle as input, output, or none (programmatic
 * only) inferred from schema {@linkcode handleType}.
 */
export type HandleType = v.InferOutput<typeof handleType>;

/** Schema definition for custom handle configuration with optional color. */
export const handleConfig = v.object({
  type: handleType,
  color: v.optional(v.string()),
});

/** Handle configuration object with type and optional color styling. */
export type HandleConfig = v.InferOutput<typeof handleConfig>;

/**
 * Schema definition for node handles partitioned by side.
 *
 * @see {@linkcode handleConfig}
 */
const handleConfigArray = v.array(handleConfig);
export const nodeHandles = v.partial(
  v.object({
    top: handleConfigArray,
    right: handleConfigArray,
    left: handleConfigArray,
    bottom: handleConfigArray,
  }),
);

/**
 * Handle configurations per side of a node container.
 *
 * @see {@linkcode nodeHandles}
 */
export type NodeHandles_T = v.InferOutput<typeof nodeHandles>;

/**
 * Schema definition for a serialized flowchart node entity.
 *
 * @see {@linkcode point}, {@linkcode data}, -- type {@linkcode NodeHandles_T}
 */
export const nodeJSON = v.object({
  position: point,
  data: v.optional(data),
  handles: v.optional(nodeHandles),
});

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
export const edgeJSON = v.object({ ...extremities.entries, data: v.optional(data) });

/** Serialized edge properties type inferred from schema {@linkcode edgeJSON}. */
export type Edge<E extends Data = Data> = Omit<
  v.InferOutput<typeof edgeJSON>,
  'data'
> & { data?: E };

/**
 * Schema definition for layout dimensions and connection points of a node.
 *
 * @see {@linkcode point}
 */
export const dimension = v.object({
  width: v.number(),
  height: v.number(),
  output: point,
  input: v.optional(point),
  inputOffset: v.optional(point),
  outputOffset: v.optional(point),
});

/** Node layout dimension type inferred from schema {@linkcode dimension}. */
export type Dimension = v.InferOutput<typeof dimension>;

/**
 * Schema definition for a 2D line vector representing edge coordinates `(x0, y0)` to
 * `(x1, y1)`.
 */
export const vector = v.object({
  x0: v.number(),
  y0: v.number(),
  x1: v.number(),
  y1: v.number(),
});

/** 2D vector coordinate type inferred from schema {@linkcode vector}. */
export type Vector = v.InferOutput<typeof vector>;

/**
 * Schema definition for an ongoing new connection edge creation preview between
 * source node and cursor position.
 *
 * @see {@linkcode vector}
 */
export const newEdge = v.object({
  from: v.string(),
  fromPosition: handlePosition,
  fromIndex: v.number(),
  ...vector.entries,
});

/** Ongoing new connection edge preview type inferred from schema {@linkcode newEdge}. */
export type NewEdge = v.InferOutput<typeof newEdge>;

/** Schema definition for flowchart board geometry and container scroll dimensions. */
export const board = v.object({
  self: v.object({
    left: v.number(),
    top: v.number(),
    width: v.number(),
    height: v.number(),
  }),
  parent: v.optional(
    v.object({
      scrollLeft: v.number(),
      scrollTop: v.number(),
      height: v.number(),
      width: v.number(),
    }),
  ),
});

/** Flowchart board layout type inferred from schema {@linkcode board}. */
export type Board = v.InferOutput<typeof board>;

/** Schema definition for a single flowchart node entity with ID. */
export const flowchartNode = v.object({ ...nodeJSON.entries, id: v.string() });

/** Single flowchart node entity type inferred from schema {@linkcode flowchartNode}. */
export type FlowchartNode = v.InferOutput<typeof flowchartNode>;

/** Schema definition for a single flowchart edge entity with ID. */
export const flowchartEdge = v.object({ ...edgeJSON.entries, id: v.string() });

/** Single flowchart edge entity type inferred from schema {@linkcode flowchartEdge}. */
export type FlowchartEdge = v.InferOutput<typeof flowchartEdge>;

/**
 * Schema definition for flowchart data containing nodes and edges.
 *
 * @see {@linkcode flowchartNode}, {@linkcode flowchartEdge}
 */
export const flowchartData = v.object({
  nodes: v.array(flowchartNode),
  edges: v.array(flowchartEdge),
});

/** Flowchart data structure inferred from schema {@linkcode flowchartData}. */
export type FlowchartData = v.InferOutput<typeof flowchartData>;

export const diff = byFunction(() => {
  const nodeDiff = deepPartial(flowchartNode);
  const edgeDiff = deepPartial(flowchartEdge);
  const removeds = v.array(v.string());

  return v.partial(
    v.object({
      nodes: v.partial(v.object({ addeds: nodeDiff, updateds: nodeDiff, removeds })),
      edges: v.partial(v.object({ addeds: edgeDiff, updateds: edgeDiff, removeds })),
    }),
  );
});

/** Delta modifications for nodes and edges between commits. */
export type FlowchartDiff = v.InferOutput<typeof diff>;

/**
 * Schema definition for a git-like history entry supporting base snapshot (index 0)
 * and delta diffs (index 1..n).
 */
export const historyEntry = v.object({
  data: v.optional(flowchartData),
  diff: v.optional(diff),
  date: v.number(),
  name: v.optional(v.string()),
});

/**
 * Git-like history entry type supporting base snapshot (index 0) and delta diffs
 * (index 1..n).
 */
export type HistoryEntry = v.InferOutput<typeof historyEntry>;

/** Schema definition for an array of history entries. */
export const history = v.array(historyEntry);

export type { DeepPartial };
