import { HANDLE_SIZE, useFlow } from '@bemedev/mind-flow';
import type { Component } from 'solid-js';

import { NODE_HANDLES } from '../data';

/** Properties for the {@linkcode StateMachineNodeSelected} component. */
export type StateMachineNodeSelectedProps = {
  /** Unique identifier of the selected state node. */
  id: string;
};

/**
 * Custom action toolbar rendered above a selected state machine node in the
 * showroom.
 *
 * Provides icon-only buttons for:
 *
 * - Deleting the state node
 * - Adding a child sub-state 250px below the parent bottom-left corner with an edge
 *   from parent bottom handle to child top handle
 */
export const StateMachineNodeSelected: Component<
  StateMachineNodeSelectedProps
> = props => {
  const { send, hooks } = useFlow();

  const nodes = hooks.state({
    selector: ({ context: { data } }) => data?.nodes ?? [],
  });

  return (
    <div class='flex items-center gap-1.5 rounded-full bg-slate-900/90 px-2 py-1 shadow-lg ring-1 ring-white/20 backdrop-blur-xs'>
      {/* Delete State Button */}
      <button
        type='button'
        class='flex cursor-pointer items-center justify-center rounded-full bg-red-600 text-white transition-transform hover:scale-110 active:scale-95'
        style={{
          'pointer-events': 'all',
          width: `${HANDLE_SIZE * 1.8}px`,
          height: `${HANDLE_SIZE * 1.8}px`,
        }}
        onClick={e => {
          e.stopPropagation();
          send({ type: 'DELETE', payload: props.id });
        }}
      >
        <svg
          class='h-3.5 w-3.5 fill-current'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' />
        </svg>
      </button>

      {/* Add Child State Button */}
      <button
        type='button'
        class='flex cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white transition-transform hover:scale-110 active:scale-95'
        style={{
          'pointer-events': 'all',
          width: `${HANDLE_SIZE * 1.8}px`,
          height: `${HANDLE_SIZE * 1.8}px`,
        }}
        onClick={e => {
          e.stopPropagation();
          const parentNode = nodes().find(n => n.id === props.id);
          if (!parentNode) return;

          const parentPath = parentNode.data?.path ?? parentNode.id;
          const existingChildren = nodes().filter(
            n =>
              n.data?.parentPath === parentPath || n.id.startsWith(`${parentPath}/`),
          );
          const childName = `state-${existingChildren.length + 1}`;
          const childId = `${parentPath}/${childName}`;
          const parentTitle =
            parentNode.data?.title ?? parentPath.split('/').pop() ?? 'parent';

          const el =
            typeof document !== 'undefined'
              ? document.getElementById(props.id)
              : null;
          const parentHeight = el?.offsetHeight ?? 60;

          // Target position: 250px below the bottom-left corner of the parent node
          const targetX = parentNode.position.x;
          const targetY = parentNode.position.y + parentHeight + 150;

          // 1. Dispatch ADD_PARENT to add the child node and link bottom-to-top hierarchy edge
          send({
            type: 'ADD_PARENT',
            payload: {
              id: childId,
              parentId: props.id,
              data: {
                id: childId,
                title: childName,
                path: childId,
                parentPath,
                stateType: 'atomic',
              },
              handles: NODE_HANDLES,
            },
          });

          // 2. Dispatch MOVE to position node at 250px below parent bottom-left corner
          send({ type: 'MOVE', payload: { id: childId, x: targetX, y: targetY } });

          // 3. Mark parent as compound if needed
          if (parentNode.data?.stateType !== 'compound') {
            send({
              type: 'SET_NODE_DATA',
              payload: { id: props.id, data: { stateType: 'compound' } },
            });
          }

          // 4. Set edge metadata for the child_parent relation
          const edgeId = `edge = ${props.id} => ${childId}:top:0`;
          send({
            type: 'SET_EDGE_DATA',
            payload: {
              id: edgeId,
              data: { kind: 'child_parent', label: `child of : /${parentTitle}` },
            },
          });
        }}
      >
        {/* Child Substate / Tree Icon */}
        <svg
          class='h-3.5 w-3.5 fill-current'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M3 3h6v6H3V3m2 2v2h2V5H5m14 10h-6v6h6v-6m-2 2v2h-2v-2h2m-6-10v3h-3v8h2v-6h1v3h6V7h-6M5 11h2v2H5v-2z' />
        </svg>
      </button>
    </div>
  );
};
