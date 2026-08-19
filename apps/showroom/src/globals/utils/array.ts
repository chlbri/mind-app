/**
 * Checks whether an index is within the bounds of an array.
 *
 * @param data - The array to check.
 * @param index - The numeric index to test.
 *
 * @returns `true` if the index exists within the array bounds; otherwise
 * `false`.
 */
export const inBounds = (data: any[], index: number) => {
  const out = data.map((_, i) => i).includes(index);

  return out;
};

/**
 * Creates a predicate filter function matching items against a partial object
 * specification.
 *
 * @template T - The type of elements being filtered.
 *
 * @param data - Partial matching object criteria.
 *
 * @returns A predicate function returning `true` if an item matches all
 * criteria.
 */
export function narrowFilter<T>(data: Partial<T>): (data: T) => boolean;

/**
 * Creates a predicate filter function matching items by a specific key and value.
 *
 * @template T - The type of elements being filtered.
 *
 * @param key - Property key to check on each item.
 * @param value - Expected property value.
 *
 * @returns A predicate function returning `true` if the item property matches the
 *   value.
 */
export function narrowFilter<T>(
  key: keyof T,
  value: T[typeof key],
): (data: T) => boolean;

export function narrowFilter<T>(arg1: any, arg2?: unknown) {
  const out = (data: T) => {
    if (typeof arg1 === 'string') {
      const key = arg1 as keyof T;
      return data[key] === arg2;
    }

    for (const key in arg1) {
      if (Object.prototype.hasOwnProperty.call(arg1, key)) {
        const elm1 = arg1[key];
        const elm2 = (data as any)[key];
        if (elm1 !== elm2) return false;
      }
    }

    return true;
  };

  return out;
}
