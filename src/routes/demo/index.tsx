import { createFileRoute } from '@tanstack/solid-router';
import { produce } from 'solid-js/store';
import { FlowContext } from '~/features/flow/ui/components/FlowChart.context';
import { FlowChart2 } from '~/features/flow/ui/components/FlowChart2';

export const Route = createFileRoute('/demo/')({
  component: () => {
    const service = FlowContext.defaultValue.service;
    const [board] = FlowContext.defaultValue.board;
    const [dimensions, setDimensions] =
      FlowContext.defaultValue.dimensions;
    const [, setEdgesPositions] = FlowContext.defaultValue.edgesPositions;

    service.addOptions(({ voidAction, batch, assign }) => ({
      actions: {
        // setDimensions: voidAction(() => {}),
        buildUI: batch(
          voidAction(({ pContext: { edges } }) => {
            setEdgesPositions(data => {
              const array = Object.entries({ ...data }).filter(([id]) => {
                return edges?.some(edge => edge.id === id);
              });

              return Object.fromEntries(array);
            });
          }),
          voidAction({
            else: ({ pContext: { edges } }) => {
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
            },
            MOVE: ({ pContext: { edges }, payload }) => {
              setEdgesPositions(
                produce(next => {
                  edges?.forEach(({ from, to, id }) => {
                    if (from === payload.id) {
                      const width = dimensions()[payload.id].width;
                      const x0 = payload.x + width + 9;
                      const y0 = payload.y + 19.5;
                      next[id] = {
                        ...next[id],
                        x0,
                        y0,
                      };
                      setDimensions(
                        produce(data => {
                          data[payload.id] = {
                            ...data[payload.id],
                            output: {
                              x: x0,
                              y: y0,
                            },
                          };
                        }),
                      );
                    }
                    if (to === payload.id) {
                      const x1 = payload.x - 9;
                      const y1 = payload.y + 19.5;
                      next[id] = {
                        ...next[id],
                        x1,
                        y1,
                      };
                      setDimensions(
                        produce(data => {
                          data[payload.id] = {
                            ...data[payload.id],
                            input: {
                              x: x1,
                              y: y1,
                            },
                          };
                        }),
                      );
                    }
                  });
                }),
              );
            },
          }),
          assign('context.updatingUI', () => true),
        ),

        buildImmediateUI: voidAction({
          MOVE_IMMEDIATE: ({ pContext: { edges }, payload }) => {
            setEdgesPositions(
              produce(next => {
                edges?.forEach(({ from, to, id }) => {
                  if (from === payload.id) {
                    const width = dimensions()[payload.id].width;
                    const x0 = payload.x + width + 4;
                    const y0 = payload.y + 16.5;
                    next[id] = {
                      ...next[id],
                      x0,
                      y0,
                    };
                    setDimensions(
                      produce(data => {
                        data[payload.id] = {
                          ...data[payload.id],
                          output: {
                            x: x0,
                            y: y0,
                          },
                        };
                      }),
                    );
                  }
                  if (to === payload.id) {
                    const x1 = payload.x - 15;
                    const y1 = payload.y + 13.5;
                    next[id] = {
                      ...next[id],
                      x1,
                      y1,
                    };
                    setDimensions(
                      produce(data => {
                        data[payload.id] = {
                          ...data[payload.id],
                          input: {
                            x: x1,
                            y: y1,
                          },
                        };
                      }),
                    );
                  }
                });
              }),
            );
          },
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
