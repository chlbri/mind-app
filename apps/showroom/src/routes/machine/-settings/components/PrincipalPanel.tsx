import type { StateType } from '@bemedev/app/states';
import { clickOutside, useFlow } from '@bemedev/mind-flow';
import { createSignal, For, Show, type Component } from 'solid-js';

import { isDirectChildOfPrincipal, PRINCIPAL_NODE_KEY } from '../constants';
import { createHandles, toList } from '../helpers';
import type { StateMachineNodeData } from '../types';

declare module 'solid-js' {
  // oxlint-disable-next-line typescript/no-namespace
  namespace JSX {
    interface Directives {
      clickOutside: () => void;
    }
  }
}

/** Signal controlling visibility of the top-right Principal Node panel. */
export const [isPrincipalOpen, setIsPrincipalOpen] = createSignal(false);

/**
 * Top-right overlay panel rendering the Principal (root) machine node.
 *
 * This node is excluded from the flowchart canvas and rendered here instead.
 * Supports switching the root machine type between atomic, compound, and parallel,
 * with automatic child node creation, initial state management, and canvas wiping.
 */
export const PrincipalPanel: Component = () => {
  void clickOutside;
  const { hooks, send } = useFlow();

  const allNodes = hooks.state({
    selector: ({ context: { data } }) => data?.nodes ?? [],
  });

  const principalNode = () =>
    allNodes().find(n => n.id === PRINCIPAL_NODE_KEY || (n.data as any)?.principal)!;

  const directChildren = () =>
    allNodes().filter(
      n =>
        n.id !== PRINCIPAL_NODE_KEY &&
        !(n.data as any)?.principal &&
        (n.data?.parentPath === PRINCIPAL_NODE_KEY ||
          isDirectChildOfPrincipal(n.data?.path ?? n.id)),
    );

  const handleClickOutside = () => {
    if (isPrincipalOpen()) {
      setIsPrincipalOpen(false);
    }
  };

  const nodeData = () => {
    const p = principalNode();
    if (p?.data) return p.data as StateMachineNodeData;
  };

  const stateType = () => nodeData()?.stateType ?? 'compound';

  const typeBadgeColor = () => {
    switch (stateType()) {
      case 'compound':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'parallel':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      default:
        return 'bg-sky-100 text-sky-700 border-sky-300';
    }
  };

  const updatePrincipalField = <K extends keyof StateMachineNodeData>(
    field: K,
    value: StateMachineNodeData[K],
  ) => {
    const p = principalNode();
    if (!p) {
      console.log('nothing');
      return;
    }
    send({ type: 'SET_NODE_DATA', payload: { id: p.id, data: { [field]: value } } });
  };

  const handleStateTypeChange = (nextType: StateType) => {
    const pNode = principalNode();
    if (!pNode) return;

    const canvasNodes = allNodes().filter(
      n => n.id !== PRINCIPAL_NODE_KEY && !(n.data as any)?.principal,
    );

    if (nextType === 'atomic') {
      // Wipe all canvas nodes and edges; only principal node remains
      const updatedPrincipal = {
        ...pNode,
        data: { ...pNode.data, stateType: 'atomic' as StateType },
      };
      send({ type: 'CONFIGURE', payload: { nodes: [updatedPrincipal], edges: [] } });
    } else if (nextType === 'compound') {
      if (canvasNodes.length === 0) {
        // If switching from atomic (no nodes), add a node and immediately make it initial
        const initialNode: any = {
          id: '/state-1',
          position: { x: 80, y: 100 },
          handles: createHandles(),
          data: {
            id: '/state-1',
            title: 'state-1',
            path: '/state-1',
            parentPath: PRINCIPAL_NODE_KEY,
            stateType: 'atomic',
            isInitial: true,
          },
        };
        const updatedPrincipal = {
          ...pNode,
          data: { ...pNode.data, stateType: 'compound' as StateType },
        };
        send({
          type: 'CONFIGURE',
          payload: { nodes: [updatedPrincipal, initialNode], edges: [] },
        });
      } else {
        send({
          type: 'SET_NODE_DATA',
          payload: { id: pNode.id, data: { stateType: 'compound' } },
        });
        const children = directChildren();
        if (children.length > 0 && !children.some(c => c.data?.isInitial)) {
          send({
            type: 'SET_NODE_DATA',
            payload: { id: children[0].id, data: { isInitial: true } },
          });
        }
      }
    } else if (nextType === 'parallel') {
      if (canvasNodes.length === 0) {
        // If switching from atomic (no nodes), add a node without initial
        const childNode: any = {
          id: '/state-1',
          position: { x: 80, y: 100 },
          handles: createHandles(),
          data: {
            id: '/state-1',
            title: 'state-1',
            path: '/state-1',
            parentPath: PRINCIPAL_NODE_KEY,
            stateType: 'atomic',
            isInitial: false,
          },
        };
        const updatedPrincipal = {
          ...pNode,
          data: { ...pNode.data, stateType: 'parallel' as StateType },
        };
        send({
          type: 'CONFIGURE',
          payload: { nodes: [updatedPrincipal, childNode], edges: [] },
        });
      } else {
        send({
          type: 'SET_NODE_DATA',
          payload: { id: pNode.id, data: { stateType: 'parallel' } },
        });
        directChildren().forEach(child => {
          if (child.data?.isInitial) {
            send({
              type: 'SET_NODE_DATA',
              payload: { id: child.id, data: { isInitial: false } },
            });
          }
        });
      }
    }
  };

  return (
    <Show when={isPrincipalOpen()}>
      <div
        use:clickOutside={handleClickOutside}
        class='animate-in fade-in zoom-in-95 pointer-events-auto relative flex max-h-[85vh] w-96 flex-col overflow-y-auto rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-2xl backdrop-blur-md transition-all select-none'
      >
        {/* Header */}
        <div class='flex items-center justify-between border-b border-gray-100 pb-2.5'>
          <div class='flex items-center gap-2'>
            <span class='flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-xs'>
              ★
            </span>
            <div>
              <div class='flex items-center gap-1.5'>
                <h3 class='text-xs font-bold text-gray-800'>
                  {nodeData()?.title || 'Principal Node'}
                </h3>
                <span
                  class={`py-0.2 rounded-full border px-1.5 text-[9px] font-semibold capitalize ${typeBadgeColor()}`}
                >
                  {stateType()}
                </span>
              </div>
              <span class='font-mono text-[10px] text-gray-400'>
                {PRINCIPAL_NODE_KEY}
              </span>
            </div>
          </div>

          <button
            type='button'
            onClick={() => setIsPrincipalOpen(false)}
            title='Close principal panel'
            aria-label='Close principal panel'
            class='cursor-pointer rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700'
          >
            <svg
              class='size-4'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              stroke-width='2'
            >
              <path d='M18 6L6 18M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* Inputs Form */}
        <div class='mt-3 flex flex-col gap-3 text-left text-xs'>
          {/* Title */}
          <div class='flex flex-col gap-1'>
            <label class='font-semibold text-gray-700'>
              Title / Name <span class='text-red-500'>*</span>
            </label>
            <input
              type='text'
              class='w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-sans text-xs focus:border-indigo-500 focus:outline-none'
              value={nodeData()?.title ?? ''}
              onInput={e => updatePrincipalField('title', e.currentTarget.value)}
              placeholder='Machine Title'
            />
          </div>

          {/* State Type */}
          <div class='flex flex-col gap-1'>
            <label class='font-semibold text-gray-700'>State Type</label>
            <select
              class='w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs capitalize focus:border-indigo-500 focus:outline-none'
              value={stateType()}
              onChange={e =>
                handleStateTypeChange(e.currentTarget.value as StateType)
              }
            >
              <option value='atomic'>Atomic</option>
              <option value='compound'>Compound</option>
              <option value='parallel'>Parallel</option>
            </select>
          </div>

          {/* Description */}
          <div class='flex flex-col gap-1'>
            <label class='font-semibold text-gray-700'>Description</label>
            <textarea
              rows={2}
              class='w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs focus:border-indigo-500 focus:outline-none'
              value={nodeData()?.content ?? ''}
              onInput={e => updatePrincipalField('content', e.currentTarget.value)}
              placeholder='Describe the principal state machine...'
            />
          </div>

          {/* Tags */}
          <div class='flex flex-col gap-1'>
            <label class='font-semibold text-gray-700'>
              Tags <span class='text-gray-400'>(comma-separated)</span>
            </label>
            <input
              type='text'
              class='w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-mono text-xs focus:border-indigo-500 focus:outline-none'
              value={nodeData()?.tags?.join(', ') ?? ''}
              onInput={e =>
                updatePrincipalField('tags', toList(e.currentTarget.value))
              }
              placeholder='e.g. root, core, workflow'
            />
          </div>

          {/* Entry Actions */}
          <div class='flex flex-col gap-1'>
            <label class='font-semibold text-gray-700'>
              Entry Actions <span class='text-gray-400'>(comma-separated)</span>
            </label>
            <input
              type='text'
              class='w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-mono text-xs focus:border-indigo-500 focus:outline-none'
              value={nodeData()?.entry?.join(', ') ?? ''}
              onInput={e =>
                updatePrincipalField('entry', toList(e.currentTarget.value))
              }
              placeholder='e.g. initMachine, setupLogger'
            />
          </div>

          {/* Exit Actions */}
          <div class='flex flex-col gap-1'>
            <label class='font-semibold text-gray-700'>
              Exit Actions <span class='text-gray-400'>(comma-separated)</span>
            </label>
            <input
              type='text'
              class='w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-mono text-xs focus:border-indigo-500 focus:outline-none'
              value={nodeData()?.exit?.join(', ') ?? ''}
              onInput={e =>
                updatePrincipalField('exit', toList(e.currentTarget.value))
              }
              placeholder='e.g. tearDown, flushMetrics'
            />
          </div>

          {/* Activities */}
          <Show when={nodeData()?.activities}>
            {activities => (
              <div class='flex flex-col gap-1'>
                <label class='font-semibold text-gray-700'>Activities</label>
                <div class='flex flex-wrap gap-1'>
                  <For each={activities()}>
                    {act => (
                      <span class='rounded bg-purple-50 px-1.5 py-0.5 font-mono text-[10px] text-purple-700'>
                        ⏱️ {act.delay}: {act.actions.join(', ')}
                      </span>
                    )}
                  </For>
                </div>
              </div>
            )}
          </Show>

          {/* Actors */}
          <Show when={nodeData()?.actors}>
            {actors => (
              <div class='flex flex-col gap-1'>
                <label class='font-semibold text-gray-700'>Actors</label>
                <div class='flex flex-wrap gap-1'>
                  <For each={actors()}>
                    {actor => (
                      <span class='rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] text-indigo-700'>
                        🤖 {actor.name} ({actor.type})
                      </span>
                    )}
                  </For>
                </div>
              </div>
            )}
          </Show>
        </div>
      </div>
    </Show>
  );
};
