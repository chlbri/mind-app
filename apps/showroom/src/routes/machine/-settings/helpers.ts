import type { HandleConfig, HandleType, NodeHandles_T } from '@bemedev/mind-flow';

import { EDGES_COLORS } from './constants';

/**
 * Width in pixels of a capitalized (uppercase) character in HTML monospace font at
 * 10px.
 */
export const CAPITALIZED_CHAR_WIDTH = 11;

/** Width in pixels of a non-capitalized character in HTML monospace font at 10px. */
export const NON_CAPITALIZED_CHAR_WIDTH = 9;

/**
 * Checks whether a character is capitalized (uppercase).
 *
 * @param char - The character to check.
 *
 * @returns `true` if the character is capitalized, otherwise `false`.
 */
export function isCapitalized(char: string): boolean {
  return char.toUpperCase() === char && char.toLowerCase() !== char;
}

/**
 * Calculates the length in pixels of a string rendered in HTML monospace font at
 * 10px font size, sizing each character based on whether it is capitalized or not.
 *
 * @param text - The string to measure.
 *
 * @returns The total calculated width in pixels.
 */
export function monoLength(text?: string | null): number {
  if (!text) return 0;

  let total = 0;
  for (const char of text) {
    total += isCapitalized(char)
      ? CAPITALIZED_CHAR_WIDTH
      : NON_CAPITALIZED_CHAR_WIDTH;
  }

  return total;
}

/** Helper to split comma-separated strings into cleaned array. */
export const toList = (val: string): string[] => {
  return val
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
};

const top: HandleConfig[] = [{ type: 'none', color: EDGES_COLORS.child_parent }];

const HORIZONTAL_EDGES_COLRS = [
  EDGES_COLORS.after,
  EDGES_COLORS.always,
  EDGES_COLORS.on,
];

const handleHelperH = (type: Exclude<HandleType, 'none'>): HandleConfig[] => {
  return HORIZONTAL_EDGES_COLRS.map(color => ({ type, color }));
};

export const createHandles: () => NodeHandles_T = () => ({
  top,
  bottom: top,
  left: handleHelperH('input'),
  right: handleHelperH('output'),
});

export * from './transition.validator';
