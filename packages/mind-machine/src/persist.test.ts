import { beforeEach, describe, expect, it } from 'vitest';

import { createHistoryPersister } from './persist';
import { readHistory } from './storage';

const entry = { data: { nodes: [], edges: [] }, date: 1 };

describe('#01 => createHistoryPersister', () => {
  beforeEach(() => localStorage.clear());

  it('#01 => should skip empty histories', () => {
    const register = createHistoryPersister('machine');

    expect(register({} as any)).toBe(false);
    expect(register({ history: [], historyIndex: -1 } as any)).toBe(false);
    expect(localStorage.getItem('machine')).toBeNull();
  });

  it('#02 => should persist the first commit', () => {
    const register = createHistoryPersister('machine');

    expect(register({ history: [entry], historyIndex: 0 } as any)).toBe(true);
    expect(readHistory('machine')?.history).toHaveLength(1);
  });

  it('#03 => should skip already registered contexts', () => {
    const register = createHistoryPersister('machine');
    const context = { history: [entry], historyIndex: 0 } as any;

    expect(register(context)).toBe(true);
    expect(register(context)).toBe(false);
  });

  it('#04 => should persist growing histories and index changes', () => {
    const register = createHistoryPersister('machine');

    expect(register({ history: [entry], historyIndex: 0 } as any)).toBe(true);
    expect(register({ history: [entry, entry], historyIndex: 1 } as any)).toBe(true);
    expect(readHistory('machine')?.historyIndex).toBe(1);

    expect(register({ history: [entry, entry], historyIndex: 0 } as any)).toBe(true);
    expect(readHistory('machine')?.historyIndex).toBe(0);
  });

  it('#05 => should not report persistence without a key', () => {
    const register = createHistoryPersister();

    expect(register({ history: [entry], historyIndex: 0 } as any)).toBe(false);
  });
});
