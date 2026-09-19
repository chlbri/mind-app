import { Flow, Hook, reconstructState, useFlow } from '@bemedev/mind-flow';
import { createFileRoute } from '@tanstack/solid-router';
import { onMount } from 'solid-js';
import * as v from 'valibot';

import {
  AtomicFiligrane,
  HistoryControlsAddons,
  PrincipalPanel,
  StateMachineEdge,
  StateMachineEditPanel,
  StateMachineNode,
  StateMachineNodeSelected,
  TransitionModal,
} from './-settings/components';
import { historyModel, localStorageModel, STORAGE_KEY } from './-settings/constants';
import { DEFAULT_CONFIG } from './-settings/data';
import { Principal } from './-settings/parser';
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

    let hLen = -1;

    return (
      <div class='relative h-[calc(100vh-64px)] w-[calc(100vw-32px)] overflow-hidden'>
        <Flow<StateMachineNodeData, StateMachineEdgeData>
          delay={100}
          config={getInitialConfig()}
          Node={StateMachineNode}
          NodeSelected={StateMachineNodeSelected}
          Edge={StateMachineEdge}
          panels={{
            bottomLeft: TransitionModal,
            topLeft: StateMachineEditPanel,
            topRight: PrincipalPanel,
          }}
          controlsAddons={HistoryControlsAddons}

          register={({ history, historyIndex }) => {
            try {
              const parsed = v.parse(historyModel, { history, historyIndex });
              const currentLen = parsed.history.length;
              const check = currentLen > hLen;
              if (check) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
                hLen = currentLen;
              }
            } catch {
              console.warn('Cannot access local storage');
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
          <AtomicFiligrane />
          <Hook>
            {() => {
              const { send, service } = useFlow();

              onMount(() => {
                service.addOptions(() => ({
                  guards: {
                    canDelete: {
                      DELETE: ({ context: { data }, payload }) => {
                        const node = data?.nodes?.find(n => n.id === payload);
                        const check =
                          (node?.data as any)?.principal === Principal.unique;
                        if (check) {
                          return false;
                        }
                        return true;
                      },
                    },
                  },
                }));
                const payload = getHistory();
                if (payload) send({ type: 'BUILD_HISTORY', payload });
              });

              // // Auto-sync:
              // // 1. If principal node is set to atomic, delete all canvas nodes and edges
              // // 2. If all canvas nodes are deleted, principal node is immediately atomic
              // createEffect(() => {
              //   const nodes = hooks.state({
              //     selector: ({ context: { data } }) => data?.nodes ?? [],
              //   })();
              //   const canvasNodes = nodes.filter(
              //     n => n.id !== PRINCIPAL_NODE_KEY && !(n.data as any)?.principal,
              //   );
              //   const principal = nodes.find(
              //     n => n.id === PRINCIPAL_NODE_KEY || (n.data as any)?.principal,
              //   );
              //   if (
              //     principal &&
              //     principal.data?.stateType === 'atomic' &&
              //     canvasNodes.length > 0
              //   ) {
              //     const updatedPrincipal = {
              //       ...principal,
              //       data: { ...principal.data, stateType: 'atomic' as StateType },
              //     };
              //     send({
              //       type: 'CONFIGURE',
              //       payload: { nodes: [updatedPrincipal], edges: [] },
              //     });
              //   } else if (
              //     canvasNodes.length === 0 &&
              //     principal &&
              //     principal.data?.stateType !== 'atomic'
              //   ) {
              //     send({
              //       type: 'SET_NODE_DATA',
              //       payload: { id: principal.id, data: { stateType: 'atomic' } },
              //     });
              //   }
              // });
            }}
          </Hook>
        </Flow>
      </div>
    );
  },
  // ssr: 'data-only',
});
