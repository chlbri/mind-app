import { toArray } from '@bemedev/app/bemedev';
import { deepEqual } from '@bemedev/app/utils';
import {
  DragDropProvider,
  DragDropSensors,
  DragOverlay,
} from '@thisbeyond/solid-dnd';
import {
  type Component,
  createEffect,
  createSignal,
  For,
  type JSX,
  on,
  onMount,
  Show,
} from 'solid-js';

import {
  CANVAS_FACTOR,
  SCROLL_MULTIPLIER,
} from '../../../services/main.machine.data';
import type { Data } from '../../../services/main.machine.typings';
import { DragBounds } from '../Bounds';
import { EdgesBoard } from '../edges/EdgesBoard';
import type { EdgeProps } from '../edges/types';
import { useFlow } from '../FlowChart.context';
import type { FlowPanels } from '../FlowChart.types';
import { Panels } from '../Panels';
import { NodeComponent, type NodeComponentProps } from './Node';

/** Properties for the {@linkcode NodesBoard} component. */
export type NodesBoardProps<N extends Data = Data, E extends Data = Data> = {
  /** Optional custom node component. */
  Node?: Component<N>;
  /** Optional custom edge component. */
  Edge: Component<EdgeProps<E>>;
  /** Component rendered when a node is selected, providing action buttons. */
  NodeSelected: NodeComponentProps<N>['Selected'];
  /** Optional custom overlay panels of type {@linkcode FlowPanels}. */
  panels?: FlowPanels;
};

/**
 * Interactive board component containing the drag-drop viewport, zoom controls,
 * panning gestures, and rendered nodes/edges.
 *
 * @template | {@linkcode Data} `N` - Custom node data dictionary type extending
 *   {@linkcode Data}.
 *
 * @param props - Board component properties of type {@linkcode NodesBoardProps}.
 *
 * @returns The rendered Solid component.
 *
 * @see {@linkcode DragBounds}, {@linkcode EdgesBoard}, {@linkcode NodeComponent}, {@linkcode useFlow}, {@linkcode CANVAS_FACTOR}, {@linkcode SCROLL_MULTIPLIER}
 */
export const NodesBoard = <N extends Data = Data, E extends Data = Data>(
  props: NodesBoardProps<N, E>,
): JSX.Element => {
  let containerRef: HTMLDivElement;
  const [isPanning, setIsPanning] = createSignal(false);
  const [transform, setTransform] = createSignal({ x: 0, y: 0 });
  const [ref, setRef] = createSignal<HTMLDivElement | undefined>();
  let percentX = 0;
  let percentY = 0;
  const { hooks, send } = useFlow();

  const newEdge = hooks.state({
    selector: s => s.context.newEdge,
    equals: deepEqual<any>,
  });

  const zoom = hooks.state({ selector: s => s.context.zoom ?? 1 });

  /**
   * Dispatches the current board geometry and parent container dimensions to the
   * state machine service
   */
  const sendBoard = () => {
    const el = ref();
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const parent = () => ref()?.parentElement;

    const payload = {
      self: {
        left: rect.left,
        top: rect.top,
        width: el.clientWidth,
        height: el.clientHeight,
      },
      parent: parent()
        ? {
            scrollLeft: parent()!.scrollLeft,
            scrollTop: parent()!.scrollTop,
            height: parent()!.clientHeight,
            width: parent()!.clientWidth,
          }
        : undefined,
    };

    send({ type: 'SET_BOARD', payload });
  };

  /**
   * Calculates and saves the normalized scroll percentages across X and Y axes for
   * preserving viewport alignment on zoom changes.
   */
  const updateScrollPercentages = () => {
    const maxScrollX = containerRef.scrollWidth - containerRef.clientWidth;
    const maxScrollY = containerRef.scrollHeight - containerRef.clientHeight;
    percentX = maxScrollX > 0 ? containerRef.scrollLeft / maxScrollX : 0;
    percentY = maxScrollY > 0 ? containerRef.scrollTop / maxScrollY : 0;
    sendBoard();
  };

  createEffect(
    on(
      zoom,
      () => {
        const maxScrollX = containerRef.scrollWidth - containerRef.clientWidth;
        const maxScrollY = containerRef.scrollHeight - containerRef.clientHeight;
        if (maxScrollX > 0) containerRef.scrollLeft = percentX * maxScrollX;
        if (maxScrollY > 0) containerRef.scrollTop = percentY * maxScrollY;
      },
      { defer: true },
    ),
  );

  onMount(sendBoard);

  const selectedId = hooks.state({ selector: s => s.context?.selected });

  const nodeIds = hooks.state({
    selector: ({ context }) => {
      const list = toArray.typed(context.data?.nodes);
      return list.map(item => item.id);
    },
    equals: (prev, next) => prev.length === next.length,
  });

  const CANVAS_SIZE = CANVAS_FACTOR * 100;
  const MARGIN_X = 53 * CANVAS_FACTOR;
  const MARGIN_Y = 85 * CANVAS_FACTOR;

  /** Computes the dynamic canvas width string in CSS units adjusted for zoom. */
  const cWidth = () => `calc((${CANVAS_SIZE}vw - ${MARGIN_X}px) * ${zoom()})`;

  /** Computes the dynamic canvas height string in CSS units adjusted for zoom. */
  const cHeight = () => `calc((${CANVAS_SIZE}vh - ${MARGIN_Y}px) * ${zoom()})`;

  return (
    <div
      onWheel={e => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          updateScrollPercentages();
          const delta = e.deltaY < 0 ? 0.1 : -0.1;
          send({ type: 'ZOOM', payload: delta });
        }
      }}

      class='relative mx-auto h-full w-full'
    >
      <DragDropProvider
        onDragMove={({ draggable: { transform: _transform, node, id } }) => {
          const grandParent = node.parentElement?.parentElement;
          const currentZoom = zoom();
          const minX = 0;
          const maxX = grandParent
            ? Math.max(0, grandParent.clientWidth / currentZoom - node.offsetWidth)
            : Infinity;
          const minY = 0;
          const maxY = grandParent
            ? Math.max(0, grandParent.clientHeight / currentZoom - node.offsetHeight)
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

          send({ type: 'MOVE_IMMEDIATE', payload: { id: `${id}`, x, y } });
          setTransform({ x: deltaX * currentZoom, y: deltaY * currentZoom });
        }}

        onDragEnd={({ draggable: { node, id } }) => {
          // if (!selected(id)) return;

          const grandParent = node.parentElement?.parentElement;
          const currentZoom = zoom();
          const minX = 0;
          const maxX = grandParent
            ? Math.max(0, grandParent.clientWidth / currentZoom - node.offsetWidth)
            : Infinity;
          const minY = 0;
          const maxY = grandParent
            ? Math.max(0, grandParent.clientHeight / currentZoom - node.offsetHeight)
            : Infinity;

          const rawX = node.offsetLeft + transform().x / currentZoom;
          const rawY = node.offsetTop + transform().y / currentZoom;
          const X = Math.min(Math.max(rawX, minX), maxX);
          const Y = Math.min(Math.max(rawY, minY), maxY);

          node.style.setProperty('top', Y + 'px');
          node.style.setProperty('left', X + 'px');
          node.style.removeProperty('transform');

          send({ type: 'MOVE', payload: { id: `${id}`, x: X, y: Y } });
          setTimeout(() => {
            setTransform({ x: 0, y: 0 });
          }, 0);
        }}
      >
        <div
          ref={el => {
            return (containerRef = el);
          }}
          onScroll={updateScrollPercentages}
          class='relative h-full w-full overflow-auto'
        >
          <DragDropSensors />
          <div
            ref={setRef}
            class='relative cursor-crosshair'
            classList={{ 'cursor-grabbing': isPanning() }}
            style={{ height: cHeight(), width: cWidth() }}
            // onScroll={() => {}}

            onMouseDown={e => {
              if (newEdge() || e.button !== 0) return;
              send('DESELECT');
              setIsPanning(true);

              // #region Props
              const startX = e.clientX;
              const startY = e.clientY;
              const startScrollLeft = containerRef.scrollLeft;
              const startScrollTop = containerRef.scrollTop;
              // #endregion

              const handleMouseMove = (moveEvent: MouseEvent) => {
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
                containerRef.scrollLeft = startScrollLeft - dx * SCROLL_MULTIPLIER;
                containerRef.scrollTop = startScrollTop - dy * SCROLL_MULTIPLIER;
                updateScrollPercentages();
              };

              const handleMouseUp = () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
                setTimeout(() => setIsPanning(false), 200);
              };

              // #region Attach Windows listeners
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
              <EdgesBoard Edge={props.Edge} />
              <For each={nodeIds()}>
                {id => (
                  <NodeComponent
                    id={id}
                    children={props.Node}
                    Selected={props.NodeSelected}
                  />
                )}
              </For>
            </div>
          </div>
        </div>

        <Panels {...props.panels} />

        {/* Bottom-Right Panel (Main Zoom & Creation Controls) */}
        <div class='absolute right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl border border-gray-200 bg-white/90 p-2 shadow-lg backdrop-blur-md'>
          <button
            type='button'
            class='flex size-9 cursor-pointer items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-700 shadow-sm transition-all duration-150 hover:bg-gray-200 active:scale-95'
            onClick={() => {
              updateScrollPercentages();
              send({ type: 'ZOOM', payload: -0.1 });
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
              send('TOGGLE_ZOOM');
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
              send({ type: 'ZOOM', payload: 0.1 });
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
            onClick={() => send('ADD_PARENT')}
            title='Add parent node'
            aria-label='Add parent node'
          >
            <svg class='size-5' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' />
            </svg>
          </button>
        </div>
        <Show when={!selectedId()}>
          <DragOverlay children='' />
        </Show>
      </DragDropProvider>
    </div>
  );
};
