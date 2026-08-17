import type { Component } from "solid-js";
import { FlowChart } from "./components/FlowChart";
import { Provider } from "./components/FlowChart.context";

export const Flow: Component = () => (
  <div class="w-[calc(100vw-32px)] h-[calc(100vh-64px)] border-2 border-gray-600 overflow-scroll rounded-lg">
    <Provider>
      <FlowChart />
    </Provider>
  </div>
);
