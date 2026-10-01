import { beforeEach, describe, expect, it } from 'vitest';

import {
  COMPOSITE_KEY_SEPARATOR,
  getStorageKey,
  readHistory,
  writeHistory,
} from './storage';

const history = [{ data: { nodes: [], edges: [] }, date: 1 }];

describe('#01 => storage', () => {
  beforeEach(() => localStorage.clear());

  describe('#01 => getStorageKey', () => {
    it('#01 => should return undefined for missing keys', () => {
      expect(getStorageKey()).toBeUndefined();
      expect(getStorageKey([])).toBeUndefined();
      expect(getStorageKey('')).toBeUndefined();
      expect(getStorageKey(['', '  '])).toBeUndefined();
    });

    it('#02 => should use a single key as-is', () => {
      expect(getStorageKey('machine')).toBe('machine');
      expect(getStorageKey(['machine'])).toBe('machine');
    });

    it('#03 => should build a composite key from multiple parts', () => {
      const expected = ['order', 'payment'].join(COMPOSITE_KEY_SEPARATOR);
      expect(getStorageKey(['order', 'payment'])).toBe(expected);
    });

    it('#04 => should trim parts and drop empty ones', () => {
      const expected = ['order', 'payment'].join(COMPOSITE_KEY_SEPARATOR);
      expect(getStorageKey([' order ', '', ' payment '])).toBe(expected);
    });
  });

  describe('#02 => readHistory', () => {
    it('#01 => should return undefined without a key', () => {
      expect(readHistory()).toBeUndefined();
    });

    it('#02 => should return undefined when nothing is stored', () => {
      expect(readHistory('unknown')).toBeUndefined();
    });

    it('#03 => should return undefined for invalid stored values', () => {
      localStorage.setItem('invalid', 'not-json');
      localStorage.setItem('invalid-shape', JSON.stringify({ history: 'nope' }));

      expect(readHistory('invalid')).toBeUndefined();
      expect(readHistory('invalid-shape')).toBeUndefined();
    });

    it('#04 => should return the parsed payload of a valid stored value', () => {
      const payload = { history, historyIndex: 0 };
      localStorage.setItem('valid', JSON.stringify(payload));

      const result = readHistory('valid');
      expect(result?.historyIndex).toBe(0);
      expect(result?.history).toHaveLength(1);
    });
  });

  describe('#03 => writeHistory', () => {
    it('#01 => should return false without a key', () => {
      expect(writeHistory(undefined, { history, historyIndex: 0 })).toBe(false);
    });

    it('#02 => should persist a valid payload', () => {
      const written = writeHistory('machine', { history, historyIndex: 0 });

      expect(written).toBe(true);
      expect(readHistory('machine')?.history).toHaveLength(1);
    });

    it('#03 => should refuse an invalid payload', () => {
      const written = writeHistory('machine', { history: 'nope' } as any);

      expect(written).toBe(false);
      expect(localStorage.getItem('machine')).toBeNull();
    });
  });
});
