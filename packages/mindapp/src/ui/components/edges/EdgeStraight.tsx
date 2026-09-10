import { FactoryEdge } from './EdgeFactory';

/**
 * SVG edge component rendering straight lines and delete interaction handles for
 * node connections.
 *
 * @returns The rendered SVG JSX elements.
 *
 * @see {@linkcode FactoryEdge}
 */
export const EdgeStraight = FactoryEdge({
  draw: vector => {
    if (!vector) return '';
    const { x0, y0, x1, y1 } = vector;
    return `M ${x0} ${y0} L ${x1} ${y1}`;
  },
});
