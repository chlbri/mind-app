import {
  Component,
  createEffect,
  createSignal,
  For,
  Show,
} from 'solid-js';
import { EdgeComponent2 } from './EdgeComponent2';
import { useFlowContext } from './FlowChart.context';

const EdgesBoard2: Component = () => {
  const [selected, setSelected] = createSignal<string>();

  const {
    newEdge: [newEdge],
    service,
    edgesPositions: [edgesPositions],
  } = useFlowContext();

  const ids = service.context(ctx => {
    const out = { ...ctx.data?.edges };
    const out2 = Object.keys(out);
    return out2;
  });

  createEffect(() => {
    if (selected() && newEdge()) setSelected();
  });

  return (
    <svg class='pointer-events-none absolute top-0 w-full h-full'>
      <Show when={newEdge()}>
        {value => (
          <EdgeComponent2
            id='__#new-edge#__TEMP'
            isNew={true}
            x0={value().x0}
            y0={value().y0}
            x1={value().x1}
            y1={value().y1}
          />
        )}
      </Show>

      <For each={ids()}>
        {edgeId => {
          return (
            <EdgeComponent2
              id={edgeId}
              isNew={false}
              {...edgesPositions()[edgeId]}
            />
          );
        }}
      </For>
    </svg>
  );
};

export default EdgesBoard2;
