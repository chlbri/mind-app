import { useState } from "@bemedev/app-solidjs";
import { DragDropProvider, DragDropSensors, DragOverlay } from "@thisbeyond/solid-dnd";
import { dequal } from "dequal";
import { Component, createSignal, For, onCleanup, Show } from "solid-js";
import { DragBounds } from "./Bounds";
import { EdgesBoard } from "./EdgesBoard";
import { useFlow } from "./FlowChart.context";
import { NodeComponent } from "./NodeComponent";

export const NodesBoard: Component = () => {
  let containerRef: HTMLDivElement | undefined;
  const [isPanning, setIsPanning] = createSignal(false);

  const {
    board: [, setRef],
    service,
    newEdge: [newEdge],
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
  let cleanupPanning = () => {};
  onCleanup(cleanupPanning);

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
      <div class="relative w-[calc(100vw-32px)] h-[calc(100vh-64px)] mx-auto">
        <div
          ref={(el) => (containerRef = el)}
          class="w-full h-full border-2 border-gray-600 overflow-scroll rounded-lg relative"
        >
          <DragDropSensors />
          <DragBounds />
          <div
            ref={setRef}
            class="w-[350vw] h-[350vh] relative cursor-crosshair"
            classList={{ "cursor-grabbing": isPanning() }}

            onMouseDown={(e) => {
              if (newEdge() || e.button !== 0) return;
              if (!containerRef) return;

              service.send("DESELECT");

              // #region Props
              const startX = e.clientX;
              const startY = e.clientY;
              const startScrollLeft = containerRef.scrollLeft;
              const startScrollTop = containerRef.scrollTop;
              // #endregion

              setIsPanning(true);

              const handleMouseMove = (moveEvent: MouseEvent) => {
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
                containerRef!.scrollLeft = startScrollLeft - dx * 3;
                containerRef!.scrollTop = startScrollTop - dy * 3;
              };

              const handleMouseUp = () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
                setTimeout(() => setIsPanning(false), 200);
                (cleanupPanning as any) = undefined;
              };

              // #region Attach Windows listeners
              cleanupPanning = handleMouseUp;
              window.addEventListener("mousemove", handleMouseMove);
              window.addEventListener("mouseup", handleMouseUp);
              // #endregion
            }}
          >
            <EdgesBoard />
            <For each={nodes()} children={NodeComponent} />
          </div>
        </div>

        {/* Panel */}
        <div class="absolute bottom-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-gray-200">
          <button
            type="button"
            class="flex items-center justify-center size-9 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg shadow transition-all duration-150 cursor-pointer"
            onClick={() => service.send("ADD_PARENT")}
            title="Add parent node"
            aria-label="Add parent node"
          >
            <svg class="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </button>
        </div>
      </div>

      <Show when={!id() || !selected(id())}>
        <DragOverlay children="" />
      </Show>
    </DragDropProvider>
  );
};
