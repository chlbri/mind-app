import { DEFAULT_SIZE, type NodeFabricComponent } from '@bemedev/mind-flow-fabric';
import { Circle, Rect, Text, type FabricObject } from 'fabric';

import { PRINCIPAL_NODE_KEY } from '../constants';
import { monoLength } from '../helpers';
import type { StateMachineNodeData } from '../types';

/** Node background colors indexed by state classification. */
export const STATE_FILLS = {
  atomic: '#f0f9ff',
  compound: '#faf5ff',
  parallel: '#fffbeb',
  final: '#f0fdf4',
} as const;

/** Node border colors indexed by state classification. */
export const STATE_STROKES = {
  atomic: '#0ea5e9',
  compound: '#a855f7',
  parallel: '#f59e0b',
  final: '#22c55e',
} as const;

/** Node text colors indexed by state classification. */
export const STATE_TEXT = {
  atomic: '#075985',
  compound: '#6b21a8',
  parallel: '#92400e',
  final: '#166534',
} as const;

/**
 * Resolves the visual palette of a state node from its classification.
 *
 * @param data - State machine node data of type {@linkcode StateMachineNodeData}.
 *
 * @returns The fill, stroke and text colors of the state type.
 */
export const statePalette = (data: StateMachineNodeData) => {
  const type = data.stateType as keyof typeof STATE_FILLS;
  return {
    fill: STATE_FILLS[type] ?? STATE_FILLS.atomic,
    stroke: STATE_STROKES[type] ?? STATE_STROKES.atomic,
    text: STATE_TEXT[type] ?? STATE_TEXT.atomic,
  };
};

/**
 * Creates a rounded badge pill with its centered label.
 *
 * @param options - Badge options with the text, colors and offset position.
 *
 * @returns The badge fabric objects.
 */
const createBadge = (options: {
  /** Badge text content. */
  text: string;
  /** Badge background color. */
  background: string;
  /** Badge text color. */
  color: string;
  /** Badge left offset in pixels. */
  left: number;
  /** Badge top offset in pixels. */
  top: number;
  /** Badge font size in pixels, defaults to `9`. */
  fontSize?: number;
}): FabricObject[] => {
  const { text, background, color, left, top, fontSize = 9 } = options;
  const width = Math.max(34, monoLength(text) + 14);
  const height = fontSize + 7;

  const rect = new Rect({
    left,
    top,
    width,
    height,
    rx: height / 2,
    ry: height / 2,
    fill: background,
    selectable: false,
    evented: false,
    objectCaching: false,
  });

  const label = new Text(text, {
    left: left + width / 2,
    top: top + height / 2,
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

  return [rect, label];
};

/**
 * Fabric renderer for `@bemedev/app` state machine nodes.
 *
 * Restyles the node body and label with the state classification palette, and
 * returns fabric badges: the state type pill at the top-right, an initial marker on
 * the left and an actor count bubble at the bottom-right. The principal node is
 * rendered with an emphasized border.
 *
 * @param props - Node entity, selection state, node rectangle and label of type
 *   `NodeProps<StateMachineNodeData> & { id, selected, rect, label }`.
 *
 * @see {@linkcode createBadge}, {@linkcode statePalette}
 */
export const StateMachineNodeFabric: NodeFabricComponent<
  StateMachineNodeData
> = props => {
  const { id, selected, rect, label } = props;
  const data = (props.data ?? {}) as StateMachineNodeData;
  const isPrincipal = id === PRINCIPAL_NODE_KEY || Boolean((data as any).principal);
  const palette = statePalette(data);
  const width = rect.width ?? DEFAULT_SIZE.width;
  const height = rect.height ?? DEFAULT_SIZE.height;

  rect.set({
    fill: selected ? '#fff7ed' : palette.fill,
    stroke: selected ? '#f97316' : palette.stroke,
    strokeWidth: selected ? 2.5 : isPrincipal ? 2 : 1.5,
    rx: 8,
    ry: 8,
  });

  label.set({
    fill: selected ? '#9a3412' : palette.text,
    fontWeight: isPrincipal ? '700' : '600',
  });

  const extras: FabricObject[] = [];

  extras.push(
    ...createBadge({
      text: String(data.stateType ?? 'atomic'),
      background: palette.stroke,
      color: '#ffffff',
      left: width - 62,
      top: -9,
    }),
  );

  if (data.isInitial) {
    const dot = new Circle({
      left: -7,
      top: height / 2,
      radius: 5,
      originX: 'center',
      originY: 'center',
      fill: '#10b981',
      stroke: '#ffffff',
      strokeWidth: 1.5,
      selectable: false,
      evented: false,
      objectCaching: false,
    });
    extras.push(dot);
  }

  const actorCount = data.actors?.length ?? 0;
  if (actorCount > 0) {
    const bubble = new Circle({
      left: width - 2,
      top: height - 2,
      radius: 10,
      originX: 'center',
      originY: 'center',
      fill: '#ec4899',
      stroke: '#ffffff',
      strokeWidth: 1.5,
      selectable: false,
      evented: false,
      objectCaching: false,
    });

    const count = new Text(String(actorCount), {
      left: width - 2,
      top: height - 2,
      originX: 'center',
      originY: 'center',
      fontSize: 10,
      fontWeight: '700',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fill: '#ffffff',
      selectable: false,
      evented: false,
      objectCaching: false,
    });

    extras.push(bubble, count);
  }

  return extras;
};
