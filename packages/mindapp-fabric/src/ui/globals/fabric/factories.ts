import { Circle, Path, Rect, Textbox, type FabricObject } from 'fabric';

import {
  DEFAULT_SIZE,
  HANDLE_SIZE,
  NODE_BORDER_WIDTH,
} from '#services/main.machine.data';
import type { Data } from '#services/main.machine.typings';

/** Canvas colors of the default flowchart theme. */
export const FABRIC_COLORS = {
  background: '#ffffff',
  grid: '#b8b8b8',
  node: '#ffffff',
  nodeStroke: '#9ca3af',
  nodeSelected: '#f97316',
  label: '#1f2937',
  handle: '#e38b29',
  edge: '#64748b',
  edgeSelected: '#f97316',
  preview: '#f97316',
} as const;

/** Options driving the creation of a node body rectangle. */
export type NodeRectOptions = {
  /** Node identifier, stored for hit-testing. */
  id: string;
  /** Left position in board coordinates. */
  left: number;
  /** Top position in board coordinates. */
  top: number;
  /** Rectangle width in pixels, defaults to `DEFAULT_SIZE.width`. */
  width?: number;
  /** Rectangle height in pixels, defaults to `DEFAULT_SIZE.height`. */
  height?: number;
  /** Fill color, defaults to `FABRIC_COLORS.node`. */
  fill?: string;
  /** Stroke color, defaults to `FABRIC_COLORS.nodeStroke`. */
  stroke?: string;
};

/**
 * Creates the draggable node body rectangle.
 *
 * @param options - Rectangle options of type {@linkcode NodeRectOptions}.
 *
 * @returns The node rectangle of type `Rect`.
 */
export const createNodeRect = (options: NodeRectOptions): Rect => {
  const {
    id,
    left,
    top,
    width = DEFAULT_SIZE.width,
    height = DEFAULT_SIZE.height,
    fill = FABRIC_COLORS.node,
    stroke = FABRIC_COLORS.nodeStroke,
  } = options;

  const rect = new Rect({
    left,
    top,
    width,
    height,
    rx: 8,
    ry: 8,
    fill,
    stroke,
    strokeWidth: NODE_BORDER_WIDTH,
    strokeUniform: true,
    hasControls: false,
    hasBorders: false,
    objectCaching: false,
    hoverCursor: 'move',
  });

  rect.set({ nodeId: id } as any);
  return rect;
};

/**
 * Creates the centered node label textbox.
 *
 * @param options - Label options with the node identifier, text, and geometry.
 *
 * @returns The node label of type `Textbox`.
 */
export const createNodeLabel = (options: {
  /** Node identifier, stored for hit-testing. */
  id: string;
  /** Label text content. */
  text: string;
  /** Left position in board coordinates. */
  left: number;
  /** Top position in board coordinates. */
  top: number;
  /** Textbox width in pixels. */
  width: number;
  /** Optional fill color, defaults to `FABRIC_COLORS.label`. */
  fill?: string;
}): Textbox => {
  const { id, text, left, top, width, fill = FABRIC_COLORS.label } = options;

  const label = new Textbox(text, {
    left,
    top,
    width,
    originX: 'center',
    originY: 'center',
    fontSize: 13,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontWeight: '600',
    textAlign: 'center',
    fill,
    splitByGrapheme: false,
    selectable: false,
    evented: false,
    objectCaching: false,
  });

  label.set({ nodeId: id } as any);
  return label;
};

/**
 * Creates a connection handle bubble.
 *
 * @param options - Handle options with the node identifier, side, index and type.
 *
 * @returns The handle circle of type `Circle`.
 */
export const createHandleCircle = (options: {
  /** Node identifier owning the handle. */
  id: string;
  /** Handle side of the node. */
  side: string;
  /** Zero-based index of the handle along its side. */
  index: number;
  /** Handle classification. */
  type: string;
  /** Left position in board coordinates. */
  left: number;
  /** Top position in board coordinates. */
  top: number;
  /** Optional fill color, defaults to `FABRIC_COLORS.handle`. */
  color?: string;
}): Circle => {
  const { id, side, index, type, left, top, color } = options;

  const circle = new Circle({
    left,
    top,
    radius: HANDLE_SIZE / 2,
    originX: 'center',
    originY: 'center',
    fill: color ?? FABRIC_COLORS.handle,
    stroke: '#ffffff',
    strokeWidth: 1.5,
    strokeUniform: true,
    selectable: false,
    hasControls: false,
    hasBorders: false,
    objectCaching: false,
    hoverCursor: type === 'output' ? 'crosshair' : 'default',
  });

  circle.set({
    nodeId: id,
    handleSide: side,
    handleIndex: index,
    handleType: type,
  } as any);
  return circle;
};

/**
 * Creates an edge path.
 *
 * @param options - Edge options with the path data and styling.
 *
 * @returns The edge path of type `Path`.
 */
export const createEdgePath = (options: {
  /** Edge identifier, stored for hit-testing. */
  id: string;
  /** SVG path data string. */
  data: string;
  /** Optional stroke color, defaults to `FABRIC_COLORS.edge`. */
  stroke?: string;
  /** Optional stroke dash pattern. */
  strokeDashArray?: number[] | undefined;
}): Path => {
  const {
    id,
    data,
    stroke = FABRIC_COLORS.edge,
    strokeDashArray = undefined,
  } = options;

  const path = new Path(data, {
    fill: '',
    stroke,
    strokeWidth: 2,
    strokeUniform: true,
    strokeLineCap: 'round',
    strokeDashArray,
    selectable: false,
    evented: false,
    objectCaching: false,
  });

  path.set({ edgeId: id } as any);
  return path;
};

/**
 * Creates the dashed preview path following the pointer during an edge drag.
 *
 * @param data - SVG path data string.
 *
 * @returns The preview path of type `Path`.
 */
export const createPreviewPath = (data: string): Path => {
  return new Path(data, {
    fill: '',
    stroke: FABRIC_COLORS.preview,
    strokeWidth: 2,
    strokeDashArray: [6, 4],
    strokeLineCap: 'round',
    selectable: false,
    evented: false,
    objectCaching: false,
  });
};

/**
 * Creates the dotted grid background path.
 *
 * @param data - SVG path data string of the grid dots.
 *
 * @returns The grid path of type `Path`.
 */
export const createGridPath = (data: string): Path => {
  return new Path(data, {
    fill: '',
    stroke: FABRIC_COLORS.grid,
    strokeWidth: 2,
    strokeLineCap: 'round',
    selectable: false,
    evented: false,
    objectCaching: false,
    opacity: 0.75,
  });
};
/**
 * Applies the selection visual state to a node body and label.
 *
 * @param rect - Node rectangle of type `Rect`.
 * @param label - Node label of type `Textbox`.
 * @param selected - Whether the node is selected.
 */
export const setNodeSelected = (
  rect: Rect,
  label: Textbox,
  selected: boolean,
): void => {
  rect.set({
    stroke: selected ? FABRIC_COLORS.nodeSelected : FABRIC_COLORS.nodeStroke,
    strokeWidth: selected ? 2.5 : NODE_BORDER_WIDTH,
    fill: selected ? '#fff7ed' : FABRIC_COLORS.node,
  });
  label.set({ fill: selected ? '#9a3412' : FABRIC_COLORS.label });
};

/**
 * Applies the selection visual state to an edge path.
 *
 * @param path - Edge path of type `Path`.
 * @param selected - Whether the edge is selected.
 */
export const setEdgeSelected = (path: Path, selected: boolean): void => {
  path.set({
    stroke: selected ? FABRIC_COLORS.edgeSelected : FABRIC_COLORS.edge,
    strokeWidth: selected ? 3 : 2,
  });
};

/**
 * Resolves the display label of a node from its data dictionary.
 *
 * @param data - Node data dictionary of type {@linkcode Data}.
 * @param fallback - Fallback text, usually the node identifier.
 *
 * @returns The resolved label text.
 */
export const labelOf = (data: Data | undefined, fallback: string): string => {
  if (!data) return fallback;
  const candidate = data.label ?? data.title ?? data.content ?? data.text;
  if (candidate === undefined || candidate === null) return fallback;
  const text = String(candidate).trim();
  return text.length > 0 ? text : fallback;
};

/**
 * Disposes a fabric object, releasing its cache.
 *
 * @param object - Fabric object of type `FabricObject` to dispose.
 */
export const disposeFabricObject = (object: FabricObject): void => {
  const candidate = object as unknown as { dispose?: () => void };
  candidate.dispose?.();
};
