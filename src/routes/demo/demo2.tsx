import { createFileRoute } from '@tanstack/solid-router';
import { produce } from 'solid-js/store';
import { FlowContext } from '~/features/flow/ui/components/FlowChart.context';
import { FlowChart2 } from '~/features/flow/ui/components/FlowChart2';

export const Route = createFileRoute('/demo/demo2')({
  component: () => {
    const service = FlowContext.defaultValue.service;
    const [board] = FlowContext.defaultValue.board;
    const [dimensions] = FlowContext.defaultValue.dimensions;
    const [, setEdgesPositions] = FlowContext.defaultValue.edgesPositions;

    service.addOptions(({ voidAction }) => ({
      actions: {
        buildUI: voidAction(({ pContext: { edges } }) => {
          console.log('Building UI...');
          setEdgesPositions(
            produce(next => {
              edges?.forEach(({ from, id, to }) => {
                const output = dimensions()[from].output;
                const input = dimensions()[to].input;
                const _board = board();
                if (input && _board)
                  next[id] = {
                    x0: output.x - _board.x + 6,
                    y0: output.y - _board.y + 6,
                    x1: input.x - _board.x + 6,
                    y1: input.y - _board.y + 6,
                  };
              });
            }),
          );
        }),
      },
    }));
    return (
      <div class='w-full'>
        <FlowContext.Provider
          value={{ ...FlowContext.defaultValue, service }}
        >
          <FlowChart2 />
        </FlowContext.Provider>
      </div>
    );
  },
});
