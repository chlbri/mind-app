import { useState } from '@bemedev/app-solidjs';
import { Component, createMemo, For, Show } from 'solid-js';

import { EdgeComponent } from './EdgeComponent';
import { useFlow } from './FlowChart.context';

/**
 * SVG board overlay component that renders all active connecting edges and ongoing
 * edge creation previews.
 *
 * @returns The rendered SVG JSX element.
 */
export const EdgesBoard: Component = () => {
  const { service } = useFlow();

  const newEdge = useState(service, {
    selector: s => s.context.newEdge,
    equals: () => false,
  });

  const edgesPositions = useState(service, {
    selector: s => s.context.edgesPositions,
    equals: () => false,
  });

  const datas = createMemo(() => {
    const entries = Object.entries(edgesPositions());
    return entries.map(([id, vector]) => ({ id, ...vector }));
  });

  return (
    <svg class='pointer-events-none h-full w-full overflow-visible'>
      <Show when={newEdge()}>
        {value => (
          <EdgeComponent
            id='__#new-edge#__TEMP'
            isNew
            x0={value().x0}
            y0={value().y0}
            x1={value().x1}
            y1={value().y1}
          />
        )}
      </Show>

      <For each={datas()} children={EdgeComponent} />
    </svg>
  );
};
