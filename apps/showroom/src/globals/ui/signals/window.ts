import { createDeferred, createSignal, onMount } from 'solid-js';

export const assignWindow = () => {
  const [win, setWin] = createSignal<Window>();
  onMount(() => setWin(window));
  return createDeferred(win, { timeoutMs: 15 });
};

export type UseWindowProps = Record<string, (win: Window) => void>;
type Out<T extends UseWindowProps> = { [K in keyof T]: () => void };

export const useWindow = <const T extends UseWindowProps>(
  props: T,
): Out<T> => {
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
