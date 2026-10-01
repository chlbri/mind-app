import type { Accessor } from 'solid-js';

import { dispatchArray } from '../helpers';
import type { StateMachineNodeData } from '../types';

/**
 * Custom hook computing derived reactive state, formatted labels, and display
 * properties for a state machine node.
 *
 * @param props - State machine node data of type {@linkcode StateMachineNodeData}.
 *
 * @returns An object containing reactive accessors for node actors, entries, exits,
 *   activities, actions presence, tags, and badge colors.
 *
 * @see {@linkcode dispatchArray}
 */
export const usePrincipalPanel = (
  props: Accessor<StateMachineNodeData | undefined>,
) => {
  const [, actorCount, hasActors] = dispatchArray.withoutTitle(
    () => props()?.actors,
  );
  const [tags, , hasTags] = dispatchArray.withoutTitle(() => props()?.tags);

  const [, , hasEntry, entries, entriesTile] = dispatchArray(
    { multiple: 'entries:', single: 'entry:' },
    () => props()?.entry,
  );

  const [activities, , hasActivities] = dispatchArray.withoutTitle(
    () => props()?.activities,
  );

  const [, , hasExit, exits, exitsTitle] = dispatchArray(
    { multiple: 'exits:', single: 'exit:' },
    () => props()?.exit,
  );

  const hasActions = () => hasEntry() || hasActivities() || hasExit();

  const badgeColor = () => {
    switch (props()?.stateType) {
      case 'compound':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'parallel':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      default:
        return 'bg-sky-100 text-sky-700 border-sky-300';
    }
  };

  return {
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
  };
};
