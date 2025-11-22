import type { Accessor } from 'solid-js';

// #region SubType
type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};

type AllowedNames<Base, Condition> = FilterFlags<
  Base,
  Condition
>[keyof Base];

// #endregion

type Getter<T> =
  NonNullable<T> extends Accessor<infer U>
    ? NonNullable<U>
    : NonNullable<T>;

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
