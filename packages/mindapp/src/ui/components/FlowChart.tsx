import { createEffect, type JSX, onCleanup, onMount } from 'solid-js';

import { DEFAULT_NODES } from '#services/main.machine.data';
import type {
  Data,
  HandlePosition,
  HandleType,
  NodeHandles_T,
  NodeProps,
} from '#services/main.machine.typings';

import { EdgeCursive } from './edges';
import { useFlow } from './FlowChart.context';
import type { FlowProps } from './FlowChart.types';
import { DefaultNodeSelected, NodesBoard } from './nodes';

export type { Data, HandlePosition, HandleType, NodeHandles_T, NodeProps };

// const PARENT_CHILD_GAP_WIDTH = 75;

/**
 * Flowchart board canvas component that renders interactive nodes, edges, pan/zoom,
 * and toolbar controls.
 *
 * @template | {@linkcode Data} `D` - Custom node data dictionary type extending
 *   {@linkcode Data}.
 *
 * @param props - Flowchart configuration and event handlers of type
 *   {@linkcode FlowProps}.
 *
 * @returns The rendered Solid component.
 *
 * @see {@linkcode NodesBoard}, {@linkcode useFlow}, {@linkcode DEFAULT_NODES}
 */
export const FlowChart = <N extends Data = Data, E extends Data = Data>(
  props: FlowProps<N, E>,
): JSX.Element => {
  const { service, hooks, send } = useFlow();
  let added = false;
  const fromNew = hooks.state({ selector: s => s.context.newEdge?.from });
  // Track the currently enlarged handle during edge drag
  let activeHandle: HTMLElement | null = null;
  onCleanup(service.pause);

  onMount(() => {
    service.resume();

    send({
      type: 'CONFIGURE',
      payload: {
        nodes: props.config?.nodes ?? DEFAULT_NODES,
        edges: props.config?.edges ?? [],
        defaultData: props.defaultData,
      },
    });
  });

  const clearActiveHandle = () => {
    if (activeHandle) {
      activeHandle.classList.remove('scale-150');
      activeHandle = null;
      added = false;
    }
  };

  const handlePointerMove = (e: MouseEvent | PointerEvent) => {
    send({ type: 'MOVE_NEW_EDGE', payload: { x: e.clientX, y: e.clientY } });

    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const inputHandle = elements
      .map(el => el.closest<HTMLElement>('.rounded-full[data-handle-type="input"]'))
      .find((handle): handle is HTMLElement =>
        Boolean(handle && handle.id !== 'inputs'),
      );

    // If cursor moved away from previous handle, reset its scale
    if (activeHandle && activeHandle !== inputHandle) {
      clearActiveHandle();
    }

    // If cursor entered a valid target handle, enlarge it
    if (inputHandle) {
      if (activeHandle !== inputHandle) {
        inputHandle.classList.add('scale-150');
        activeHandle = inputHandle;
        added = true;
      }
    }
  };

  const createHandlePointerUp = (from: string) => (e: MouseEvent | PointerEvent) => {
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const inputHandle = elements
      .map(el => el.closest<HTMLElement>('.rounded-full[data-handle-type="input"]'))
      .find((handle): handle is HTMLElement =>
        Boolean(handle && handle.id !== 'inputs'),
      );
    const to = inputHandle?.getAttribute('data-node-id');

    if (inputHandle && to) {
      const toPosition = inputHandle.getAttribute('data-handle-position') as
        | HandlePosition
        | undefined;
      const toIndexStr = inputHandle.getAttribute('data-handle-index');
      const toIndex =
        toIndexStr !== null && toIndexStr !== undefined
          ? parseInt(toIndexStr, 10)
          : undefined;
      const currentEdge = service.state.context.newEdge;

      send({
        type: 'ADD_EDGE',
        payload: {
          from,
          to,
          toPosition,
          toIndex,
          fromPosition: currentEdge?.fromPosition,
          fromIndex: currentEdge?.fromIndex,
        },
      });
    }

    // Cleanup on release
    clearActiveHandle();
    send('CLEAR_NEW_EDGE');
  };

  createEffect(() => {
    const from = fromNew();
    if (!from || added) return;

    const handlePointerUp = createHandlePointerUp(from);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    onCleanup(() => {
      // Cleanup on effect disposal
      clearActiveHandle();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    });
  });

  return (
    <div class='relative h-full w-full'>
      <div
        class='h-full w-full'
        style={{ cursor: fromNew() ? 'inherit' : 'crosshair' }}
      >
        <NodesBoard
          panels={props.panels}
          Node={props.Node}
          Edge={props.Edge ?? EdgeCursive<E>}
          NodeSelected={props.NodeSelected ?? DefaultNodeSelected}
        />
      </div>
    </div>
  );
};
