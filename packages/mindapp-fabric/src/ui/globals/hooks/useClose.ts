import { createEffect, createSignal, onCleanup, type Accessor } from 'solid-js';

/** Configuration options for the {@linkcode useClose} hook. */
export type PanelHooks_P = {
  /**
   * Optional reactive boolean accessor determining when the panel is initially
   * opened.
   */
  initial?: Accessor<boolean>;
  /** Callback invoked to close the panel. */
  close?: () => void;
  /** Optional timer configuration in milliseconds. */
  timers?: {
    /**
     * Delay before automatically closing on initial open before user interaction.
     * Defaults to `10_000`.
     */
    initial?: number;
    /** Delay before closing after mouse leave or trigger. Defaults to `250`. */
    all?: number;
  };
};

/**
 * Hook managing panel closing state with timeout delays, mouse hover detection, and
 * click-outside handling.
 *
 * @param options - Configuration options of type {@linkcode PanelHooks_P}.
 *
 * @returns An object containing closing states and event handler callbacks.
 */
export const useClose = ({ initial, close: _close, timers }: PanelHooks_P) => {
  /** Signal telling whether the closing animation is playing. */
  const [closing, setClosing] = createSignal(false);

  /** Signal telling whether the pointer already entered the panel. */
  const [hasEntered, setHasEntered] = createSignal(false);

  /** Pending initial auto-close timer. */
  let initialTimer: NodeJS.Timeout | undefined;

  /** Pending closing animation timer. */
  let allTimer: NodeJS.Timeout | undefined;

  /** Timestamp of the last opening, used to ignore the opening click. */
  let openedAt = 0;

  /** Cancels both pending timers. */
  const clearTimer = () => {
    clearTimeout(allTimer);
    clearTimeout(initialTimer);
  };

  /** Initial auto-close delay in milliseconds. */
  const _initialTimer = timers?.initial ?? 10_000;

  /** Closing animation delay in milliseconds. */
  const _allTimer = timers?.all ?? 250;

  /** Closes the panel immediately, resetting every animation state. */
  const directClose = () => {
    _close?.();
    setClosing(false);
    setHasEntered(false);
  };

  /** Starts the closing animation and triggers `directClose` after the delay. */
  const close = () => {
    clearTimer();
    setClosing(true);
    allTimer = setTimeout(() => {
      directClose();
    }, _allTimer);
  };

  /** Pauses the timers while the pointer is inside the panel. */
  const handleMouseEnter = () => {
    clearTimer();
    setHasEntered(true);
  };

  /** Closes the panel when a click lands outside of it. */
  const handleClickOutside = () => {
    // Prevent immediate close on the same click event that opened the modal
    if (Date.now() - openedAt < _allTimer + _allTimer / 5) return;
    close();
  };

  /** (Re)starts the initial auto-close timer when the panel opens. */
  const mount = () => {
    clearTimer();
    const check = !initial || initial();
    if (check) {
      openedAt = Date.now();
      setHasEntered(false);
      // 10-second timer on first opening before user reaches panel
      initialTimer = setTimeout(() => close(), _initialTimer);
    }
  };

  createEffect(mount);
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
