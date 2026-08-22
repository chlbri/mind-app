import { interpret } from '@bemedev/app';
import { dequal } from 'dequal/lite';
import { createSignal } from 'solid-js';
import { produce } from 'solid-js/store';

import { createContext } from '../../helpers/createContext';
import { machine } from '../../services/main.machine';
import type { Point } from '../../services/main.typings';
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

/**
 * Solid Context Provider component and hook for accessing flowchart board state,
 * services, and zoom.
 */
export const [Provider, useFlow] = createContext(
  () => {
    /**
     * Shared state machine interpreter service instance for flowchart state
     * management.
     */
    const service = interpret(machine, {
      context: { zoom: 1, edgesPositions: {} },
      pContext: { generatedId: null, dimensions: {} },
    });

    service.start();

    const [boardRef, setBoardRef] = createSignal<HTMLDivElement>();

    const [dimensions, setDimensions] = createSignal<Record<string, Dimensions>>(
      {},
      { equals: dequal },
    );

    /**
     * Converts client viewport coordinates to board canvas coordinates adjusted for
     * zoom and scroll.
     *
     * @param clientX - Viewport horizontal coordinate.
     * @param clientY - Viewport vertical coordinate.
     *
     * @returns Board coordinate point of type {@linkcode Point}.
     */
    const getBoardPoint = (clientX: number, clientY: number): Point => {
      const el = boardRef();
      if (!el) return { x: clientX, y: clientY };

      const rect = el.getBoundingClientRect();
      const currentZoom = service.state.context.zoom;
      const x = (clientX - rect.left) / currentZoom;
      const y = (clientY - rect.top) / currentZoom;
      return { x, y };
    };

    /**
     * Clamps node coordinates within the visible container boundaries.
     *
     * @param x - Desired horizontal X coordinate.
     * @param y - Desired vertical Y coordinate.
     * @param nodeWidth - Width of the node element in pixels, defaults to `192`.
     * @param nodeHeight - Height of the node element in pixels, defaults to `50`.
     *
     * @returns Clamped coordinate point of type {@linkcode Point}.
     */
    const clampPosition = (
      x: number,
      y: number,
      nodeWidth = 192,
      nodeHeight = 50,
    ): Point => {
      const container = boardRef()?.parentElement;
      if (!container) return { x, y };

      const currentZoom = service.state.context.zoom ?? 1;

      const minX =
        container.scrollLeft / currentZoom + BOUNDS_CONSTRAINTS.horizontal;

      const maxX = Math.max(
        minX,
        (container.scrollLeft + container.clientWidth) / currentZoom -
          BOUNDS_CONSTRAINTS.horizontal -
          nodeWidth,
      );

      const minY = container.scrollTop / currentZoom + BOUNDS_CONSTRAINTS.vertical;

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

    service.addOptions(({ batch, assign }) => ({
      actions: {
        placeChild: assign('context.data.nodes', {
          ADD_CHILD: ({ payload, context: { data }, pContext: { generatedId } }) => {
            const nodes = data?.nodes ?? [];
            if (!payload) return nodes;

            const parentNode = nodes.find(node => node.id === payload);
            if (!parentNode) return nodes;

            const id = `node-${generatedId}`;
            const width = dimensions()[payload]?.width ?? 0;
            const height = dimensions()[payload]?.height ?? 0;
            const initialX = parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;
            const initialY = parentNode.position.y;
            const position = clampPosition(initialX, initialY, width, height);

            return [
              ...nodes,
              { id, data: { content: '<Nouveau nœud>' }, input: true, position },
            ];
          },
        }),

        placeParent: assign('context.data.nodes', {
          ADD_PARENT: ({
            context: { data, zoom = 1 },
            pContext: { generatedId },
          }) => {
            const nodes = data?.nodes ?? [];
            const id = `node-${generatedId}`;
            const container = boardRef()?.parentElement;
            const scrollLeft = container?.scrollLeft ?? 0;
            const scrollTop = container?.scrollTop ?? 0;
            const width = container?.clientWidth ?? 0;
            const height = container?.clientHeight ?? 0;
            const currentZoom = zoom;
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
            const initialX = parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;
            const initialY = parentNode.position.y + 100;
            const position = clampPosition(initialX, initialY, width, height);

            return [
              ...nodes,
              { id, data: { content: '<Nouveau nœud>' }, input: true, position },
            ];
          },
        }),

        buildUI: batch(
          assign('context.edgesPositions', {
            else: ({ context: { data, edgesPositions } }) => {
              const edges = data?.edges ?? [];
              edgesPositions = {};

              edges.forEach(({ from, id, to }) => {
                const output = dimensions()[from]?.output;
                const input = dimensions()[to]?.input;

                if (output && input) {
                  edgesPositions[id] = {
                    x0: output.x,
                    y0: output.y,
                    x1: input.x,
                    y1: input.y,
                  };
                } else {
                  delete edgesPositions[id];
                }
              });

              return edgesPositions;
            },
            MOVE: ({ context: { data, edgesPositions }, payload }) => {
              const edges = data?.edges ?? [];
              // const next: Record<string, Vector> = { ...edgesPositions };

              edges.forEach(({ from, to, id }) => {
                if (from === payload.id) {
                  const offset =
                    dimensions()[payload.id]?.outputOffset ??
                    getDefaultOutputOffset(dimensions()[payload.id]?.width);

                  const x = payload.x + offset.x;
                  const y = payload.y + offset.y;
                  edgesPositions[id].x0 = x;
                  edgesPositions[id].y0 = y;

                  setDimensions(
                    produce(data => {
                      if (data[payload.id]) data[payload.id].output = { x, y };
                    }),
                  );
                }
                if (to === payload.id) {
                  const offset =
                    dimensions()[payload.id]?.inputOffset ?? DEFAULT_INPUT_OFFSET;

                  const x = payload.x + offset.x;
                  const y = payload.y + offset.y;
                  edgesPositions[id].x1 = x;
                  edgesPositions[id].y1 = y;

                  setDimensions(
                    produce(data => {
                      if (data[payload.id]) data[payload.id].input = { x, y };
                    }),
                  );
                }
              });

              return edgesPositions;
            },
          }),

          assign('context.updatingUI', () => true),
        ),

        buildImmediateUI: assign('context.edgesPositions', {
          MOVE_IMMEDIATE: ({ context: { data, edgesPositions = {} }, payload }) => {
            const edges = data?.edges ?? [];

            edges.forEach(({ from, to, id }) => {
              if (from === payload.id) {
                const offset =
                  dimensions()[payload.id]?.outputOffset ??
                  getDefaultOutputOffset(dimensions()[payload.id]?.width);

                const x0 = payload.x + offset.x;
                const y0 = payload.y + offset.y;
                edgesPositions[id].x0 = x0;
                edgesPositions[id].y0 = y0;

                setDimensions(
                  produce(data => {
                    if (data[payload.id]) {
                      data[payload.id].output.x = x0;
                      data[payload.id].output.y = y0;
                    }
                  }),
                );
              }

              if (to === payload.id) {
                const offset =
                  dimensions()[payload.id]?.inputOffset ?? DEFAULT_INPUT_OFFSET;

                const x1 = payload.x + offset.x;
                const y1 = payload.y + offset.y;
                edgesPositions[id].x1 = x1;
                edgesPositions[id].y1 = y1;

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

            return edgesPositions;
          },
        }),
      },
    }));

    service.start();

    return {
      dimensions: [dimensions, setDimensions] as const,
      board: [boardRef, setBoardRef] as const,
      getBoardPoint,
      service,
      // clampPosition,
    };
  },
  { name: 'FlowContext' },
);
