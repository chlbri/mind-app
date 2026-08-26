import { createSignal, onMount, Show, type JSX } from 'solid-js';
import {} from 'solid-js/web';

import type { NodeData } from '../services/main.machine.typings';
import { FlowChart } from './components/FlowChart';
import { Provider } from './components/FlowChart.context';
import type { FlowProps } from './components/FlowChart.types';
import { LoadingFallback } from './globals/components/organisms/LoadingFallback';

/**
 * Root Flow component wrapping the {@linkcode FlowChart} inside the flow context
 * provider.
 *
 * @template | {@linkcode NodeData} `D` - Custom node data dictionary type extending
 *   {@linkcode NodeData}.
 *
 * @param props - Flow chart configuration and callbacks of type
 *   {@linkcode FlowProps}.
 *
 * @returns The rendered Solid component.
 *
 * @see {@linkcode Provider}, {@linkcode FlowChart}
 */
export const Flow = <D extends NodeData = NodeData>(
  props: FlowProps<D>,
): JSX.Element => {
  const [isMounted, setIsMounted] = createSignal(false);

  // onMount never runs on the server, only in the browser
  onMount(() => setTimeout(() => setIsMounted(true), props.delay));
  return (
    <div
      style={{
        'background-image':
          'radial-gradient(circle, #b8b8b8bf 1px, rgba(0, 0, 0, 0) 1px)',
      }}

      class='relative flex h-full w-full rounded-lg border-2 border-gray-600 bg-white bg-size-[30px_30px]'
    >
      <Show
        when={isMounted()}
        keyed
        fallback={
          <div class='relative flex flex-1 items-center justify-center'>
            <LoadingFallback
              message='Chart is loading...'
              interval={35}
              rewind
              rewindDelay={1_000}
            />
          </div>
        }
      >
        <Provider>
          <FlowChart {...props} />
        </Provider>
      </Show>
    </div>
  );
};
