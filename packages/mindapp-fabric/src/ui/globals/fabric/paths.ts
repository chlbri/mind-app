import type { Point, Vector } from '#services/main.machine.typings';

/** Options driving the SVG path generation of an edge. */
export type EdgePathOptions = {
  /** Whether the edge is drawn as a straight line instead of a curve. */
  straight?: boolean;
  /** Minimum curvature offset in pixels, defaults to `40`. */
  curvature?: number;
};

/**
 * Builds the SVG path data of an edge connecting two handle points.
 *
 * Horizontal connections curve along the X axis, vertical connections curve along
 * the Y axis, and diagonal connections blend both, producing the cursive look of the
 * canvas edges.
 *
 * @param vector - Edge coordinates `(x0, y0, x1, y1)` of type {@linkcode Vector}.
 * @param options - Path options of type {@linkcode EdgePathOptions}.
 *
 * @returns The SVG path data string.
 */
export const edgePathData = (
  vector: Vector,
  options: EdgePathOptions = {},
): string => {
  const { x0, y0, x1, y1 } = vector;
  const { straight = false, curvature = 40 } = options;

  if (straight) {
    return `M ${x0} ${y0} L ${x1} ${y1}`;
  }

  const dx = x1 - x0;
  const dy = y1 - y0;
  const horizontal = Math.abs(dx) >= Math.abs(dy);
  const offset = Math.max(curvature, Math.abs(horizontal ? dx : dy) * 0.5);

  if (horizontal) {
    const sign = dx >= 0 ? 1 : -1;
    const c1x = x0 + offset * sign;
    const c2x = x1 - offset * sign;
    return `M ${x0} ${y0} C ${c1x} ${y0}, ${c2x} ${y1}, ${x1} ${y1}`;
  }

  const sign = dy >= 0 ? 1 : -1;
  const c1y = y0 + offset * sign;
  const c2y = y1 - offset * sign;
  return `M ${x0} ${y0} C ${x0} ${c1y}, ${x1} ${c2y}, ${x1} ${y1}`;
};

/**
 * Builds the SVG path data of the dashed preview edge following the pointer.
 *
 * @param from - Source handle point of type {@linkcode Point}.
 * @param to - Current pointer point of type {@linkcode Point}.
 *
 * @returns The SVG path data string.
 */
export const previewPathData = (from: Point, to: Point): string => {
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
};

/**
 * Builds the SVG path data of the dashed dot-grid background pattern.
 *
 * @param width - Canvas width in pixels.
 * @param height - Canvas height in pixels.
 * @param spacing - Grid spacing in pixels, defaults to `30`.
 *
 * @returns The SVG path data string of the grid dots.
 */
export const gridPathData = (
  width: number,
  height: number,
  spacing = 30,
): string => {
  const parts: string[] = [];

  for (let x = spacing; x < width; x += spacing) {
    for (let y = spacing; y < height; y += spacing) {
      parts.push(`M ${x} ${y} l 0.01 0`);
    }
  }

  return parts.join(' ');
};
