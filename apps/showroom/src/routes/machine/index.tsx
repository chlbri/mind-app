import { Flow } from '@bemedev/mind-flow';
import { createFileRoute } from '@tanstack/solid-router';

import {
  ActorDetailModal,
  AddTransitionModal,
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
          edgesAllowed={(from, to) => {
            // A child state cannot transition to its parent
            const isChild =
              from.data?.parentPath === to.data?.path ||
              from.data?.parentPath === to.id ||
              (Boolean(to.data?.path) &&
                Boolean(from.data?.path) &&
                from?.data?.path.startsWith(`${to?.data?.path}/`));
            return !isChild;
          }}
          defaultData={{
            id: 'new-state',
            title: 'New State',
            path: '/new-state',
            stateType: 'atomic',
          }}
        >
          {/* Modal Window for inspecting state actors when bubble is clicked */}
          <ActorDetailModal />

          {/* Modal Window for adding transitions to an edge */}
          <AddTransitionModal />
        </Flow>
      </div>
    );
  },
});
