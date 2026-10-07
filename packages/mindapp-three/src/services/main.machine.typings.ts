import * as v from 'valibot';

import { byFunction, deepPartial, soa, type DeepPartial } from '../helpers/valibot';

/** Schema definition for 3D coordinates `(x, y, z)`. */
export const point3d = v.object({ x: v.number(), y: v.number(), z: v.number() });

/** 3D coordinate point type inferred from schema {@linkcode point3d}. */
export type Point3D = v.InferOutput<typeof point3d>;

/** Schema definition for serialized node data dictionary. */
export const data = v.record(v.string(), v.any());

/** Serialized node data dictionary type. */
export type Data = v.InferOutput<typeof data>;

/** Schema definition for edge extremities in 3D space. */
export const extremities = v.object({ from: v.string(), to: v.string() });

/** Edge extremities definition inferred from schema {@linkcode extremities}. */
export type EdgeExtremeties = v.InferOutput<typeof extremities>;

/**
 * Schema definition for a serialized 3D flowchart node entity.
 *
 * @see {@linkcode point3d}, {@linkcode data}
 */
export const nodeJSON = v.object({
  position: point3d,
  data: v.optional(data),
  fixed: v.optional(v.boolean()),
});

/** Serialized 3D node properties type inferred from schema {@linkcode nodeJSON}. */
export type NodeProps<D extends Data = Data> = {
  position: Point3D;
  data?: D;
  fixed?: boolean;
};

/**
 * Serialized 3D flowchart node entity with identifier.
 *
 * @template | {@linkcode Data} `D` - Custom node data properties type extending type
 *   {@linkcode Data}.
 */
export type Node<D extends Data = Data> = NodeProps<D> & { id: string };

/**
 * Schema definition for a serialized 3D flowchart edge entity.
 *
 * @see {@linkcode extremities}
 */
export const edgeJSON = v.object({ ...extremities.entries, data: v.optional(data) });

/** Serialized 3D edge properties type inferred from schema {@linkcode edgeJSON}. */
export type Edge<E extends Data = Data> = Omit<
  v.InferOutput<typeof edgeJSON>,
  'data'
> & { data?: E };

/** Schema definition for a single 3D flowchart node entity with ID. */
export const flowchartNode = v.object({ ...nodeJSON.entries, id: v.string() });

/**
 * Single 3D flowchart node entity type inferred from schema
 * {@linkcode flowchartNode}.
 */
export type FlowchartNode = v.InferOutput<typeof flowchartNode>;

/** Schema definition for a single 3D flowchart edge entity with ID. */
export const flowchartEdge = v.object({ ...edgeJSON.entries, id: v.string() });

/**
 * Single 3D flowchart edge entity type inferred from schema
 * {@linkcode flowchartEdge}.
 */
export type FlowchartEdge = v.InferOutput<typeof flowchartEdge>;

/**
 * Schema definition for 3D flowchart data containing nodes and edges.
 *
 * @see {@linkcode flowchartNode}, {@linkcode flowchartEdge}
 */
export const flowchartData = v.object({
  nodes: v.array(flowchartNode),
  edges: v.array(flowchartEdge),
});

/** 3D flowchart data structure inferred from schema {@linkcode flowchartData}. */
export type FlowchartData = v.InferOutput<typeof flowchartData>;

/**
 * Schema definition for 3D flowchart diffs capturing additions, updates, and
 * removals of nodes and edges.
 */
export const diff = byFunction(() => {
  const nodeDiff = soa(deepPartial(flowchartNode));
  const edgeDiff = soa(deepPartial(flowchartEdge));
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
  previous: v.optional(v.number()),
});

/**
 * Git-like history entry type supporting base snapshot (index 0) and delta diffs
 * (index 1..n).
 */
export type HistoryEntry = v.InferOutput<typeof historyEntry>;

/** Schema definition for an array of history entries. */
export const history = v.array(historyEntry);

/** Schema definition for commit action payload specifying the commit name. */
export const commitPayload = v.string();

/** Commit payload inferred from schema {@linkcode commitPayload}. */
export type CommitPayload = v.InferOutput<typeof commitPayload>;

/** Schema definition for the physics engine settings. */
export const physicsSettings = v.object({ enabled: v.boolean(), alpha: v.number() });

/** Physics engine settings type inferred from schema {@linkcode physicsSettings}. */
export type PhysicsSettings = v.InferOutput<typeof physicsSettings>;

/** Schema definition for a batch of node positions applied by the simulation. */
export const positionsBatch = v.record(v.string(), point3d);

/** Batch of node positions type inferred from schema {@linkcode positionsBatch}. */
export type PositionsBatch = v.InferOutput<typeof positionsBatch>;

/** Type alias for recursive deep partial type {@linkcode DeepPartial}. */
export type { DeepPartial };
