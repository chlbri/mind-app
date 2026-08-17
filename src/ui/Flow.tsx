import type { Component } from "solid-js";
import { FlowChart } from "./components/FlowChart";
import { Provider } from "./components/FlowChart.context";

export const Flow: Component = () => (
  <div class="w-full h-full">
    <Provider>
      <FlowChart />
    </Provider>
  </div>
);
