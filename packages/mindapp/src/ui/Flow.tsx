import type { Component } from 'solid-js';
import { FlowChart, type FlowProps } from './components/FlowChart';
import { Provider } from './components/FlowChart.context';

/**
 * Root Flow component wrapping the {@linkcode FlowChart} inside the flow
 * context provider.
 *
 * @param props - Flow chart configuration and callbacks of type
 *   {@linkcode FlowProps}.
 *
 * @returns The rendered Solid component.
 */
export const Flow: Component<FlowProps> = props => (
  <Provider>
    <FlowChart {...props} />
  </Provider>
);
