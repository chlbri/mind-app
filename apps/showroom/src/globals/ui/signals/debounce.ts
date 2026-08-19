import { createSignal, type Accessor, type Setter } from 'solid-js';

/**
 * Creates a debounced function that delays invoking `action` until after `ms`
 * milliseconds have elapsed since the last call.
 *
 * @template T - Argument type passed to the debounced action.
 *
 * @param action - The callback function to debounce.
 * @param ms - Delay duration in milliseconds. Defaults to 1000.
 *
 * @returns The debounced execution function with a `.cancel()` method.
 */
export function createDebounce<T>(action: (arg: T) => void, ms = 1000) {
  let timerHandle: NodeJS.Timeout;

  const debounce = (value: T) => {
    clearTimeout(timerHandle);
    timerHandle = setTimeout(() => action(value), ms);
  };
  debounce.cancel = () => clearTimeout(timerHandle);

  return debounce;
}

/** Options for debounced reactive signal creation. */
type Options<T> = {
  /** Debounce delay duration in milliseconds. */
  ms?: number;
  /** Optional action executed on update. */
  action?: (value: T) => void;
  /** Optional end state value to automatically set before debouncing back. */
  end?: T;
};

/**
 * Creates a debounced signal with an automatic temporary `end` state.
 *
 * @template T - Type of the stored signal state.
 *
 * @param start - Initial signal state value.
 * @param options - Configuration options including the mandatory `end` state.
 *
 * @returns A tuple of `[Accessor<T>, { (): void; cancel: () => void }]`.
 */
export function createDebounceSignal<T>(
  start: T,
  options: Omit<Options<T>, 'end'> & Required<Pick<Options<T>, 'end'>>,
): readonly [Accessor<T>, { (): void; cancel: () => void }];

/**
 * Creates a debounced signal that updates after a settled delay.
 *
 * @template T - Type of the stored signal state.
 *
 * @param start - Initial signal state value.
 * @param options - Optional configuration options.
 *
 * @returns A tuple of `[Accessor<T>, debouncedSetter, immediateSetter]`.
 */
export function createDebounceSignal<T>(
  start: T,
  options?: Omit<Options<T>, 'end'>,
): readonly [
  Accessor<T>,
  { (value: T): void; cancel: () => void },
  setter: Setter<T>,
];

export function createDebounceSignal<T>(start: T, options?: Options<T>) {
  const { ms = 500, action, end } = options ?? {};
  const [signal, _setSignal] = createSignal(start);

  const setSignal = (value: T) => {
    if (action) {
      action(value);
    }

    _setSignal(value as any);
  };

  const debounce = createDebounce<T>(setSignal, ms);

  if (end) {
    const debounce2 = () => {
      setSignal(end as any);
      debounce(start);
    };
    debounce2.cancel = debounce.cancel;

    return [signal, debounce2] as any;
  }

  return [signal, debounce, setSignal] as any;
}

/** Short alias for {@linkcode createDebounceSignal}. */
export const cds = createDebounceSignal;

/**
 * Creates a debounced boolean toggle signal switching state temporarily.
 *
 * @param args - Configuration options for the boolean debounce.
 *
 * @returns Debounced signal tuple.
 */
export const toggleDebounceBool = (
  args?: { initial?: boolean } & Omit<Options<boolean>, 'end'>,
) => {
  const { ms = 500, initial = true, action } = args ?? {};
  return cds(initial, { ms, end: !initial, action });
};
