import type { SoA } from '@bemedev/app/bemedev';
import type { ParentComponent } from 'solid-js';

/**
 * Render mode relying solely on localStorage keys to restore a previously persisted
 * machine session.
 *
 * The canvas starts empty when nothing is persisted under the derived key.
 */
export type FlowMachineStorageProps = {
  /**
   * Single key or array of key parts used to derive the localStorage key.
   *
   * - A single string (or an array of one) is used directly as the key.
   * - An array of strings is joined to create a composite key.
   */
  localKeys: SoA<string>;
};

/** Render mode accepting an initial history source, with optional persistence. */
export type FlowMachineProps = {
  /**
   * Initial machine history, of type `any`, accepting:
   *
   * - A `@bemedev/app` state machine configuration or machine instance, parsed with
   *   {@linkcode parseMachineToGraph} to provide default nodes and edges.
   * - A flowchart history array (`typings.HistoryEntry[]`).
   * - A persisted payload `{ history, historyIndex }`.
   * - A flowchart configuration `{ nodes, edges }`, used as-is.
   */
  history: any;

  /**
   * Optional single key or array of key parts used to derive the localStorage key.
   *
   * - A single string (or an array of one) is used directly as the key.
   * - An array of strings is joined to create a composite key.
   */
  localKeys?: SoA<string>;
};
