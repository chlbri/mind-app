import type { Component } from 'solid-js';
import { FlowChart } from './components/FlowChart';
import { Provider } from './components/FlowChart.context';

export const Flow: Component = () => (
  <Provider>
    <FlowChart />
  </Provider>
);
