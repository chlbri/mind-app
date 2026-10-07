import { describe, expect, it } from 'vitest';

import {
  DASH_ARRAY,
  EDGES_COLORS,
  isDirectChildOfPrincipal,
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
});
