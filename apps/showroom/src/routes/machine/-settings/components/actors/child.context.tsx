import { deepEqual } from '@bemedev/app';
import { useFlow } from '@bemedev/mind-flow';
import { createMemo, type Component } from 'solid-js';

import type { StateActorData, StateMachineNodeData } from '../../types';

export type ActorChildContextItemProps = {
  actorId: string;
  contextKey: string;
  updateField: <K extends keyof StateMachineNodeData>(
    field: K,
    value: StateMachineNodeData[K],
  ) => void;
};

/**
 * Child item component representing a single context projection mapping
 * (`child.contexts`). Retrieves its target context reactively from the state
 * machine.
 */
export const ActorChildContextItem: Component<
  ActorChildContextItemProps
> = props => {
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

  const contextValue = hooks.state({
    selector: ({ context }) => {
      const editingId = context.editing;
      if (!editingId) return undefined;
      const node = context.data?.nodes?.find(n => n.id === editingId);
      const actors = (node?.data as StateMachineNodeData | undefined)?.actors;
      const actor = actors?.find(
        (a, i) => (a.id ?? a.name ?? String(i)) === props.actorId,
      );
      return actor?.child?.contexts?.[props.contextKey];
    },
    equals: deepEqual<string | undefined>,
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
        const merged: StateActorData = {
          ...item,
          child: newChild,
          contexts: newChild?.contexts,
        };
        return merged;
      }
      return item;
    });
    props.updateField('actors', updated);
  };

  const currentActor = createMemo(() => {
    return allActors().find(
      (a, i) => (a.id ?? a.name ?? String(i)) === props.actorId,
    );
  });

  const renameKey = (newKey: string) => {
    const trimmed = newKey.trim();
    if (!trimmed || trimmed === props.contextKey) return;

    const currentContexts = currentActor()?.child?.contexts ?? {};
    if (trimmed in currentContexts) return;

    updateChild(child => {
      const contexts = child.contexts ?? {};
      if (trimmed in contexts) return child;
      const { [props.contextKey]: oldVal, ...rest } = contexts;
      return { ...child, contexts: { ...rest, [trimmed]: oldVal ?? '' } };
    });
  };

  const updateValue = (newVal: string) => {
    updateChild(child => {
      const contexts = child.contexts ?? {};
      return { ...child, contexts: { ...contexts, [props.contextKey]: newVal } };
    });
  };

  const removeMapping = () => {
    updateChild(child => {
      const { [props.contextKey]: _, ...rest } = child.contexts ?? {};
      return { ...child, contexts: rest };
    });
  };

  return (
    <div class='flex items-center gap-1.5 rounded border border-gray-200 bg-white p-1 shadow-2xs'>
      <input
        type='text'
        title='Child context path (e.g. . or user.id)'
        class='w-1/2 rounded border border-gray-200 px-1 py-0.5 font-mono text-[10px] focus:border-indigo-500 focus:outline-none'
        value={props.contextKey}
        onBlur={e => {
          renameKey(e.currentTarget.value);
          e.currentTarget.value = props.contextKey;
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
      />
      <span class='text-xs text-gray-400'>→</span>
      <input
        type='text'
        title='Parent pContext path (e.g. fraudScore)'
        class='w-1/2 rounded border border-gray-200 px-1 py-0.5 font-mono text-[10px] focus:border-indigo-500 focus:outline-none'
        value={contextValue() ?? ''}
        onInput={e => updateValue(e.currentTarget.value)}
      />

      <button
        type='button'
        title='Delete mapping'
        onClick={removeMapping}
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
  );
};
