import { createState } from '@bemedev/app-solidjs';
import { createEffect, type JSX, onCleanup, onMount } from 'solid-js';

import { DEFAULT_NODES } from '#services/main.machine.data';
import type { NodeData, NodeProps } from '#services/main.machine.typings';

import { useFlow } from './FlowChart.context';
import type { FlowProps } from './FlowChart.types';
import { NodesBoard } from './NodesBoard';

export type { NodeData, NodeProps };

// const PARENT_CHILD_GAP_WIDTH = 75;

/**
 * Flowchart board canvas component that renders interactive nodes, edges, pan/zoom,
 * and toolbar controls.
 *
 * @template | {@linkcode NodeData} `D` - Custom node data dictionary type extending
 *   {@linkcode NodeData}.
 *
 * @param props - Flowchart configuration and event handlers of type
 *   {@linkcode FlowProps}.
 *
 * @returns The rendered Solid component.
 *
 * @see {@linkcode NodesBoard}, {@linkcode useFlow}, {@linkcode DEFAULT_NODES}
 */
export const FlowChart = <D extends NodeData = NodeData>(
  props: FlowProps<D>,
): JSX.Element => {
  const primaryNodes = props.config?.nodes ?? DEFAULT_NODES;
  const primaryEdges = props.config?.edges;
  const service = useFlow();
  const fromSignal = createState(service, {
    selector: s => s.context.newEdge?.from,
  });
  onCleanup(service.pause);

  onMount(() => {
    service.resume();
    service.send({
      type: 'CONFIGURE',
      payload: {
        nodes: primaryNodes,
        edges: primaryEdges ?? [],
        defaultData: props.defaultData,
      },
    });
  });

  let added = false;

  createEffect(() => {
    const from = fromSignal();
    if (!from || added) return;

    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
      service.send({
        type: 'MOVE_NEW_EDGE',
        payload: { x: e.clientX, y: e.clientY },
      });

      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const inputHandle = elements
        .map(el =>
          el.closest<HTMLElement>('.rounded-full[data-handle-type="input"]'),
        )
        .find((handle): handle is HTMLElement =>
          Boolean(handle && handle.id !== 'inputs'),
        );
      const targetId = inputHandle?.getAttribute('data-node-id');

      if (inputHandle && targetId) {
        console.log('REACH CAN !!!');
        inputHandle.classList.add('scale-150');
        added = true;
        inputHandle.addEventListener(
          'mouseleave',
          () => {
            inputHandle.classList.remove('scale-150');
            added = false;
          },
          { once: true },
        );
      }
    };

    const handlePointerUp = (e: MouseEvent | PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const inputHandle = el?.closest('[data-handle-type="input"]');
      const to = inputHandle?.getAttribute('data-node-id');
      if (inputHandle && to) {
        service.send({ type: 'ADD_EDGE', payload: { from, to } });
        inputHandle.classList.remove('scale-150');
        added = false;
      }

      service.send('CLEAR_NEW_EDGE');
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    onCleanup(() => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    });
  });

  return (
    <div class='relative h-full w-full'>
      <div
        class='h-full w-full'
        style={{ cursor: fromSignal() ? 'inherit' : 'crosshair' }}
      >
        <NodesBoard panels={props.panels} component={props.component} />
      </div>
    </div>
  );
};
