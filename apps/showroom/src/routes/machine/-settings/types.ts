import type { CommonConfig3, GuardConfig } from '@bemedev/app';
import type { StateType } from '@bemedev/app/states';
import type { Point } from '@bemedev/mind-flow';

import { EDGES_COLORS } from './constants';

/** 2D coordinate position representing a node's location on the canvas. */
export type Position = Point;

/**
 * Configuration structure for a `@bemedev/app` state machine.
 *
 * @template {string} Paths - Allowed state path union. Defaults to `string`.
 */
export type MachineConfig<Paths extends string = string> = CommonConfig3<Paths>;

/**
 * Recursively extracts all state path keys (e.g. `'/cart'`,
 * `'/fulfillment/packaging'`) from a state machine configuration tree.
 *
 * @template T - State machine configuration node or tree.
 * @template {string} Prefix - Current state path prefix.
 */
export type ExtractStateKeys<T, Prefix extends string = ''> = T extends {
  states: infer S;
}
  ? string extends keyof S
    ? string
    : {
        [K in keyof S & string]:
          | `${Prefix}/${K}`
          | ExtractStateKeys<S[K], `${Prefix}/${K}`>;
      }[keyof S & string]
  : never;

/**
 * Extracts all state node path identifiers from a machine or machine configuration.
 *
 * @template T - State machine or configuration object.
 */
export type StateNodeKeys<T> = T extends { config: infer C }
  ? ExtractStateKeys<C> extends never
    ? string
    : ExtractStateKeys<C>
  : ExtractStateKeys<T> extends never
    ? string
    : ExtractStateKeys<T>;

/**
 * Dictionary mapping each state node path key to its canvas position.
 *
 * @template T - State machine or configuration object.
 */
export type StateNodePositions<T> = Record<StateNodeKeys<T>, Position>;

/** Four distinct edge categories in the state machine diagram. */
export type EdgeKind = keyof typeof EDGES_COLORS;

/** Structured activity configuration running periodically on a state node. */
export type StateActivityData = {
  /** Optional unique identifier for stable rendering and editing. */
  id?: string;
  /** Identifier or timer key (e.g. `POLL`, `HEARTBEAT`, `3000ms`). */
  delay: string;
  /** Action names fired periodically on each interval tick. */
  actions: string[];
  /** Optional guard conditions checked before firing actions. */
  guards?: GuardConfig | GuardConfig[];
  /** Optional human-readable description of the activity. */
  description?: string;
};

/** Emission transition / action handler for stream emitters in `@bemedev/app`. */
export type StateActorEmissionHandler = {
  /** Action names executed upon this emission. */
  actions?: string[];
  /** Optional state target to transition to. */
  target?: string;
  /** Optional guards evaluated before executing actions or transitioning. */
  guards?: GuardConfig | GuardConfig[];
};

/** Event transition / action handler for child machines in `@bemedev/app`. */
export type StateActorChildEventHandler = {
  /** Action names executed upon receiving this event from child machine. */
  actions?: string[];
  /** Optional state target in parent machine to transition to. */
  target?: string;
  /** Optional guards evaluated before executing actions or transitioning. */
  guards?: GuardConfig | GuardConfig[];
};

/** Detailed configuration and lifecycle metadata for an actor attached to a state. */
export type StateActorData = {
  /** Optional unique identifier for stable rendering and editing. */
  id?: string;
  /** Identifier name of the actor. */
  name: string;
  /** Classification of the actor in `@bemedev/app`. */
  type: 'emitter' | 'child' | 'service';
  /** Human-readable description of what this actor does. */
  description?: string;
  /** Emitter actor configuration when type is 'emitter'. */
  emitter?: {
    /** Handler for next value emissions. */
    next: StateActorEmissionHandler;
    /** Handler for stream error emissions. */
    error?: StateActorEmissionHandler;
    /** Handler for stream completion. */
    complete?: {
      actions?: string[];
      guards?: GuardConfig | GuardConfig[];
      description?: string;
    };
  };
  /** Child actor configuration when type is 'child'. */
  child?: {
    /** Handled bubbled events from child machine to parent actions/targets. */
    on?: Record<string, StateActorChildEventHandler>;
    /** One-way context projection mapping child context paths to parent pContext. */
    contexts?: Record<string, string>;
  };
  /**
   * Handled emissions (e.g. `next`, `error`, `complete`) for stream emitters
   * (backward-compatibility).
   */
  emissions?: { next?: string[]; error?: string[]; complete?: string[] };
  /** Forwarded events from child machine to parent (backward-compatibility). */
  events?: Record<string, string[]>;
  /**
   * Context mappings (e.g. child context mapped to parent `pContext`)
   * (backward-compatibility).
   */
  contexts?: Record<string, string>;
  /** Raw configuration or options for this actor. */
  config?: Record<string, any>;
};

/** Flowchart node data structure representing a state in the state machine. */
export type StateMachineNodeData = {
  /** Node identifier matching the state path (e.g. `/order/fulfillment/shipping`). */
  id: string;
  /** Display title (the state name, e.g. `shipping`). */
  title: string;
  /** Full hierarchy state path (e.g. `/fulfillment/shipping`). */
  path: string;
  /** Parent state path if this state is a child of a compound state. */
  parentPath?: string;
  /** State classification. */
  stateType: StateType;
  /** Whether this state is the initial substate of its parent or root. */
  isInitial?: boolean;
  /** Metadata tags assigned to this state. */
  tags?: string[];
  /** Entry action names executed upon state entrance. */
  entry?: string[];
  /** Exit action names executed upon state exit. */
  exit?: string[];
  /** Activities running while this state is active. */
  activities?: StateActivityData[];
  /** Actors (emitters or child actors) attached to this state. */
  actors?: StateActorData[];
  /** Optional summary or note. */
  content?: string;
};

/**
 * Individual transition definition linking source state to target state. Multiple
 * transitions can share the same edge between two nodes.
 */
export type TransitionItem = {
  /** Unique transition identifier. */
  id: string;
  /** Transition category. */
  kind: EdgeKind;
  /** Human-readable label for this transition. */
  label: string;
  /** Event name for `on` transitions (e.g. `CHECKOUT`, `PAY`). */
  event?: string;
  /**
   * Delay duration or delay name for `after` transitions (e.g. `3000ms` or
   * `PAYMENT_TIMEOUT`).
   */
  delay?: string | number;
  /** Guard condition expression or array of guard conditions. */
  guards?: GuardConfig | GuardConfig[];
  /** Actions triggered during this transition. */
  actions?: string[];
};

/** Flowchart edge data structure representing transitions and hierarchy relations. */
export type StateMachineEdgeData = {
  /** The primary category of the edge. */
  kind?: EdgeKind;
  /** Display label shown on the edge midpoint tag. */
  label?: string;
  /** All transitions linking the two connected states. */
  transitions?: TransitionItem[];
  /** Event name for `on` transitions (e.g. `CHECKOUT`, `PAY`). */
  event?: string;
  /**
   * Delay duration or delay name for `after` transitions (e.g. `3000ms` or
   * `PAYMENT_TIMEOUT`).
   */
  delay?: string | number;
  /** Guard condition expression or array of guard conditions. */
  guards?: GuardConfig | GuardConfig[];
  /** Actions triggered during this transition. */
  actions?: string[];
  /** Source state path. */
  fromState?: string;
  /** Target state path. */
  toState?: string;
};
