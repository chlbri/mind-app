import {
  reconstructState,
  type ConfigFrom,
  type typings,
} from '@bemedev/mind-flow-three';

import { parseMachineToGraph } from './parser';
import type {
  MachineConfig,
  StateMachineEdgeData,
  StateMachineNodeData,
} from './types';

/**
 * 3D scene configuration consumed by the `Flow` component for `@bemedev/app` state
 * machines.
 */
export type MachineConfigFrom = ConfigFrom<
  StateMachineNodeData,
  StateMachineEdgeData
>;

/**
 * Type guard checking that a value is a plain object.
 *
 * @param value - Value of type `unknown` to inspect.
 *
 * @returns `true` when the value is a non-array object.
 */
const isObject = (value: unknown): value is Record<string, any> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/**
 * Checks whether a value is a `@bemedev/app` machine instance.
 *
 * @param value - Candidate object to inspect.
 *
 * @returns `true` when the object carries a machine configuration.
 */
const isMachine = (value: Record<string, any>): boolean =>
  isObject(value.config) &&
  !('nodes' in value.config) &&
  ['states', 'initial', 'on', 'always', 'after', 'type'].some(
    key => key in value.config,
  );

/**
 * Checks whether a value is a `@bemedev/app` state machine configuration.
 *
 * @param value - Candidate object to inspect.
 *
 * @returns `true` when the object looks like a machine configuration.
 */
const isMachineConfig = (value: Record<string, any>): boolean =>
  isObject(value.states) ||
  ['initial', 'on', 'always', 'after', 'type'].some(key => key in value);

/**
 * Resolves the initial 3D scene configuration from a `history` source.
 *
 * Accepted values are:
 *
 * - A 3D scene configuration `{ nodes, edges }`, used as-is.
 * - A raw scene history array of type `typings.HistoryEntry[]`, reconstructed at its
 *   last commit.
 * - A persisted payload `{ history, historyIndex }`, reconstructed at `historyIndex`.
 * - A `@bemedev/app` state machine configuration or machine instance, parsed with
 *   {@linkcode parseMachineToGraph} to provide default 3D nodes and edges.
 * - Any other value, resulting in an empty configuration.
 *
 * @param history - The source of type `unknown` to derive the configuration from.
 *
 * @returns The initial configuration of type {@linkcode MachineConfigFrom}.
 */
export const configFromHistory = (history?: unknown): MachineConfigFrom => {
  if (!history) return { nodes: [], edges: [] };

  if (Array.isArray(history)) {
    const entries = history as Parameters<typeof reconstructState>[0];
    return reconstructState(entries, entries.length - 1) as MachineConfigFrom;
  }

  if (!isObject(history)) return { nodes: [], edges: [] };

  if (Array.isArray(history.history)) {
    const entries = history.history as Parameters<typeof reconstructState>[0];
    const historyIndex =
      typeof history.historyIndex === 'number'
        ? history.historyIndex
        : entries.length - 1;

    return reconstructState(entries, historyIndex) as MachineConfigFrom;
  }

  if (Array.isArray(history.nodes) || Array.isArray(history.edges)) {
    return history as MachineConfigFrom;
  }

  const machineConfig: unknown = isMachine(history) ? history.config : history;
  if (isObject(machineConfig) && isMachineConfig(machineConfig)) {
    const graph = parseMachineToGraph(machineConfig as MachineConfig);
    return {
      nodes: graph.nodes as MachineConfigFrom['nodes'],
      edges: graph.edges as MachineConfigFrom['edges'],
    };
  }

  return { nodes: [], edges: [] };
};

export type { typings };
