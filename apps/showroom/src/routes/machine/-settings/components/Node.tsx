import { useFlow } from '@bemedev/mind-flow';
import { For, Show, type Component } from 'solid-js';

import { PRINCIPAL_NODE_KEY } from '../constants';
import type { StateMachineNodeData } from '../types';
import { useStateNodeHooks } from './Node.hooks';

/**
 * Custom node renderer for `@bemedev/app` state machines.
 *
 * Displays state metadata, hierarchy path, entry/activity/exit actions, tags, and an
 * interactive bubble at the bottom-right corner if the state has actors attached.
 */
export const StateMachineNode: Component<StateMachineNodeData> = props => {
  if (props.id === PRINCIPAL_NODE_KEY || (props as any).principal) {
    return null;
  }
  const { send } = useFlow();
  const {
    hasActors,
    actorCount,
    entries,
    hasEntry,
    entriesTile,
    exits,
    hasExit,
    exitsTitle,
    activities,
    hasActivities,
    hasActions,
    tags,
    hasTags,
    badgeColor,
  } = useStateNodeHooks(props);

  return (
    <div class='relative flex max-w-72 min-w-64 flex-col rounded-md p-3 select-none'>
      {/* Bottom-Right Actor Bubble:
          "Actors will be show inside a bubble at the top-right corner of the node,
           and on click, a window will detail it." */}
      <Show when={hasActors()}>
        <button
          type='button'
          title={`${actorCount()} actor(s) attached — Click to inspect details`}
          class='absolute -right-3.5 -bottom-3.5 z-30 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-linear-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white shadow-md ring-2 ring-white transition-transform duration-200 hover:scale-115'
          onMouseDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation();
            send({ type: 'EDIT', payload: props.id });
          }}
        >
          {/* Sparkle / Bot icon representation */}
          <svg
            class='h-3.5 w-3.5 fill-current'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d='M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18 2.5 2.5 0 0 0 10 15.5 2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5' />
          </svg>

          {/* Actor count badge pill */}
          <div class='absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center rounded-full text-[8px] font-extrabold text-gray-700 ring-1 ring-white'>
            <span class='flex h-full w-full items-center justify-center rounded-full bg-pink-500 text-pink-50'>
              {actorCount()}
            </span>
            <div class='absolute h-full w-full animate-ping rounded-full border-2 border-pink-400 bg-transparent'></div>
          </div>
        </button>
      </Show>

      {/* Node Header */}
      <div class='flex items-center justify-between gap-2 border-b border-gray-100 pb-1.5'>
        <div class='flex items-center gap-1.5 truncate'>
          <span class='truncate text-sm font-bold text-gray-900'>
            {props.title || 'State'}
          </span>
          <Show when={props.isInitial}>
            <span class='rounded bg-emerald-50 px-1 py-0.5 text-[9px] font-semibold text-emerald-700'>
              initial
            </span>
          </Show>
        </div>

        <span
          class={`py-0.2 rounded-full border px-2 text-[9px] font-semibold capitalize ${badgeColor()}`}
        >
          {props.stateType}
        </span>
      </div>

      {/* State Path Display */}
      <div class='mt-1 truncate font-mono text-[11px] text-gray-400'>
        {props.path || '/'}
      </div>

      {/* State Description */}
      <Show when={props.content}>
        <p class='mt-1 line-clamp-2 text-xs text-gray-600'>{props.content}</p>
      </Show>

      {/* Actions: (entry, activities (same UI, do not change), exit) */}
      <Show when={hasActions()}>
        <div class='mt-2 flex flex-wrap gap-1 text-[10px]'>
          <Show when={hasEntry()}>
            <div class='flex gap-1 rounded bg-green-50 px-1.5 py-0.5 font-mono text-green-700'>
              <span>{entriesTile()}</span>
              <span>{entries()}</span>
            </div>
          </Show>

          <Show when={hasActivities()}>
            <For each={activities()}>
              {act => (
                <span
                  class='rounded bg-purple-50 px-1.5 py-0.5 font-mono text-purple-700'
                  title={`Activity '${act.delay}': ${act.actions.join(', ')}${act.description ? ` (${act.description})` : ''}`}
                >
                  ⏱️ {act.delay}: {act.actions.join(', ')}
                </span>
              )}
            </For>
          </Show>

          <Show when={hasExit()}>
            <div class='flex gap-1 rounded bg-red-50 px-1.5 py-0.5 font-mono text-red-700'>
              <span>{exitsTitle()}</span>
              <span>{exits()}</span>
            </div>
          </Show>
        </div>
      </Show>

      {/* Tags at the bottom under a divide */}
      <Show when={hasTags()}>
        <div class='mt-2 h-px w-full bg-gray-300' />
        <div class='mt-1.5 flex flex-wrap gap-1'>
          <For each={tags()}>
            {tag => (
              <span class='rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[9px] text-gray-600'>
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
