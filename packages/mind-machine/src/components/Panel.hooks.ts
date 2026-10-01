import { createEffect, createSignal, onCleanup, type Accessor } from 'solid-js';

/** Properties configuring the auto-close behavior of a panel or modal. */
export type PanelHooks_P = {
  /** Reactive accessor telling whether the panel should be open. */
  initial: Accessor<boolean>;
  /** Callback invoked once the panel is fully closed. */
  close?: () => void;
  /** Timing configuration in milliseconds for the initial and closing delays. */
  timers?: { initial?: number; all?: number };
};

/**
 * Manages the opening, hover-pause, outside-click and delayed closing lifecycle of a
 * panel or modal.
 *
 * A first timer automatically closes the panel after `timers.initial` unless the
 * user hovers it, and a second timer delays the actual close by `timers.all` to let
 * the closing animation play.
 *
 * @param props - Auto-close configuration of type {@linkcode PanelHooks_P}.
 *
 * @returns An object exposing the `closing` and `hasEntered` accessors along with
 *   the `handleClickOutside`, `handleMouseEnter`, `close` and `directClose`
 *   handlers.
 */
export const useClose = ({ initial, close: _close, timers }: PanelHooks_P) => {
  const [closing, setClosing] = createSignal(false);
  const [hasEntered, setHasEntered] = createSignal(false);

  let initialTimer: ReturnType<typeof setTimeout> | undefined;
  let openedAt = 0;

  /** Cancels the pending initial auto-close timer. */
  const clearTimer = () => {
    if (initialTimer) {
      clearTimeout(initialTimer);
      initialTimer = undefined;
    }
  };

  const intialTimer = timers?.initial ?? 10_000;
  const allTimer = timers?.all ?? 250;

  /** Closes the panel immediately, resetting every animation state. */
  const directClose = () => {
    clearTimer();
    _close?.();
    setClosing(false);
    setHasEntered(false);
  };

  /** Starts the closing animation and triggers `directClose` after the delay. */
  const close = () => {
    clearTimer();
    setClosing(true);
    setTimeout(() => {
      directClose();
    }, allTimer);
  };

  /** Pauses the initial auto-close timer while the pointer is inside the panel. */
  const handleMouseEnter = () => {
    clearTimer();
    setHasEntered(true);
  };

  /** Closes the panel when a click lands outside of it. */
  const handleClickOutside = () => {
    // Prevent immediate close on the same click event that opened the modal
    if (Date.now() - openedAt < allTimer + allTimer / 5) return;
    close();
  };

  createEffect(() => {
    clearTimer();
    if (initial()) {
      openedAt = Date.now();
      setHasEntered(false);
      // 10-second timer on first opening before user reaches panel
      initialTimer = setTimeout(() => {
        close();
      }, intialTimer);
    }
  });

  onCleanup(clearTimer);

  return {
    closing,
    hasEntered,
    handleClickOutside,
    handleMouseEnter,
    close,
    directClose,
  };
};
