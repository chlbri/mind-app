import {
  EditPanel,
  mouseOut,
  useFlow,
  type MouseOutParam,
} from '@bemedev/mind-flow';
import { createEffect, Show, type Component } from 'solid-js';

import type { StateMachineNodeData } from '../types';
import { ActivityInputs } from './activities';
import { ActorInputs } from './actors';

declare module 'solid-js' {
  // oxlint-disable-next-line typescript/no-namespace
  namespace JSX {
    interface Directives {
      mouseOut: MouseOutParam;
    }
  }
}

/**
 * Top-left overlay panel allowing users to inspect and modify state node properties
 * upon double-click, including title, stateType, isInitial, description (content),
 * tags, entry/exit actions, and activities.
 */
export const StateMachineEditPanel: Component = () => {
  void mouseOut;
  const { send, hooks } = useFlow();

  const allNodes = hooks.state({
    selector: ({ context: { data } }) => data?.nodes ?? [],
  });

  const toList = (val: string): string[] | undefined => {
    const list = val
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    return list.length > 0 ? list : undefined;
  };

  return (
    <EditPanel<StateMachineNodeData>
      class='max-h-[85vh] w-96 overflow-y-auto transition-all ease-linear'
      classList={({ closing }) => ({
        'pointer-events-none scale-95 opacity-0 duration-250': closing(),
        'opacity-35 has-focus-within:opacity-100 hover:opacity-100 duration-150':
          !closing(),
      })}
      header={({ id, close }) => {
        const currentNode = () => allNodes().find(n => n.id === id);
        const stateType = () => currentNode()?.data?.stateType ?? 'atomic';
        const isInitial = () => Boolean(currentNode()?.data?.isInitial);

        const typeBadgeColor = () => {
          switch (stateType()) {
            case 'compound':
              return 'bg-purple-100 text-purple-700 border-purple-300';
            case 'parallel':
              return 'bg-amber-100 text-amber-700 border-amber-300';
            case 'final':
              return 'bg-slate-100 text-slate-700 border-slate-300';
            default:
              return 'bg-sky-100 text-sky-700 border-sky-300';
          }
        };

        return (
          <div class='flex items-center justify-between border-b border-gray-100 pb-2.5'>
            <div class='flex items-center gap-2'>
              <span class='flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-xs'>
                ⚙
              </span>
              <div>
                <div class='flex items-center gap-1.5'>
                  <h3 class='text-xs font-bold text-gray-800'>Edit State Node</h3>
                  <span
                    class={`py-0.2 rounded-full border px-1.5 text-[9px] font-semibold capitalize ${typeBadgeColor()}`}
                  >
                    {stateType()}
                  </span>
                  <Show when={isInitial()}>
                    <span class='rounded bg-emerald-50 px-1 py-0.5 text-[9px] font-semibold text-emerald-700'>
                      initial
                    </span>
                  </Show>
                </div>
                <span class='font-mono text-[10px] text-gray-400'>{id}</span>
              </div>
            </div>

            <button
              type='button'
              onClick={close}
              title='Close editor'
              aria-label='Close editor'
              class='cursor-pointer rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700'
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
        );
      }}
    >
      {({ editingNode: node, updateField, close, updateNodeData }) => {
        const childNodes = () => {
          const current = node();
          const currentPath = current.data?.path ?? current.id;
          const currentId = current.id;
          return allNodes().filter(n => {
            if (n.id === currentId) return false;
            const parentPath = n.data?.parentPath;
            if (
              parentPath &&
              (parentPath === currentPath || parentPath === currentId)
            ) {
              return true;
            }
            return false;
          });
        };

        const hasChildren = () => childNodes().length > 0;

        const parentNode = () => {
          const current = node();
          if (!current) return undefined;
          const parentPath = current.data?.parentPath;
          if (!parentPath) return undefined;

          return allNodes().find(
            n => n.id === parentPath || n.data?.path === parentPath,
          );
        };

        const isParentCompound = () => parentNode()?.data?.stateType === 'compound';

        const siblingNodes = () => {
          const parent = parentNode();
          if (!parent) return [];
          const pPath = parent.data?.path ?? parent.id;
          return allNodes().filter(n => n.data?.parentPath === pPath);
        };

        createEffect(() => {
          const check =
            isParentCompound() &&
            siblingNodes().length === 1 &&
            !node()?.data?.isInitial;

          if (check) updateField('isInitial', true);
        });

        return (
          <div
            use:mouseOut={[close, 3_150]}
            class='flex flex-col gap-3 text-left text-xs'
          >
            {/* State Title */}
            <div class='flex flex-col gap-1'>
              <label class='font-semibold text-gray-700'>
                Title / Name <span class='text-red-500'>*</span>
              </label>
              <input
                type='text'
                class='w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-sans text-xs focus:border-indigo-500 focus:outline-none'
                value={node().data?.title ?? ''}
                onInput={e => {
                  const title = e.currentTarget.value;
                  const previousTitle = node().data.title;
                  const path = node().data.path.replace(previousTitle, title);
                  updateNodeData({ title, path });
                }}
                placeholder='e.g. shipping, validation'
              />
            </div>

            {/* State Type: only shown if node has children, with compound and parallel */}
            <Show when={hasChildren()}>
              <div class='flex flex-col gap-1'>
                <label class='font-semibold text-gray-700'>State Type</label>
                <select
                  class='w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs capitalize focus:border-indigo-500 focus:outline-none'
                  value={
                    node().data?.stateType === 'parallel' ? 'parallel' : 'compound'
                  }
                  onChange={e => {
                    const nextType = e.currentTarget.value as
                      | 'compound'
                      | 'parallel';
                    updateField('stateType', nextType);
                    if (nextType === 'parallel') {
                      childNodes().forEach(child => {
                        if (child.data?.isInitial) {
                          send({
                            type: 'SET_NODE_DATA',
                            payload: { id: child.id, data: { isInitial: false } },
                          });
                        }
                      });
                    } else if (nextType === 'compound') {
                      const children = childNodes();
                      if (
                        children.length > 0 &&
                        !children.some(c => c.data?.isInitial)
                      ) {
                        send({
                          type: 'SET_NODE_DATA',
                          payload: { id: children[0].id, data: { isInitial: true } },
                        });
                      }
                    }
                  }}
                >
                  <option value='compound'>Compound</option>
                  <option value='parallel'>Parallel</option>
                </select>
              </div>
            </Show>

            {/* Initial State Toggle: only shown if parent is compound and multiple children */}
            <Show when={isParentCompound() && siblingNodes().length > 1}>
              <div class='flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5'>
                <div class='flex flex-col pr-2'>
                  <span class='font-semibold text-emerald-900'>
                    Initial Substate
                  </span>
                  <span class='text-[10px] text-emerald-700'>
                    Initial child of {node().data?.parentPath}
                  </span>
                </div>
                <input
                  type='checkbox'
                  class='h-4 w-4 cursor-pointer rounded border-gray-300 text-emerald-600 focus:ring-emerald-500'
                  checked={Boolean(node().data?.isInitial)}
                  onChange={e => {
                    const checked = e.currentTarget.checked;
                    if (checked) {
                      updateField('isInitial', true);
                      const currentId = node().id;
                      siblingNodes().forEach(sibling => {
                        if (sibling.id !== currentId && sibling.data?.isInitial) {
                          send({
                            type: 'SET_NODE_DATA',
                            payload: { id: sibling.id, data: { isInitial: false } },
                          });
                        }
                      });
                    } else {
                      e.currentTarget.checked = true;
                    }
                  }}
                />
              </div>
            </Show>

            {/* Description / Content */}
            <div class='flex flex-col gap-1'>
              <label class='font-semibold text-gray-700'>Description</label>
              <textarea
                rows={2}
                class='w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs focus:border-indigo-500 focus:outline-none'
                value={node().data?.content ?? ''}
                onInput={e => updateField('content', e.currentTarget.value)}
                placeholder='Describe this state role...'
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
                value={node().data?.tags?.join(', ') ?? ''}
                onInput={e => updateField('tags', toList(e.currentTarget.value))}
                placeholder='e.g. checkout, payment, auth'
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
                value={node().data?.entry?.join(', ') ?? ''}
                onInput={e => updateField('entry', toList(e.currentTarget.value))}
                placeholder='e.g. notifyUser, logState'
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
                value={node().data?.exit?.join(', ') ?? ''}
                onInput={e => updateField('exit', toList(e.currentTarget.value))}
                placeholder='e.g. cleanupState, flushBuffer'
              />
            </div>

            {/* Activities */}
            <ActivityInputs updateField={updateField} />

            {/* Actors */}
            <ActorInputs updateField={updateField} />
          </div>
        );
      }}
    </EditPanel>
  );
};
