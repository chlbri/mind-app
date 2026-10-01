import type { Context } from '@bemedev/mind-flow';
import { typings } from '@bemedev/mind-flow';
import type { MachineConfigFrom } from '@bemedev/mind-machine';
import * as v from 'valibot';

import { STORAGE_KEY } from './constants';
import { DEFAULT_CONFIG } from './data';

/** Payload model grouping the flowchart history and its active index. */
export const historyModel = v.object({
  history: typings.history,
  historyIndex: v.number(),
});

/** Serialized localStorage model parsed and validated with valibot. */
export const localStorageModel = v.pipe(v.string(), v.parseJson(), historyModel);

/** Persisted payload grouping the flowchart history and its active index. */
export type MachineHistoryPayload = v.InferOutput<typeof historyModel>;

/**
 * Reads and validates the persisted history payload.
 *
 * Returns `undefined` on the server, when nothing is stored, or when the stored
 * value does not match {@linkcode localStorageModel}.
 *
 * @param key - The localStorage key, defaulting to {@linkcode STORAGE_KEY}.
 *
 * @returns The validated payload of type {@linkcode MachineHistoryPayload} or
 *   `undefined`.
 */
export const readHistory = (
  key = STORAGE_KEY,
): MachineHistoryPayload | undefined => {
  if (typeof localStorage === 'undefined') return undefined;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;

    return v.parse(localStorageModel, raw);
  } catch {
    return undefined;
  }
};

/**
 * Validates and persists the history payload.
 *
 * Storage failures (quota exceeded, private mode, server side rendering) are
 * swallowed and reported through the return value.
 *
 * @param payload - The payload of type {@linkcode MachineHistoryPayload} to persist.
 * @param key - The localStorage key, defaulting to {@linkcode STORAGE_KEY}.
 *
 * @returns `true` when the payload is persisted, `false` otherwise.
 */
export const writeHistory = (
  payload: MachineHistoryPayload,
  key = STORAGE_KEY,
): boolean => {
  if (typeof localStorage === 'undefined') return false;

  try {
    localStorage.setItem(key, JSON.stringify(v.parse(historyModel, payload)));
    return true;
  } catch {
    return false;
  }
};

/**
 * Reads the stored payload only when it holds at least one commit.
 *
 * An empty history means nothing was committed yet, so the default configuration
 * should be used instead of a blank canvas.
 *
 * @returns The validated payload of type {@linkcode MachineHistoryPayload} or
 *   `undefined`.
 */
export const readStoredPayload = (): MachineHistoryPayload | undefined => {
  const stored = readHistory();
  return stored?.history.length ? stored : undefined;
};

/**
 * Resolves the initial machine history: the stored payload first, then
 * {@linkcode DEFAULT_CONFIG}.
 *
 * @returns The history source of type {@linkcode MachineHistoryPayload} or
 *   {@linkcode MachineConfigFrom}.
 */
export const getInitialHistory = (): MachineHistoryPayload | MachineConfigFrom =>
  readStoredPayload() ?? DEFAULT_CONFIG;

/**
 * Creates a registrar persisting the flow history into localStorage.
 *
 * The returned callback skips empty histories, avoiding to overwrite a configured
 * diagram with a blank canvas, and only writes when the history grows or the
 * restored index changes.
 *
 * @param key - The localStorage key, defaulting to {@linkcode STORAGE_KEY}.
 *
 * @returns The registrar of type `(context: Context) => boolean`, returning `true`
 *   when the context was persisted.
 */
export const createHistoryPersister = (key = STORAGE_KEY) => {
  let lastHistoryLength = -1;
  let lastHistoryIndex = -1;

  /**
   * Persists the registered flow context.
   *
   * @param context - The current flow context of type {@linkcode Context}.
   *
   * @returns `true` when the context was persisted, `false` otherwise.
   */
  const register = ({ history = [], historyIndex = -1 }: Context): boolean => {
    const isNotEmpty = history.length > 0;
    const check =
      isNotEmpty &&
      (history.length > lastHistoryLength || lastHistoryIndex !== historyIndex);
    if (!check) return false;

    lastHistoryLength = history.length;
    lastHistoryIndex = historyIndex;

    return writeHistory({ history, historyIndex }, key);
  };

  return register;
};
