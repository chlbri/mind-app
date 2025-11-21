import { Component, createSignal, For, onMount } from 'solid-js';
import { produce } from 'solid-js/store';
import { useFlowContext } from './FlowChart.context';
import { NodeComponent2 } from './NodeComponent2';
import { dequal } from 'dequal';

export const NodesBoard2: Component = () => {
  const [ref, setRef] = createSignal<HTMLDivElement>();

  const {
    dimensions: [, setDimensions],
    service,
  } = useFlowContext();

  const nodes = service.context(ctx => {
    const out = { ...ctx.data?.nodes };
    const entries = Object.entries(out);
    const out2 = entries.map(
      ([
        id,
        {
          data: { content, label },
          input,
          position: { x, y },
        },
      ]) => ({ id, x, y, label, content, input }),
    );
    return out2;
  }, dequal);

  onMount(() => {
    const rect = ref()!.getBoundingClientRect();

    setDimensions(
      produce(data => {
        for (const key in data) {
          const dimension = data[key];

          const X = nodes().find(n => n.id === key)?.x || 0;
          const Y = nodes().find(n => n.id === key)?.y || 0;

          data[key] = {
            ...dimension,
            output: {
              x: dimension.output.x - rect.x - X + 6,
              y: dimension.output.y - rect.y - Y + 6,
            },
            input: dimension.input
              ? {
                  x: dimension.input.x - rect.x - X + 6,
                  y: dimension.input.y - rect.y - Y + 6,
                }
              : undefined,
          };
        }
      }),
    );
  });

  return (
    <div ref={setRef} class='w-full h-full relative'>
      <For each={nodes()}>{node => <NodeComponent2 {...node} />}</For>
    </div>
  );
};
