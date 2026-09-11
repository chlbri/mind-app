import { describe, expect, it } from 'vitest';

import { getHandleOffsetPercent } from './Node';

describe('#01 => Node Handles Layout & Centering', () => {
  describe('#01 => getHandleOffsetPercent', () => {
    it('#01 => should return 50 for non-positive totals', () => {
      expect(getHandleOffsetPercent(0, 0)).toBe(50);
      expect(getHandleOffsetPercent(0, -1)).toBe(50);
    });

    it('#02 => should place a single handle at the exact center (50%)', () => {
      expect(getHandleOffsetPercent(0, 1)).toBe(50);
    });

    it('#03 => should calculate midpoints for two handles (25% and 75%)', () => {
      const h0 = getHandleOffsetPercent(0, 2);
      const h1 = getHandleOffsetPercent(1, 2);

      expect(h0).toBe(25);
      expect(h1).toBe(75);

      // The segment between the two handles is centered at 50%
      expect((h0 + h1) / 2).toBe(50);
    });

    it('#04 => should calculate midpoints for three handles with center at 50%', () => {
      const h0 = getHandleOffsetPercent(0, 3);
      const h1 = getHandleOffsetPercent(1, 3);
      const h2 = getHandleOffsetPercent(2, 3);

      expect(h0).toBeCloseTo(16.6667, 3);
      expect(h1).toBe(50);
      expect(h2).toBeCloseTo(83.3333, 3);

      // Symmetrical around center
      expect((h0 + h2) / 2).toBeCloseTo(50, 3);
    });

    it('#05 => should calculate midpoints for four handles symmetrically', () => {
      const h0 = getHandleOffsetPercent(0, 4);
      const h1 = getHandleOffsetPercent(1, 4);
      const h2 = getHandleOffsetPercent(2, 4);
      const h3 = getHandleOffsetPercent(3, 4);

      expect(h0).toBe(12.5);
      expect(h1).toBe(37.5);
      expect(h2).toBe(62.5);
      expect(h3).toBe(87.5);

      expect((h0 + h3) / 2).toBe(50);
      expect((h1 + h2) / 2).toBe(50);
    });
  });
});
