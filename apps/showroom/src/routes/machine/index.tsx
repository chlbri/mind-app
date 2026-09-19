import { Flow, Hook, reconstructState, useFlow } from '@bemedev/mind-flow';
import { createFileRoute } from '@tanstack/solid-router';
import { onMount } from 'solid-js';
import * as v from 'valibot';

import {
  HistoryControlsAddons,
  StateMachineEdge,
  StateMachineEditPanel,
  StateMachineNode,
  StateMachineNodeSelected,
  TransitionModal,
} from './-settings/components';
import { localStorageModel, STORAGE_KEY } from './-settings/constants';
import { DEFAULT_CONFIG } from './-settings/data';
import type { StateMachineEdgeData, StateMachineNodeData } from './-settings/types';

const getHistory = () => {
  if (typeof window === 'undefined') return;

  try {
    return v.parse(localStorageModel, localStorage.getItem(STORAGE_KEY));
  } catch {
    console.warn('Nothing is registered yet');
  }
};

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
     * @see {@linkcode DEFAULT_CONFIG}
     */
    const getInitialConfig: any = () => {
      try {
        const parsed = getHistory();
        if (parsed) return reconstructState(parsed.history, parsed.historyIndex);
      } catch {
        console.warn('Nothing is registered yet');
      }

      return DEFAULT_CONFIG;
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
          controlsAddons={HistoryControlsAddons}

          register={({ history, historyIndex }) => {
            const parsed = v.safeParse(localStorageModel, { history, historyIndex });
            if (parsed.success) {
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.output));
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
        >
          <Hook>
            {() => {
              const { send } = useFlow();

              onMount(() => {
                const payload = getHistory();
                if (payload) send({ type: 'BUILD_HISTORY', payload });
              });
            }}
          </Hook>
        </Flow>
      </div>
    );
  },
  // ssr: 'data-only',
});
