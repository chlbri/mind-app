import type { NodeProps } from "./FlowChart";

export const PARENT_CHILD_GAP_WIDTH = 100;

// #region Node & Handle Layout Constants & Formulas
export const NODE_BORDER_WIDTH = 1.5;

export const HANDLE_SIZE = 12;
export const HANDLE_RADIUS = HANDLE_SIZE / 2;
export const HANDLE_MARGIN_TOP = 12;
export const HANDLE_CONTAINER_OFFSET_X = 18;

export const HANDLE_CENTER_Y = HANDLE_MARGIN_TOP + HANDLE_RADIUS;
export const HANDLE_CENTER_X_OFFSET = HANDLE_CONTAINER_OFFSET_X - NODE_BORDER_WIDTH - HANDLE_RADIUS;

export const DEFAULT_INPUT_OFFSET_X = -HANDLE_CENTER_X_OFFSET;
export const DEFAULT_INPUT_OFFSET_Y = HANDLE_CENTER_Y;

export const DEFAULT_INPUT_OFFSET = {
  x: DEFAULT_INPUT_OFFSET_X,
  y: DEFAULT_INPUT_OFFSET_Y,
};

export const CONTAINER_DIMENSIONS = {
  WIDTH: 5000,
  HEIGHT: 3500,
};

export const getDefaultOutputOffset = (width = 0) => ({
  x: width + HANDLE_CENTER_X_OFFSET,
  y: HANDLE_CENTER_Y,
});

export const TOOLBAR_TOP_OFFSET = 30;
export const TOOLBAR_BUFFER = 5;

export const BOUNDS_CONSTRAINTS = {
  horizontal: HANDLE_CONTAINER_OFFSET_X + 2,
  vertical: TOOLBAR_TOP_OFFSET + TOOLBAR_BUFFER,
};

export const CANVAS_FACTOR = 4;
// #endregion

export const DEFAULT_NODES: (NodeProps & { id: string })[] = [
  {
    id: "node-0",
    data: {
      content: "Some text",
      label: "Root node",
    },
    input: false,
    position: {
      x: 350,
      y: 100,
    },
  },
];
