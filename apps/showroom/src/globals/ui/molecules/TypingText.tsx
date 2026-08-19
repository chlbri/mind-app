import {
  createEffect,
  createMemo,
  on,
  type Accessor,
  type Component,
} from 'solid-js';

import { VISIBLE_ESPACE } from '../constants';
import { createTyping } from '../signals/createTyping';

/** Base configuration properties for {@linkcode TypingText}. */
type BaseProps = {
  /** The text string to animate typing out. */
  children: string;
  /** Optional container CSS class name. */
  class?: string;
  /** Keystroke interval delay in milliseconds. Defaults to 62. */
  interval?: number;
  /** Optional boolean accessor to disable typing and display text immediately. */
  disabled?: Accessor<boolean>;
};

/** Props for the {@linkcode TypingText} component with optional rewind configuration. */
type Props = BaseProps &
  ({ rewind: true; rewindDelay: number } | { rewind?: false });

/**
 * Renders animated text with a typewriter keystroke animation effect.
 *
 * @param props - Component configuration properties of type {@linkcode Props}.
 *
 * @returns Rendered animated typing text JSX container.
 */
export const TypingText: Component<Props> = props => {
  // #region Default values
  const min = props.interval ?? 62;
  const rewind = props.rewind ?? false;
  const rewindDelay = (props as any).rewindDelay ?? 500;
  const content = props.children;
  const disabled = createMemo(
    () => (props.disabled ? props.disabled() : false),
    false,
  );
  // #endregion

  const { text, type, setText } = createTyping({
    content,
    min,
    rewind,
    rewindDelay,
  });

  createEffect(on(disabled, () => setText(VISIBLE_ESPACE)));

  createEffect(() => {
    // If disabled, show full text immediately
    if (disabled()) setText(content);
    else type();
  });

  return <div class={props.class}>{text()}</div>;
};
