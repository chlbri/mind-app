import { byFunction, deepPartial, soa, typings } from '@bemedev/mind-flow-fabric';
import * as v from 'valibot';

import { EDGES_COLORS } from './constants';
//  const history = typings.history;
/** Schema for the three state machine node types. */
const stateType = v.picklist(['atomic', 'compound', 'parallel']);

/** Optional untyped guards schema. */
const guards = v.optional(v.any());
//  const actorType = v.picklist(['emitter', 'child']);
/** Schema for context key/value pairs of a child machine. */
const contexts = v.record(v.string(), v.string());

/** Schema for a list of action names. */
const actions = v.array(v.string());

/** Schema for an optional human-readable description. */
const description = v.optional(v.string());

/** Schema listing the four valid edge kinds. */
const edgeKind = v.picklist(
  Object.keys(EDGES_COLORS) as (keyof typeof EDGES_COLORS)[],
);

/** Schema for an actor event handler entry. */
const actorHandler = v.object({
  target: v.optional(v.string()),
  actions: v.array(v.string()),
  guards,
});

/** Schema for a state activity configuration. */
const activity = v.object({
  id: description,
  delay: v.string(),
  actions,
  description,
  guards,
});

/** Schema for a single edge transition item. */
const transitionItem = v.object({
  id: v.string(),
  kind: edgeKind,
  label: v.string(),
  event: description,
  delay: v.string(),
  guards,
  actions: v.optional(actions),
});

/** Schema for an actor: emitter or child, discriminated by its `type`. */
const actor = v.intersect([
  v.object({ id: description, name: v.string(), description }),
  v.variant('type', [
    v.pipe(
      v.object({
        type: v.literal('emitter'),

        emitter: v.object({
          next: actorHandler,
          error: v.optional(actorHandler),
          complete: v.optional(
            v.object({
              actions: v.optional(actions),
              guards,
              description: v.optional(v.string()),
            }),
          ),
        }),

        emissions: v.object({
          next: v.optional(actions),
          error: v.optional(actions),
          complete: v.optional(actions),
        }),
      }),

      v.description('OK'),
    ),

    v.pipe(
      v.object({
        type: v.literal('child'),

        child: v.pipe(
          v.union([
            v.object({
              on: v.record(v.string(), actorHandler),
              contexts: v.optional(contexts),
            }),

            v.object({
              on: v.optional(v.record(v.string(), actorHandler)),
              contexts,
            }),
          ]),

          // v.check(({ contexts, on }) => {
          //   return contexts !== undefined || on !== undefined;
          // }),
        ),

        contexts: v.optional(contexts),
        events: v.optional(v.record(v.string(), v.array(v.string()))),
      }),

      v.check(({ contexts, events }) => {
        return contexts !== undefined || events !== undefined;
      }),

      v.description('OK'),
    ),
  ]),
]);

/** Validation schema for -- type {@linkcode StateMachineNodeData} payloads. */
export const nodeData = v.object({
  id: v.string(),
  title: v.string(),
  path: v.string(),
  parentPath: description,
  stateType,
  isInitail: v.optional(v.boolean()),
  tags: v.optional(v.array(v.string())),
  entry: v.optional(v.array(v.string())),
  exit: v.optional(v.array(v.string())),
  activities: v.optional(v.array(activity)),
  actors: v.optional(v.array(actor)),
  content: description,
});

/** Validation schema for -- type {@linkcode StateMachineEdgeData} payloads. */
export const edgeData = v.object({
  kind: edgeKind,
  label: description,
  transitions: v.optional(v.array(transitionItem)),
  event: description,
  delay: description,
  guards,
  actions: v.optional(actions),
  from: description,
  to: description,
});

/**
 * Validation schema for a flowchart node carrying -- type
 * {@linkcode StateMachineNodeData}.
 */
export const machineNode = v.intersect([
  v.omit(typings.flowchartNode, ['data']),
  v.object({ data: nodeData }),
]);

/**
 * Validation schema for a flowchart edge carrying -- type
 * {@linkcode StateMachineEdgeData}.
 */
export const machineEdge = v.intersect([
  v.omit(typings.flowchartEdge, ['data']),
  v.object({ data: edgeData }),
]);

/**
 * Schema definition for flowchart diffs capturing additions, updates, and removals
 * of nodes and edges.
 */
export const machineDiff = byFunction(() => {
  const nodeDiff = soa(deepPartial(machineNode));
  const edgeDiff = soa(deepPartial(machineEdge));
  const removeds = v.array(v.string());

  return v.partial(
    v.object({
      nodes: v.partial(v.object({ addeds: nodeDiff, updateds: nodeDiff, removeds })),
      edges: v.partial(v.object({ addeds: edgeDiff, updateds: edgeDiff, removeds })),
    }),
  );
});

/** Schema for a single persisted history entry. */
const historyEntry = v.object({
  date: v.number(),
  diff: v.optional(machineDiff),
  name: description,
  previous: v.optional(v.number()),

  data: v.optional(
    v.object({ nodes: v.array(machineNode), edges: v.array(machineEdge) }),
  ),
});

/** Schema for a persisted history payload with its current index. */
export const historyModel = v.object({
  history: v.array(historyEntry),
  historyIndex: v.number(),
});
