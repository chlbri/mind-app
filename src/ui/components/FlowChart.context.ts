import { interpret } from '@bemedev/app';
import { dequal } from 'dequal/lite';
import { createSignal } from 'solid-js';
import { produce } from 'solid-js/store';
import { createContext } from '../../helpers/createContext';
import { machine } from '../../services/main.machine';
import type { Point, Vector } from '../../services/main.typings';
import { PARENT_CHILD_GAP_WIDTH } from './FlowChart.data';

type Dimensions = {
  width: number;
  height: number;
  output: Point;
  input?: Point;
  outputOffset?: Point;
  inputOffset?: Point;
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
    const [dimensions, setDimensions] = createSignal<
      Record<string, Dimensions>
    >(
      {},
      {
        equals: dequal,
      },
    );

    const newEdge = createSignal<Edge>();
    const [boardRef, setBoardRef] = createSignal<HTMLDivElement>();
    const [zoom, setZoom] = createSignal(1);

    const getBoardPoint = (clientX: number, clientY: number): Point => {
      const el = boardRef();
      if (!el) return { x: clientX, y: clientY };
      const rect = el.getBoundingClientRect();
      const currentZoom = zoom();
      return {
        x: (clientX - rect.left) / currentZoom,
        y: (clientY - rect.top) / currentZoom,
      };
    };

    const [edgesPositions, setEdgesPositions] = createSignal<
      Record<string, Vector>
    >({}, { equals: false });

    service.addOptions(({ voidAction, batch, assign }) => ({
      actions: {
        placeChild: assign('context.data.nodes', {
          ADD_CHILD: params => {
            const payload = params?.payload;
            const nodes = params?.context?.data?.nodes ?? [];
            const generatedId = params?.pContext?.generatedId;
            if (!payload) return nodes;

            const parentNode = nodes.find(node => node.id === payload);
            if (!parentNode) return nodes;

            const id = `node-${generatedId}`;
            const width = dimensions()[payload]?.width ?? 0;
            const x =
              parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;

            return [
              ...nodes,
              {
                id,
                data: { content: '<Nouveau nœud>' },
                input: true,
                position: { x, y: parentNode.position.y },
              },
            ];
          },
        }),

        placeParent: assign('context.data.nodes', {
          ADD_PARENT: params => {
            const nodes = params?.context?.data?.nodes ?? [];
            const generatedId = params?.pContext?.generatedId;
            const id = `node-${generatedId}`;
            const container = boardRef()?.parentElement;
            const scrollLeft = container?.scrollLeft ?? 0;
            const scrollTop = container?.scrollTop ?? 0;
            const width = container?.clientWidth ?? 0;
            const height = container?.clientHeight ?? 0;
            const currentZoom = zoom();
            const x = (scrollLeft + width / 2) / currentZoom;
            const y = (scrollTop + height / 2) / currentZoom;

            return [
              ...nodes,
              {
                id,
                data: { content: '<Nouveau nœud>' },
                input: false,
                position: { x, y },
              },
            ];
          },
        }),

        placeSibling: assign('context.data.nodes', {
          ADD_SIBLING: ({
            payload,
            context: { data },
            pContext: { generatedId },
          }) => {
            const edges = data?.edges ?? [];
            const nodes = data?.nodes ?? [];

            const parentID = edges.find(edge => edge.to === payload)?.from;
            if (!parentID) return nodes;

            const parentNode = nodes.find(node => node.id === parentID);
            if (!parentNode) return nodes;

            const id = `node-${generatedId}`;
            const width = dimensions()[parentID]?.width ?? 0;
            const x =
              parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;

            return [
              ...nodes,
              {
                id,
                data: { content: '<Nouveau nœud>' },
                input: true,
                position: { x, y: parentNode.position.y + 100 },
              },
            ];
          },
        }),

        buildUI: batch(
          voidAction(({ context: { data } }) => {
            const edges = data?.edges ?? [];
            setEdgesPositions(data => {
              const array = Object.entries({ ...data }).filter(([id]) => {
                return edges?.some(edge => edge.id === id);
              });

              return Object.fromEntries(array);
            });
          }),
          voidAction({
            else: ({ context: { data } }) => {
              const edges = data?.edges ?? [];
              setEdgesPositions(
                produce(next => {
                  edges?.forEach(({ from, id, to }) => {
                    const output = dimensions()[from]?.output;
                    const input = dimensions()[to]?.input;
                    if (output && input) {
                      next[id] = {
                        x0: output.x,
                        y0: output.y,
                        x1: input.x,
                        y1: input.y,
                      };
                    }
                  });
                }),
              );
            },
            MOVE: params => {
              const edges = params?.context?.data?.edges;
              const payload = params?.payload;
              if (!payload) return;

              setEdgesPositions(
                produce(next => {
                  edges?.forEach(({ from, to, id }) => {
                    if (from === payload.id) {
                      const offset = dimensions()[payload.id]
                        ?.outputOffset ?? {
                        x: (dimensions()[payload.id]?.width ?? 0) + 10.5,
                        y: 18,
                      };
                      const x0 = payload.x + offset.x;
                      const y0 = payload.y + offset.y;
                      next[id] = {
                        ...next[id],
                        x0,
                        y0,
                      };
                      setDimensions(
                        produce(data => {
                          if (data[payload.id]) {
                            data[payload.id] = {
                              ...data[payload.id],
                              output: { x: x0, y: y0 },
                            };
                          }
                        }),
                      );
                    }
                    if (to === payload.id) {
                      const offset = dimensions()[payload.id]
                        ?.inputOffset ?? {
                        x: -10.5,
                        y: 18,
                      };
                      const x1 = payload.x + offset.x;
                      const y1 = payload.y + offset.y;
                      next[id] = {
                        ...next[id],
                        x1,
                        y1,
                      };
                      setDimensions(
                        produce(data => {
                          if (data[payload.id]) {
                            data[payload.id] = {
                              ...data[payload.id],
                              input: { x: x1, y: y1 },
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
          assign('context.updatingUI', () => true),
        ),

        buildImmediateUI: voidAction({
          MOVE_IMMEDIATE: params => {
            const edges = params?.context?.data?.edges;
            const payload = params?.payload;
            if (!payload) return;

            setEdgesPositions(
              produce(next => {
                edges?.forEach(({ from, to, id }) => {
                  if (from === payload.id) {
                    const offset = dimensions()[payload.id]
                      ?.outputOffset ?? {
                      x: (dimensions()[payload.id]?.width ?? 0) + 10.5,
                      y: 18,
                    };
                    const x0 = payload.x + offset.x;
                    const y0 = payload.y + offset.y;
                    next[id] = {
                      ...next[id],
                      x0,
                      y0,
                    };
                    setDimensions(
                      produce(data => {
                        if (data[payload.id]) {
                          data[payload.id] = {
                            ...data[payload.id],
                            output: { x: x0, y: y0 },
                          };
                        }
                      }),
                    );
                  }
                  if (to === payload.id) {
                    const offset = dimensions()[payload.id]
                      ?.inputOffset ?? {
                      x: -10.5,
                      y: 18,
                    };
                    const x1 = payload.x + offset.x;
                    const y1 = payload.y + offset.y;
                    next[id] = {
                      ...next[id],
                      x1,
                      y1,
                    };
                    setDimensions(
                      produce(data => {
                        if (data[payload.id]) {
                          data[payload.id] = {
                            ...data[payload.id],
                            input: { x: x1, y: y1 },
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
      board: [boardRef, setBoardRef] as const,
      zoom: [zoom, setZoom] as const,
      getBoardPoint,
      edgesPositions: [edgesPositions, setEdgesPositions] as const,
      service,
    };
  },
  { name: 'FlowContext' },
);
