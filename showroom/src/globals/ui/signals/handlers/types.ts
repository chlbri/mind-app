import type { Accessor } from 'solid-js';

type _Return = {
  add: () => void;
  remove: () => void;
};

type Conditional = <K extends keyof HTMLElementEventMap>(
  args: {
    type: K;
    listener: (ev: HTMLElementEventMap[K]) => void;
    options?: {
      add?: boolean | AddEventListenerOptions;
      remove?: boolean | EventListenerOptions;
    };
  },
  condition: Accessor<boolean | undefined> | boolean,
) => _Return;

type Normal = <K extends keyof HTMLElementEventMap>(args: {
  type: K;
  listener: (ev: HTMLElementEventMap[K]) => void;
  options?: {
    add?: boolean | AddEventListenerOptions;
    remove?: boolean | EventListenerOptions;
  };
}) => void;

type ConditionalWithRef<
  T extends HTMLElement | Window | undefined = Window,
> = (ref?: Accessor<T>) => <K extends keyof HTMLElementEventMap>(
  args: {
    type: K;
    listener: (this: T, ev: HTMLElementEventMap[K]) => void;
    options?: {
      add?: boolean | AddEventListenerOptions;
      remove?: boolean | EventListenerOptions;
    };
  },
  condition: Accessor<boolean | undefined> | boolean,
) => _Return;

type NormalWithRef<T extends HTMLElement | Window | undefined = Window> = (
  ref?: Accessor<T>,
) => <K extends keyof HTMLElementEventMap>(args: {
  type: K;
  listener: (this: T, ev: HTMLElementEventMap[K]) => void;
  options?: {
    add?: boolean | AddEventListenerOptions;
    remove?: boolean | EventListenerOptions;
  };
}) => void;

export type Handler = <
  T extends HTMLElement | Window | undefined = HTMLElement | Window,
>(
  nornal: NormalWithRef<T>,
  conditional: ConditionalWithRef<T>,
  ref?: Accessor<T>,
) => Normal & {
  conditional: Conditional;
};
