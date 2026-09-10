import { FactoryEdge } from './EdgeFactory';

/**
 * Computes bezier curve control point offset based on horizontal distance.
 *
 * @param value - Absolute horizontal delta between start and end points.
 *
 * @returns Offset distance in pixels for bezier curvature.
 */
const calculateOffset = (value: number) => value * 0.5;

/**
 * SVG edge component rendering bezier curves and delete interaction handles for node
 * connections.
 *
 * @returns The rendered SVG JSX elements.
 *
 * @see {@linkcode FactoryEdge}
 */
export const EdgeCursive = FactoryEdge({
  draw: vector => {
    if (!vector) return '';
    const { x0, y0, x1, y1 } = vector;
    return `M ${x0} ${y0} C ${x0 + calculateOffset(Math.abs(x1 - x0))} ${y0}, ${x1 - calculateOffset(Math.abs(x1 - x0))} ${y1}, ${x1} ${y1}`;
  },
});
