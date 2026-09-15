import { Flow } from '@bemedev/mind-flow';
import { createFileRoute } from '@tanstack/solid-router';

import {
  TransitionModal,
  StateMachineEdge,
  StateMachineNode,
  StateMachineNodeSelected,
} from './-settings/components';
import { config } from './-settings/data';
import type { StateMachineEdgeData, StateMachineNodeData } from './-settings/types';

/**
 * Interactive State Machine Showroom route demonstrating `@bemedev/app` graph
 * visualization.
 */
export const Route = createFileRoute('/machine/')({
  component: () => {
    return (
      <div class='relative h-[calc(100vh-64px)] w-[calc(100vw-32px)] overflow-hidden'>
        <Flow<StateMachineNodeData, StateMachineEdgeData>
          delay={100}
          config={config}
          Node={StateMachineNode}
          NodeSelected={StateMachineNodeSelected}
          Edge={StateMachineEdge}
          edgesAllowed={(from, to, edge) => {
            const fromPath = from.data?.path;
            const toPath = to.data?.path;
            if (!fromPath || !toPath) return false;

            const none =
              ['bottom', 'top'].includes(edge.fromPosition as any) ||
              ['bottom', 'top'].includes(edge.toPosition as any);

            if (none) return false;

            if (edge.fromPosition === 'right') {
              const isChildOf =
                from.data?.parentPath === to.data?.path ||
                from.data?.parentPath === to.id ||
                fromPath.startsWith(`${toPath}/`);

              return !isChildOf && edge.fromIndex === edge.toIndex;
            }
            return false;
          }}

          defaultData={{
            id: 'new-state',
            title: 'New State',
            path: '/new-state',
            stateType: 'atomic',
          }}

          panels={{ bottomLeft: TransitionModal }}
        ></Flow>
      </div>
    );
  },
});
