import { interpret } from '@bemedev/app';
import { dequal } from 'dequal/lite';
import { createSignal } from 'solid-js';
import { produce } from 'solid-js/store';
import { createContext } from '../../helpers/createContext';
import { machine } from '../../services/main.machine';
import type { Point, Vector } from '../../services/main.typings';
import {
  BOUNDS_CONSTRAINTS,
  DEFAULT_INPUT_OFFSET,
  getDefaultOutputOffset,
  PARENT_CHILD_GAP_WIDTH,
} from './FlowChart.data';

/** Layout dimensions and handle offset coordinates for a flowchart node. */
type Dimensions = {
  /** Node width in pixels. */
  width: number;
  /** Node height in pixels. */
  height: number;
  /** Output handle point coordinates of type {@linkcode Point}. */
  output: Point;
  /** Input handle point coordinates of type {@linkcode Point}. */
  input?: Point;
  /** Output handle relative offset point of type {@linkcode Point}. */
  outputOffset?: Point;
  /** Input handle relative offset point of type {@linkcode Point}. */
  inputOffset?: Point;
};

/** Connection edge coordinate representation between two endpoints. */
export type Edge = {
  /** Source node identifier. */
  from: string;
  /** Starting X-coordinate. */
  x0: number;
  /** Starting Y-coordinate. */
  y0: number;
  /** Ending X-coordinate. */
  x1: number;
  /** Ending Y-coordinate. */
  y1: number;
};

/**
 * Shared state machine interpreter service instance for flowchart state
 * management.
 */
const service = interpret(machine, {
  context: {},
  pContext: { generatedId: null },
});

/**
 * Solid Context Provider component and hook for accessing flowchart board
 * state, services, and zoom.
 */
export const [Provider, useFlow] = createContext(
  () => {
    const zoom = createSignal(1);
    const newEdge = createSignal<Edge>();
    const [boardRef, setBoardRef] = createSignal<HTMLDivElement>();

    const [dimensions, setDimensions] = createSignal<
      Record<string, Dimensions>
    >({}, { equals: dequal });

    const getBoardPoint = (clientX: number, clientY: number): Point => {
      const el = boardRef();
      if (!el) return { x: clientX, y: clientY };
      const rect = el.getBoundingClientRect();
      const currentZoom = zoom[0]();
      return {
        x: (clientX - rect.left) / currentZoom,
        y: (clientY - rect.top) / currentZoom,
      };
    };

    const [edgesPositions, setEdgesPositions] = createSignal<
      Record<string, Vector>
    >({}, { equals: false });

    const clampPosition = (
      x: number,
      y: number,
      nodeWidth = 192,
      nodeHeight = 50,
    ): Point => {
      const container = boardRef()?.parentElement;
      if (!container) return { x, y };
      const currentZoom = zoom[0]();

      const minX =
        container.scrollLeft / currentZoom + BOUNDS_CONSTRAINTS.horizontal;
      const maxX = Math.max(
        minX,
        (container.scrollLeft + container.clientWidth) / currentZoom -
          BOUNDS_CONSTRAINTS.horizontal -
          nodeWidth,
      );

      const minY =
        container.scrollTop / currentZoom + BOUNDS_CONSTRAINTS.vertical;
      const maxY = Math.max(
        minY,
        (container.scrollTop + container.clientHeight) / currentZoom -
          BOUNDS_CONSTRAINTS.vertical -
          nodeHeight,
      );

      return {
        x: Math.min(Math.max(x, minX), maxX),
        y: Math.min(Math.max(y, minY), maxY),
      };
    };

    service.addOptions(({ voidAction, batch, assign }) => ({
      actions: {
        placeChild: assign('context.data.nodes', {
          ADD_CHILD: ({
            payload,
            context: { data },
            pContext: { generatedId },
          }) => {
            const nodes = data?.nodes ?? [];
            if (!payload) return nodes;

            const parentNode = nodes.find(node => node.id === payload);
            if (!parentNode) return nodes;

            const id = `node-${generatedId}`;
            const width = dimensions()[payload]?.width ?? 0;
            const height = dimensions()[payload]?.height ?? 0;
            const initialX =
              parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;
            const initialY = parentNode.position.y;
            const position = clampPosition(
              initialX,
              initialY,
              width,
              height,
            );

            return [
              ...nodes,
              {
                id,
                data: { content: '<Nouveau nœud>' },
                input: true,
                position,
              },
            ];
          },
        }),

        placeParent: assign('context.data.nodes', {
          ADD_PARENT: ({
            context: { data },
            pContext: { generatedId },
          }) => {
            const nodes = data?.nodes ?? [];
            const id = `node-${generatedId}`;
            const container = boardRef()?.parentElement;
            const scrollLeft = container?.scrollLeft ?? 0;
            const scrollTop = container?.scrollTop ?? 0;
            const width = container?.clientWidth ?? 0;
            const height = container?.clientHeight ?? 0;
            const currentZoom = zoom[0]();
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
            const height = dimensions()[parentID]?.height ?? 0;
            const initialX =
              parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;
            const initialY = parentNode.position.y + 100;
            const position = clampPosition(
              initialX,
              initialY,
              width,
              height,
            );

            return [
              ...nodes,
              {
                id,
                data: { content: '<Nouveau nœud>' },
                input: true,
                position,
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
            MOVE: ({ context: { data }, payload }) => {
              const edges = data?.edges ?? [];

              setEdgesPositions(
                produce(next => {
                  edges?.forEach(({ from, to, id }) => {
                    if (from === payload.id) {
                      const offset =
                        dimensions()[payload.id]?.outputOffset ??
                        getDefaultOutputOffset(
                          dimensions()[payload.id]?.width,
                        );
                      const x0 = payload.x + offset.x;
                      const y0 = payload.y + offset.y;
                      next[id] = { ...next[id], x0, y0 };
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
                      const offset =
                        dimensions()[payload.id]?.inputOffset ??
                        DEFAULT_INPUT_OFFSET;
                      const x1 = payload.x + offset.x;
                      const y1 = payload.y + offset.y;
                      next[id] = { ...next[id], x1, y1 };
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
          MOVE_IMMEDIATE: ({ context: { data }, payload }) => {
            const edges = data?.edges ?? [];

            setEdgesPositions(
              produce(next => {
                edges?.forEach(({ from, to, id }) => {
                  if (from === payload.id) {
                    const offset =
                      dimensions()[payload.id]?.outputOffset ??
                      getDefaultOutputOffset(
                        dimensions()[payload.id]?.width,
                      );
                    const x0 = payload.x + offset.x;
                    const y0 = payload.y + offset.y;
                    next[id] = { ...next[id], x0, y0 };
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
                    const offset =
                      dimensions()[payload.id]?.inputOffset ??
                      DEFAULT_INPUT_OFFSET;
                    const x1 = payload.x + offset.x;
                    const y1 = payload.y + offset.y;
                    next[id] = { ...next[id], x1, y1 };
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
      getBoardPoint,
      edgesPositions: [edgesPositions, setEdgesPositions] as const,
      service,
      zoom,
    };
  },
  { name: 'FlowContext' },
);
