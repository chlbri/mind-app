import {
  onMount,
  type Component,
  type ComponentProps,
  type ValidComponent,
} from 'solid-js';

type FocusFn<T extends ValidComponent> = (
  props: ComponentProps<T>,
) => boolean;

function _focus<T extends Component<any>>(children: T, focus: FocusFn<T>) {
  const Out = (props => {
    let ref: any;

    onMount(() => {
      if (focus(props)) ref?.focus();
    });

    const Compt = children;

    return <Compt {...props} ref={ref} />;
  }) as T;

  return Out;
}

function _forwardFocus<T2 extends ValidComponent>(focus: FocusFn<T2>) {
  return <T extends ComponentProps<T2>>(Compt: Component<T>) =>
    _focus(Compt, focus as any);
}

export function forwardFocus<T2 extends ValidComponent>(
  focus: FocusFn<T2>,
): <T extends ComponentProps<T2>>(Compt: Component<T>) => Component<T>;

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
