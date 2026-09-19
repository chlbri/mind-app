import { deepEqual } from '@bemedev/app/utils';

import type {
  FlowchartData,
  FlowchartDiff,
  FlowchartEdge,
  FlowchartNode,
  HistoryEntry,
} from './main.machine.typings';

export type { FlowchartDiff, FlowchartEdge, FlowchartNode };

/** Maximum number of history elements allowed in the machine context. */
export const MAX_HISTORY_SIZE = 100;

/**
 * Applies a single diff to a base flowchart state.
 *
 * @param base - Base flowchart data.
 * @param diff - Diff to apply.
 *
 * @returns Reconstructed type {@linkcode FlowchartData}.
 */
const applyDiff = (
  base?: FlowchartData,
  diff?: FlowchartDiff | null,
): FlowchartData => {
  let nodes = structuredClone(base?.nodes ?? []);
  let edges = structuredClone(base?.edges ?? []);

  if (!diff) {
    return { nodes, edges };
  }

  if (diff.nodes) {
    if (diff.nodes.removeds && diff.nodes.removeds.length > 0) {
      const removedSet = new Set(diff.nodes.removeds);
      nodes = nodes.filter(n => !removedSet.has(n.id));
    }
    if (diff.nodes.updateds) {
      const updates = Array.isArray(diff.nodes.updateds)
        ? (diff.nodes.updateds as any[])
        : [diff.nodes.updateds];
      for (const updated of updates) {
        if (!updated?.id) continue;
        nodes = nodes.map(n => {
          if (n.id === updated.id) {
            return {
              ...n,
              ...updated,
              position: updated.position
                ? { ...n.position, ...updated.position }
                : n.position,
              data: updated.data ? { ...n.data, ...updated.data } : n.data,
            } as FlowchartNode;
          }
          return n;
        });
      }
    }
    if (diff.nodes.addeds) {
      const additions = Array.isArray(diff.nodes.addeds)
        ? (diff.nodes.addeds as any[])
        : [diff.nodes.addeds];
      for (const added of additions) {
        if (!added?.id) continue;
        const existingIdx = nodes.findIndex(n => n.id === added.id);
        if (existingIdx >= 0) {
          nodes[existingIdx] = { ...nodes[existingIdx], ...added } as FlowchartNode;
        } else {
          nodes.push(structuredClone(added) as FlowchartNode);
        }
      }
    }
  }

  if (diff.edges) {
    if (diff.edges.removeds && diff.edges.removeds.length > 0) {
      const removedSet = new Set(diff.edges.removeds);
      edges = edges.filter(e => !removedSet.has(e.id));
    }
    if (diff.edges.updateds) {
      const updates = Array.isArray(diff.edges.updateds)
        ? (diff.edges.updateds as any[])
        : [diff.edges.updateds];
      for (const updated of updates) {
        if (!updated?.id) continue;
        edges = edges.map(e => {
          if (e.id === updated.id) {
            return {
              ...e,
              ...updated,
              data: updated.data ? { ...e.data, ...updated.data } : e.data,
            } as FlowchartEdge;
          }
          return e;
        });
      }
    }
    if (diff.edges.addeds) {
      const additions = Array.isArray(diff.edges.addeds)
        ? (diff.edges.addeds as any[])
        : [diff.edges.addeds];
      for (const added of additions) {
        if (!added?.id) continue;
        const existingIdx = edges.findIndex(e => e.id === added.id);
        if (existingIdx >= 0) {
          edges[existingIdx] = { ...edges[existingIdx], ...added } as FlowchartEdge;
        } else {
          edges.push(structuredClone(added) as FlowchartEdge);
        }
      }
    }
  }

  return { nodes, edges };
};

/**
 * Calculates a delta diff between two flowchart data states. Returns `null` if no
 * differences are observed (empty commit prevention).
 *
 * @param prev - Previous flowchart state.
 * @param next - Candidate next flowchart state.
 *
 * @returns Type {@linkcode FlowchartDiff} if changes exist, or `null` if identical.
 */
export const calculateDiff = (
  prev?: FlowchartData,
  next?: FlowchartData,
): FlowchartDiff | null => {
  if (!prev && !next) return null;

  if (!prev && next) {
    const hasContent =
      (next.nodes?.length ?? 0) > 0 || (next.edges?.length ?? 0) > 0;
    if (!hasContent) return null;
    return {
      nodes: {
        addeds: (next.nodes?.length === 1 ? next.nodes[0] : next.nodes) as any,
      },
      edges: {
        addeds: (next.edges?.length === 1 ? next.edges[0] : next.edges) as any,
      },
    };
  }

  if (prev && !next) {
    const hasContent =
      (prev.nodes?.length ?? 0) > 0 || (prev.edges?.length ?? 0) > 0;
    if (!hasContent) return null;
    return {
      nodes: { removeds: (prev.nodes ?? []).map(n => n.id) },
      edges: { removeds: (prev.edges ?? []).map(e => e.id) },
    };
  }

  const prevNodes = prev?.nodes ?? [];
  const nextNodes = next?.nodes ?? [];
  const prevEdges = prev?.edges ?? [];
  const nextEdges = next?.edges ?? [];

  const prevNodeMap = new Map(prevNodes.map(n => [n.id, n]));
  const nextNodeMap = new Map(nextNodes.map(n => [n.id, n]));

  const nodesAdded: FlowchartNode[] = [];
  const nodesUpdated: FlowchartNode[] = [];
  const nodesRemoved: string[] = [];

  for (const nextNode of nextNodes) {
    const prevNode = prevNodeMap.get(nextNode.id);
    if (!prevNode) {
      nodesAdded.push(structuredClone(nextNode));
    } else if (!deepEqual(prevNode, nextNode)) {
      nodesUpdated.push(structuredClone(nextNode));
    }
  }

  for (const prevNode of prevNodes) {
    if (!nextNodeMap.has(prevNode.id)) {
      nodesRemoved.push(prevNode.id);
    }
  }

  const prevEdgeMap = new Map(prevEdges.map(e => [e.id, e]));
  const nextEdgeMap = new Map(nextEdges.map(e => [e.id, e]));

  const edgesAdded: FlowchartEdge[] = [];
  const edgesUpdated: FlowchartEdge[] = [];
  const edgesRemoved: string[] = [];

  for (const nextEdge of nextEdges) {
    const prevEdge = prevEdgeMap.get(nextEdge.id);
    if (!prevEdge) {
      edgesAdded.push(structuredClone(nextEdge));
    } else if (!deepEqual(prevEdge, nextEdge)) {
      edgesUpdated.push(structuredClone(nextEdge));
    }
  }

  for (const prevEdge of prevEdges) {
    if (!nextEdgeMap.has(prevEdge.id)) {
      edgesRemoved.push(prevEdge.id);
    }
  }

  const hasNodeChanges =
    nodesAdded.length > 0 || nodesRemoved.length > 0 || nodesUpdated.length > 0;
  const hasEdgeChanges =
    edgesAdded.length > 0 || edgesRemoved.length > 0 || edgesUpdated.length > 0;

  if (!hasNodeChanges && !hasEdgeChanges) {
    return null;
  }

  const diff: FlowchartDiff = {};
  if (hasNodeChanges) {
    diff.nodes = {
      ...(nodesAdded.length > 0
        ? { addeds: (nodesAdded.length === 1 ? nodesAdded[0] : nodesAdded) as any }
        : {}),
      ...(nodesRemoved.length > 0 ? { removeds: nodesRemoved } : {}),
      ...(nodesUpdated.length > 0
        ? {
            updateds: (nodesUpdated.length === 1
              ? nodesUpdated[0]
              : nodesUpdated) as any,
          }
        : {}),
    };
  }
  if (hasEdgeChanges) {
    diff.edges = {
      ...(edgesAdded.length > 0
        ? { addeds: (edgesAdded.length === 1 ? edgesAdded[0] : edgesAdded) as any }
        : {}),
      ...(edgesRemoved.length > 0 ? { removeds: edgesRemoved } : {}),
      ...(edgesUpdated.length > 0
        ? {
            updateds: (edgesUpdated.length === 1
              ? edgesUpdated[0]
              : edgesUpdated) as any,
          }
        : {}),
    };
  }

  return diff;
};

/**
 * Reconstructs the flowchart data state at `targetIndex` by replaying from base
 * entry 0 and applying sequential diffs up to `targetIndex`.
 *
 * @param history - The history array.
 * @param targetIndex - Target commit index to reconstruct.
 *
 * @returns Reconstructed type {@linkcode FlowchartData}.
 */
export const reconstructState = (
  history: HistoryEntry[],
  targetIndex: number,
): FlowchartData => {
  if (history.length === 0 || targetIndex < 0) {
    return { nodes: [], edges: [] };
  }

  const boundedIndex = Math.min(targetIndex, history.length - 1);
  if (boundedIndex === 0) {
    return history[0].data
      ? structuredClone(history[0].data)
      : { nodes: [], edges: [] };
  }

  const chain: number[] = [];
  let curr = boundedIndex;
  const visited = new Set<number>();

  while (curr > 0 && !visited.has(curr)) {
    visited.add(curr);
    chain.unshift(curr);
    const entry = history[curr];
    const prev = entry?.previous ?? curr - 1;
    curr = prev >= 0 && prev < curr ? prev : curr - 1;
  }

  const baseEntry = history[0];
  let current: FlowchartData = baseEntry.data
    ? structuredClone(baseEntry.data)
    : { nodes: [], edges: [] };

  for (const idx of chain) {
    const entry = history[idx];
    if (entry?.diff) {
      current = applyDiff(current, entry.diff);
    }
  }

  return current;
};

/**
 * Squashes the oldest delta (entry 1) into the base snapshot (entry 0). Used to cap
 * history at {@linkcode MAX_HISTORY_SIZE} while keeping delta chains intact.
 *
 * @param history - History array to squash.
 *
 * @returns Mutated history array.
 */
export const squashOldestCommit = (history: HistoryEntry[]): HistoryEntry[] => {
  if (history.length <= 1) return history;
  const base = history[0];
  const next = history[1];

  const squashedData = next.diff
    ? applyDiff(base.data, next.diff)
    : (next.data ?? base.data);

  const newBase: HistoryEntry = { data: squashedData, date: next.date };

  history.splice(0, 2, newBase);
  return history;
};
