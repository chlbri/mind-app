import { onCleanup } from 'solid-js';

/**
 * Callback function type invoked when the mouse leaves the bound element.
 *
 * @param event - Optional mouse event that triggered the leave.
 */
export type MouseOutCallback = (event?: MouseEvent) => void;

/** Configuration options for the {@linkcode mouseOut} directive. */
export type MouseOutOptions = {
  /** Callback function to trigger after the timer elapses. */
  callback?: MouseOutCallback;

  /** Alternative callback property name for triggering after the timer elapses. */
  onMouseOut?: MouseOutCallback;

  /**
   * Delay in milliseconds before triggering the callback after the mouse leaves. If
   * the cursor re-enters the element before this duration, the timer is reset.
   *
   * @defaultValue 0
   */
  delay?: number;
};

/** Accepted parameter shapes for the {@linkcode mouseOut} directive. */
export type MouseOutParam =
  | MouseOutCallback
  | [callback: MouseOutCallback, delay?: number]
  | MouseOutOptions;

/**
 * Solid custom directive that triggers a callback when the mouse leaves the bound
 * element after a specified timer duration. If the user re-enters the component
 * before the timer expires, the timer is reset/cancelled.
 *
 * @param el - The bound DOM element.
 * @param accessor - Accessor returning a callback, tuple `[callback, delay]`, or
 *   type {@linkcode MouseOutOptions}.
 */
export const mouseOut = (
  el: HTMLElement | Element,
  accessor: () => MouseOutParam,
) => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const clear = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  const onMouseEnter = () => {
    clear();
  };

  const onMouseLeave = (event: MouseEvent) => {
    clear();

    const param = accessor();
    if (!param) return;

    let callback: MouseOutCallback | undefined;
    let delay = 0;

    if (typeof param === 'function') {
      callback = param;
    } else if (Array.isArray(param)) {
      callback = param[0];
      delay = param[1] ?? 0;
    } else if (typeof param === 'object') {
      callback = param.callback ?? param.onMouseOut;
      delay = param.delay ?? 0;
    }

    if (!callback) return;

    if (delay > 0) {
      timer = setTimeout(() => {
        callback?.(event);
        timer = undefined;
      }, delay);
    } else {
      callback(event);
    }
  };

  el.addEventListener('mouseleave', onMouseLeave as EventListener);
  el.addEventListener('mouseenter', onMouseEnter as EventListener);

  onCleanup(() => {
    clear();
    el.removeEventListener('mouseleave', onMouseLeave as EventListener);
    el.removeEventListener('mouseenter', onMouseEnter as EventListener);
  });
};
