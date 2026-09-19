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
import { NodesBoardControls } from './NodesBoard.controls';

/**
 * Properties for the {@linkcode NodesBoard} component.
 *
 * @template | {@linkcode Data} `N` - Custom node data dictionary type extending
 *   {@linkcode Data}.
 * @template | {@linkcode Data} `E` - Custom edge data dictionary type extending
 *   {@linkcode Data}.
 */
export type NodesBoardProps<N extends Data = Data, E extends Data = Data> = {
  /** Optional custom node component. */
  Node?: Component<N>;
  /** Optional custom edge component. */
  Edge: Component<EdgeProps<E>>;
  /** Component rendered when a node is selected, providing action buttons. */
  NodeSelected: NodeComponentProps<N>['Selected'];
  /** Optional custom overlay panels of type {@linkcode FlowPanels}. */
  panels?: FlowPanels;
  /** Optional custom controls addon component. */
  controlsAddons?: Component;
};

/**
 * Interactive board component containing the drag-drop viewport, zoom controls,
 * panning gestures, and rendered nodes/edges.
 *
 * @template | {@linkcode Data} `N` - Custom node data dictionary type extending
 *   {@linkcode Data}.
 * @template | {@linkcode Data} `E` - Custom edge data dictionary type extending
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
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
  const [isPanning, setIsPanning] = createSignal(false);
  const [transform, setTransform] = createSignal({ x: 0, y: 0 });
  const [ref, setRef] = createSignal<HTMLDivElement>();
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
    const el = containerRef();
    if (!el) return;
    const maxScrollX = el.scrollWidth - el.clientWidth;
    const maxScrollY = el.scrollHeight - el.clientHeight;
    percentX = maxScrollX > 0 ? el.scrollLeft / maxScrollX : 0;
    percentY = maxScrollY > 0 ? el.scrollTop / maxScrollY : 0;
    sendBoard();
  };

  createEffect(
    on(
      zoom,
      () => {
        const el = containerRef();
        if (!el) return;
        const maxScrollX = el.scrollWidth - el.clientWidth;
        const maxScrollY = el.scrollHeight - el.clientHeight;
        if (maxScrollX > 0) el.scrollLeft = percentX * maxScrollX;
        if (maxScrollY > 0) el.scrollTop = percentY * maxScrollY;
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
          ref={setContainerRef}
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
              const el = containerRef();
              if (!el) return;
              send('DESELECT');
              setIsPanning(true);

              // #region Props
              const startX = e.clientX;
              const startY = e.clientY;
              const startScrollLeft = el.scrollLeft;
              const startScrollTop = el.scrollTop;
              // #endregion

              const handleMouseMove = (moveEvent: MouseEvent) => {
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
                el.scrollLeft = startScrollLeft - dx * SCROLL_MULTIPLIER;
                el.scrollTop = startScrollTop - dy * SCROLL_MULTIPLIER;
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

        <NodesBoardControls
          updateScrollPercentages={updateScrollPercentages}
          addons={props.controlsAddons}
        />
        <Show when={!selectedId()}>
          <DragOverlay children='' />
        </Show>
      </DragDropProvider>
    </div>
  );
};
