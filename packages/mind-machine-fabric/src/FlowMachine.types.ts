import type { Context, WithFlow } from '@bemedev/mind-flow-fabric';
import type { JSX } from 'solid-js';

/**
 * Properties for the fabric {@linkcode FlowMachine} component.
 *
 * @see {@linkcode import('@bemedev/mind-flow-fabric').createContext}
 */
export type FlowMachineProps = {
  /**
   * Initial machine history, of type `any`, accepting:
   *
   * - A `@bemedev/app` state machine configuration or machine instance, parsed with
   *   `parseMachineToGraph` to provide default nodes and edges.
   * - A flowchart history array (`typings.HistoryEntry[]`).
   * - A persisted payload `{ history, historyIndex }`.
   * - A flowchart configuration `{ nodes, edges }`, used as-is.
   */
  history: any;

  /** Optional child elements rendered alongside the machine canvas. */
  children?: JSX.Element;

  /**
   * Callback invoked whenever the state machine context changes across working
   * states, receiving the flow context of type {@linkcode Context}.
   *
   * Persistence is delegated to the consumer: read the stored history before
   * mounting, pass it as the `history` prop, and persist the registered context
   * here.
   */
  register?: (context: Context) => void;
};

export type { WithFlow };
