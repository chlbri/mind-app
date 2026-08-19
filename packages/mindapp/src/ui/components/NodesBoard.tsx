import { useState } from '@bemedev/app-solidjs';
import {
  DragDropProvider,
  DragDropSensors,
  DragOverlay,
} from '@thisbeyond/solid-dnd';
import { dequal } from 'dequal';
import {
  Component,
  createEffect,
  createSignal,
  For,
  on,
  onCleanup,
  Show,
} from 'solid-js';
import { EdgesBoard } from './EdgesBoard';
import { useFlow } from './FlowChart.context';
import { CANVAS_FACTOR } from './FlowChart.data';
import { NodeComponent } from './NodeComponent';
import { DragBounds } from './Bounds';

/**
 * Interactive board component containing the drag-drop viewport, zoom
 * controls, panning gestures, and rendered nodes/edges.
 *
 * @returns The rendered Solid component.
 */
export const NodesBoard: Component = () => {
  let containerRef: HTMLDivElement | undefined;
  const [isPanning, setIsPanning] = createSignal(false);
  const [transform, setTransform] = createSignal({ x: 0, y: 0 });
  const [id, setId] = createSignal<string | number>('');
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
    const maxScrollY =
      containerRef.scrollHeight - containerRef.clientHeight;
    percentX = maxScrollX > 0 ? containerRef.scrollLeft / maxScrollX : 0;
    percentY = maxScrollY > 0 ? containerRef.scrollTop / maxScrollY : 0;
  };

  createEffect(
    on(
      zoom,
      () => {
        if (!containerRef) return;
        const maxScrollX =
          containerRef.scrollWidth - containerRef.clientWidth;
        const maxScrollY =
          containerRef.scrollHeight - containerRef.clientHeight;
        if (maxScrollX > 0)
          containerRef.scrollLeft = percentX * maxScrollX;
        if (maxScrollY > 0) containerRef.scrollTop = percentY * maxScrollY;
      },
      { defer: true },
    ),
  );

  const selectedId = useState(service, {
    selector: s => s.context?.selected,
  });

  const selected = (id: string | number) => selectedId() === id;

  const nodes = useState(service, {
    selector: s => {
      const list = s.context.data?.nodes ?? [];
      return list.map(item => ({
        id: item.id,
        x: item.position.x,
        y: item.position.y,
        label: item.data.label,
        content: item.data.content ?? '',
        input: item.input,
      }));
    },
    equals: dequal,
  });

  const cDim = () => CANVAS_FACTOR * 100 * zoom();

  return (
    <div
      onWheel={e => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          updateScrollPercentages();
          const delta = e.deltaY < 0 ? 0.1 : -0.1;
          setZoom(prev =>
            Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.2), 3),
          );
        }
      }}

      class='relative mx-auto h-[calc(100vh-64px)] w-[calc(100vw-32px)] overflow-hidden'
    >
      <DragDropProvider
        onDragMove={({
          draggable: { transform: _transform, node, id },
        }) => {
          setId(id);
          if (selected(id)) {
            const grandParent = node.parentElement?.parentElement;
            const currentZoom = zoom();
            const minX = 0;
            const maxX = grandParent
              ? Math.max(
                  0,
                  grandParent.clientWidth / currentZoom - node.offsetWidth,
                )
              : Infinity;
            const minY = 0;
            const maxY = grandParent
              ? Math.max(
                  0,
                  grandParent.clientHeight / currentZoom -
                    node.offsetHeight,
                )
              : Infinity;

            const targetX = node.offsetLeft + _transform.x / currentZoom;
            const targetY = node.offsetTop + _transform.y / currentZoom;

            const x = Math.min(Math.max(targetX, minX), maxX);
            const y = Math.min(Math.max(targetY, minY), maxY);

            const deltaX = x - node.offsetLeft;
            const deltaY = y - node.offsetTop;

            // Directly update the draggable node's CSS transform adjusted for zoom:
            node.style.setProperty(
              'transform',
              `translate3d(${deltaX}px, ${deltaY}px, 0)`,
            );

            service.send({
              type: 'MOVE_IMMEDIATE',
              payload: { id: `${id}`, x, y },
            });
            setTransform({
              x: deltaX * currentZoom,
              y: deltaY * currentZoom,
            });
          }
        }}

        onDragEnd={({ draggable: { node, id } }) => {
          if (!selected(id)) return;

          const grandParent = node.parentElement?.parentElement;
          const currentZoom = zoom();
          const minX = 0;
          const maxX = grandParent
            ? Math.max(
                0,
                grandParent.clientWidth / currentZoom - node.offsetWidth,
              )
            : Infinity;
          const minY = 0;
          const maxY = grandParent
            ? Math.max(
                0,
                grandParent.clientHeight / currentZoom - node.offsetHeight,
              )
            : Infinity;

          const rawX = node.offsetLeft + transform().x / currentZoom;
          const rawY = node.offsetTop + transform().y / currentZoom;
          const X = Math.min(Math.max(rawX, minX), maxX);
          const Y = Math.min(Math.max(rawY, minY), maxY);

          node.style.setProperty('top', Y + 'px');
          node.style.setProperty('left', X + 'px');
          node.style.removeProperty('transform');

          setTimeout(() => {
            service.send({
              type: 'MOVE',
              payload: { id: `${id}`, x: X, y: Y },
            });
            setTransform({ x: 0, y: 0 });
          }, 0);
        }}
      >
        <div
          ref={el => {
            return (containerRef = el);
          }}
          onScroll={updateScrollPercentages}
          class='relative h-full w-full overflow-scroll rounded-lg border-2 border-gray-600'
        >
          <DragDropSensors />
          <div
            ref={setRef}
            class='relative cursor-crosshair overflow-hidden border-3 border-red-700'
            classList={{ 'cursor-grabbing': isPanning() }}
            style={{
              height: `calc(${cDim()}vh - 85px)`,
              width: `calc(${cDim()}vw - 53px)`,
            }}
            onMouseDown={e => {
              if (newEdge() || e.button !== 0) return;
              if (!containerRef) return;

              service.send('DESELECT');

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
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
                setTimeout(() => setIsPanning(false), 200);
                (cleanupPanning as any) = undefined;
              };

              // #region Attach Windows listeners
              cleanupPanning = handleMouseUp;
              window.addEventListener('mousemove', handleMouseMove);
              window.addEventListener('mouseup', handleMouseUp);
              // #endregion
            }}
          >
            <div
              class='relative h-full w-full'
              style={{ scale: zoom(), 'transform-origin': 'top left' }}
            >
              <DragBounds />
              <EdgesBoard />
              <For each={nodes()} children={NodeComponent} />
            </div>
          </div>
        </div>

        {/* Panel */}
        <div class='absolute right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl border border-gray-200 bg-white/90 p-2 shadow-lg backdrop-blur-md'>
          <button
            type='button'
            class='flex size-9 cursor-pointer items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-700 shadow-sm transition-all duration-150 hover:bg-gray-200 active:scale-95'
            onClick={() => {
              updateScrollPercentages();
              setPreviousZoom(undefined);
              setZoom(prev =>
                Math.max(
                  1 / CANVAS_FACTOR,
                  Number((prev - 0.1).toFixed(2)),
                ),
              );
            }}
            title='Zoom out'
            aria-label='Zoom out'
          >
            -
          </button>
          <button
            type='button'
            class='h-9 cursor-pointer rounded-lg px-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100'
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
            title='Reset zoom'
            aria-label='Reset zoom'
          >
            {Math.round(zoom() * 100)}%
          </button>
          <button
            type='button'
            class='flex size-9 cursor-pointer items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-700 shadow-sm transition-all duration-150 hover:bg-gray-200 active:scale-95'
            onClick={() => {
              updateScrollPercentages();
              setPreviousZoom(undefined);
              setZoom(prev =>
                Math.min(
                  Math.min(3, CANVAS_FACTOR),
                  Number((prev + 0.1).toFixed(2)),
                ),
              );
            }}
            title='Zoom in'
            aria-label='Zoom in'
          >
            +
          </button>
          <div class='h-5 w-px bg-gray-300' />

          <button
            type='button'
            class='flex size-9 cursor-pointer items-center justify-center rounded-lg bg-blue-600 text-white shadow transition-all duration-150 hover:bg-blue-700 active:scale-95'
            onClick={() => service.send('ADD_PARENT')}
            title='Add parent node'
            aria-label='Add parent node'
          >
            <svg class='size-5' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' />
            </svg>
          </button>
        </div>
        <Show when={!id() || !selected(id())}>
          <DragOverlay children='' />
        </Show>
      </DragDropProvider>
    </div>
  );
};
