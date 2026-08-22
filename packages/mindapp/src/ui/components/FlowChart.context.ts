import { interpret } from '@bemedev/app';
import { createSignal } from 'solid-js';

import { createContext } from '#helpers/createContext';
import { machine } from '#main-machine';
import {
  BOUNDS_CONSTRAINTS,
  PARENT_CHILD_GAP_WIDTH,
} from '#services/main.machine.data';
import { calculateDimensions } from '#services/main.machine.helpers';
import type { Point } from '#services/main.machine.typings';

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
      context: { zoom: 1, edgesPositions: {} },
      pContext: { generatedId: null, dimensions: {} },
    });

    service.start();

    // #region Helpers
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
     *
     * @see {@linkcode BOUNDS_CONSTRAINTS}
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
    // #endregion

    service.addOptions(({ assign }) => ({
      actions: {
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

        moveNewEdge: assign('context.newEdge', {
          MOVE_NEW_EDGE: ({ context: { newEdge }, payload }) => {
            if (!newEdge) return undefined;
            const { x: x1, y: y1 } = getBoardPoint(payload.x, payload.y);
            return { ...newEdge, x1, y1 };
          },
        }),
      },
    }));

    service.start();
    return { board, service };
  },
  { name: 'FlowContext' },
);
