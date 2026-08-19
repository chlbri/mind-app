import type { Component, ComponentProps, JSX, ValidComponent } from 'solid-js';

/**
 * Extracts a subset of component props from a valid component.
 *
 * @template | {@linkcode ValidComponent} `T` - Target component type.
 * @template | `keyof ComponentProps<T>` `K` - Prop keys to pick.
 */
export type PropsOf<
  T extends ValidComponent,
  K extends keyof ComponentProps<T> = never,
> = Pick<ComponentProps<T>, K>;

/**
 * Omits a subset of component props from a valid component.
 *
 * @template | {@linkcode ValidComponent} `T` - Target component type.
 * @template | `keyof ComponentProps<T>` `K` - Prop keys to omit.
 */
export type OmitPropsOf<
  T extends ValidComponent,
  K extends keyof ComponentProps<T> = never,
> = Omit<ComponentProps<T>, K>;

/**
 * Creates a component type where specified props are optional.
 *
 * @template | {@linkcode ValidComponent} `T` - Target component type.
 * @template | `keyof ComponentProps<T>` `K` - Prop keys to make optional.
 */
export type ReduceComponent<
  T extends ValidComponent,
  K extends keyof ComponentProps<T> = never,
> = Component<OmitPropsOf<T, K> & Partial<PropsOf<T, K>>>;

/**
 * Short alias for type {@linkcode ReduceComponent}.
 *
 * @template | {@linkcode ValidComponent} `T` - Target component type.
 * @template | `keyof ComponentProps<T>` `K` - Prop keys to make optional.
 */
export type RC<
  T extends ValidComponent,
  K extends keyof ComponentProps<T> = never,
> = ReduceComponent<T, K>;

/**
 * Creates a component type requiring only a picked subset of props.
 *
 * @template | {@linkcode ValidComponent} `T` - Target component type.
 * @template | `keyof ComponentProps<T>` `K` - Picked prop keys.
 */
export type PickComponent<
  T extends ValidComponent,
  K extends keyof ComponentProps<T> = never,
> = Component<PropsOf<T, K>>;

/**
 * Short alias for type {@linkcode PickComponent}.
 *
 * @template | {@linkcode ValidComponent} `T` - Target component type.
 * @template | `keyof ComponentProps<T>` `K` - Picked prop keys.
 */
export type PiC<
  T extends ValidComponent,
  K extends keyof ComponentProps<T> = never,
> = PickComponent<T, K>;

/** Type representing an HTML `<link>` tag properties. */
export type RootLink = JSX.HTMLElementTags['link'];

/**
 * Type representing an HTML element ref or ref callback.
 *
 * @template | {@linkcode HTMLElement} `T` - Target HTML element type.
 */
export type Ref<T extends HTMLElement> =
  | T
  | ((el: T | undefined) => void)
  | undefined;
