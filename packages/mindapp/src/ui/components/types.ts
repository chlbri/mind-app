import type { JSX } from 'solid-js';

/**
 * Higher-order component type signature accepting props extending type {@linkcode T}
 * and returning a Solid type {@linkcode JSX.Element}.
 *
 * @template | {@linkcode object} `T` - Base component properties constraint type.
 *
 * @param props - Component properties extending type {@linkcode T}.
 *
 * @returns The rendered Solid type {@linkcode JSX.Element}.
 */
export type HighComponent<T extends object> = <D extends T>(props: D) => JSX.Element;
