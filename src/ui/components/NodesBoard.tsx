import { useState } from "@bemedev/app-solidjs";
import { DragDropProvider, DragDropSensors, DragOverlay } from "@thisbeyond/solid-dnd";
import { dequal } from "dequal";
import { Component, createEffect, createSignal, For, on, onCleanup, Show } from "solid-js";
import { DragBounds } from "./Bounds";
import { EdgesBoard } from "./EdgesBoard";
import { useFlow } from "./FlowChart.context";
import { NodeComponent } from "./NodeComponent";
import { CANVAS_FACTOR } from "./FlowChart.data";

export const NodesBoard: Component = () => {
  let containerRef: HTMLDivElement | undefined;
  const [isPanning, setIsPanning] = createSignal(false);
  const [transform, setTransform] = createSignal({ x: 0, y: 0 });
  const [id, setId] = createSignal<string | number>("");
  const [previousZoom, setPreviousZoom] = createSignal<number>();
  let cleanupPanning = () => {};
  onCleanup(cleanupPanning);
  let percentX = 0;
  let percentY = 0;

  const {
    board: [, setRef],
    service,
    newEdge: [newEdge],
    zoom: [zoom, setZoom],
  } = useFlow();

  const updateScrollPercentages = () => {
    if (!containerRef) return;
    const maxScrollX = containerRef.scrollWidth - containerRef.clientWidth;
    const maxScrollY = containerRef.scrollHeight - containerRef.clientHeight;
    percentX = maxScrollX > 0 ? containerRef.scrollLeft / maxScrollX : 0;
    percentY = maxScrollY > 0 ? containerRef.scrollTop / maxScrollY : 0;
  };

  createEffect(
    on(
      zoom,
      () => {
        if (!containerRef) return;
        const maxScrollX = containerRef.scrollWidth - containerRef.clientWidth;
        const maxScrollY = containerRef.scrollHeight - containerRef.clientHeight;
        if (maxScrollX > 0) containerRef.scrollLeft = percentX * maxScrollX;
        if (maxScrollY > 0) containerRef.scrollTop = percentY * maxScrollY;
      },
      { defer: true },
    ),
  );

  const selectedId = useState(service, {
    selector: (s) => s.context?.selected,
  });

  const selected = (id: string | number) => selectedId() === id;

  const nodes = useState(service, {
    selector: (s) => {
      const list = s.context.data?.nodes ?? [];
      return list.map((item) => ({
        id: item.id,
        x: item.position.x,
        y: item.position.y,
        label: item.data.label,
        content: item.data.content ?? "",
        input: item.input,
      }));
    },
    equals: dequal,
  });

  const cDim = () => {
    const _zoom = zoom();
    if (_zoom < 1) {
      return CANVAS_FACTOR * 100 * _zoom;
    }
    return CANVAS_FACTOR * 100;
  };

  return (
    <DragDropProvider
      onDragMove={({ draggable: { transform: _transform, node, id }, overlay }) => {
        setId(id);
        if (selected(id)) {
          const x = node.offsetLeft + _transform.x / zoom();
          const y = node.offsetTop + _transform.y / zoom();
          overlay?.node.style.setProperty("top", y * 2 + "px");
          overlay?.node.style.setProperty("left", x * 2 + "px");
          const deltaX = _transform.x / zoom();
          const deltaY = _transform.y / zoom();
          // Directly update the draggable node's CSS transform adjusted for zoom:
          node.style.setProperty("transform", `translate3d(${deltaX}px, ${deltaY}px, 0)`);

          service.send({ type: "MOVE_IMMEDIATE", payload: { id: `${id}`, x, y } });
          setTransform({ ..._transform });
        }
      }}

      onDragEnd={({ draggable: { node, id } }) => {
        if (!selected(id)) return;

        const X = node.offsetLeft + transform().x / zoom();
        const Y = node.offsetTop + transform().y / zoom();
        node.style.setProperty("top", Y + "px");
        node.style.setProperty("left", X + "px");
        node.style.removeProperty("transform");

        setTimeout(() => {
          service.send({ type: "MOVE", payload: { id: `${id}`, x: X, y: Y } });
          setTransform({ x: 0, y: 0 });
        }, 0);
      }}
    >
      <div
        onWheel={(e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            updateScrollPercentages();
            const delta = e.deltaY < 0 ? 0.1 : -0.1;
            setZoom((prev) => Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.2), 3));
          }
        }}

        class="relative w-[calc(100vw-32px)] h-[calc(100vh-64px)] mx-auto"
      >
        <div
          ref={(el) => {
            return (containerRef = el);
          }}
          onScroll={updateScrollPercentages}
          class="w-full h-full border-2 border-gray-600 rounded-lg overflow-scroll relative"
        >
          <DragDropSensors />
          <DragBounds />
          <div
            ref={setRef}
            class="relative cursor-crosshair"
            classList={{ "cursor-grabbing": isPanning() }}
            style={{
              height: `${cDim()}vh`,
              width: `${cDim()}vw`,
              scale: zoom(),
              "transform-origin": "top left",
            }}
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
                if (!containerRef) return;
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
                containerRef.scrollLeft = startScrollLeft - dx * 3;
                containerRef.scrollTop = startScrollTop - dy * 3;
                updateScrollPercentages();
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
            class="flex items-center justify-center size-9 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 rounded-lg shadow-sm transition-all duration-150 cursor-pointer font-bold text-lg"
            onClick={() => {
              updateScrollPercentages();
              setPreviousZoom(undefined);
              setZoom((prev) => Math.max(0.2, Number((prev - 0.1).toFixed(2))));
            }}
            title="Zoom out"
            aria-label="Zoom out"
          >
            -
          </button>
          <button
            type="button"
            class="px-2 h-9 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            onClick={() => {
              updateScrollPercentages();
              if (previousZoom()) {
                setZoom(previousZoom()!);
                setPreviousZoom(undefined);
              } else {
                setPreviousZoom(zoom());
                setZoom(1);
              }
            }}
            title="Reset zoom"
            aria-label="Reset zoom"
          >
            {Math.round(zoom() * 100)}%
          </button>
          <button
            type="button"
            class="flex items-center justify-center size-9 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 rounded-lg shadow-sm transition-all duration-150 cursor-pointer font-bold text-lg"
            onClick={() => {
              updateScrollPercentages();
              setPreviousZoom(undefined);
              setZoom((prev) => Math.min(3, Number((prev + 0.1).toFixed(2))));
            }}
            title="Zoom in"
            aria-label="Zoom in"
          >
            +
          </button>
          <div class="h-5 w-px bg-gray-300" />

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
