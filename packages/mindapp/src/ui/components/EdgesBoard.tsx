import { createState } from '@bemedev/app-solidjs';
import { Component, For, Show } from 'solid-js';

import { EdgeComponent } from './EdgeComponent';
import { useFlow } from './FlowChart.context';

/**
 * SVG board overlay component that renders all active connecting edges and ongoing
 * edge creation previews.
 *
 * @returns The rendered SVG JSX element.
 *
 * @see {@linkcode EdgeComponent}, {@linkcode useFlow}
 */
export const EdgesBoard: Component = () => {
  const { service } = useFlow();

  const hasNewEdge = createState(service, { selector: s => !!s.context.newEdge });

  const edgeIds = createState(service, {
    selector: ({ context }) => Object.keys(context.edgesPositions),
    equals: (prev, next) => prev.length === next.length,
  });

  return (
    <svg class='pointer-events-none h-full w-full overflow-visible'>
      <Show when={hasNewEdge()}>
        <EdgeComponent id='__#new-edge#__TEMP' isNew />
      </Show>

      <For each={edgeIds()}>{id => <EdgeComponent id={id} />}</For>
    </svg>
  );
};
