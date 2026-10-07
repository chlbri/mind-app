import { typings } from '@bemedev/mind-flow-three';
import * as v from 'valibot';

/** Schema definition for the state type classification of a node. */
export const stateType = v.picklist(['atomic', 'compound', 'parallel', 'final']);

/**
 * Schema definition for a state activity configuration payload.
 *
 * @see -- type {@linkcode StateActivityData}
 */
export const stateActivityData = v.object({
  id: v.optional(v.string()),
  delay: v.string(),
  actions: v.array(v.string()),
  guards: v.optional(v.any()),
  description: v.optional(v.string()),
});

/**
 * Schema definition for an actor emission handler payload.
 *
 * @see -- type {@linkcode StateActorEmissionHandler}
 */
export const stateActorEmissionHandler = v.object({
  actions: v.optional(v.array(v.string())),
  target: v.optional(v.string()),
  guards: v.optional(v.any()),
});

/**
 * Schema definition for a state actor payload.
 *
 * @see -- type {@linkcode StateActorData}
 */
export const stateActorData = v.object({
  id: v.optional(v.string()),
  name: v.string(),
  type: v.picklist(['emitter', 'child']),
  description: v.optional(v.string()),
  emitter: v.optional(v.any()),
  child: v.optional(v.any()),
  emissions: v.optional(v.any()),
  events: v.optional(v.any()),
  contexts: v.optional(v.any()),
});

/**
 * Schema definition for a state machine node data payload.
 *
 * @see -- type {@linkcode StateMachineNodeData}
 */
export const stateMachineNodeData = v.object({
  id: v.string(),
  title: v.string(),
  path: v.string(),
  parentPath: v.optional(v.string()),
  stateType,
  isInitial: v.optional(v.boolean()),
  tags: v.optional(v.array(v.string())),
  entry: v.optional(v.array(v.string())),
  exit: v.optional(v.array(v.string())),
  activities: v.optional(v.array(stateActivityData)),
  actors: v.optional(v.array(stateActorData)),
  content: v.optional(v.string()),
  principal: v.optional(v.unknown()),
});

/**
 * Schema definition for a state transition item payload.
 *
 * @see -- type {@linkcode TransitionItem}
 */
export const transitionItem = v.object({
  id: v.string(),
  kind: v.picklist(['after', 'always', 'on', 'child_parent']),
  label: v.string(),
  event: v.optional(v.string()),
  delay: v.optional(v.string()),
  guards: v.optional(v.any()),
  actions: v.optional(v.array(v.string())),
});

/**
 * Schema definition for a state machine edge data payload.
 *
 * @see -- type {@linkcode StateMachineEdgeData}
 */
export const stateMachineEdgeData = v.object({
  kind: v.picklist(['after', 'always', 'on', 'child_parent']),
  label: v.optional(v.string()),
  transitions: v.optional(v.array(transitionItem)),
  event: v.optional(v.string()),
  delay: v.optional(v.string()),
  guards: v.optional(v.any()),
  actions: v.optional(v.array(v.string())),
  from: v.optional(v.string()),
  to: v.optional(v.string()),
});

/** Schema definition for a persisted 3D scene node entity. */
export const flowchartNode = v.object({
  id: v.string(),
  position: typings.point3d,
  data: v.optional(stateMachineNodeData),
  fixed: v.optional(v.boolean()),
});

/** Schema definition for a persisted 3D scene edge entity. */
export const flowchartEdge = v.object({
  id: v.string(),
  from: v.string(),
  to: v.string(),
  data: v.optional(stateMachineEdgeData),
});

/** Schema definition for a full 3D scene data payload. */
export const flowchartData = v.object({
  nodes: v.array(flowchartNode),
  edges: v.array(flowchartEdge),
});

/**
 * Schema definition for a persisted scene payload carrying the history and cursor.
 *
 * @see {@linkcode flowchartData}
 */
export const storedPayload = v.object({
  history: v.array(typings.historyEntry),
  historyIndex: v.number(),
});

export type { typings };
