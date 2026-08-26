import type { NodeProps } from './main.machine.typings';

/** Horizontal gap in pixels between a parent node and newly created child node. */
export const PARENT_CHILD_GAP_WIDTH = 100;

// #region Node & Handle Layout Constants & Formulas
/** Default width and height dimensions for newly created flowchart nodes. */
export const DEFAULT_SIZE = { width: 192, height: 50 } as const;

/** Default node width in pixels. */
export const DEFAULT_NODE_WIDTH = DEFAULT_SIZE.width;

/** Default node height in pixels. */
export const DEFAULT_NODE_HEIGHT = DEFAULT_SIZE.height;

/** Default node data payload applied when creating new nodes. */
export const DEFAULT_DATA = { content: '<Nouveau nœud>' };

/** Border width in pixels for a node container. */
export const NODE_BORDER_WIDTH = 1.5;

/** Diameter in pixels of a node connection handle. */
export const HANDLE_SIZE = 12;

/** Radius in pixels of a node connection handle. */
export const HANDLE_RADIUS = HANDLE_SIZE / 2;

/** Top margin in pixels for positioning connection handles. */
export const HANDLE_MARGIN_TOP = 12;

/** Horizontal container offset in pixels for handle placement. */
export const HANDLE_CONTAINER_OFFSET_X = 18;

/** Y-axis center coordinate in pixels of a handle. */
export const HANDLE_CENTER_Y = HANDLE_MARGIN_TOP + HANDLE_RADIUS;

/** X-axis center offset in pixels from the node container edge. */
export const HANDLE_CENTER_X_OFFSET =
  HANDLE_CONTAINER_OFFSET_X - NODE_BORDER_WIDTH - HANDLE_RADIUS;

/** Default X offset in pixels for input connection handles. */
export const DEFAULT_INPUT_OFFSET_X = -HANDLE_CENTER_X_OFFSET;

/** Default Y offset in pixels for input connection handles. */
export const DEFAULT_INPUT_OFFSET_Y = HANDLE_CENTER_Y;

/** Default 2D offset coordinates for input connection handles. */
export const DEFAULT_INPUT_OFFSET = {
  x: DEFAULT_INPUT_OFFSET_X,
  y: DEFAULT_INPUT_OFFSET_Y,
};

/** Dimensions representing width and height of the flow chart container canvas. */
export const CONTAINER_DIMENSIONS = { WIDTH: 5000, HEIGHT: 3500 };

/**
 * Computes default output handle offset coordinates given a node width.
 *
 * @param width - Node width in pixels, defaults to `0`.
 *
 * @returns 2D offset coordinates for the output handle.
 *
 * @see {@linkcode HANDLE_CENTER_X_OFFSET}, {@linkcode HANDLE_CENTER_Y}
 */
export const getDefaultOutputOffset = (width = 0) => ({
  x: width + HANDLE_CENTER_X_OFFSET,
  y: HANDLE_CENTER_Y,
});

/** Top offset in pixels for node action toolbars. */
export const TOOLBAR_TOP_OFFSET = 30;

/** Safety buffer in pixels applied above the toolbar. */
export const TOOLBAR_BUFFER = 5;

/**
 * Boundary padding constraints for node dragging and positioning within the
 * viewport.
 */
export const BOUNDS_CONSTRAINTS = { horizontal: 55, vertical: 40 };

/** Multiplier factor used to compute canvas virtual scroll dimensions. */
export const CANVAS_FACTOR = 5;

/** Multiplier factor used to compute canvas scroll dimensions. */
export const SCROLL_MULTIPLIER = 3;
// #endregion

/**
 * Default node items of type {@linkcode NodeProps} provided when no initial
 * configuration is given.
 */
export const DEFAULT_NODES: (NodeProps & { id: string })[] = [
  {
    id: 'node-0',
    data: { content: 'Some text', label: 'Root node' },
    input: false,
    position: { x: 350, y: 100 },
  },
];
