import { createEffect, createSignal, onCleanup, type Accessor } from 'solid-js';

export type PanelHooks_P = {
  initial?: Accessor<boolean>;
  close?: () => void;
  timers?: { initial?: number; all?: number };
};

export const useClose = ({ initial, close: _close, timers }: PanelHooks_P) => {
  const [closing, setClosing] = createSignal(false);
  const [hasEntered, setHasEntered] = createSignal(false);

  let initialTimer: ReturnType<typeof setTimeout> | undefined;
  let openedAt = 0;

  const clearTimer = () => {
    if (initialTimer) {
      clearTimeout(initialTimer);
      initialTimer = undefined;
    }
  };

  const intialTimer = timers?.initial ?? 10_000;
  const allTimer = timers?.all ?? 250;

  const directClose = () => {
    clearTimer();
    _close?.();
    setClosing(false);
    setHasEntered(false);
  };

  const close = () => {
    clearTimer();
    setClosing(true);
    setTimeout(() => {
      directClose();
    }, allTimer);
  };

  const handleMouseEnter = () => {
    clearTimer();
    setHasEntered(true);
  };

  const handleClickOutside = () => {
    // Prevent immediate close on the same click event that opened the modal
    if (Date.now() - openedAt < allTimer + allTimer / 5) return;
    close();
  };

  createEffect(() => {
    clearTimer();
    if (!initial || initial()) {
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
