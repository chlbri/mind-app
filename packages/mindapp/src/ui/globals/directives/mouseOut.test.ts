import { createRoot } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mouseOut } from './mouseOut';

describe('Directive => mouseOut', () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    el = document.createElement('div');
    document.body.appendChild(el);
  });

  afterEach(() => {
    vi.useRealTimers();
    el.remove();
  });

  it('#01 => should trigger callback immediately when no delay is provided', () => {
    const callback = vi.fn();

    createRoot(dispose => {
      mouseOut(el, () => callback);

      el.dispatchEvent(new MouseEvent('mouseleave'));
      expect(callback).toHaveBeenCalledTimes(1);

      dispose();
    });
  });

  it('#02 => should wait for the specified delay before executing the callback', () => {
    const callback = vi.fn();

    createRoot(dispose => {
      mouseOut(el, () => [callback, 300]);

      el.dispatchEvent(new MouseEvent('mouseleave'));
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(200);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);

      dispose();
    });
  });

  it('#03 => should reset/cancel the timer when user re-enters before delay finishes', () => {
    const callback = vi.fn();

    createRoot(dispose => {
      mouseOut(el, () => ({ callback, delay: 500 }));

      el.dispatchEvent(new MouseEvent('mouseleave'));
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);
      expect(callback).not.toHaveBeenCalled();

      // User re-enters
      el.dispatchEvent(new MouseEvent('mouseenter'));

      // Time passes past the original 500ms
      vi.advanceTimersByTime(500);
      expect(callback).not.toHaveBeenCalled();

      dispose();
    });
  });

  it('#04 => should re-arm timer when mouse leaves again after re-entering', () => {
    const callback = vi.fn();

    createRoot(dispose => {
      mouseOut(el, () => ({ onMouseOut: callback, delay: 400 }));

      el.dispatchEvent(new MouseEvent('mouseleave'));
      vi.advanceTimersByTime(200);
      el.dispatchEvent(new MouseEvent('mouseenter'));
      vi.advanceTimersByTime(300);
      expect(callback).not.toHaveBeenCalled();

      // Leave again
      el.dispatchEvent(new MouseEvent('mouseleave'));
      vi.advanceTimersByTime(400);
      expect(callback).toHaveBeenCalledTimes(1);

      dispose();
    });
  });

  it('#05 => should cancel pending timer and remove event listeners on cleanup', () => {
    const callback = vi.fn();

    let disposeRoot!: () => void;
    createRoot(dispose => {
      disposeRoot = dispose;
      mouseOut(el, () => [callback, 300]);
    });

    el.dispatchEvent(new MouseEvent('mouseleave'));
    disposeRoot();

    vi.advanceTimersByTime(400);
    expect(callback).not.toHaveBeenCalled();

    // Ensure listeners are removed
    el.dispatchEvent(new MouseEvent('mouseleave'));
    expect(callback).not.toHaveBeenCalled();
  });
});
