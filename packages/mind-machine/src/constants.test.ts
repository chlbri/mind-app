import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

import {
  DASH_ARRAY,
  EDGES_COLORS,
  historyModel,
  isDirectChildOfPrincipal,
  localStorageModel,
  PRINCIPAL_NODE_KEY,
} from './constants';

describe('#01 => constants', () => {
  describe('#01 => static values', () => {
    it('#01 => should expose edge colors per transition kind', () => {
      expect(EDGES_COLORS).toEqual({
        after: '#f97316',
        always: '#22c55e',
        on: '#3b82f6',
        child_parent: '#8b5cf6',
      });
    });

    it('#02 => should expose the principal node key and dash array', () => {
      expect(PRINCIPAL_NODE_KEY).toBe('/');
      expect(DASH_ARRAY).toBe('6 4');
    });
  });

  describe('#02 => isDirectChildOfPrincipal', () => {
    it('#01 => should accept direct children paths', () => {
      expect(isDirectChildOfPrincipal('/cart')).toBe(true);
    });

    it('#02 => should reject nested, root, and missing paths', () => {
      expect(isDirectChildOfPrincipal('/fulfillment/packaging')).toBe(false);
      expect(isDirectChildOfPrincipal(PRINCIPAL_NODE_KEY)).toBe(false);
      expect(isDirectChildOfPrincipal('cart')).toBe(false);
      expect(isDirectChildOfPrincipal()).toBe(false);
    });
  });

  describe('#03 => schemas', () => {
    it('#01 => should validate a history payload', () => {
      const payload = {
        history: [{ data: { nodes: [], edges: [] }, date: 1 }],
        historyIndex: 0,
      };

      expect(v.safeParse(historyModel, payload).success).toBe(true);
      expect(v.safeParse(historyModel, { history: [] }).success).toBe(false);
    });

    it('#02 => should parse a serialized history payload', () => {
      const payload = { history: [], historyIndex: -1 };

      const parsed = v.parse(localStorageModel, JSON.stringify(payload));
      expect(parsed).toEqual(payload);
    });

    it('#03 => should reject invalid serialized payloads', () => {
      expect(v.safeParse(localStorageModel, 'not-json').success).toBe(false);
      expect(v.safeParse(localStorageModel, '{"history":[]}').success).toBe(false);
    });
  });
});
