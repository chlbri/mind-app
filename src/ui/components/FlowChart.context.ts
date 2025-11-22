import { createContext } from '../../helpers/createContext';
import { dequal } from 'dequal/lite';
import { createSignal } from 'solid-js';
import { produce } from 'solid-js/store';
import { buildService } from '../../services/main';
import { machine } from '../../services/main.machine';
import type { Point, Vector } from '../../services/main.types';
import { PARENT_CHILD_GAP_WIDTH } from './FlowChart.data';

type Dimensions = {
  width: number;
  height: number;
  output: Point;
  input?: Point;
};

export type Edge = {
  from: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
};

export const [Provider, useFlow] = createContext(
  () => {
    const [dimensions, setDimensions] = createSignal<
      Record<string, Dimensions>
    >(
      {},
      {
        equals: dequal,
      },
    );

    const newEdge = createSignal<Edge>();
    const board = createSignal<Point>();

    const [edgesPositions, setEdgesPositions] = createSignal<
      Record<string, Vector>
    >({}, { equals: false });

    const _machine = machine.provideOptions(
      ({ voidAction, batch, assign }) => ({
        actions: {
          placeChild: assign('context.data.nodes', {
            ADD_CHILD: ({
              payload,
              context: { data },
              pContext: { generatedId },
            }) => {
              const out = { ...data?.nodes };
              const parentNode = out[payload];
              const id = `node-${generatedId}`;
              const width = dimensions()[payload].width;

              const x =
                parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;

              out[id] = {
                data: { content: '<Nouveau nœud>' },
                input: true,
                position: { x, y: parentNode.position.y },
              };

              return out;
            },
          }),

          placeSibling: assign('context.data.nodes', {
            ADD_SIBLING: ({
              payload,
              context: { data },
              pContext: { edges, generatedId },
            }) => {
              const out = { ...data?.nodes };

              const parentID = edges?.find(
                edge => edge.to === payload,
              )?.from;

              if (!parentID) return out;

              const parentNode = out[parentID];
              const id = `node-${generatedId}`;
              const width = dimensions()[parentID].width;

              const x =
                parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;

              out[id] = {
                data: { content: '<Nouveau nœud>' },
                input: true,
                position: { x, y: parentNode.position.y + 100 },
              };

              return out;
            },
          }),

          buildUI: batch(
            voidAction(({ pContext: { edges } }) => {
              setEdgesPositions(data => {
                const array = Object.entries({ ...data }).filter(
                  ([id]) => {
                    return edges?.some(edge => edge.id === id);
                  },
                );

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
                      const _board = board[0]();
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
      }),
    );

    const service = buildService(_machine);

    return {
      dimensions: [dimensions, setDimensions] as const,
      newEdge,
      board,
      edgesPositions: [edgesPositions, setEdgesPositions] as const,
      service,
    };
  },
  { name: 'FlowContext' },
);
