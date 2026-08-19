import type { Accessor } from 'solid-js';

/**
 * Return type for conditional event handlers providing manual add/remove triggers.
 *
 * @property add - Function to manually register the event listener.
 * @property remove - Function to manually deregister the event listener.
 */
type _Return = { add: () => void; remove: () => void };

/**
 * Conditional DOM event handler attachment function signature.
 *
 * @template | `keyof HTMLElementEventMap` `K` - DOM event name key type from
 *   interface {@linkcode HTMLElementEventMap}.
 *
 * @param args - Event listener configuration options.
 * @param args.type - Event type name to listen for.
 * @param args.listener - Callback listener function invoked on event trigger.
 * @param args.options - Optional configuration for event listener registration and
 *   removal.
 * @param args.options.add - Options passed when adding the event listener of
 *   interface {@linkcode AddEventListenerOptions} or `boolean`.
 * @param args.options.remove - Options passed when removing the event listener of
 *   interface {@linkcode EventListenerOptions} or `boolean`.
 * @param condition - Boolean condition or accessor of type {@linkcode Accessor}
 *   controlling whether the event is active.
 *
 * @returns Object of type {@linkcode _Return} with `add` and `remove` methods to
 *   manage the event manually.
 */
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

/**
 * Unconditional DOM event handler attachment function signature.
 *
 * @template | `keyof HTMLElementEventMap` `K` - DOM event name key type from
 *   interface {@linkcode HTMLElementEventMap}.
 *
 * @param args - Event listener configuration options.
 * @param args.type - Event type name to listen for.
 * @param args.listener - Callback listener function invoked on event trigger.
 * @param args.options - Optional configuration for event listener registration and
 *   removal.
 * @param args.options.add - Options passed when adding the event listener of
 *   interface {@linkcode AddEventListenerOptions} or `boolean`.
 * @param args.options.remove - Options passed when removing the event listener of
 *   interface {@linkcode EventListenerOptions} or `boolean`.
 */
type Normal = <K extends keyof HTMLElementEventMap>(args: {
  type: K;
  listener: (ev: HTMLElementEventMap[K]) => void;
  options?: {
    add?: boolean | AddEventListenerOptions;
    remove?: boolean | EventListenerOptions;
  };
}) => void;

/**
 * Conditional DOM event handler attachment function signature accepting an element
 * ref accessor.
 *
 * @template | {@linkcode HTMLElement} | {@linkcode Window} | undefined `T`
 *
 *   - Target DOM element or window type.
 *
 * @param ref - Optional accessor of type {@linkcode Accessor} returning the target
 *   element or window.
 *
 * @returns A conditional event handler function returning type
 * {@linkcode _Return}.
 *
 * @see -- interface {@linkcode HTMLElementEventMap}, -- interface {@linkcode AddEventListenerOptions}, -- interface {@linkcode EventListenerOptions}
 */
type ConditionalWithRef<T extends HTMLElement | Window | undefined = Window> = (
  ref?: Accessor<T>,
) => <K extends keyof HTMLElementEventMap>(
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

/**
 * Unconditional DOM event handler attachment function signature accepting an element
 * ref accessor.
 *
 * @template | {@linkcode HTMLElement} | {@linkcode Window} | undefined `T`
 *
 *   - Target DOM element or window type.
 *
 * @param ref - Optional accessor of type {@linkcode Accessor} returning the target
 *   element or window.
 *
 * @returns An unconditional event handler function.
 *
 * @see -- interface {@linkcode HTMLElementEventMap}, -- interface {@linkcode AddEventListenerOptions}, -- interface {@linkcode EventListenerOptions}
 */
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

/**
 * Higher-order event handler factory signature combining standard and conditional
 * event listeners.
 *
 * @template | {@linkcode HTMLElement} | {@linkcode Window} | undefined `T`
 *
 *   - Target DOM element or window type.
 *
 * @param nornal - Unconditional event handler function of type
 *   {@linkcode NormalWithRef}.
 * @param conditional - Conditional event handler function of type
 *   {@linkcode ConditionalWithRef}.
 * @param ref - Optional target element or window accessor of type
 *   {@linkcode Accessor}.
 *
 * @returns An event handler function of type {@linkcode Normal} with attached
 *   `conditional` handler of type {@linkcode Conditional}.
 */
export type Handler = <
  T extends HTMLElement | Window | undefined = HTMLElement | Window,
>(
  nornal: NormalWithRef<T>,
  conditional: ConditionalWithRef<T>,
  ref?: Accessor<T>,
) => Normal & { conditional: Conditional };
