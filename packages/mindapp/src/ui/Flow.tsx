import { type JSX } from 'solid-js';

import type { NodeData } from '../services/main.machine.typings';
import { FlowChart } from './components/FlowChart';
import { Provider } from './components/FlowChart.context';
import type { FlowProps } from './components/FlowChart.types';

/**
 * Root Flow component wrapping the {@linkcode FlowChart} inside the flow context
 * provider.
 *
 * @template | Type {@linkcode NodeData} `D` - Custom node data dictionary type
 *   extending type {@linkcode NodeData}.
 *
 * @param props - Flow chart configuration and callbacks of type
 *   {@linkcode FlowProps}.
 *
 * @returns The rendered Solid component.
 *
 * @see {@linkcode Provider}
 */
export const Flow = <D extends NodeData = NodeData>(
  props: FlowProps<D>,
): JSX.Element => {
  return (
    <div
      style={{
        'background-image':
          'radial-gradient(circle, #b8b8b8bf 1px, rgba(0, 0, 0, 0) 1px)',
      }}

      class='relative flex h-full w-full rounded-lg border-2 border-gray-600 bg-white bg-size-[30px_30px]'
    >
      <Provider>
        <FlowChart {...props} />
      </Provider>
    </div>
  );
};
