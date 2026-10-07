import { createContext as createSolidContext, useContext, type JSX } from 'solid-js';

import type { Data } from '../services/main.machine.typings';
import { Scene } from './components/Scene';
import type { FlowProps } from './components/Scene.types';
import { createFlowService, type FlowContext } from './Flow.context';
export { cn } from 'cn';

/**
 * Creates a Solid context bound to the 3D flowchart engine: the `useFlow` hook
 * reading it and the `Flow` component providing it.
 *
 * Each call produces an isolated context, so several flows can coexist with their
 * own service. Descendant components receive the same value as a `flow` prop, while
 * custom children read it with the returned hook.
 *
 * @returns A tuple containing the accessor hook of type `() => FlowContext` and the
 *   root Flow component.
 *
 * @see {@linkcode createFlowService}, {@linkcode Scene}
 */
export const createContext = () => {
  const _context = createSolidContext<FlowContext | undefined>(undefined, {
    name: 'FlowContext',
  });

  const Provider = _context.Provider;

  /**
   * Reads the closest flow context value.
   *
   * @returns The flow value of type {@linkcode FlowContext}.
   *
   * @throws When used outside of a `Flow` component.
   */
  const useFlow = (): FlowContext => {
    const value = useContext(_context);
    if (!value) {
      throw new Error('useFlow must be used within a Flow component');
    }
    return value;
  };

  /**
   * Root Flow component creating the flow service, providing the context, and
   * rendering the 3D {@linkcode Scene} with the `flow` prop.
   *
   * @template | {@linkcode Data} `N` - Custom node data dictionary type extending
   *   type {@linkcode Data}.
   * @template | {@linkcode Data} `E` - Custom edge data dictionary type extending
   *   type {@linkcode Data}.
   *
   * @param props - 3D scene configuration and callbacks of type
   *   {@linkcode FlowProps}.
   *
   * @returns The rendered Solid component.
   */
  const Flow = <N extends Data = Data, E extends Data = Data>(
    props: FlowProps<N, E>,
  ): JSX.Element => {
    const flow = createFlowService();

    return (
      <div class='relative h-full w-full overflow-hidden rounded-lg border-2 border-gray-600 bg-slate-950'>
        <Provider value={flow}>
          <Scene<N, E> {...props} flow={flow} />
          {props.children}
        </Provider>
      </div>
    );
  };

  return [useFlow, Flow] as const;
};
