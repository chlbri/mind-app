import { Component, createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { EdgeComponent } from "./EdgeComponent";
import { useFlow } from "./FlowChart.context";

export const EdgesBoard: Component = () => {
  const [selected, setSelected] = createSignal<string>();

  const {
    newEdge: [newEdge],
    edgesPositions: [edgesPositions],
  } = useFlow();

  const datas = createMemo(() => {
    const entries = Object.entries(edgesPositions());
    return entries.map(([id, vector]) => ({ id, ...vector }));
  });

  createEffect(() => {
    if (selected() && newEdge()) setSelected();
  });

  return (
    <svg class="pointer-events-none absolute top-0 w-full h-full">
      <Show when={newEdge()}>
        {(value) => (
          <EdgeComponent
            id="__#new-edge#__TEMP"
            isNew
            x0={value().x0}
            y0={value().y0}
            x1={value().x1}
            y1={value().y1}
          />
        )}
      </Show>

      <For each={datas()} children={EdgeComponent} />
    </svg>
  );
};
