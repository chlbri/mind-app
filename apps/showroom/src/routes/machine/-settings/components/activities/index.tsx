import { deepEqual } from '@bemedev/app';
import { useFlow } from '@bemedev/mind-flow';
import { For, Show, type Component } from 'solid-js';

import type { StateActivityData, StateMachineNodeData } from '../../types';
import { ActivityItem } from './input';

export type ActivityInputsProps = {
  updateField: <K extends keyof StateMachineNodeData>(
    field: K,
    value: StateMachineNodeData[K],
  ) => void;
};

/**
 * Dedicated editor for `@bemedev/app` state activities (`ActivityConfig`).
 *
 * Maps activities using `<For>` keyed by stable unique id/key, allowing continuous
 * input editing without focus loss or UI invalidation.
 */
export const ActivityInputs: Component<ActivityInputsProps> = props => {
  const { hooks } = useFlow();

  const activityIds = hooks.state({
    selector: ({ context }) => {
      const editingId = context.editing;
      if (!editingId) return [];
      const node = context.data?.nodes?.find(n => n.id === editingId);
      const activities =
        (node?.data as StateMachineNodeData | undefined)?.activities ?? [];
      return activities.map((a, i) => a.id ?? a.delay ?? String(i));
    },
    equals: deepEqual<string[]>,
  });

  const activitiesList = hooks.state({
    selector: ({ context }) => {
      const editingId = context.editing;
      if (!editingId) return [];
      const node = context.data?.nodes?.find(n => n.id === editingId);
      return (node?.data as StateMachineNodeData | undefined)?.activities ?? [];
    },
    equals: deepEqual<StateActivityData[]>,
  });

  const addActivity = () => {
    const current = activitiesList();
    const count = current.length + 1;
    const newActivity: StateActivityData = {
      id: `activity_${Date.now()}_${count}`,
      delay: `INTERVAL_${count}`,
      actions: ['refresh'],
      description: 'Periodic state activity',
    };
    props.updateField('activities', [...current, newActivity]);
  };

  const removeActivity = (id: string) => {
    const current = activitiesList();
    const updated = current.filter(
      (item, i) => (item.id ?? item.delay ?? String(i)) !== id,
    );
    props.updateField('activities', updated.length > 0 ? updated : undefined);
  };

  return (
    <div class='flex flex-col gap-2 rounded-xl border border-gray-200 bg-slate-50/70 p-2.5'>
      {/* Header */}
      <div class='flex items-center justify-between'>
        <div class='flex items-center gap-1.5'>
          <span class='font-semibold text-gray-800'>Activities</span>
          <span class='py-0.2 rounded-full bg-purple-100 px-1.5 text-[10px] font-bold text-purple-700'>
            {activityIds().length}
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
        when={activityIds().length > 0}
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
          <For each={activityIds()}>
            {id => (
              <ActivityItem
                id={id}
                updateField={props.updateField}
                onRemove={() => removeActivity(id)}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
