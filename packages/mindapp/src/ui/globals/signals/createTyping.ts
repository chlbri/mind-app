import { createSignal, onCleanup } from 'solid-js';

import { VISIBLE_ESPACE } from '../constants';
import { espace } from '../helpers/espace';

/** Typing animation options. */
type Props = {
  /** The text content to type out. */
  content: string;
  /** Minimum delay interval between keystrokes in milliseconds. */
  min: number;
  /** Whether the typing effect rewinds after completion. */
  rewind?: boolean;
  /** Delay in milliseconds before rewinding or restarting. */
  rewindDelay?: number;
};

/**
 * Creates a reactive typewriter effect signal with oscillatory typing delay and
 * optional rewind.
 *
 * @param props - Configuration properties of type {@linkcode Props}.
 *
 * @returns An object containing the current text signal, type trigger, and text
 *   setter.
 */
export const createTyping = ({ content, min, ...props }: Props) => {
  /** Whether the typing animation rewinds once completed. */
  const rewind = props.rewind ?? false;

  /** Delay in milliseconds before rewinding or restarting. */
  const rewindDelay = (props as any).rewindDelay ?? 500;

  /** Maximum delay oscillation applied to the keystroke interval. */
  const OSCILLATION = Math.min(min / 10 + content.length / 10, 10);

  /** Reactive text currently displayed. */
  const [text, setText] = createSignal(VISIBLE_ESPACE);

  /** Pending keystroke timer. */
  let timeoutId: number | NodeJS.Timeout;

  /** Current character index in the content. */
  let index = 0;

  /** Tells whether the animation is currently typing forward. */
  let isTyping = true;

  /** Upper bound of the oscillating interval. */
  const max = min + OSCILLATION;

  /** Current oscillating interval between keystrokes. */
  let interval = min;

  /** Direction of the interval oscillation: `1` increments, `-1` decrements. */
  let intervalDirection = 1; // 1 for incrementing, -1 for decrementing

  /** Advances the typing animation by one step, scheduling the next tick. */
  const type = () => {
    if (isTyping) {
      if (index < content.length) {
        setText(prev => prev + content[index]);
        index++;
        timeoutId = setTimeout(type, interval);
      } else if (rewind) {
        isTyping = false;
        // interval = min;
        intervalDirection = 1;
        timeoutId = setTimeout(type, rewindDelay);
      }
    } else {
      // Rewind mode
      if (index > 0) {
        index--;
        setText(espace(content.substring(0, index)));
        timeoutId = setTimeout(type, interval);
      } else {
        isTyping = true;
        // interval = min;
        intervalDirection = 1;
        timeoutId = setTimeout(type, rewindDelay);
      }
    }

    // Update interval with oscillation
    interval += intervalDirection;

    if (interval >= max) {
      intervalDirection = -1;
    } else if (interval <= min) {
      intervalDirection = 1;
    }
  };

  onCleanup(() => {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  });

  return { text, type, setText };
};
