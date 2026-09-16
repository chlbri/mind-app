import { EditPanel, mouseOut, type MouseOutParam } from '@bemedev/mind-flow';
import { createMemo, Show, type Component } from 'solid-js';

import type { StateMachineNodeData } from '../types';
import { ActivityInputs } from './ActivityInputs';
import { ActorInputs } from './ActorInputs';

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
      header={({ id, close }) => (
        <div class='flex items-center justify-between border-b border-gray-100 pb-2.5'>
          <div class='flex items-center gap-2'>
            <span class='flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-xs'>
              ⚙
            </span>
            <div>
              <h3 class='text-xs font-bold text-gray-800'>Edit State Node</h3>
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
      )}
    >
      {({ editingNode: node, updateField, close }) => (
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
              onInput={e => updateField('title', e.currentTarget.value)}
              placeholder='e.g. shipping, validation'
            />
          </div>

          {/* State Type */}
          <div class='flex flex-col gap-1'>
            <label class='font-semibold text-gray-700'>State Type</label>
            <select
              class='w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs capitalize focus:border-indigo-500 focus:outline-none'
              value={node().data?.stateType ?? 'atomic'}
              onChange={e => updateField('stateType', e.currentTarget.value as any)}
            >
              <option value='atomic'>Atomic</option>
              <option value='compound'>Compound</option>
              <option value='initial'>Initial</option>
              <option value='final'>Final</option>
            </select>
          </div>

          {/* Initial State Toggle (for child of compound state) */}
          <Show when={node().data?.parentPath}>
            <div class='flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5'>
              <div class='flex flex-col pr-2'>
                <span class='font-semibold text-emerald-900'>Initial Substate</span>
                <span class='text-[10px] text-emerald-700'>
                  Initial child of {node().data?.parentPath}
                </span>
              </div>
              <input
                type='checkbox'
                class='h-4 w-4 cursor-pointer rounded border-gray-300 text-emerald-600 focus:ring-emerald-500'
                checked={Boolean(node().data?.isInitial)}
                onChange={e => updateField('isInitial', e.currentTarget.checked)}
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
          <ActivityInputs
            activities={createMemo(() => node().data.activities)}
            onChange={acts => updateField('activities', acts)}
          />

          {/* Actors */}
          <ActorInputs
            actors={() => node().data?.actors}
            onChange={acts => updateField('actors', acts)}
          />
        </div>
      )}
    </EditPanel>
  );
};
