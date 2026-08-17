import { useState } from "@bemedev/app-solidjs";
import { DragDropProvider, DragDropSensors, DragOverlay } from "@thisbeyond/solid-dnd";
import { dequal } from "dequal";
import { Component, createSignal, For, onMount, Show } from "solid-js";
import { useFlow } from "./FlowChart.context";
import { NodeComponent } from "./NodeComponent";

export const NodesBoard: Component = () => {
  const [ref, setRef] = createSignal<HTMLDivElement>();

  const {
    board: [, setPoint],
    service,
  } = useFlow();

  const selectedId = useState(service, {
    selector: (s) => s.context?.selected,
  });
  const selected = (id: string | number) => selectedId() === id;

  const nodes = useState(service, {
    selector: (s) => {
      const list = s.context?.data?.nodes ?? [];
      return list.map((item) => ({
        id: item.id,
        x: item.position?.x ?? 0,
        y: item.position?.y ?? 0,
        label: item.data?.label,
        content: item.data?.content ?? "",
        input: item.input ?? false,
      }));
    },
    equals: dequal,
  });

  onMount(() => {
    const element = ref();
    if (!element) return;

    const rect = element.getBoundingClientRect();

    setPoint({
      x: rect.x,
      y: rect.y,
    });
  });

  const [transform, setTransform] = createSignal({ x: 0, y: 0 });
  const [id, setId] = createSignal<string | number>("");

  return (
    <DragDropProvider
      onDragMove={({ draggable: { transform: _transform, node, id } }) => {
        setId(id);
        if (selected(id)) {
          setTransform({ ..._transform });
          const X = node.offsetLeft + transform().x + 6;
          const Y = node.offsetTop + transform().y + 6;
          service.send({
            type: "MOVE_IMMEDIATE",
            payload: {
              id: `${id}`,
              x: X,
              y: Y,
            },
          });
        }
      }}
      onDragEnd={({ draggable: { node, id } }) => {
        if (!selected(id)) return;

        const X = node.offsetLeft + transform().x + 6;
        const Y = node.offsetTop + transform().y + 6;
        node.style.setProperty("top", Y + "px");
        node.style.setProperty("left", X + "px");

        service.send({
          type: "MOVE",
          payload: {
            id: `${id}`,
            x: X - 6,
            y: Y - 6,
          },
        });
      }}
    >
      <DragDropSensors />
      <div ref={setRef} class="w-full h-full relative" onMouseDown={() => service.send("DESELECT")}>
        <For each={nodes()} children={NodeComponent} />
      </div>

      <Show when={!id() || !selected(id())}>
        <DragOverlay children="" />
      </Show>
    </DragDropProvider>
  );
};
