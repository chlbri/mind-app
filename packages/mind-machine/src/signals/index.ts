import { createSignal } from 'solid-js';

import type { EdgeKind, StateMachineNodeData, TransitionItem } from '../types';

export const [activeActorNode, setActiveActorNode] =
  createSignal<StateMachineNodeData | null>(null);

/**
 * Payload data for the currently active edge or transition being added/edited in the
 * Transition modal.
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
  /** Interaction mode: adding a new transition or editing an existing one. */
  mode?: 'add' | 'edit';
  /** Identifier of the existing transition being edited. */
  transitionId?: string;
  /** Initial data of the transition being edited. */
  initialData?: Partial<TransitionItem>;
};

export const [activeAddTransitionEdge, setActiveAddTransitionEdge] =
  createSignal<ActiveAddTransition | null>(null);

/** Global edge filter signal to toggle visibility of the 4 edge types. */
export const [edgeFilters, setEdgeFilters] = createSignal<Record<EdgeKind, boolean>>(
  { child_parent: true, after: true, always: true, on: true },
);
