import type { Context, WithFlow } from '@bemedev/mind-flow-three';
import type { JSX } from 'solid-js';

/**
 * Properties for the 3D {@linkcode FlowMachine} component.
 *
 * @see {@linkcode import('@bemedev/mind-flow-three').createContext}
 */
export type FlowMachineProps = {
  /**
   * Initial machine history, of type `any`, accepting:
   *
   * - A `@bemedev/app` state machine configuration or machine instance, parsed with
   *   `parseMachineToGraph` to provide default 3D nodes and edges.
   * - A scene history array (`typings.HistoryEntry[]`).
   * - A persisted payload `{ history, historyIndex }`.
   * - A scene configuration `{ nodes, edges }`, used as-is.
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

  /** Whether the force-directed physics simulation runs on mount, defaults to `true`. */
  physics?: boolean;
};

export type { WithFlow };
