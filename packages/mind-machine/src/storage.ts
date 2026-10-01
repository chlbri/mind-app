import type { SoA } from '@bemedev/app/bemedev';
import * as v from 'valibot';

import { historyModel, localStorageModel } from './constants';

/**
 * Separator used to join multiple localStorage key parts into a single composite
 * key.
 */
export const COMPOSITE_KEY_SEPARATOR = '-';

/**
 * Persisted payload grouping the flowchart history and its active index.
 *
 * @see {@linkcode historyModel}
 */
export type MachineHistoryPayload = v.InferOutput<typeof historyModel>;

/**
 * Normalizes the `localKeys` prop into a single localStorage key.
 *
 * - `undefined` or an empty list returns `undefined`, disabling persistence.
 * - A single string (or an array of one) is used directly as the key.
 * - Multiple strings are joined with {@linkcode COMPOSITE_KEY_SEPARATOR} to build a
 *   composite key.
 *
 * @param localKeys - Single key or array of key parts of type {@linkcode SoA}.
 *
 * @returns The localStorage key, or `undefined` when persistence is disabled.
 */
export const getStorageKey = (localKeys?: SoA<string>): string | undefined => {
  if (!localKeys) return undefined;

  const parts = (Array.isArray(localKeys) ? localKeys : [localKeys])
    .filter(key => typeof key === 'string')
    .map(key => key.trim())
    .filter(Boolean);

  if (parts.length === 0) return undefined;
  if (parts.length === 1) return parts[0];

  return parts.join(COMPOSITE_KEY_SEPARATOR);
};

/**
 * Reads and validates the persisted history payload at the given key.
 *
 * Returns `undefined` on the server, when nothing is stored, or when the stored
 * value does not match {@linkcode localStorageModel}.
 *
 * @param key - The localStorage key, usually derived with {@linkcode getStorageKey}.
 *
 * @returns The validated payload of type {@linkcode MachineHistoryPayload} or
 *   `undefined`.
 */
export const readHistory = (key?: string): MachineHistoryPayload | undefined => {
  if (!key || typeof localStorage === 'undefined') return undefined;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;

    return v.parse(localStorageModel, raw);
  } catch {
    return undefined;
  }
};

/**
 * Validates and persists the history payload at the given key.
 *
 * Storage failures (quota exceeded, private mode, server side rendering) are
 * swallowed and reported through the return value.
 *
 * @param key - The localStorage key, usually derived with {@linkcode getStorageKey}.
 * @param payload - The payload of type {@linkcode MachineHistoryPayload} to persist.
 *
 * @returns `true` when the payload is persisted, `false` otherwise.
 */
export const writeHistory = (
  key: string | undefined,
  payload: MachineHistoryPayload,
): boolean => {
  if (!key || typeof localStorage === 'undefined') return false;

  try {
    localStorage.setItem(key, JSON.stringify(v.parse(historyModel, payload)));
    return true;
  } catch {
    return false;
  }
};
