import { createState } from '@bemedev/app-solidjs';
import { dequal } from 'dequal';
import { Component, Index, Show } from 'solid-js';

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

  const newEdge = createState(service, { selector: s => s.context.newEdge });

  const datas = createState(service, {
    selector: ({ context }) => {
      const entries = Object.entries(context.edgesPositions);
      return entries.map(([id, vector]) => ({ id, ...vector }));
    },
    equals: dequal,
    stateEquals: (_, next) => {
      return next.event.type === 'SELECT';
    },
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

      <Index each={datas()} children={item => <EdgeComponent {...item()} />} />
    </svg>
  );
};
