import { createState } from '@bemedev/app-solidjs';
import { type JSX, onCleanup, onMount } from 'solid-js';

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

  return (
    <div
      class='relative h-full w-full'
      onMouseUp={() => service.send('CLEAR_NEW_EDGE')}
      onMouseMove={({ clientX, clientY }) => {
        if (hasNewEdge())
          service.send({
            type: 'MOVE_NEW_EDGE',
            payload: { x: clientX, y: clientY },
          });
      }}
    >
      <div
        class='h-full w-full'
        style={{ cursor: hasNewEdge() ? 'inherit' : 'crosshair' }}
      >
        <NodesBoard panels={props.panels} component={props.component} />
      </div>
    </div>
  );
};
