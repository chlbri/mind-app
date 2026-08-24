import { interpret } from '@bemedev/app';

import { createContext } from '#helpers/createContext';
import { machine } from '#main-machine';
import {
  BOUNDS_CONSTRAINTS,
  DEFAULT_INPUT_OFFSET,
  getDefaultOutputOffset,
  PARENT_CHILD_GAP_WIDTH,
} from '#services/main.machine.data';
import type { Dimension, Point } from '#services/main.machine.typings';

/**
 * Solid Context Provider component and hook for accessing flowchart board state,
 * services, and zoom.
 *
 * @see {@linkcode machine}, {@linkcode createContext}
 */
export const [Provider, useFlow] = createContext(
  () => {
    /** Shared service for flowchart state management. */
    const service = interpret(machine, {
      context: { zoom: 1, edgesPositions: {}, bounds: { x: 0, y: 0 } },
      pContext: {
        generatedId: null,
        dimensions: {},

        /**
         * Converts viewport screen coordinates to unscaled board coordinates.
         *
         * @param clientX - Client X coordinate in pixels.
         * @param clientY - Client Y coordinate in pixels.
         * @param el - Board layout details of type {@linkcode Board}.
         *
         * @returns Calculated 2D coordinate of type {@linkcode Point}.
         */
        getBoardPosition(clientX, clientY, el): Point {
          if (!el) return { x: clientX, y: clientY };
          const currentZoom = service.state.context.zoom;
          const x = (clientX - el.self.left) / currentZoom;
          const y = (clientY - el.self.top) / currentZoom;
          return { x, y };
        },

        /**
         * Clamps given coordinates within board boundaries.
         *
         * @param board - Board layout and container details of type
         *   {@linkcode Board}.
         * @param x - Desired X position in pixels.
         * @param y - Desired Y position in pixels.
         * @param nodeWidth - Node width in pixels, defaults to `192`.
         * @param nodeHeight - Node height in pixels, defaults to `50`.
         *
         * @returns Clamped coordinate of type {@linkcode Point}.
         *
         * @see {@linkcode BOUNDS_CONSTRAINTS}
         */
        clampPosition(board, x, y, nodeWidth = 192, nodeHeight = 50): Point {
          const container = board?.parent;
          if (!container) return { x, y };

          const currentZoom = service.state.context.zoom ?? 1;

          const minX =
            container.scrollLeft / currentZoom + BOUNDS_CONSTRAINTS.horizontal;

          const maxX = Math.max(
            minX,
            (container.scrollLeft + container.width) / currentZoom -
              BOUNDS_CONSTRAINTS.horizontal -
              nodeWidth,
          );

          const minY =
            container.scrollTop / currentZoom + BOUNDS_CONSTRAINTS.vertical;

          const maxY = Math.max(
            minY,
            (container.scrollTop + container.height) / currentZoom -
              BOUNDS_CONSTRAINTS.vertical -
              nodeHeight,
          );

          return {
            x: Math.min(Math.max(x, minX), maxX),
            y: Math.min(Math.max(y, minY), maxY),
          };
        },

        /**
         * Computes node dimension, connection points, and handle offsets.
         *
         * @param position - Node position of type {@linkcode Point}.
         * @param parentDimension - Optional sizing and offsets to inherit.
         *
         * @returns Calculated dimension object of type {@linkcode Dimension}.
         *
         * @see {@linkcode DEFAULT_INPUT_OFFSET}, {@linkcode getDefaultOutputOffset}
         */
        calculateDimensions: (
          position: Point,
          parentDimension: Pick<
            Dimension,
            'width' | 'height' | 'outputOffset' | 'inputOffset'
          > = { width: 192, height: 50, inputOffset: DEFAULT_INPUT_OFFSET },
        ): Dimension => {
          const width = parentDimension.width;
          const height = parentDimension.height;
          const outputOffset =
            parentDimension.outputOffset ?? getDefaultOutputOffset(width);
          const inputOffset = parentDimension.inputOffset!;

          const output = {
            x: position.x + outputOffset.x,
            y: position.y + outputOffset.y,
          };
          const input = {
            x: position.x + inputOffset.x,
            y: position.y + inputOffset.y,
          };

          return { width, height, output, input, outputOffset, inputOffset };
        },
      },
    });

    // #endregion

    service.addOptions(({ assign }) => ({
      actions: {
        placeChild: assign('data.nodes', {
          ADD_CHILD: ({ payload, context: { data, board }, pContext }) => {
            if (!board) return data?.nodes;
            const nodes = data?.nodes;
            if (!payload) return nodes;

            const parentNode = nodes?.find(node => node.id === payload);
            if (!parentNode) return nodes;

            const parentDimension = pContext.dimensions[payload];

            const id = `node-${pContext.generatedId}`;
            const width = parentDimension?.width ?? 192;
            const height = parentDimension?.height ?? 50;
            const initialX = parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;
            const initialY = parentNode.position.y;
            const position = pContext.clampPosition(
              board,
              initialX,
              initialY,
              width,
              height,
            );
            const dimension = pContext.calculateDimensions(
              position,
              parentDimension,
            );

            nodes?.push({
              id,
              data: { content: '<Nouveau nœud>' },
              input: true,
              position,
            });
            pContext.dimensions[id] = dimension;

            return nodes;
          },
        }),

        placeParent: assign('data.nodes', {
          ADD_PARENT: ({ context: { data, zoom = 1, board }, pContext }) => {
            if (!board) return data?.nodes;
            const nodes = data?.nodes;
            const id = `node-${pContext.generatedId}`;
            const container = board.parent;
            const scrollLeft = container?.scrollLeft ?? 0;
            const scrollTop = container?.scrollTop ?? 0;
            const width = container?.width ?? 0;
            const height = container?.height ?? 0;
            const currentZoom = zoom;
            const x = (scrollLeft + width / 2) / currentZoom;
            const y = (scrollTop + height / 2) / currentZoom;
            const position = pContext.clampPosition(board, x, y);
            const dimension = pContext.calculateDimensions(position);

            nodes?.push({
              id,
              data: { content: '<Nouveau nœud>' },
              input: false,
              position,
            });

            pContext.dimensions[id] = dimension;
            return nodes;
          },
        }),

        placeSibling: assign('data.nodes', {
          ADD_SIBLING: ({ payload, context: { data, board }, pContext }) => {
            if (!board) return data?.nodes;
            const edges = data?.edges;
            const nodes = data?.nodes;
            const parentID = edges?.find(edge => edge.to === payload)?.from;
            if (!parentID) return nodes;

            const parentNode = nodes?.find(node => node.id === parentID);
            if (!parentNode) return nodes;

            const parentDimension = pContext.dimensions[parentID];
            const id = `node-${pContext.generatedId}`;
            const width = parentDimension?.width ?? 192;
            const height = parentDimension?.height ?? 50;
            const initialX = parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;
            const initialY = parentNode.position.y + PARENT_CHILD_GAP_WIDTH;
            const position = pContext.clampPosition(
              board,
              initialX,
              initialY,
              width,
              height,
            );
            const dimension = pContext.calculateDimensions(
              position,
              parentDimension,
            );

            nodes?.push({
              id,
              data: { content: '<Nouveau nœud>' },
              input: true,
              position,
            });

            pContext.dimensions[id] = dimension;
            return nodes;
          },
        }),

        moveNewEdge: assign('newEdge', {
          MOVE_NEW_EDGE: ({ context: { newEdge, board }, payload, pContext }) => {
            if (!board) return undefined;
            if (!newEdge) return undefined;
            const { x: x1, y: y1 } = pContext.getBoardPosition(
              payload.x,
              payload.y,
              board,
            );
            return { ...newEdge, x1, y1 };
          },
        }),
      },
    }));

    service.start();
    return service;
  },
  { name: 'FlowContext' },
);
