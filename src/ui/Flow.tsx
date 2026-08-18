import type { Component } from 'solid-js';
import { FlowChart, type FlowProps } from './components/FlowChart';
import { Provider } from './components/FlowChart.context';

export const Flow: Component<FlowProps> = props => (
  <Provider>
    <FlowChart {...props} />
  </Provider>
);
