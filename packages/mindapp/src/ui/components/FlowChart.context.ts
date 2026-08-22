import { interpret } from '@bemedev/app';
import { createSignal } from 'solid-js';

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
 * Calculates node dimensions, connection points, and handle offsets from position
 * and optional parent dimension.
 *
 * @param position - Node position in board coordinates of type {@linkcode Point}.
 * @param parentDimension - Optional parent node dimension to inherit sizing and
 *   offsets from.
 *
 * @returns Node layout dimension object.
 */
const calculateDimensions = (
  position: Point,
  parentDimension: Pick<
    Dimensions,
    'width' | 'height' | 'outputOffset' | 'inputOffset'
  > = { width: 192, height: 50, inputOffset: DEFAULT_INPUT_OFFSET },
): Dimensions => {
  const width = parentDimension.width;
  const height = parentDimension.height;
  const outputOffset = parentDimension.outputOffset ?? getDefaultOutputOffset(width);
  const inputOffset = parentDimension.inputOffset!;

  const output = { x: position.x + outputOffset.x, y: position.y + outputOffset.y };
  const input = { x: position.x + inputOffset.x, y: position.y + inputOffset.y };

  return { width, height, output, input, outputOffset, inputOffset };
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

    const board = createSignal<HTMLDivElement>();

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
      const el = board[0]();
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
      const container = board[0]()?.parentElement;
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
        configure: batch(
          assign('context.data', { CONFIGURE: ({ payload }) => payload }),
          assign('context.newEdge', () => undefined),
          assign('context.updatingUI', () => false),
          assign('context.zoom', () => 1),
          assign('pContext.generatedId', () => null),
          assign('pContext.previousZoom', () => undefined),

          assign('pContext.dimensions', {
            CONFIGURE: ({ payload: { nodes }, pContext: { dimensions } }) => {
              nodes.forEach(({ id, position }) => {
                dimensions[id] = calculateDimensions(position);
              });

              return dimensions;
            },
          }),
        ),

        placeChild: assign(['context.data.nodes', 'pContext.dimensions'], {
          ADD_CHILD: ({
            payload,
            context: { data },
            pContext: { generatedId, dimensions },
          }) => {
            const nodes = data?.nodes;
            if (!payload) return [nodes, dimensions];

            const parentNode = nodes?.find(node => node.id === payload);
            if (!parentNode) return [nodes, dimensions];

            const parentDimension = dimensions[payload];

            const id = `node-${generatedId}`;
            const width = parentDimension?.width ?? 192;
            const height = parentDimension?.height ?? 50;
            const initialX = parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;
            const initialY = parentNode.position.y;
            const position = clampPosition(initialX, initialY, width, height);

            const dimension = calculateDimensions(position, parentDimension);

            nodes?.push({
              id,
              data: { content: '<Nouveau nœud>' },
              input: true,
              position,
            });
            dimensions[id] = dimension;

            return [nodes, dimensions] as const;
          },
        }),

        placeParent: assign(['context.data.nodes', 'pContext.dimensions'], {
          ADD_PARENT: ({
            context: { data, zoom = 1 },
            pContext: { generatedId, dimensions },
          }) => {
            const nodes = data?.nodes;
            const id = `node-${generatedId}`;
            const container = board[0]()?.parentElement;
            const scrollLeft = container?.scrollLeft ?? 0;
            const scrollTop = container?.scrollTop ?? 0;
            const width = container?.clientWidth ?? 0;
            const height = container?.clientHeight ?? 0;
            const currentZoom = zoom;
            const x = (scrollLeft + width / 2) / currentZoom;
            const y = (scrollTop + height / 2) / currentZoom;
            const position = clampPosition(x, y);
            const dimension = calculateDimensions(position);

            nodes?.push({
              id,
              data: { content: '<Nouveau nœud>' },
              input: false,
              position,
            });

            dimensions[id] = dimension;
            return [nodes, dimensions];
          },
        }),

        placeSibling: assign(['context.data.nodes', 'pContext.dimensions'], {
          ADD_SIBLING: ({
            payload,
            context: { data },
            pContext: { generatedId, dimensions },
          }) => {
            const edges = data?.edges;
            const nodes = data?.nodes;
            const parentID = edges?.find(edge => edge.to === payload)?.from;
            if (!parentID) return [nodes, dimensions];

            const parentNode = nodes?.find(node => node.id === parentID);
            if (!parentNode) return [nodes, dimensions];

            const parentDimension = dimensions[parentID];
            const id = `node-${generatedId}`;
            const width = parentDimension?.width ?? 192;
            const height = parentDimension?.height ?? 50;
            const initialX = parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;
            const initialY = parentNode.position.y + PARENT_CHILD_GAP_WIDTH;
            const position = clampPosition(initialX, initialY, width, height);
            const dimension = calculateDimensions(position, parentDimension);

            nodes?.push({
              id,
              data: { content: '<Nouveau nœud>' },
              input: true,
              position,
            });

            dimensions[id] = dimension;
            return [nodes, dimensions];
          },
        }),

        startNewEdge: assign('context.newEdge', {
          START_NEW_EDGE: ({ payload: from, pContext: { dimensions } }) => {
            const { x, y } = dimensions[from].output;
            return { from, x0: x, y0: y, x1: x, y1: y };
          },
        }),

        buildUI: batch(
          assign(['context.edgesPositions', 'pContext.dimensions'], {
            MOVE: ({
              context: { data, edgesPositions },
              payload,
              pContext: { dimensions },
            }) => {
              const edges = data?.edges;
              const dimension = dimensions[payload.id];

              const outputOffset =
                dimension?.outputOffset ?? getDefaultOutputOffset(dimension?.width);

              const inputOffset = dimension?.inputOffset ?? DEFAULT_INPUT_OFFSET;

              const output = {
                x: payload.x + outputOffset.x,
                y: payload.y + outputOffset.y,
              };

              const input = {
                x: payload.x + inputOffset.x,
                y: payload.y + inputOffset.y,
              };

              if (dimension) {
                dimension.output = output;
                dimension.input = input;
              }

              edges?.forEach(({ from, to, id }) => {
                if (from === payload.id) {
                  edgesPositions[id].x0 = output.x;
                  edgesPositions[id].y0 = output.y;
                }
                if (to === payload.id) {
                  edgesPositions[id].x1 = input.x;
                  edgesPositions[id].y1 = input.y;
                }
              });

              return [edgesPositions, dimensions];
            },
            else: ({
              context: { data, edgesPositions },
              pContext: { dimensions },
            }) => {
              const edges = data?.edges ?? [];
              edgesPositions = {};

              edges.forEach(({ from, id, to }) => {
                const output = dimensions[from]?.output;
                const input = dimensions[to]?.input;

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

              return [edgesPositions, dimensions];
            },
          }),

          assign('context.updatingUI', () => true),
        ),

        moveNewEdge: assign('context.newEdge', {
          MOVE_NEW_EDGE: ({ context: { newEdge }, payload }) => {
            if (!newEdge) return undefined;
            const { x: x1, y: y1 } = getBoardPoint(payload.x, payload.y);
            return { ...newEdge, x1, y1 };
          },
        }),

        buildImmediateUI: assign(['context.edgesPositions', 'pContext.dimensions'], {
          MOVE_IMMEDIATE: ({
            context: { data, edgesPositions },
            payload,
            pContext: { dimensions },
          }) => {
            const edges = data?.edges;

            edges?.forEach(({ from, to, id }) => {
              if (from === payload.id) {
                const dimension = dimensions[payload.id];
                const offset =
                  dimension?.outputOffset ??
                  getDefaultOutputOffset(dimension?.width);

                const x0 = payload.x + offset.x;
                const y0 = payload.y + offset.y;
                edgesPositions[id].x0 = x0;
                edgesPositions[id].y0 = y0;

                if (dimension) {
                  dimension.output.x = x0;
                  dimension.output.y = y0;
                }
              }

              if (to === payload.id) {
                const dimension = dimensions[payload.id];
                const offset = dimension?.inputOffset ?? DEFAULT_INPUT_OFFSET;

                const x1 = payload.x + offset.x;
                const y1 = payload.y + offset.y;
                edgesPositions[id].x1 = x1;
                edgesPositions[id].y1 = y1;

                if (dimension) {
                  dimension.input = { x: x1, y: y1 };
                }
              }
            });

            return [edgesPositions, dimensions];
          },
        }),
      },
    }));

    service.start();

    return {
      board,
      service,
      // clampPosition,
    };
  },
  { name: 'FlowContext' },
);
