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

export const localStorageModel = v.pipe(
  v.string(),
  v.parseJson(),
  v.object({ history: typings.history, historyIndex: v.number() }),
);
