import { createSignal } from 'solid-js';

import type { EdgeKind, StateMachineNodeData } from '../types';

export const [activeActorNode, setActiveActorNode] =
  createSignal<StateMachineNodeData | null>(null);

export type ActiveAddTransition = { edgeId: string; from: string; to: string };

export const [activeAddTransitionEdge, setActiveAddTransitionEdge] =
  createSignal<ActiveAddTransition | null>(null);

/** Global edge filter signal to toggle visibility of the 4 edge types. */
export const [edgeFilters, setEdgeFilters] = createSignal<Record<EdgeKind, boolean>>(
  { child_parent: true, after: true, always: true, on: true },
);
