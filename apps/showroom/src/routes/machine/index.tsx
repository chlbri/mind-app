import { Flow, type ConfigFrom } from '@bemedev/mind-flow';
import { createFileRoute } from '@tanstack/solid-router';

import {
  StateMachineEdge,
  StateMachineEditPanel,
  StateMachineNode,
  StateMachineNodeSelected,
  TransitionModal,
} from './-settings/components';
import { STORAGE_KEY } from './-settings/constants';
import { config } from './-settings/data';
import type { StateMachineEdgeData, StateMachineNodeData } from './-settings/types';

/**
 * Function type signature for retrieving initial state machine flowchart
 * configuration.
 *
 * @returns Initial flowchart configuration of type {@linkcode ConfigFrom}.
 *
 * @see -- type {@linkcode StateMachineNodeData}, -- type {@linkcode StateMachineEdgeData}
 */
type InitialConfig = () => ConfigFrom<StateMachineNodeData, StateMachineEdgeData>;

/**
 * Interactive State Machine Showroom route demonstrating `@bemedev/app` graph
 * visualization.
 */
export const Route = createFileRoute('/machine/')({
  component: () => {
    /**
     * Retrieves the stored state machine flowchart configuration from LocalStorage,
     * falling back to the default configuration.
     *
     * @returns The flowchart configuration object.
     *
     * @see {@linkcode config}
     */
    const getInitialConfig: InitialConfig = () => {
      if (typeof window === 'undefined') return config;

      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return config;

        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
          return { nodes: parsed.nodes, edges: parsed.edges };
        }
      } catch {
        console.warn('Nothing is registered yet');
      }

      return config;
    };

    return (
      <div class='relative h-[calc(100vh-64px)] w-[calc(100vw-32px)] overflow-hidden'>
        <Flow<StateMachineNodeData, StateMachineEdgeData>
          delay={100}
          config={getInitialConfig()}
          Node={StateMachineNode}
          NodeSelected={StateMachineNodeSelected}
          Edge={StateMachineEdge}
          panels={{ bottomLeft: TransitionModal, topLeft: StateMachineEditPanel }}
          controlsAddons={() => null}

          register={({ data }) => {
            if (data && typeof window !== 'undefined') {
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
              } catch {
                console.warn('Cannot access local storage');
              }
            }
          }}

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
        ></Flow>
      </div>
    );
  },
  // ssr: 'data-only',
});
