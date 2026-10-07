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

  it('#06 => should not trigger callback on mouseleave if an input inside element has focus', () => {
    const callback = vi.fn();
    const input = document.createElement('input');
    el.appendChild(input);
    input.focus();

    createRoot(dispose => {
      mouseOut(el, () => callback);

      el.dispatchEvent(new MouseEvent('mouseleave'));
      expect(callback).not.toHaveBeenCalled();

      dispose();
    });
  });

  it('#07 => should trigger callback when focused child loses focus and mouse is outside', () => {
    const callback = vi.fn();
    const input = document.createElement('input');
    el.appendChild(input);
    input.focus();

    createRoot(dispose => {
      mouseOut(el, () => [callback, 200]);

      // Mouse leaves while input is focused
      el.dispatchEvent(new MouseEvent('mouseleave'));
      expect(callback).not.toHaveBeenCalled();

      // Input loses focus (blurred)
      input.dispatchEvent(
        new FocusEvent('focusout', { bubbles: true, relatedTarget: null }),
      );

      vi.advanceTimersByTime(100);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);

      dispose();
    });
  });

  it('#08 => should not trigger callback when child loses focus but mouse is still inside', () => {
    const callback = vi.fn();
    const input = document.createElement('input');
    el.appendChild(input);
    input.focus();

    createRoot(dispose => {
      mouseOut(el, () => callback);

      // Mouse enters element
      el.dispatchEvent(new MouseEvent('mouseenter'));

      // Child loses focus while mouse is still inside
      input.dispatchEvent(
        new FocusEvent('focusout', { bubbles: true, relatedTarget: null }),
      );
      expect(callback).not.toHaveBeenCalled();

      dispose();
    });
  });

  it('#09 => should not trigger callback when focus moves from one child to another within the element', () => {
    const callback = vi.fn();
    const input1 = document.createElement('input');
    const input2 = document.createElement('input');
    el.appendChild(input1);
    el.appendChild(input2);
    input1.focus();

    createRoot(dispose => {
      mouseOut(el, () => callback);

      // Mouse leaves while input1 is focused
      el.dispatchEvent(new MouseEvent('mouseleave'));

      // Focus switches to input2 within the same element
      input1.dispatchEvent(
        new FocusEvent('focusout', { bubbles: true, relatedTarget: input2 }),
      );
      expect(callback).not.toHaveBeenCalled();

      dispose();
    });
  });

  it('#10 => should cancel pending mouseleave timer if an element inside gains focus before delay finishes', () => {
    const callback = vi.fn();
    const input = document.createElement('input');
    el.appendChild(input);

    createRoot(dispose => {
      mouseOut(el, () => [callback, 400]);

      el.dispatchEvent(new MouseEvent('mouseleave'));
      vi.advanceTimersByTime(200);
      expect(callback).not.toHaveBeenCalled();

      // Focus gained inside element
      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      vi.advanceTimersByTime(300);
      expect(callback).not.toHaveBeenCalled();

      dispose();
    });
  });

  it('#11 => should not trigger callback on mouseleave if the element itself has focus', () => {
    const callback = vi.fn();
    el.tabIndex = 0;
    el.focus();

    createRoot(dispose => {
      mouseOut(el, () => callback);

      el.dispatchEvent(new MouseEvent('mouseleave'));
      expect(callback).not.toHaveBeenCalled();

      dispose();
    });
  });
});
