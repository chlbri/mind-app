import {
  DEFAULT_INPUT_OFFSET,
  DEFAULT_SIZE,
  getDefaultOutputOffset,
} from './main.machine.data';
import type { Dimension, Point } from './main.machine.typings';

/**
 * Constructs a unique edge identifier string from source and destination node IDs.
 *
 * @param out - The source node ID string.
 * @param _in - The destination node ID string.
 *
 * @returns Formatted edge identifier string.
 */
export const buildEdgeId = (out: string, _in: string) => {
  return `edge = ${out} => ${_in}`;
};

/**
 * Constructs a formatted node identifier string from a generated ID.
 *
 * @param generated - The generated unique ID string or `null`/`undefined`.
 *
 * @returns Formatted node identifier string.
 */
export const buildNodeID = (generated?: string | null) => {
  return `node-${generated}`;
};

/**
 * Calculates node dimensions, connection points, and handle offsets from position
 * and optional parent dimension.
 *
 * @param position - Node position in board coordinates of type {@linkcode Point}.
 * @param parentDimension - Optional parent node dimension of type
 *   {@linkcode Dimension} to inherit sizing and offsets from.
 *
 * @returns Node layout dimension object of type {@linkcode Dimension}.
 *
 * @see {@linkcode getDefaultOutputOffset}, {@linkcode DEFAULT_INPUT_OFFSET}, {@linkcode DEFAULT_SIZE}
 */
export const calculateDimensions = (
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
  const outputOffset = parentDimension.outputOffset ?? getDefaultOutputOffset(width);
  const inputOffset = parentDimension.inputOffset ?? DEFAULT_INPUT_OFFSET;

  const output = { x: position.x + outputOffset.x, y: position.y + outputOffset.y };
  const input = { x: position.x + inputOffset.x, y: position.y + inputOffset.y };

  return { width, height, output, input, outputOffset, inputOffset };
};
