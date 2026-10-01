import type { Context } from '@bemedev/mind-flow';

import { writeHistory } from './storage';

/**
 * Creates a registrar persisting the flow history into localStorage.
 *
 * The returned callback skips empty histories, avoiding to overwrite a configured
 * diagram with a blank canvas, and only writes when the history grows or the
 * restored index changes.
 *
 * @param storageKey - The localStorage key, usually derived with
 *   {@linkcode getStorageKey}.
 *
 * @returns The registrar of type `(context: Context) => boolean`, returning `true`
 *   when the context was persisted.
 */
export const createHistoryPersister = (storageKey?: string) => {
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

    return writeHistory(storageKey, { history, historyIndex });
  };

  return register;
};
