/**
 * Restricts a number to be within the specified minimum and maximum bounds.
 *
 * @param value - The numerical value to clamp.
 * @param min - The lower boundary limit.
 * @param max - The upper boundary limit.
 *
 * @returns The clamped numerical value between `min` and `max`.
 */
export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};
