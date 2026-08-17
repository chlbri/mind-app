import { interpret } from "@bemedev/app";
import { dequal } from "dequal/lite";
import { createSignal } from "solid-js";
import { produce } from "solid-js/store";
import { createContext } from "../../helpers/createContext";
import { machine } from "../../services/main.machine";
import type { Point, Vector } from "../../services/main.typings";
import { PARENT_CHILD_GAP_WIDTH } from "./FlowChart.data";

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

const service = interpret(machine, {
  context: {},
  pContext: { generatedId: null },
});

export const [Provider, useFlow] = createContext(
  () => {
    const [dimensions, setDimensions] = createSignal<Record<string, Dimensions>>(
      {},
      {
        equals: dequal,
      },
    );

    const newEdge = createSignal<Edge>();
    const board = createSignal<Point>();

    const [edgesPositions, setEdgesPositions] = createSignal<Record<string, Vector>>(
      {},
      { equals: false },
    );

    service.addOptions(({ voidAction, batch, assign }) => ({
      actions: {
        placeChild: assign("context.data.nodes", {
          ADD_CHILD: (params) => {
            const payload = params?.payload;
            const nodes = params?.context?.data?.nodes ?? [];
            const generatedId = params?.pContext?.generatedId;
            if (!payload) return nodes;

            const parentNode = nodes.find((node) => node.id === payload);
            if (!parentNode) return nodes;

            const id = `node-${generatedId}`;
            const width = dimensions()[payload]?.width ?? 0;
            const x = parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;

            return [
              ...nodes,
              {
                id,
                data: { content: "<Nouveau nœud>" },
                input: true,
                position: { x, y: parentNode.position.y },
              },
            ];
          },
        }),

        placeSibling: assign("context.data.nodes", {
          ADD_SIBLING: (params) => {
            const payload = params?.payload;
            const nodes = params?.context?.data?.nodes ?? [];
            const edges = params?.context?.data?.edges ?? [];
            const generatedId = params?.pContext?.generatedId;

            const parentID = edges.find((edge) => edge.to === payload)?.from;
            if (!parentID) return nodes;

            const parentNode = nodes.find((node) => node.id === parentID);
            if (!parentNode) return nodes;

            const id = `node-${generatedId}`;
            const width = dimensions()[parentID]?.width ?? 0;
            const x = parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;

            return [
              ...nodes,
              {
                id,
                data: { content: "<Nouveau nœud>" },
                input: true,
                position: { x, y: parentNode.position.y + 100 },
              },
            ];
          },
        }),

        buildUI: batch(
          voidAction((params) => {
            const edges = params?.context?.data?.edges;
            setEdgesPositions((data) => {
              const array = Object.entries({ ...data }).filter(([id]) => {
                return edges?.some((edge) => edge.id === id);
              });

              return Object.fromEntries(array);
            });
          }),
          voidAction({
            else: (params) => {
              const edges = params?.context?.data?.edges;
              setEdgesPositions(
                produce((next) => {
                  edges?.forEach(({ from, id, to }) => {
                    const output = dimensions()[from]?.output;
                    const input = dimensions()[to]?.input;
                    const _board = board[0]();
                    if (output && input && _board)
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
            MOVE: (params) => {
              const edges = params?.context?.data?.edges;
              const payload = params?.payload;
              if (!payload) return;

              setEdgesPositions(
                produce((next) => {
                  edges?.forEach(({ from, to, id }) => {
                    if (from === payload.id) {
                      const width = dimensions()[payload.id].width;
                      const x0 = payload.x + width + 4.5;
                      const y0 = payload.y + 13.5;
                      const _board = board[0]();
                      next[id] = {
                        ...next[id],
                        x0,
                        y0,
                      };
                      setDimensions(
                        produce((data) => {
                          if (data[payload.id]) {
                            data[payload.id] = {
                              ...data[payload.id],
                              output: {
                                x: x0 + (_board?.x ?? 0),
                                y: y0 + (_board?.y ?? 0),
                              },
                            };
                          }
                        }),
                      );
                    }
                    if (to === payload.id) {
                      const x1 = payload.x - 15;
                      const y1 = payload.y + 13.5;
                      const _board = board[0]();
                      next[id] = {
                        ...next[id],
                        x1,
                        y1,
                      };
                      setDimensions(
                        produce((data) => {
                          if (data[payload.id]) {
                            data[payload.id] = {
                              ...data[payload.id],
                              input: {
                                x: x1 + (_board?.x ?? 0),
                                y: y1 + (_board?.y ?? 0),
                              },
                            };
                          }
                        }),
                      );
                    }
                  });
                }),
              );
            },
          }),
          assign("context.updatingUI", () => true),
        ),

        buildImmediateUI: voidAction({
          MOVE_IMMEDIATE: (params) => {
            const edges = params?.context?.data?.edges;
            const payload = params?.payload;
            if (!payload) return;

            setEdgesPositions(
              produce((next) => {
                edges?.forEach(({ from, to, id }) => {
                  if (from === payload.id) {
                    const width = dimensions()[payload.id]?.width ?? 0;
                    const x0 = payload.x + width + 4.5;
                    const y0 = payload.y + 13.5;
                    const _board = board[0]();
                    next[id] = {
                      ...next[id],
                      x0,
                      y0,
                    };
                    setDimensions(
                      produce((data) => {
                        if (data[payload.id]) {
                          data[payload.id] = {
                            ...data[payload.id],
                            output: {
                              x: x0 + (_board?.x ?? 0),
                              y: y0 + (_board?.y ?? 0),
                            },
                          };
                        }
                      }),
                    );
                  }
                  if (to === payload.id) {
                    const x1 = payload.x - 15;
                    const y1 = payload.y + 13.5;
                    const _board = board[0]();
                    next[id] = {
                      ...next[id],
                      x1,
                      y1,
                    };
                    setDimensions(
                      produce((data) => {
                        if (data[payload.id]) {
                          data[payload.id] = {
                            ...data[payload.id],
                            input: {
                              x: x1 + (_board?.x ?? 0),
                              y: y1 + (_board?.y ?? 0),
                            },
                          };
                        }
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

    service.start();

    return {
      dimensions: [dimensions, setDimensions] as const,
      newEdge,
      board,
      edgesPositions: [edgesPositions, setEdgesPositions] as const,
      service,
    };
  },
  { name: "FlowContext" },
);
