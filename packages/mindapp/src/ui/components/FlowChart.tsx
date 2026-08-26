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
  const hasNewEdge = createState(service, { selector: s => !!s.context.newEdge });
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

  createEffect(() => {
    if (!hasNewEdge()) return;

    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
      service.send({
        type: 'MOVE_NEW_EDGE',
        payload: { x: e.clientX, y: e.clientY },
      });
    };

    const handlePointerUp = (e: MouseEvent | PointerEvent) => {
      const from = service.state.context.newEdge?.from;
      if (from) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const inputHandle = el?.closest('[data-handle-type="input"]');
        const targetId = inputHandle?.getAttribute('data-node-id');
        if (targetId && targetId !== from) {
          service.send({ type: 'ADD_EDGE', payload: { from, to: targetId } });
        }
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
        style={{ cursor: hasNewEdge() ? 'inherit' : 'crosshair' }}
      >
        <NodesBoard panels={props.panels} component={props.component} />
      </div>
    </div>
  );
};
