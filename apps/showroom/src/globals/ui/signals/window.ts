import { createDeferred, createSignal, onMount } from 'solid-js';

/**
 * Creates a deferred accessor providing the browser `window` object once mounted on
 * the client.
 *
 * @returns Deferred accessor returning `Window | undefined`.
 */
export const assignWindow = () => {
  const [win, setWin] = createSignal<Window>();
  onMount(() => setWin(window));
  return createDeferred(win, { timeoutMs: 15 });
};

/** Record mapping callback names to window handler functions. */
export type UseWindowProps = Record<string, (win: Window) => void>;

/** Mapped object type wrapping window handlers in client-safe caller functions. */
type Out<T extends UseWindowProps> = { [K in keyof T]: () => void };

/**
 * Wraps window operations in client-safe invoker functions that only execute when
 * `window` is available.
 *
 * @template | {@linkcode UseWindowProps} `T` - Map of window handler functions.
 *
 * @param props - Map of callbacks receiving the browser `window` object.
 *
 * @returns An object with identical keys invoking callbacks safely on
 * client.
 */
export const useWindow = <const T extends UseWindowProps>(props: T): Out<T> => {
  const win = assignWindow();
  const entries = Object.entries(props);

  const out = Object.fromEntries(
    entries.map(([name, handler]) => {
      const method = () => {
        const _win = win();
        if (_win) return handler(_win);
      };
      return [name, method] as const;
    }),
  );

  return out as Out<T>;
};
