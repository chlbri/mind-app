import type { NOmit } from '@bemedev/app/bemedev';
import { deepEqual } from '@bemedev/app/utils';
import { TinyColor } from '@ctrl/tinycolor';

import type { Data } from '#services/main.machine.typings';

import type { EdgeProps } from './types';

/**
 * Hook providing reactive state and computed properties for an SVG edge component.
 *
 * @template | {@linkcode Data} `E` - Type of the custom data associated with the
 *   edge.
 *
 * @param props - Edge properties excluding `middle`, typed with type
 *   {@linkcode NOmit}.
 *
 * @returns An object containing reactive edge states, colors, handlers, and the flow
 *   service.
 */
export const useEdge = <E extends Data = Data>(
  props: NOmit<EdgeProps<E>, 'middle'>,
) => {
  const { hooks, send } = props.flow;

  /** Reactive vector coordinates of the edge, or of the ongoing preview. */
  const vector = hooks.state({
    selector: ({ context: { newEdge, edgesPositions, data } }) => {
      if (props.isNew && newEdge) {
        const color = data?.nodes?.find(({ id }) => id === newEdge.from)?.handles?.[
          newEdge.fromPosition
        ]?.[newEdge.fromIndex]?.color;

        return { ...newEdge, color };
      }

      return edgesPositions[props.id];
    },
    equals: deepEqual<any>,
  });

  /** Tells whether this edge is the currently selected one. */
  const selected = hooks.state({ selector: s => s.context.selected === props.id });

  /** Reactive custom data attached to the edge. */
  const edgeData = hooks.state({
    selector: ({ context }) => {
      if (props.data) return props.data;
      const edge = context.data?.edges?.find(e => e.id === props.id);
      return edge?.data as E | undefined;
    },

    equals: deepEqual<any>,
  });

  /** Coordinates of the middle point of the edge vector. */
  const middlePoint = () => {
    const v = vector();
    if (!v) return { x: 0, y: 0 };
    return { x: (v.x0 + v.x1) / 2, y: (v.y0 + v.y1) / 2 };
  };

  /** Base color of the edge before selection and opacity adjustments. */
  const __stroke = () => {
    const color: string | undefined = (vector() as any).color;
    return new TinyColor(color ?? props.stroke ?? '#a8a8a8');
  };

  /** Stroke width of the edge, enlarged when selected. */
  const strokeWidth = () => (selected() ? 4 : 3);

  /** Final stroke color with the opacity matching the edge state. */
  const stroke = () => {
    const _selected = selected();
    const _stroke = __stroke();
    if (props.isNew === true) return _stroke.setAlpha(0.4).toHex8String();
    if (_selected) return _stroke.setAlpha(1).toHex8String();
    return _stroke.setAlpha(0.7).toHex8String();
  };

  return { vector, selected, edgeData, middlePoint, strokeWidth, stroke, send };
};
