import type { NOmit } from '@bemedev/app/bemedev';
import { deepEqual } from '@bemedev/app/utils';
import { TinyColor } from '@ctrl/tinycolor';

import type { Data } from '#services/main.machine.typings';

import { useFlow } from '../FlowChart.context';
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
 *
 * @see {@linkcode useFlow}
 */
export const useEdge = <E extends Data = Data>(
  props: NOmit<EdgeProps<E>, 'middle'>,
) => {
  const { hooks, send } = useFlow();

  const vector = hooks.state({
    selector: ({ context: { newEdge, edgesPositions } }) => {
      if (props.isNew) return newEdge;
      return edgesPositions[props.id];
    },
    equals: deepEqual<any>,
  });

  const selected = hooks.state({ selector: s => s.context.selected === props.id });

  const edgeData = hooks.state({
    selector: ({ context }) => {
      if (props.data) return props.data;
      const edge = context.data?.edges?.find(e => e.id === props.id);
      return edge?.data as E | undefined;
    },
    equals: deepEqual<any>,
  });

  const middlePoint = () => {
    const v = vector();
    if (!v) return { x: 0, y: 0 };
    return { x: (v.x0 + v.x1) / 2, y: (v.y0 + v.y1) / 2 };
  };

  const _stroke = new TinyColor(props.stroke ?? '#a8a8a8');
  const strokeWidth = () => (selected() ? 4 : 3);

  const stroke = () => {
    const _selected = selected();
    if (props.isNew === true) return _stroke.setAlpha(0.4).toHex8String();
    if (_selected) return _stroke.setAlpha(1).toHex8String();
    return _stroke.setAlpha(0.7).toHex8String();
  };

  return { vector, selected, edgeData, middlePoint, strokeWidth, stroke, send };
};
