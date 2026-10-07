import type { EdgeFabricComponent } from '@bemedev/mind-flow-fabric';
import { Rect, Text, type FabricObject } from 'fabric';

import { EDGES_COLORS } from '../constants';
import type { EdgeKind, StateMachineEdgeData } from '../types';

/**
 * Resolves the edge category from its data, falling back to the `on` category.
 *
 * @param data - Edge data of type {@linkcode StateMachineEdgeData}.
 *
 * @returns The edge category of type {@linkcode EdgeKind}.
 */
export const edgeKind = (data?: StateMachineEdgeData): EdgeKind => {
  return (data?.kind ?? 'on') as EdgeKind;
};

/**
 * Fabric renderer for `@bemedev/app` state machine edges.
 *
 * Recolors the edge path with the category color, applies the hierarchy dash
 * pattern, and returns a centered label badge describing the transitions.
 *
 * @param props - Edge entity, selection state and edge path of type
 *   `Edge<StateMachineEdgeData> & { id, selected, path }`.
 *
 * @see {@linkcode EDGES_COLORS}
 */
export const StateMachineEdgeFabric: EdgeFabricComponent<
  StateMachineEdgeData
> = props => {
  const { path, selected } = props;
  const data = (props.data ?? {}) as StateMachineEdgeData;
  const kind = edgeKind(data);
  const color = EDGES_COLORS[kind];
  const isHierarchy = kind === 'child_parent';

  path.set({
    stroke: selected ? '#f97316' : color,
    strokeWidth: selected ? 3 : 2,
    strokeDashArray: isHierarchy ? [6, 4] : undefined,
  });

  const label = data.label ?? `on: ${data.event ?? kind}`;
  if (!label) return [];

  const center = path.getCenterPoint();
  const fontSize = 10;
  const width = Math.max(28, label.length * 6 + 12);
  const height = fontSize + 8;

  const background = new Rect({
    left: center.x,
    top: center.y,
    width,
    height,
    rx: height / 2,
    ry: height / 2,
    originX: 'center',
    originY: 'center',
    fill: '#ffffff',
    stroke: color,
    strokeWidth: 1,
    selectable: false,
    evented: false,
    objectCaching: false,
  });

  const text = new Text(label, {
    left: center.x,
    top: center.y,
    originX: 'center',
    originY: 'center',
    fontSize,
    fontWeight: '600',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fill: color,
    selectable: false,
    evented: false,
    objectCaching: false,
  });

  const extras: FabricObject[] = [background, text];
  return extras;
};
