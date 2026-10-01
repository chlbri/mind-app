import { expandFn } from '@bemedev/app/bemedev';
import type { typings, HandleType, NodeHandles_T } from '@bemedev/mind-flow';
import type { Accessor } from 'solid-js';

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

/** Default handle configuration for top and bottom connection points. */
const top: typings.HandleConfig[] = [
  { type: 'none', color: EDGES_COLORS.child_parent },
];

/** Edge color mapping list for horizontal transitions (after, always, on). */
const HORIZONTAL_EDGES_COLRS = [
  EDGES_COLORS.after,
  EDGES_COLORS.always,
  EDGES_COLORS.on,
];

/**
 * Creates horizontal handle configurations with distinct colors for each transition
 * type.
 *
 * @param type - Handle endpoint type excluding `'none'` of type
 *   {@linkcode HandleType}.
 *
 * @returns Array of handle configurations of type {@linkcode HandleConfig}.
 */
const handleHelperH = (
  type: Exclude<HandleType, 'none'>,
): typings.HandleConfig[] => {
  return HORIZONTAL_EDGES_COLRS.map(color => ({ type, color }));
};

/**
 * Generates standard directional handles for a state machine node.
 *
 * @returns Standard handles configuration of type {@linkcode NodeHandles_T}.
 */
export const createHandles: () => NodeHandles_T = () => ({
  top,
  bottom: top,
  left: handleHelperH('input'),
  right: handleHelperH('output'),
});

export * from './transition.validator';

/**
 * Configuration tuple for dispatching array data with pluralized title strings.
 *
 * @template T - Element type of the array data.
 */
type PropsDispatchArray<T> = [
  number: { multiple: string; single: string },
  data?: Accessor<T[] | undefined>,
];

/**
 * Helper generating reactive accessors for array data, length, presence, and joined
 * representation.
 *
 * @template T - Element type of the array data.
 *
 * @param data - Optional reactive accessor providing array data.
 *
 * @returns A tuple of accessors `[_data, len, has, join]`.
 */
const withoutTitle = <T>(data?: Accessor<T[] | undefined>) => {
  const _data = () => data?.() ?? [];
  const len = () => _data().length;
  const has = () => len() >= 1;
  const join = () => _data().join(', ');
  return [_data, len, has, join] as const;
};

/**
 * Formats and dispatches array data with reactive length, presence, joined string,
 * and dynamic title.
 *
 * @template T - Element type of the array data.
 *
 * @param options - Object specifying single and plural title labels.
 * @param data - Optional reactive accessor providing array data.
 *
 * @returns A tuple of accessors `[_data, len, has, join, title]`.
 */
export const dispatchArray = expandFn(
  <T>(...[{ multiple, single }, data]: PropsDispatchArray<T>) => {
    const [_data, len, ...rest] = withoutTitle(data);
    const title = () => (len() === 1 ? single : multiple);
    return [_data, len, ...rest, title] as const;
  },

  { withoutTitle },
);
