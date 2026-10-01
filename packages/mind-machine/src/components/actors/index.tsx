import { deepEqual } from '@bemedev/app';
import { type WithFlow } from '@bemedev/mind-flow';
import { For, Show, type Component } from 'solid-js';

import type { StateActorData, StateMachineNodeData } from '../../types';
import { ActorItem } from './input';

/** Properties for the {@linkcode ActorInputs} editor component. */
export type ActorInputsProps = {
  /**
   * Updates a single data field of the edited node.
   *
   * @template K - Key of -- type {@linkcode StateMachineNodeData} to update.
   *
   * @param field - Field name to update.
   * @param value - New value assigned to the field.
   */
  updateField: <K extends keyof StateMachineNodeData>(
    field: K,
    value: StateMachineNodeData[K],
  ) => void;
} & WithFlow;

/**
 * Dedicated editor for `@bemedev/app` actors (`ActorConfig`).
 *
 * Maps actors and their nested arrays of objects using `<For>` keyed by stable
 * unique id/key, allowing continuous input editing without focus loss or UI
 * invalidation.
 */
export const ActorInputs: Component<ActorInputsProps> = props => {
  const { hooks } = props.flow;

  /** Stable identifiers of the actors of the node being edited. */
  const actorIds = hooks.state({
    selector: ({ context }) => {
      const editingId = context.editing;
      if (!editingId) return [];
      const node = context.data?.nodes?.find(n => n.id === editingId);
      const actors = (node?.data as StateMachineNodeData | undefined)?.actors ?? [];
      return actors.map((a, i) => a.id ?? a.name ?? String(i));
    },
    equals: deepEqual<string[]>,
  });

  /** Reactive actors list of the node being edited. */
  const actorsList = hooks.state({
    selector: ({ context }) => {
      const editingId = context.editing;
      if (!editingId) return [];
      const node = context.data?.nodes?.find(n => n.id === editingId);
      return (node?.data as StateMachineNodeData | undefined)?.actors ?? [];
    },
    equals: deepEqual<StateActorData[]>,
  });

  /**
   * Appends a new actor of the given type to the node being edited.
   *
   * @param type - Actor classification: `'emitter'` or `'child'`.
   */
  const addActor = (type: 'emitter' | 'child') => {
    const current = actorsList();
    const count = current.length + 1;

    let newActor: StateActorData;
    if (type === 'emitter') {
      newActor = {
        id: `actor_${Date.now()}_${count}`,
        name: `streamSource_${count}`,
        type: 'emitter',
        description: 'Reactive pausable stream source',
        emitter: {
          next: { actions: ['handleNext'] },
          error: { actions: ['handleError'] },
          complete: { actions: ['onComplete'] },
        },
        emissions: {
          next: ['handleNext'],
          error: ['handleError'],
          complete: ['onComplete'],
        },
      };
    } else {
      newActor = {
        id: `actor_${Date.now()}_${count}`,
        name: `childWorker_${count}`,
        type: 'child',
        description: 'Nested child state machine',
        child: {
          on: { DONE: { actions: ['onChildDone'] } },
          contexts: { '.': 'childContext' },
        },
        events: { DONE: ['onChildDone'] },
        contexts: { '.': 'childContext' },
      };
    }

    props.updateField('actors', [...current, newActor]);
  };

  /**
   * Removes an actor from the node being edited.
   *
   * @param id - Stable identifier of the actor to remove.
   */
  const removeActor = (id: string) => {
    const current = actorsList();
    const updated = current.filter(
      (item, i) => (item.id ?? item.name ?? String(i)) !== id,
    );
    props.updateField('actors', updated.length > 0 ? updated : undefined);
  };

  return (
    <div class='flex flex-col gap-2 rounded-xl border border-gray-200 bg-slate-50/70 p-2.5'>
      {/* Header */}
      <div class='flex items-center justify-between'>
        <div class='flex items-center gap-1.5'>
          <span class='font-semibold text-gray-800'>Actors</span>
          <span class='py-0.2 rounded-full bg-indigo-100 px-1.5 text-[10px] font-bold text-indigo-700'>
            {actorIds().length}
          </span>
        </div>

        <div class='flex items-center gap-1'>
          <button
            type='button'
            onClick={() => addActor('emitter')}
            title='Add Pausable stream emitter'
            class='flex cursor-pointer items-center gap-0.5 rounded-md bg-cyan-600 px-2 py-1 text-[10px] font-medium text-white shadow-xs transition hover:bg-cyan-700 active:scale-95'
          >
            + Emitter
          </button>
          <button
            type='button'
            onClick={() => addActor('child')}
            title='Add Nested child state machine'
            class='flex cursor-pointer items-center gap-0.5 rounded-md bg-indigo-600 px-2 py-1 text-[10px] font-medium text-white shadow-xs transition hover:bg-indigo-700 active:scale-95'
          >
            + Child
          </button>
        </div>
      </div>

      <p class='text-[10px] text-gray-500'>
        Emitters (streams) and child machines attached to this state.
      </p>

      {/* List of Actors */}
      <Show
        when={actorIds().length > 0}
        fallback={
          <div class='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white/60 py-3 text-center'>
            <span class='text-[11px] text-gray-400'>No actors attached</span>
            <div class='mt-1.5 flex gap-2'>
              <button
                type='button'
                onClick={() => addActor('emitter')}
                class='cursor-pointer text-[11px] font-semibold text-cyan-600 hover:text-cyan-700 hover:underline'
              >
                + Add Emitter
              </button>
              <span class='text-gray-300'>|</span>
              <button
                type='button'
                onClick={() => addActor('child')}
                class='cursor-pointer text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline'
              >
                + Add Child Actor
              </button>
            </div>
          </div>
        }
      >
        <div class='flex flex-col gap-2.5'>
          <For each={actorIds()}>
            {id => (
              <ActorItem
                flow={props.flow}
                id={id}
                updateField={props.updateField}
                onRemove={() => removeActor(id)}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
