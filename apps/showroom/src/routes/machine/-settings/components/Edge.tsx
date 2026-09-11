import { deepEqual } from '@bemedev/app/utils';
import {
  EdgeCursive,
  EdgeStraight,
  useFlow,
  type EdgeProps,
} from '@bemedev/mind-flow';
import { Show, type Component } from 'solid-js';

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

  const isMulti = () => transitions().length > 1;
  const kind = () => {
    return transitions()[0]?.kind ?? edgeData()?.kind ?? 'on';
  };

  const strokeColor = () => {
    if (isMulti()) return '#6366f1'; // Indigo for multi-transition connections
    const k = kind();
    switch (k) {
      case 'child_parent':
        return '#8b5cf6'; // Violet
      case 'after':
        return '#f59e0b'; // Amber
      case 'always':
        return '#10b981'; // Emerald
      case 'on':
      default:
        return '#3b82f6'; // Blue
    }
  };

  const strokeDasharray = () => {
    const k = transitions()[0]?.kind ?? edgeData()?.kind ?? 'on';
    return k === 'child_parent' && !isMulti() ? '6 4' : undefined;
  };

  return (
    <Show
      fallback={
        <EdgeCursive<StateMachineEdgeData>
          {...props}
          stroke={strokeColor()}
          strokeDasharray={strokeDasharray()}
          middle={StateMachineEdgeMiddle}
        />
      }
      when={kind() === 'child_parent'}
    >
      <EdgeStraight<StateMachineEdgeData>
        {...props}
        stroke={strokeColor()}
        strokeDasharray={strokeDasharray()}
        middle={StateMachineEdgeMiddle}
      />
    </Show>
  );
};
