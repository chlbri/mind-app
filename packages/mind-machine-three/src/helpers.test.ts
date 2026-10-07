import { describe, expect, it } from 'vitest';

import { EDGES_COLORS } from './constants';
import {
  CAPITALIZED_CHAR_WIDTH,
  dispatchArray,
  edgeColor,
  isCapitalized,
  monoLength,
  NON_CAPITALIZED_CHAR_WIDTH,
  toList,
} from './helpers';

describe('#01 => helpers', () => {
  describe('#01 => isCapitalized', () => {
    it('#01 => should detect uppercase letters', () => {
      expect(isCapitalized('A')).toBe(true);
      expect(isCapitalized('É')).toBe(true);
    });

    it('#02 => should reject lowercase letters and symbols', () => {
      expect(isCapitalized('a')).toBe(false);
      expect(isCapitalized('1')).toBe(false);
      expect(isCapitalized(' ')).toBe(false);
    });
  });

  describe('#02 => monoLength', () => {
    it('#01 => should return 0 for missing text', () => {
      expect(monoLength()).toBe(0);
      expect(monoLength(null)).toBe(0);
      expect(monoLength('')).toBe(0);
    });

    it('#02 => should size characters on capitalization', () => {
      const expected = 2 * CAPITALIZED_CHAR_WIDTH + 2 * NON_CAPITALIZED_CHAR_WIDTH;
      expect(monoLength('ABcd')).toBe(expected);
    });
  });

  describe('#03 => toList', () => {
    it('#01 => should split, trim, and filter entries', () => {
      expect(toList('a, b ,c')).toEqual(['a', 'b', 'c']);
      expect(toList('')).toEqual([]);
      expect(toList(' , ')).toEqual([]);
    });
  });

  describe('#04 => edgeColor', () => {
    it('#01 => should resolve the palette color of each edge kind', () => {
      expect(edgeColor('after')).toBe(EDGES_COLORS.after);
      expect(edgeColor('always')).toBe(EDGES_COLORS.always);
      expect(edgeColor('on')).toBe(EDGES_COLORS.on);
      expect(edgeColor('child_parent')).toBe(EDGES_COLORS.child_parent);
    });
  });

  describe('#05 => dispatchArray', () => {
    it('#01 => should derive accessors without titles', () => {
      const [_data, len, has, join] = dispatchArray.withoutTitle(() => [1, 2]);

      expect(_data()).toEqual([1, 2]);
      expect(len()).toBe(2);
      expect(has()).toBe(true);
      expect(join()).toBe('1, 2');
    });

    it('#02 => should fallback to empty data', () => {
      const [, len, has, join] = dispatchArray.withoutTitle();

      expect(len()).toBe(0);
      expect(has()).toBe(false);
      expect(join()).toBe('');
    });

    it('#03 => should pluralize titles', () => {
      const labels = { multiple: 'entries:', single: 'entry:' };

      const single = dispatchArray(labels, () => ['a']);
      const multiple = dispatchArray(labels, () => ['a', 'b']);

      expect(single[4]()).toBe('entry:');
      expect(multiple[4]()).toBe('entries:');
    });
  });
});
