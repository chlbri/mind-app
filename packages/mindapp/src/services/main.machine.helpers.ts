import {
  DEFAULT_INPUT_OFFSET,
  DEFAULT_SIZE,
  getDefaultInputOffset,
  getDefaultOutputOffset,
  HANDLE_CENTER_X_OFFSET,
} from './main.machine.data';
import type {
  Dimension,
  HandlePosition,
  NodeProps,
  Point,
  Vector,
} from './main.machine.typings';

/**
 * Computes the percentage offset along a node edge segment for a handle at the given
 * index.
 *
 * For a single handle (`total === 1`), returns `50` (exact center). For multiple
 * handles, partitions the edge into equal segments and places each handle at the
 * midpoint of its corresponding segment.
 *
 * @param index - Zero-based index of the handle along the side.
 * @param total - Total number of handles on this side.
 *
 * @returns The percentage position along the edge from `0` to `100`.
 */
export const getHandleOffsetPercent = (index: number, total: number): number => {
  if (total <= 0) return 50;
  return ((index + 0.5) / total) * 100;
};

/**
 * Constructs a unique edge identifier string from source and destination node IDs,
 * as well as the target handle position and index.
 *
 * @param out - The source node ID string.
 * @param _in - The destination node ID string.
 * @param position - The input handle position side (`top`, `right`, `bottom`,
 *   `left`), defaults to `'left'`.
 * @param index - The zero-based index of the input handle on that side, defaults to
 *   `0`.
 *
 * @returns Formatted edge identifier string.
 *
 * @see -- type {@linkcode HandlePosition}
 */
export const buildEdgeId = (
  out: string,
  _in: string,
  position: HandlePosition | string = 'left',
  index: number = 0,
) => {
  return `edge = ${out} => ${_in}:${position}:${index}`;
};

/**
 * Parses source, destination, handle position, and handle index encoded within an
 * edge identifier string (e.g. `edge = node-0 => node-1:top:2` or `node-0 =>
 * node-1`).
 *
 * @param id - The edge identifier string.
 *
 * @returns Object containing optional parsed fields `from`, `to`, `position`, and
 *   `index`.
 *
 * @see -- type {@linkcode HandlePosition}
 */
export const parseEdgeId = (
  id: string,
): { from?: string; to?: string; position?: HandlePosition; index?: number } => {
  const matchWithHandle = id.match(
    /^(?:edge\s*=\s*)?([^\s=>]+)\s*=>\s*([^:]+):([a-z]+):(\d+)$/,
  );
  if (matchWithHandle) {
    const from = matchWithHandle[1];
    const to = matchWithHandle[2];
    const pos = matchWithHandle[3] as HandlePosition;
    const idx = parseInt(matchWithHandle[4], 10);
    if (['top', 'right', 'bottom', 'left'].includes(pos) && !isNaN(idx)) {
      return { from, to, position: pos, index: idx };
    }
  }

  const matchLegacy = id.match(/^(?:edge\s*=\s*)?([^\s=>]+)\s*=>\s*([^:\s]+)$/);
  if (matchLegacy) {
    return { from: matchLegacy[1], to: matchLegacy[2] };
  }

  const matchHandleOnly = id.match(/:([a-z]+):(\d+)$/);
  if (matchHandleOnly) {
    const pos = matchHandleOnly[1] as HandlePosition;
    const idx = parseInt(matchHandleOnly[2], 10);
    if (['top', 'right', 'bottom', 'left'].includes(pos) && !isNaN(idx)) {
      return { position: pos, index: idx };
    }
  }

  return {};
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
 * Calculates absolute 2D canvas coordinates for a connection handle on a node.
 *
 * @param nodePosition - The node's top-left position coordinates of type
 *   {@linkcode Point}.
 * @param nodeSize - Width and height dimensions of the node.
 * @param side - Node container side of type {@linkcode HandlePosition}.
 * @param index - Zero-based index of the handle along that side, defaults to `0`.
 * @param total - Total number of handles on that side, defaults to `1`.
 *
 * @returns Absolute 2D coordinates of type {@linkcode Point} for the handle center.
 *
 * @see {@linkcode getHandleOffsetPercent}, {@linkcode HANDLE_CENTER_X_OFFSET}
 */
export const getHandlePosition = (
  nodePosition: Point,
  nodeSize: { width: number; height: number },
  side: HandlePosition = 'left',
  index = 0,
  total = 1,
): Point => {
  const count = Math.max(1, total);
  const clampedIdx = Math.min(Math.max(0, index), count - 1);
  const percent = getHandleOffsetPercent(clampedIdx, count) / 100;

  switch (side) {
    case 'top':
      return {
        x: nodePosition.x + nodeSize.width * percent,
        y: nodePosition.y - HANDLE_CENTER_X_OFFSET,
      };
    case 'bottom':
      return {
        x: nodePosition.x + nodeSize.width * percent,
        y: nodePosition.y + nodeSize.height + HANDLE_CENTER_X_OFFSET,
      };
    case 'left':
      return {
        x: nodePosition.x - HANDLE_CENTER_X_OFFSET,
        y: nodePosition.y + nodeSize.height * percent,
      };
    case 'right':
      return {
        x: nodePosition.x + nodeSize.width + HANDLE_CENTER_X_OFFSET,
        y: nodePosition.y + nodeSize.height * percent,
      };
  }
};

/**
 * Computes 2D vector coordinates (x0, y0, x1, y1) for an edge connecting source and
 * target nodes, resolving specific input and output handles.
 *
 * @param edge - Edge entity connecting source and target nodes.
 * @param nodes - List of node objects of type {@linkcode NodeProps}.
 * @param dimensions - Registry of node dimensions of type {@linkcode Dimension}.
 *
 * @returns Vector coordinates of type {@linkcode Vector} or `undefined` if nodes are
 *   missing.
 *
 * @see {@linkcode getHandlePosition}, {@linkcode parseEdgeId}, -- type {@linkcode HandlePosition}
 */
export const calculateEdgePosition = (
  edge: {
    id: string;
    from: string;
    to: string;
    fromPosition?: HandlePosition | string;
    fromIndex?: number;
    toPosition?: HandlePosition | string;
    toIndex?: number;
  },
  nodes: (NodeProps & { id: string })[] = [],
  dimensions: Record<string, Dimension> = {},
): Vector | undefined => {
  const fromNode = nodes.find(n => n.id === edge.from);
  const toNode = nodes.find(n => n.id === edge.to);
  const fromDim = dimensions[edge.from];
  const toDim = dimensions[edge.to];

  if (!fromDim || !toDim) return undefined;

  const fromPos = fromNode?.position ?? {
    x: fromDim.output.x - (fromDim.outputOffset?.x ?? fromDim.width),
    y: fromDim.output.y - (fromDim.outputOffset?.y ?? fromDim.height / 2),
  };
  const toPos = toNode?.position ?? {
    x: toDim.input?.x
      ? toDim.input.x - (toDim.inputOffset?.x ?? 0)
      : toDim.output.x - (toDim.outputOffset?.x ?? toDim.width),
    y: toDim.input?.y
      ? toDim.input.y - (toDim.inputOffset?.y ?? toDim.height / 2)
      : toDim.output.y - (toDim.outputOffset?.y ?? toDim.height / 2),
  };
  const fromSize = {
    width: fromDim.width ?? DEFAULT_SIZE.width,
    height: fromDim.height ?? DEFAULT_SIZE.height,
  };
  const toSize = {
    width: toDim.width ?? DEFAULT_SIZE.width,
    height: toDim.height ?? DEFAULT_SIZE.height,
  };

  // Resolve source (output) handle
  let fromSide: HandlePosition = (edge.fromPosition as HandlePosition) ?? 'right';
  let fromIndex = edge.fromIndex ?? 0;
  if (!edge.fromPosition && fromNode?.handles) {
    const sides: HandlePosition[] = ['right', 'bottom', 'top', 'left'];
    for (const s of sides) {
      const idx = fromNode.handles[s]?.findIndex(h => h.type === 'output');
      if (idx !== undefined && idx !== -1) {
        fromSide = s;
        fromIndex = idx;
        break;
      }
    }
  }
  const fromTotal = Math.max(
    fromNode?.handles?.[fromSide]?.length ?? 1,
    fromIndex + 1,
  );
  const p0 = getHandlePosition(fromPos, fromSize, fromSide, fromIndex, fromTotal);

  // Resolve target (input) handle
  const parsed = parseEdgeId(edge.id);
  let toSide: HandlePosition =
    (edge.toPosition as HandlePosition) ?? parsed.position ?? 'left';
  let toIndex = edge.toIndex ?? parsed.index ?? 0;
  if (!edge.toPosition && !parsed.position && toNode?.handles) {
    const sides: HandlePosition[] = ['left', 'top', 'bottom', 'right'];
    for (const s of sides) {
      const idx = toNode.handles[s]?.findIndex(h => h.type === 'input');
      if (idx !== undefined && idx !== -1) {
        toSide = s;
        toIndex = idx;
        break;
      }
    }
  }
  const toTotal = Math.max(toNode?.handles?.[toSide]?.length ?? 1, toIndex + 1);
  const p1 = getHandlePosition(toPos, toSize, toSide, toIndex, toTotal);

  return { x0: p0.x, y0: p0.y, x1: p1.x, y1: p1.y };
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
 * @see {@linkcode getDefaultOutputOffset}, {@linkcode getDefaultInputOffset}, {@linkcode DEFAULT_SIZE}
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
  const outputOffset =
    parentDimension.outputOffset ?? getDefaultOutputOffset(width, height);
  const inputOffset = parentDimension.inputOffset ?? getDefaultInputOffset(height);

  const output = { x: position.x + outputOffset.x, y: position.y + outputOffset.y };
  const input = { x: position.x + inputOffset.x, y: position.y + inputOffset.y };

  return { width, height, output, input, outputOffset, inputOffset };
};
