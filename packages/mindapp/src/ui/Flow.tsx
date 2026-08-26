import type { JSX } from 'solid-js';

import type { NodeData } from '../services/main.machine.typings';
import { FlowChart, type FlowProps } from './components/FlowChart';
import { Provider } from './components/FlowChart.context';

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
): JSX.Element => (
  <Provider>
    <FlowChart {...props} />
  </Provider>
);
