import { createState } from '@bemedev/app-solidjs';
import { Component, For, Show, type JSX } from 'solid-js';

import type { Data } from '#services/main.machine.typings';

import type { EdgeProps } from './edges/types';
import { useFlow } from './FlowChart.context';

/**
 * SVG board overlay component that renders all active connecting edges and ongoing
 * edge creation previews.
 *
 * @returns The rendered SVG JSX element.
 *
 * @see {@linkcode useFlow}
 */
export const EdgesBoard: <E extends Data = Data>(props: {
  Edge: Component<EdgeProps<E>>;
}) => JSX.Element = props => {
  const { service } = useFlow();
  const hasNewEdge = createState(service, { selector: s => !!s.context.newEdge });

  const edgeIds = createState(service, {
    selector: ({ context }) => Object.keys(context.edgesPositions ?? {}),
    equals: (prev, next) => prev.length === next.length,
  });

  return (
    <svg class='pointer-events-none h-full w-full overflow-visible'>
      <Show when={hasNewEdge()}>
        <props.Edge id='__#new-edge#__TEMP' isNew />
      </Show>

      <For each={edgeIds()}>{id => <props.Edge id={id} />}</For>
    </svg>
  );
};
