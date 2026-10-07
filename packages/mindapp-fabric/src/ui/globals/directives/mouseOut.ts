import { onCleanup } from 'solid-js';

/**
 * Callback function type invoked when the mouse leaves or focus is lost from the
 * bound element.
 *
 * @param event - Optional mouse or focus event that triggered the leave.
 */
export type MouseOutCallback = (event?: MouseEvent | FocusEvent) => void;

/** Configuration options for the {@linkcode mouseOut} directive. */
export type MouseOutOptions = {
  /**
   * Callback function to trigger after the timer elapses of type
   * {@linkcode MouseOutCallback}.
   */
  callback?: MouseOutCallback;

  /**
   * Alternative callback property name for triggering after the timer elapses of
   * type {@linkcode MouseOutCallback}.
   */
  onMouseOut?: MouseOutCallback;

  /**
   * Delay in milliseconds before triggering the callback after the mouse leaves or
   * focus is lost. If the cursor re-enters the element or focus is regained before
   * this duration, the timer is reset.
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
 * element and focus is not inside it, after a specified timer duration. If the user
 * re-enters the component or gains focus before the timer expires, the timer is
 * reset/cancelled.
 *
 * @param el - The bound DOM element.
 * @param accessor - Accessor returning a callback, tuple `[callback, delay]`, or
 *   type {@linkcode MouseOutOptions}.
 */
export const mouseOut = (
  el: HTMLElement | Element,
  accessor: () => MouseOutParam,
) => {
  /** Pending leave callback timer. */
  let timer: ReturnType<typeof setTimeout> | undefined;

  /** Tracks whether the pointer is currently inside the element. */
  let isHovered = false;

  /** Cancels the pending leave callback timer. */
  const clear = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  /** Tells whether the element or one of its descendants currently has focus. */
  const isFocused = () => {
    const active = el.ownerDocument?.activeElement ?? document.activeElement;
    return !!active && el.contains(active);
  };

  /**
   * Resolves the accessor parameters and invokes the leave callback, possibly after
   * the configured delay.
   *
   * @param event - Mouse or focus event that triggered the leave.
   */
  const triggerLeave = (event?: MouseEvent | FocusEvent) => {
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

  /** Marks the element as hovered and cancels any pending leave. */
  const onMouseEnter = () => {
    isHovered = true;
    clear();
  };

  /**
   * Schedules the leave callback when the pointer exits without focus inside.
   *
   * @param event - Mouse leave event.
   */
  const onMouseLeave = (event: MouseEvent) => {
    isHovered = false;
    if (isFocused()) return;
    triggerLeave(event);
  };

  /**
   * Schedules the leave callback when focus exits the element without hover.
   *
   * @param event - Focus out event.
   */
  const onFocusOut = (event: FocusEvent) => {
    const nextTarget = event.relatedTarget as Node | null;
    const stillHasFocus = !!nextTarget && el.contains(nextTarget);

    if (!stillHasFocus && !isHovered) {
      triggerLeave(event);
    }
  };

  el.addEventListener('mouseleave', onMouseLeave as EventListener);
  el.addEventListener('mouseenter', onMouseEnter);
  el.addEventListener('focusin', clear);
  el.addEventListener('focusout', onFocusOut as EventListener);

  onCleanup(() => {
    clear();
    el.removeEventListener('mouseleave', onMouseLeave as EventListener);
    el.removeEventListener('mouseenter', onMouseEnter);
    el.removeEventListener('focusin', clear);
    el.removeEventListener('focusout', onFocusOut as EventListener);
  });
};
