import { splitProps } from 'solid-js';

import { cn } from '../cn/utils';
import type { OmitPropsOf } from '../types';

/** Props for the {@linkcode MultiText} component. */
type Props<T extends string[]> = {
  /** Array of text segment strings to render in sequence. */
  texts: T;
  /** Optional per-segment HTML span properties. */
  props?: {
    [K in Extract<keyof T, `${number}`>]?: OmitPropsOf<'span', 'children'>;
  };
} & OmitPropsOf<'span', 'children'>;

/**
 * Renders multiple inline text spans sequentially with customized attributes per
 * segment.
 *
 * @template | `string[]` `T` - String tuple type for the text segments.
 *
 * @param props - Component properties of type {@linkcode Props}.
 *
 * @returns Rendered inline span sequence JSX element.
 */
export function MultiText<const T extends string[]>({
  texts,
  props: _props,
  ...rest
}: Props<T>) {
  const [local, all] = splitProps(rest, ['class']);

  return (
    <span {...all} class={cn('inline!', local.class)}>
      {texts.map((text, index) => {
        const props = { ...(_props as any)?.[index] };
        return <span {...props}>{text}</span>;
      })}
    </span>
  );
}
