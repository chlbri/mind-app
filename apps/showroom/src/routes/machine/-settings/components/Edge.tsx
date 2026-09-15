import { deepEqual } from '@bemedev/app/utils';
import {
  EdgeCursive,
  EdgeStraight,
  useFlow,
  type EdgeProps,
} from '@bemedev/mind-flow';
import { Show, splitProps, type Component } from 'solid-js';

import { DASH_ARRAY } from '../data';
import { getStrokeColor } from '../helpers';
import type { StateMachineEdgeData } from '../types';
import { StateMachineEdgeMiddle } from './Edge.middle';

export const StateMachineEdge: Component<
  EdgeProps<StateMachineEdgeData>
> = props => {
  const { hooks } = useFlow();

  const edgeRecord = hooks.state({
    selector: ({ context }) => context.data?.edges?.find(e => e.id === props.id),
    equals: deepEqual<any>,
  });

  const edgeData = () =>
    (props.data ?? edgeRecord()?.data) as StateMachineEdgeData | undefined;

  const transitions = () => edgeData()?.transitions ?? [];

  const kind = () => {
    const dataKind = edgeData()?.kind ?? transitions()[0]?.kind;
    if (dataKind) return dataKind;

    const fromPos = edgeRecord()?.fromPosition;
    const toPos = edgeRecord()?.toPosition;
    if (fromPos === 'top' || toPos === 'bottom') return 'child_parent';

    const idx = edgeRecord()?.fromIndex ?? edgeRecord()?.toIndex;
    if (idx === 0) return 'after';
    if (idx === 1) return 'always';
    if (idx === 2) return 'on';

    return 'on';
  };

  const strokeDasharray = () => {
    return kind() === 'child_parent' ? DASH_ARRAY : undefined;
  };

  const strokeColor = () => getStrokeColor(kind());
  const [, others] = splitProps(props, ['data']);
  const data = () => ({ ...props.data, ...edgeData(), kind: kind() });

  return (
    <Show
      fallback={
        <EdgeCursive<StateMachineEdgeData>
          {...others}
          data={data()}
          stroke={strokeColor()}
          strokeDasharray={strokeDasharray()}
          middle={StateMachineEdgeMiddle}
        />
      }
      when={kind() === 'child_parent'}
    >
      <EdgeStraight<StateMachineEdgeData>
        {...others}
        data={data()}
        stroke={strokeColor()}
        strokeDasharray={strokeDasharray()}
        middle={StateMachineEdgeMiddle}
      />
    </Show>
  );
};
