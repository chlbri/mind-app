import { Index, Show, type Component } from 'solid-js';

import type { StateActivityData } from '../types';

/** Helper to split comma-separated strings into cleaned array. */
const toList = (val: string): string[] => {
  return val
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
};

export type ActivityInputsProps = {
  activities: () => StateActivityData[] | undefined;
  onChange: (activities: StateActivityData[] | undefined) => void;
};

/**
 * Dedicated editor for `@bemedev/app` state activities (`ActivityConfig`).
 *
 * An activity is an action that executes repeatedly on a named interval (delay)
 * while the state is active, and can have guards, actions, and a description.
 */
export const ActivityInputs: Component<ActivityInputsProps> = props => {
  const activitiesList = () => props.activities() ?? [];

  const addActivity = () => {
    const current = activitiesList();
    const newActivity: StateActivityData = {
      delay: `INTERVAL_${current.length + 1}`,
      actions: ['refresh'],
      description: 'Periodic state activity',
    };
    props.onChange([...current, newActivity]);
  };

  const removeActivity = (index: number) => {
    const current = activitiesList();
    const updated = current.filter((_, i) => i !== index);
    props.onChange(updated.length > 0 ? updated : undefined);
  };

  const updateActivity = (index: number, patch: Partial<StateActivityData>) => {
    const current = activitiesList();
    const updated = current.map((item, i) => {
      if (i === index) {
        return { ...item, ...patch };
      }
      return item;
    });
    props.onChange(updated);
  };

  return (
    <div class='flex flex-col gap-2 rounded-xl border border-gray-200 bg-slate-50/70 p-2.5'>
      {/* Header */}
      <div class='flex items-center justify-between'>
        <div class='flex items-center gap-1.5'>
          <span class='font-semibold text-gray-800'>Activities</span>
          <span class='py-0.2 rounded-full bg-purple-100 px-1.5 text-[10px] font-bold text-purple-700'>
            {activitiesList().length}
          </span>
        </div>

        <button
          type='button'
          onClick={addActivity}
          class='flex cursor-pointer items-center gap-1 rounded-md bg-purple-600 px-2 py-1 text-[11px] font-medium text-white shadow-xs transition hover:bg-purple-700 active:scale-95'
        >
          <svg
            class='size-3'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            stroke-width='2.5'
          >
            <path d='M12 5v14M5 12h14' />
          </svg>
          Add
        </button>
      </div>

      <p class='text-[10px] text-gray-500'>
        Periodic interval actions running while this state is active.
      </p>

      {/* List of Activities */}
      <Show
        when={activitiesList().length > 0}
        fallback={
          <div class='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white/60 py-3 text-center'>
            <span class='text-[11px] text-gray-400'>No activities configured</span>
            <button
              type='button'
              onClick={addActivity}
              class='mt-1 cursor-pointer text-[11px] font-semibold text-purple-600 hover:text-purple-700 hover:underline'
            >
              + Add first activity
            </button>
          </div>
        }
      >
        <div class='flex flex-col gap-2'>
          {/* <Index each={activitiesList()}></Index> */}
          <Index each={activitiesList()}>
            {(activity, index) => (
              <div class='relative flex flex-col gap-1.5 rounded-lg border border-purple-200/80 bg-white p-2 shadow-xs'>
                {/* Item Top Bar */}
                <div class='flex items-center justify-between border-b border-gray-100 pb-1.5'>
                  <div class='flex items-center gap-1.5'>
                    <span class='text-xs'>⏱️</span>
                    <span class='font-mono text-[11px] font-bold text-purple-900'>
                      {activity().delay || 'UNNAMED'}
                    </span>
                  </div>

                  <button
                    type='button'
                    title='Remove activity'
                    onClick={() => removeActivity(index)}
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
                    value={activity().delay}
                    placeholder='e.g. POLL, 3000ms, HEARTBEAT'
                    onInput={e =>
                      updateActivity(index, { delay: e.currentTarget.value })
                    }
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
                    value={activity().actions.join(', ')}
                    placeholder='e.g. refreshData, logHeartbeat'
                    onInput={e =>
                      updateActivity(index, {
                        actions: toList(e.currentTarget.value),
                      })
                    }
                  />
                </div>

                {/* Guards Input */}
                <div class='flex flex-col gap-0.5'>
                  <label class='text-[10px] font-semibold text-gray-600'>
                    Guards{' '}
                    <span class='text-gray-400'>(optional condition names)</span>
                  </label>
                  <input
                    type='text'
                    class='w-full rounded border border-gray-200 bg-white px-2 py-1 font-mono text-xs focus:border-purple-500 focus:outline-none'
                    value={activity().guards?.join(', ') ?? ''}
                    placeholder='e.g. isOnline, hasCredentials'
                    onInput={e => {
                      const guards = toList(e.currentTarget.value);
                      updateActivity(index, {
                        guards: guards.length > 0 ? guards : undefined,
                      });
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
                    value={activity().description ?? ''}
                    placeholder='e.g. Ping GPS coordinates every 3s'
                    onInput={e =>
                      updateActivity(index, {
                        description: e.currentTarget.value || undefined,
                      })
                    }
                  />
                </div>
              </div>
            )}
          </Index>
        </div>
      </Show>
    </div>
  );
};
