import { createSignal, For, onMount, type Component } from 'solid-js';
import { service } from '../../services/main';
import { EDGE_RADIUS } from '../../services/main.data';
import { Edge, type EdgeProps } from './Edge';
import { Node, type NodeProps } from './Node';

type Props = {
  config?: {
    nodes?: NodeProps[];
    edges?: Omit<EdgeProps & { from: string; to: string }, 'isNew'>[];
  };
};

export const FlowChart: Component<Props> = props => {
  const [refBoard, setRefBoard] = createSignal<HTMLDivElement>();
  const drawingEdge = service.context(({ edge }) => !!edge);

  service.send({
    type: 'CONFIGURE',
    payload: {
      ...props.config,
    },
  });

  onMount(() => {
    service.start();
    service.addOptions(({ assign }) => ({
      actions: {
        updateMount: assign('pContext.mount', {
          MOUNT: ({ pContext: { mount } }) => {
            const rect = refBoard()?.getBoundingClientRect();
            if (!rect) return mount;
            const entries = Object.entries(mount).map(
              ([key, value]) =>
                [
                  key,
                  {
                    ...value,
                    input: {
                      x: value.input.x - rect.x + EDGE_RADIUS,
                      y: value.input.y - rect.y + EDGE_RADIUS,
                    },
                    output: {
                      x: value.output.x - rect.x + EDGE_RADIUS,
                      y: value.output.y - rect.y + EDGE_RADIUS,
                    },
                  },
                ] as const,
            );

            return Object.fromEntries(entries);
          },
        }),
      },
    }));
  });

  return (
    <div class='relative w-full h-full overflow-hidden'>
      <div class='w-full h-full overflow-scroll'>
        <div
          class='relative h-[150vh] w-[2160px] bg-white bg-[length:30px_30px]'
          style={{
            cursor: drawingEdge() ? 'inherit' : 'crosshair',
            'background-image':
              'radial-gradient(circle, #b8b8b8bf 1px, rgba(0, 0, 0, 0) 1px)',
          }}
        >
          <div
            ref={setRefBoard}
            class='relative w-full h-full'
            onMouseDown={({ currentTarget }) => {
              const rect = currentTarget.getBoundingClientRect();

              service.addOptions(({ assign }) => ({
                actions: {
                  updateMount: assign('pContext.mount', {
                    MOUNT: ({ pContext: { mount } }) => {
                      const entries = Object.entries(mount).map(
                        ([key, value]) => [
                          key,
                          {
                            ...value,
                            input: {
                              x: value.input.x - rect.x,
                              y: value.input.y - rect.y,
                            },
                            output: {
                              x: value.output.x - rect.x,
                              y: value.output.y - rect.y,
                            },
                          },
                        ],
                      );
                      return Object.fromEntries(entries);
                    },
                  }),
                },
              }));
            }}
          >
            <For each={service.select('context.nodes')()}>
              {node => (
                <Node
                  id={node.id}
                  x={node.position.x}
                  y={node.position.y}
                  label={node.label}
                  content={node.content}
                  input={node.input}
                />
              )}
            </For>
          </div>
          <svg class='pointer-events-none absolute top-0 w-full h-full'>
            <For each={service.select('context.edges')()}>{Edge}</For>
          </svg>
        </div>
      </div>
    </div>
  );
};
