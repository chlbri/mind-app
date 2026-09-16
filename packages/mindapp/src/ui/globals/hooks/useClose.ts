import { createEffect, createSignal, onCleanup, type Accessor } from 'solid-js';

export type PanelHooks_P = {
  initial?: Accessor<boolean>;
  close?: () => void;
  timers?: { initial?: number; all?: number };
};

export const useClose = ({ initial, close: _close, timers }: PanelHooks_P) => {
  const [closing, setClosing] = createSignal(false);
  const [hasEntered, setHasEntered] = createSignal(false);

  let initialTimer: NodeJS.Timeout | undefined;
  let allTimer: NodeJS.Timeout | undefined;
  let openedAt = 0;

  const clearTimer = () => {
    clearTimeout(allTimer);
    clearTimeout(initialTimer);
  };

  const _initialTimer = timers?.initial ?? 10_000;
  const _allTimer = timers?.all ?? 250;

  const directClose = () => {
    _close?.();
    setClosing(false);
    setHasEntered(false);
  };

  const close = () => {
    clearTimer();
    setClosing(true);
    allTimer = setTimeout(() => {
      directClose();
    }, _allTimer);
  };

  const handleMouseEnter = () => {
    clearTimer();
    setHasEntered(true);
  };

  const handleClickOutside = () => {
    // Prevent immediate close on the same click event that opened the modal
    if (Date.now() - openedAt < _allTimer + _allTimer / 5) return;
    close();
  };

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
