import { createSignal } from 'solid-js';

import type { EdgeKind, StateMachineNodeData } from '../types';

export const [activeActorNode, setActiveActorNode] =
  createSignal<StateMachineNodeData | null>(null);

/**
 * Payload data for the currently active edge being edited in the Add Transition
 * modal.
 */
export type ActiveAddTransition = {
  /** Unique edge identifier. */
  edgeId: string;
  /** Source state node identifier. */
  from: string;
  /** Target state node identifier. */
  to: string;
  /** Edge transition category matching handle type. */
  kind?: EdgeKind;
};

export const [activeAddTransitionEdge, setActiveAddTransitionEdge] =
  createSignal<ActiveAddTransition | null>(null);

/** Global edge filter signal to toggle visibility of the 4 edge types. */
export const [edgeFilters, setEdgeFilters] = createSignal<Record<EdgeKind, boolean>>(
  { child_parent: true, after: true, always: true, on: true },
);
