import type { EdgeKind } from './types';

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

export const getStrokeColor = (k: EdgeKind) => {
  switch (k) {
    case 'child_parent':
      return '#8b5cf6'; // Violet
    case 'after':
      return '#f97316'; // Orange
    case 'always':
      return '#22c55e'; // Green
    case 'on':
    default:
      return '#3b82f6'; // Blue
  }
};

/** Helper to split comma-separated strings into cleaned array. */
export const toList = (val: string): string[] => {
  return val
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
};

export * from './transition.validator';
