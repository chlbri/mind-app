import type { Accessor } from 'solid-js';

/**
 * Normalizes a boolean value or reactive boolean accessor to a primitive
 * boolean.
 *
 * @param condition - Boolean value or Solid accessor returning boolean.
 *
 * @returns The resolved boolean value (defaults to `true` if undefined).
 */
export const buildBoolean = (
  condition?: Accessor<boolean | undefined> | boolean,
) => {
  const _condition =
    typeof condition === 'function'
      ? (condition() ?? true)
      : (condition ?? true);
  return _condition;
};
