import { describe, expect, it } from 'vitest';

import {
  canInsertGuardAtCursor,
  cleanGuardConfig,
  formatGuardValue,
  getGuardNodeType,
  insertGuardAtCursor,
  toGuardArray,
} from './GuardsInput';

describe('#01 => GuardsInput helpers', () => {
  describe('#01 => getGuardNodeType', () => {
    it('#01 => should identify string as key', () => {
      expect(getGuardNodeType('isAuthorized')).toBe('key');
    });

    it('#02 => should identify object with and as and', () => {
      expect(getGuardNodeType({ and: ['a', 'b'] })).toBe('and');
    });

    it('#03 => should identify object with or as or', () => {
      expect(getGuardNodeType({ or: ['a', 'b'] })).toBe('or');
    });

    it('#04 => should identify object with name as describer', () => {
      expect(getGuardNodeType({ name: 'checkAge', description: 'desc' })).toBe(
        'describer',
      );
    });
  });

  describe('#02 => cleanGuardConfig', () => {
    it('#01 => should return undefined for empty or whitespace strings', () => {
      expect(cleanGuardConfig('')).toBeUndefined();
      expect(cleanGuardConfig('   ')).toBeUndefined();
    });

    it('#02 => should trim valid string', () => {
      expect(cleanGuardConfig('  isValid  ')).toBe('isValid');
    });

    it('#03 => should filter out empty children in and group', () => {
      const input = { and: ['a', '  ', 'b'] };
      expect(cleanGuardConfig(input)).toEqual({ and: ['a', 'b'] });
    });

    it('#04 => should return undefined if and group has no valid children', () => {
      const input = { and: ['', '  '] };
      expect(cleanGuardConfig(input)).toBeUndefined();
    });

    it('#05 => should filter out empty children in or group', () => {
      const input = { or: ['x', ''] };
      expect(cleanGuardConfig(input)).toEqual({ or: ['x'] });
    });

    it('#06 => should clean describer and trim description', () => {
      const input = { name: '  checkAuth  ', description: '  verify  ' };
      expect(cleanGuardConfig(input)).toEqual({
        name: 'checkAuth',
        description: 'verify',
      });
    });

    it('#07 => should return undefined if describer name is empty', () => {
      const input = { name: '   ', description: 'desc' };
      expect(cleanGuardConfig(input)).toBeUndefined();
    });
  });

  describe('#03 => toGuardArray', () => {
    it('#01 => should return empty array for undefined', () => {
      expect(toGuardArray(undefined)).toEqual([]);
    });

    it('#02 => should parse comma-separated string', () => {
      expect(toGuardArray('isValid, isApproved')).toEqual(['isValid', 'isApproved']);
    });

    it('#03 => should parse JSON string of and/or object', () => {
      const json = JSON.stringify({ and: ['a', 'b'] });
      expect(toGuardArray(json)).toEqual([{ and: ['a', 'b'] }]);
    });

    it('#04 => should wrap single object into array', () => {
      expect(toGuardArray({ or: ['x', 'y'] })).toEqual([{ or: ['x', 'y'] }]);
    });

    it('#05 => should flatten array inputs', () => {
      expect(toGuardArray(['a', 'b'])).toEqual(['a', 'b']);
    });
  });

  describe('#04 => formatGuardValue', () => {
    it('#01 => should return empty string for undefined', () => {
      expect(formatGuardValue(undefined)).toBe('');
    });

    it('#02 => should quote single string', () => {
      expect(formatGuardValue('isValid')).toBe('"isValid"');
    });

    it('#03 => should serialize and object cleanly', () => {
      const formatted = formatGuardValue({ and: ['a', 'b'] });
      expect(JSON.parse(formatted)).toEqual({ and: ['a', 'b'] });
    });
  });

  describe('#05 => canInsertGuardAtCursor', () => {
    it('#01 => should allow insertion in empty text', () => {
      expect(canInsertGuardAtCursor('', 0, 0)).toBe(true);
      expect(canInsertGuardAtCursor('   ', 1, 1)).toBe(true);
    });

    it('#02 => should disallow insertion inside string literal', () => {
      const text = '"isValid"';
      expect(canInsertGuardAtCursor(text, 3, 3)).toBe(false);
    });

    it('#03 => should allow insertion at root boundaries', () => {
      const text = '"isValid"';
      expect(canInsertGuardAtCursor(text, 0, 0)).toBe(true);
      expect(canInsertGuardAtCursor(text, text.length, text.length)).toBe(true);
    });

    it('#04 => should allow insertion inside array', () => {
      const text = '{\n  "and": [\n    "g1",\n    \n  ]\n}';
      const pos = text.indexOf('    \n') + 4;
      expect(canInsertGuardAtCursor(text, pos, pos)).toBe(true);
    });

    it('#05 => should disallow insertion inside object outside arrays', () => {
      const text = '{\n  "and": [\n    "g1"\n  ],\n  \n}';
      const pos = text.indexOf('  \n}');
      expect(canInsertGuardAtCursor(text, pos, pos)).toBe(false);
    });

    it('#06 => should allow insertion with valid selection', () => {
      const text = '{\n  "and": [\n    "g1"\n  ]\n}';
      const selStart = text.indexOf('"g1"');
      const selEnd = selStart + 4;
      expect(canInsertGuardAtCursor(text, selStart, selEnd)).toBe(true);
    });
  });

  describe('#06 => insertGuardAtCursor', () => {
    it('#01 => should insert AND into empty text', () => {
      const res = insertGuardAtCursor('', 0, 0, 'and');
      expect(JSON.parse(res.text)).toEqual({ and: ['conditionA', 'conditionB'] });
      expect(res.selectionStart).toBeGreaterThan(0);
    });

    it('#02 => should insert OR into array with correct commas', () => {
      const text = '[\n  "g1"\n]';
      const pos = text.indexOf('"g1"') + 4;
      const res = insertGuardAtCursor(text, pos, pos, 'or');
      expect(JSON.parse(res.text)).toEqual(['g1', { or: ['optionA', 'optionB'] }]);
    });
  });
});
