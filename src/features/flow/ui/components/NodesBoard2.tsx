import { DragDropProvider, DragDropSensors } from '@thisbeyond/solid-dnd';
import { dequal } from 'dequal';
import { Component, createSignal, For, onMount } from 'solid-js';
import { useFlowContext } from './FlowChart.context';
import { NodeComponent2 } from './NodeComponent2';
import { produce } from 'solid-js/store';

export const NodesBoard2: Component = () => {
  const [ref, setRef] = createSignal<HTMLDivElement>();

  const {
    board: [board, setPoint],
    service,
    dimensions: [dimensions],
    edgesPositions: [, setEdgesPositions],
  } = useFlowContext();

  const selected = service.context(ctx => ctx.selected);

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

    setPoint({
      x: rect.x,
      y: rect.y,
    });
  });

  return (
    <DragDropProvider
      onDragMove={({
        draggable: {
          id,
          layout: { x, y },
        },
      }) => {
        const _board = board();
        if (!_board) return;

        setEdgesPositions(
          produce(data => {
            const output = dimensions()[id].output;

            data[id] = {
              ...data[id],
              x0: x - output.x - _board.x + 6,
              y0: y - output.y - _board.y + 6,
            };
          }),
        );
      }}
      onDragEnd={({
        draggable: {
          id,
          layout: { left: x, top: y },
          node,
        },
      }) => {
        const _board = board();
        if (!_board) return;
        const position = service.context(ctx => {
          const node = ctx.data?.nodes[id];
          return node?.position;
        })();
        if (position) {
          const posX = x - _board.x + position.x;
          const posY = y - _board.y + position.y;
          const transform = `translate(${posX}px, ${posY}px)`;
          console.log('transform', '=>', transform);
          node.style.setProperty('transform', transform);
          service.send({
            type: 'MOVE',
            payload: {
              id: `${id}`,
              x: posX,
              y: posY,
            },
          });
        }
      }}
    >
      <DragDropSensors />
      <div
        ref={setRef}
        class='w-full h-full relative'
        onMouseDown={() => {
          service.send('DESELECT');
        }}
      >
        <For each={nodes()}>{node => <NodeComponent2 {...node} />}</For>
      </div>
    </DragDropProvider>
  );
};
