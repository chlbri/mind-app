import { interpret } from '@bemedev/app';

import { clamp } from '#helpers/clamp';
import { createContext } from '#helpers/createContext';
import { machine } from '#main-machine';
import {
  BOUNDS_CONSTRAINTS,
  DEFAULT_INPUT_OFFSET,
  DEFAULT_SIZE,
  getDefaultOutputOffset,
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
        getBoardPosition: (clientX, clientY, el): Point => {
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
         * @param nodeWidth - Node width in pixels, defaults to `DEFAULT_SIZE.width`.
         * @param nodeHeight - Node height in pixels, defaults to
         *   `DEFAULT_SIZE.height`.
         *
         * @returns Clamped coordinate of type {@linkcode Point}.
         *
         * @see {@linkcode BOUNDS_CONSTRAINTS}, {@linkcode DEFAULT_SIZE}
         */
        clampPosition: (
          board,
          x,
          y,
          nodeWidth = DEFAULT_SIZE.width,
          nodeHeight = DEFAULT_SIZE.height,
        ): Point => {
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

          return { x: clamp(x, minX, maxX), y: clamp(y, minY, maxY) };
        },

        /**
         * Computes node dimension, connection points, and handle offsets.
         *
         * @param position - Node position of type {@linkcode Point}.
         * @param parentDimension - Optional sizing and offsets to inherit.
         *
         * @returns Calculated dimension object of type {@linkcode Dimension}.
         *
         * @see {@linkcode DEFAULT_INPUT_OFFSET}, {@linkcode getDefaultOutputOffset}, {@linkcode DEFAULT_SIZE}
         */
        calculateDimensions: (
          position: Point,
          parentDimension: Pick<
            Dimension,
            'width' | 'height' | 'outputOffset' | 'inputOffset'
          > = {
            width: DEFAULT_SIZE.width,
            height: DEFAULT_SIZE.height,
            inputOffset: DEFAULT_INPUT_OFFSET,
          },
        ): Dimension => {
          const width = parentDimension.width;
          const height = parentDimension.height;
          const outputOffset =
            parentDimension.outputOffset ?? getDefaultOutputOffset(width);
          const inputOffset = parentDimension.inputOffset ?? DEFAULT_INPUT_OFFSET;

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

    service.start();
    return service;
  },
  { name: 'FlowContext' },
);
