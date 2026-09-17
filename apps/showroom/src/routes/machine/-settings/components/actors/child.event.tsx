import { deepEqual } from '@bemedev/app';
import { useFlow } from '@bemedev/mind-flow';
import { Show, type Component } from 'solid-js';

import { toList } from '../../helpers';
import type {
  StateActorChildEventHandler,
  StateActorData,
  StateMachineNodeData,
} from '../../types';

export type ActorChildEventItemProps = {
  actorId: string;
  eventKey: string;
  updateField: <K extends keyof StateMachineNodeData>(
    field: K,
    value: StateMachineNodeData[K],
  ) => void;
};

/**
 * Child item component representing a single handled event on a child actor
 * (`child.on`). Retrieves its configuration reactively from the state machine by
 * `actorId` and `eventKey`.
 */
export const ActorChildEventItem: Component<ActorChildEventItemProps> = props => {
  const { hooks } = useFlow();

  const allActors = hooks.state({
    selector: ({ context }) => {
      const editingId = context.editing;
      if (!editingId) return [];
      const node = context.data?.nodes?.find(n => n.id === editingId);
      return (node?.data as StateMachineNodeData | undefined)?.actors ?? [];
    },
    equals: deepEqual<StateActorData[]>,
  });

  const eventHandler = hooks.state({
    selector: ({ context }) => {
      const editingId = context.editing;
      if (!editingId) return undefined;
      const node = context.data?.nodes?.find(n => n.id === editingId);
      const actors = (node?.data as StateMachineNodeData | undefined)?.actors;
      const actor = actors?.find(
        (a, i) => (a.id ?? a.name ?? String(i)) === props.actorId,
      );
      return actor?.child?.on?.[props.eventKey];
    },
    equals: deepEqual<StateActorChildEventHandler | undefined>,
  });

  const updateChild = (
    updater: (
      currentChild: NonNullable<StateActorData['child']>,
    ) => StateActorData['child'],
  ) => {
    const current = allActors();
    const updated = current.map((item, i) => {
      if ((item.id ?? item.name ?? String(i)) === props.actorId) {
        const currentChild = item.child ?? {};
        const newChild = updater(currentChild);
        const merged: StateActorData = { ...item, child: newChild };
        const events: Record<string, string[]> = {};
        if (merged.child?.on) {
          Object.entries(merged.child.on).forEach(([ev, h]) => {
            events[ev] = h.actions ?? [];
          });
        }
        merged.events = events;
        merged.contexts = merged.child?.contexts;
        return merged;
      }
      return item;
    });
    props.updateField('actors', updated);
  };

  const currentActor = () => {
    return allActors().find(
      (a, i) => (a.id ?? a.name ?? String(i)) === props.actorId,
    );
  };

  const updateHandler = (patch: Partial<StateActorChildEventHandler>) => {
    updateChild(child => {
      const on = child.on ?? {};
      const current = on[props.eventKey] ?? {};
      return { ...child, on: { ...on, [props.eventKey]: { ...current, ...patch } } };
    });
  };

  const renameEventKey = (newKey: string) => {
    const trimmed = newKey.trim();
    if (!trimmed || trimmed === props.eventKey) return;

    const currentOn = currentActor()?.child?.on ?? {};
    if (trimmed in currentOn) return;

    updateChild(child => {
      const on = child.on ?? {};
      if (trimmed in on) return child;
      const { [props.eventKey]: old, ...rest } = on;
      return { ...child, on: { ...rest, [trimmed]: old ?? { actions: [] } } };
    });
  };

  const removeEvent = () => {
    updateChild(child => {
      const { [props.eventKey]: _, ...rest } = child.on ?? {};
      return { ...child, on: rest };
    });
  };

  return (
    <Show when={eventHandler()}>
      {handler => (
        <div class='flex flex-col gap-1 rounded border border-gray-200 bg-white p-1.5 shadow-2xs'>
          <div class='flex items-center justify-between'>
            <input
              type='text'
              class='rounded border border-indigo-200 bg-indigo-50/40 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-900 focus:border-indigo-500 focus:outline-none'
              value={props.eventKey}
              onBlur={e => {
                renameEventKey(e.currentTarget.value);
                e.currentTarget.value = props.eventKey;
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
            />

            <button
              type='button'
              title='Delete event handler'
              onClick={removeEvent}
              class='cursor-pointer rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-600'
            >
              <svg
                class='size-3'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                stroke-width='2'
              >
                <path d='M18 6L6 18M6 6l12 12' />
              </svg>
            </button>
          </div>

          <div class='flex flex-col gap-0.5'>
            <label class='text-[9px] text-gray-500'>Actions (comma-separated)</label>
            <input
              type='text'
              class='w-full rounded border border-gray-200 px-1.5 py-0.5 font-mono text-[11px] focus:border-indigo-500 focus:outline-none'
              value={handler().actions?.join(', ') ?? ''}
              placeholder='e.g. notifyParent, syncStatus'
              onInput={e => {
                const actions = toList(e.currentTarget.value);
                updateHandler({ actions });
              }}
            />
          </div>

          <div class='grid grid-cols-2 gap-1.5'>
            <div class='flex flex-col gap-0.5'>
              <label class='text-[9px] text-gray-500'>Target State</label>
              <input
                type='text'
                class='w-full rounded border border-gray-200 px-1.5 py-0.5 font-mono text-[11px] focus:border-indigo-500 focus:outline-none'
                value={handler().target ?? ''}
                placeholder='e.g. /approved'
                onInput={e => {
                  updateHandler({ target: e.currentTarget.value || undefined });
                }}
              />
            </div>

            <div class='flex flex-col gap-0.5'>
              <label class='text-[9px] text-gray-500'>Guards</label>
              <input
                type='text'
                class='w-full rounded border border-gray-200 px-1.5 py-0.5 font-mono text-[11px] focus:border-indigo-500 focus:outline-none'
                value={handler().guards?.join(', ') ?? ''}
                placeholder='e.g. isValid'
                onInput={e => {
                  const guards = toList(e.currentTarget.value);
                  updateHandler({ guards: guards.length > 0 ? guards : undefined });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </Show>
  );
};
