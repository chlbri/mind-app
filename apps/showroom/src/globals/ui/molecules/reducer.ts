import { type Component, type ComponentProps } from 'solid-js';

import type { RC } from '~/globals/ui/types';

/**
 * Creates a partially-applied component with default props bound.
 *
 * @template | {@linkcode Component} `T` - Base Solid component type.
 * @template | `Partial<ComponentProps<T>>` `K` - Partial props to pre-bind.
 * @template | `keyof ComponentProps<T>` `Keys` - Keys of the bound props.
 *
 * @param Compt - The source component to reduce.
 * @param props1 - Default props to pre-bind to the component.
 *
 * @returns A reduced component accepting the remaining unbound props.
 */
export const reduceComponent = <
  const T extends Component<any>,
  K extends Partial<ComponentProps<T>> = never,
  Keys extends keyof ComponentProps<T> = keyof K extends keyof ComponentProps<T>
    ? keyof K
    : never,
>(
  Compt: T,
  props1?: K,
) => {
  const out: RC<T, Keys> = props2 => {
    const props = { ...props1, ...props2 };
    return Compt(props);
  };

  return out;
};
