import { typings } from '@bemedev/mind-flow';
import * as v from 'valibot';

export const DASH_ARRAY = '6 4';

export const EDGES_COLORS = {
  after: '#f97316',
  always: '#22c55e',
  on: '#3b82f6',
  child_parent: '#8b5cf6',
} as const;

/** LocalStorage key for persisting state machine flowchart configuration. */
export const STORAGE_KEY = 'machine-flow-config';

export const historyModel = v.object({
  history: typings.history,
  historyIndex: v.number(),
});

export const localStorageModel = v.pipe(v.string(), v.parseJson(), historyModel);

export const PRINCIPAL_NODE_KEY = '/';

/**
 * Determines whether a given state path is a direct child of the principal node
 * (i.e. has exactly one '/' separator, e.g. '/cart', '/payment').
 */
export const isDirectChildOfPrincipal = (path?: string): boolean => {
  if (!path || path === PRINCIPAL_NODE_KEY) return false;
  return path.startsWith('/') && !path.slice(1).includes('/');
};
