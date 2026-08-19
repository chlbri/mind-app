import {
  onMount,
  type Component,
  type ComponentProps,
  type ValidComponent,
} from 'solid-js';

/**
 * Predicate determining whether an element or component should receive
 * focus.
 */
type FocusFn<T extends ValidComponent> = (
  props: ComponentProps<T>,
) => boolean;

/**
 * Internal wrapper focusing a component on mount when the focus condition
 * evaluates to true.
 */
function _focus<T extends Component<any>>(children: T, focus: FocusFn<T>) {
  const Out = (props => {
    let ref: any;

    onMount(() => {
      if (focus(props)) ref?.focus();
    });

    const Compt = children;

    return <Compt {...props} ref={(el: any) => (ref = el)} />;
  }) as T;

  return Out;
}

/** Higher-order curried helper for forwardFocus. */
function _forwardFocus<T2 extends ValidComponent>(focus: FocusFn<T2>) {
  return <T extends ComponentProps<T2>>(Compt: Component<T>) =>
    _focus(Compt, focus as any);
}

/**
 * Creates a higher-order component factory that auto-focuses the component
 * when the predicate resolves to true.
 *
 * @template | {@linkcode ValidComponent} `T2` - Target component type.
 *
 * @param focus - Predicate function of type {@linkcode FocusFn}.
 *
 * @returns Component decorator wrapping the target component.
 */
export function forwardFocus<T2 extends ValidComponent>(
  focus: FocusFn<T2>,
): <T extends ComponentProps<T2>>(Compt: Component<T>) => Component<T>;

/**
 * Wraps a component to auto-focus when mounted if the predicate resolves
 * to true.
 *
 * @template | {@linkcode Component} `T2` - Target component type.
 *
 * @param children - The component to wrap with focus capabilities.
 * @param focus - Predicate function of type {@linkcode FocusFn}.
 *
 * @returns Wrapped focusable component.
 */
export function forwardFocus<T2 extends Component<any>>(
  children: T2,
  focus: FocusFn<T2>,
): T2;

export function forwardFocus<T2 extends ValidComponent>(
  arg1: any,
  arg2?: FocusFn<T2>,
) {
  return arg2
    ? _focus(arg1 as any, arg2)
    : _forwardFocus(arg1 as FocusFn<T2>);
}
