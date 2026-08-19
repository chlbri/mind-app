import type { Accessor } from 'solid-js';

// #region SubType
/**
 * Utility type mapping matching keys whose property types satisfy a
 * condition.
 *
 * @template Base - Target base object type.
 * @template Condition - Required condition type.
 */
type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};

/**
 * Extracts allowed property names of a base type matching a specific
 * condition.
 *
 * @template Base - Target base object type.
 * @template Condition - Required condition type.
 */
type AllowedNames<Base, Condition> = FilterFlags<
  Base,
  Condition
>[keyof Base];

// #endregion

/**
 * Extracts the inner unwrapped value type from a Solid {@linkcode Accessor}
 * or plain value.
 *
 * @template T - The target type or accessor type.
 */
type Getter<T> =
  NonNullable<T> extends Accessor<infer U>
    ? NonNullable<U>
    : NonNullable<T>;

/**
 * Safely calls a method on an object or reactive getter if it is defined.
 *
 * @template T - The object or accessor type.
 * @template K - Method key name on the unwrapped object type.
 *
 * @param obj - The object instance or accessor returning an object.
 * @param key - The method name to execute.
 * @param args - Arguments to pass to the method.
 *
 * @returns The method return value if defined, otherwise `undefined`.
 */
export const undefinedCall = <
  T,
  K extends AllowedNames<Getter<T>, (...args: any[]) => any>,
>(
  obj: T,
  key: K,
  ...args: Parameters<Extract<Getter<T>[K], (...args: any[]) => any>>
) => {
  const data = typeof obj === 'function' ? obj() : obj;
  return (data ? data[key](...args) : undefined) as
    | ReturnType<Extract<Getter<T>[K], (...args: any[]) => any>>
    | undefined;
};
