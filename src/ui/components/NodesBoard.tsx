import { useState } from "@bemedev/app-solidjs";
import { DragDropProvider, DragDropSensors, DragOverlay } from "@thisbeyond/solid-dnd";
import { dequal } from "dequal";
import { Component, createSignal, For, Show } from "solid-js";
import { DragBounds } from "./Bounds";
import { EdgesBoard } from "./EdgesBoard";
import { useFlow } from "./FlowChart.context";
import { NodeComponent } from "./NodeComponent";

export const NodesBoard: Component = () => {
  // const [ref, setRef] = createSignal<HTMLDivElement>();

  const {
    board: [, setRef],
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

  const [transform, setTransform] = createSignal({ x: 0, y: 0 });
  const [id, setId] = createSignal<string | number>("");

  return (
    <DragDropProvider
      onDragMove={({ draggable: { transform: _transform, node, id } }) => {
        setId(id);
        if (selected(id)) {
          setTransform({ ..._transform });
          const X = node.offsetLeft + transform().x;
          const Y = node.offsetTop + transform().y;
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

        const X = node.offsetLeft + transform().x;
        const Y = node.offsetTop + transform().y;
        node.style.setProperty("top", Y + "px");
        node.style.setProperty("left", X + "px");

        service.send({
          type: "MOVE",
          payload: {
            id: `${id}`,
            x: X,
            y: Y,
          },
        });
        setTransform({ x: 0, y: 0 });
      }}
    >
      <div class="w-[calc(100vw-32px)] h-[calc(100vh-64px)] border-2 border-gray-600 overflow-scroll rounded-lg mx-auto relative no-scrollbar">
        <DragDropSensors />
        <DragBounds />
        <div
          ref={setRef}
          class="w-[350vw] h-[350vh] relative"
          onMouseDown={() => service.send("DESELECT")}
        >
          <EdgesBoard />
          <For each={nodes()} children={NodeComponent} />
        </div>
      </div>

      <Show when={!id() || !selected(id())}>
        <DragOverlay children="" />
      </Show>
    </DragDropProvider>
  );
};
