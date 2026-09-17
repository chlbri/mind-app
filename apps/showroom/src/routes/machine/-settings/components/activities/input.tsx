import { deepEqual } from '@bemedev/app/utils';
import { useFlow } from '@bemedev/mind-flow';
import { Show, type Component } from 'solid-js';

import { toList } from '../../helpers';
import type { StateActivityData, StateMachineNodeData } from '../../types';

export type ActivityItemProps = {
  id: string;
  updateField: <K extends keyof StateMachineNodeData>(
    field: K,
    value: StateMachineNodeData[K],
  ) => void;
  onRemove: () => void;
};

/**
 * Child item component representing a single activity. Retrieves its state
 * reactively from the state machine using its stable `id`.
 */
export const ActivityItem: Component<ActivityItemProps> = props => {
  const { hooks } = useFlow();

  const activity = hooks.state({
    selector: ({ context }) => {
      const editingId = context.editing;
      if (!editingId) return undefined;
      const node = context.data?.nodes?.find(n => n.id === editingId);
      const activities = (node?.data as StateMachineNodeData | undefined)
        ?.activities;
      return activities?.find((a, i) => (a.id ?? a.delay ?? String(i)) === props.id);
    },
    equals: deepEqual<StateActivityData | undefined>,
  });

  const allActivities = hooks.state({
    selector: ({ context }) => {
      const editingId = context.editing;
      if (!editingId) return [];
      const node = context.data?.nodes?.find(n => n.id === editingId);
      return (node?.data as StateMachineNodeData | undefined)?.activities ?? [];
    },
    equals: deepEqual<StateActivityData[]>,
  });

  const updateActivity = (patch: Partial<StateActivityData>) => {
    const current = allActivities();
    const updated = current.map((item, i) => {
      if ((item.id ?? item.delay ?? String(i)) === props.id) {
        return { ...item, ...patch };
      }
      return item;
    });
    props.updateField('activities', updated);
  };

  const renameDelay = (newDelay: string) => {
    const delay = newDelay.trim();
    const currentDelay = activity()?.delay;
    if (!delay || delay === currentDelay) return;

    const others = allActivities()
      .filter((item, i) => (item.id ?? item.delay ?? String(i)) !== props.id)
      .map(({ delay }) => delay)
      .filter(Boolean);

    if (others.includes(delay)) return;
    updateActivity({ delay });
  };

  // const error = () => {
  //   const act = activity();
  //   if (!act) return undefined;
  //   const currentDelay = act.delay;
  //   if (!currentDelay) return undefined;

  //   const others = allActivities()
  //     .filter((item, i) => (item.id ?? item.delay ?? String(i)) !== props.id)
  //     .map(({ delay }) => delay)
  //     .filter(Boolean);

  //   if (others.includes(currentDelay)) {
  //     return `delay ('${currentDelay}') duplicated`;
  //   }
  // };

  return (
    <Show when={activity()}>
      {act => {
        return (
          <div class='relative flex flex-col gap-1.5 rounded-lg border border-purple-200/80 bg-white p-2 shadow-xs'>
            {/* Item Top Bar */}
            <div class='flex items-center justify-between border-b border-gray-100 pb-1.5'>
              <div class='flex items-center gap-1.5'>
                <span class='text-xs'>⏱️</span>
                <span class='font-mono text-[11px] font-bold text-purple-900'>
                  {act().delay || 'UNNAMED'}
                </span>
              </div>

              <button
                type='button'
                title='Remove activity'
                onClick={props.onRemove}
                class='cursor-pointer rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600'
              >
                <svg
                  class='size-3.5'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  stroke-width='2'
                >
                  <path d='M18 6L6 18M6 6l12 12' />
                </svg>
              </button>
            </div>

            {/* Delay Input */}
            <div class='flex flex-col gap-0.5'>
              <label class='text-[10px] font-semibold text-gray-600'>
                Delay / Interval Key <span class='text-red-500'>*</span>
              </label>
              <input
                type='text'
                class='w-full rounded border border-gray-200 bg-white px-2 py-1 font-mono text-xs focus:border-purple-500 focus:outline-none'
                value={act().delay}
                placeholder='e.g. POLL, 3000ms, HEARTBEAT'
                onBlur={e => {
                  renameDelay(e.currentTarget.value);
                  e.currentTarget.value = activity()?.delay ?? '';
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
              />
            </div>

            {/* Actions Input */}
            <div class='flex flex-col gap-0.5'>
              <label class='text-[10px] font-semibold text-gray-600'>
                Actions <span class='text-gray-400'>(comma-separated)</span>{' '}
                <span class='text-red-500'>*</span>
              </label>
              <input
                type='text'
                class='w-full rounded border border-gray-200 bg-white px-2 py-1 font-mono text-xs focus:border-purple-500 focus:outline-none'
                value={act().actions.join(', ')}
                placeholder='e.g. refreshData, logHeartbeat'
                onInput={e =>
                  updateActivity({ actions: toList(e.currentTarget.value) })
                }
              />
            </div>

            {/* Guards Input */}
            <div class='flex flex-col gap-0.5'>
              <label class='text-[10px] font-semibold text-gray-600'>
                Guards <span class='text-gray-400'>(optional condition names)</span>
              </label>
              <input
                type='text'
                class='w-full rounded border border-gray-200 bg-white px-2 py-1 font-mono text-xs focus:border-purple-500 focus:outline-none'
                value={act().guards?.join(', ') ?? ''}
                placeholder='e.g. isOnline, hasCredentials'
                onInput={e => {
                  const guards = toList(e.currentTarget.value);
                  updateActivity({ guards: guards.length > 0 ? guards : undefined });
                }}
              />
            </div>

            {/* Description Input */}
            <div class='flex flex-col gap-0.5'>
              <label class='text-[10px] font-semibold text-gray-600'>
                Description <span class='text-gray-400'>(optional)</span>
              </label>
              <input
                type='text'
                class='w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:border-purple-500 focus:outline-none'
                value={act().description ?? ''}
                placeholder='e.g. Ping GPS coordinates every 3s'
                onInput={e =>
                  updateActivity({ description: e.currentTarget.value || undefined })
                }
              />
            </div>
          </div>
        );
      }}
    </Show>
  );
};
