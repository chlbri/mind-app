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
        <EdgeComponent2
          id='__#new-edge#__TEMP'
          isNew={true}
          x0={newEdge()!.x0}
          y0={newEdge()!.y0}
          x1={newEdge()!.x1}
          y1={newEdge()!.y1}
        />
      </Show>

      <For each={ids()}>
        {edgeId => {
          return (
            <EdgeComponent2
              id={edgeId}
              isNew={false}
              x0={edgesPositions()[edgeId]?.x0 || 0}
              y0={edgesPositions()[edgeId]?.y0 || 0}
              x1={edgesPositions()[edgeId]?.x1 || 0}
              y1={edgesPositions()[edgeId]?.y1 || 0}
            />
          );
        }}
      </For>
    </svg>
  );
};

export default EdgesBoard2;
