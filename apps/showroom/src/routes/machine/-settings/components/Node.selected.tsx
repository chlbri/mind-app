import { HANDLE_SIZE, useFlow } from '@bemedev/mind-flow';
import type { Component } from 'solid-js';

import { createHandles } from '../helpers';

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
  const { send, hooks, service } = useFlow();
  const setData = service.sender('SET_NODE_DATA');

  const nodes = hooks.state({
    selector: ({ context: { data } }) => data?.nodes ?? [],
  });

  return (
    <div class='flex items-center gap-1.5 rounded-full bg-zinc-800/10 px-2 py-1 shadow-xl backdrop-blur-sm'>
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
          const currentNode = nodes().find(n => n.id === props.id);
          const parentPath = currentNode?.data?.parentPath;
          if (parentPath) {
            const parent = nodes().find(
              n => n.id === parentPath || n.data?.path === parentPath,
            );
            const remainingSiblings = nodes().filter(
              n =>
                n.id !== props.id &&
                (n.data?.parentPath === parentPath ||
                  n.data?.parentPath === parent?.id),
            );

            if (
              remainingSiblings.length === 0 &&
              parent &&
              parent.data?.stateType !== 'final'
            ) {
              setData({ id: parent.id, data: { stateType: 'atomic' } });
            } else if (remainingSiblings.length === 1) {
              setData({ id: remainingSiblings[0].id, data: { isInitial: true } });
            } else if (
              remainingSiblings.length > 1 &&
              currentNode?.data?.isInitial
            ) {
              setData({ id: remainingSiblings[0].id, data: { isInitial: true } });
            }
          }
          send({ type: 'DELETE', payload: props.id });
        }}
      >
        <svg
          class='size-3.5 fill-current'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' />
        </svg>
      </button>

      {/* Add Child State Button */}
      <button
        type='button'
        class='flex cursor-pointer items-center justify-center rounded-full border border-white bg-indigo-600 text-white transition-transform hover:scale-110 active:scale-95'
        style={{
          'pointer-events': 'all',
          width: `${HANDLE_SIZE * 1.8}px`,
          height: `${HANDLE_SIZE * 1.8}px`,
        }}
        onClick={e => {
          // #region 0. Preparation
          e.stopPropagation();
          const parentNode = nodes().find(n => n.id === props.id);
          if (!parentNode) return;

          const parentPath = parentNode.data?.path ?? parentNode.id;
          const existingChildren = nodes().filter(
            n =>
              n.data?.parentPath === parentPath ||
              n.data?.parentPath === props.id ||
              n.id.startsWith(`${parentPath}/`),
          );
          const isFirstChild = existingChildren.length === 0;
          const childName = `state-${existingChildren.length + 1}`;
          const childId = `${parentPath}/${childName}`;
          const parentTitle =
            parentNode.data?.title ?? parentPath.split('/').pop() ?? 'parent';

          const el =
            typeof document !== 'undefined'
              ? document.getElementById(props.id)
              : null;
          const parentHeight = el?.offsetHeight ?? 60;

          // #region Target position: 250px below the bottom-left corner of the parent node
          const targetX = parentNode.position.x;
          const targetY = parentNode.position.y + parentHeight + 150;
          // #endregion
          // #endregion

          // #region 1. Dispatch ADD_PARENT to add the child node and link bottom-to-top hierarchy edge
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
                isInitial: isFirstChild,
              },
              handles: createHandles(),
            },
          });
          // #endregion

          // 2. Dispatch MOVE to position node at 250px below parent bottom-left corner
          send({ type: 'MOVE', payload: { id: childId, x: targetX, y: targetY } });

          // #region 3. If there was already 1 child without isInitial: true, ensure it is initial
          if (
            existingChildren.length === 1 &&
            !existingChildren[0].data?.isInitial
          ) {
            setData({ id: existingChildren[0].id, data: { isInitial: true } });
          }
          // #endregion

          // #region 4. Mark parent as compound if needed
          if (
            parentNode.data?.stateType !== 'compound' &&
            parentNode.data?.stateType !== 'parallel'
          ) {
            setData({ id: props.id, data: { stateType: 'compound' } });
          }
          // #endregion

          // #region 5. Set edge metadata for the child_parent relation
          const edgeId = `edge = ${props.id} => ${childId}:top:0`;
          send({
            type: 'SET_EDGE_DATA',
            payload: {
              id: edgeId,
              data: { kind: 'child_parent', label: `child of : /${parentTitle}` },
            },
          });
          // #endregion
        }}
      >
        {/* Child Substate / Tree Icon */}
        <svg
          xmlns='http://www.w3.org/2000/svg'
          class='size-3.5'
          viewBox='0 -960 960 960'
          fill='#e3e3e3'
        >
          <path d='M609-389q-29-29-29-71t29-71q29-29 71-29t71 29q29 29 29 71t-29 71q-29 29-71 29t-71-29ZM480-160v-56q0-24 12.5-44.5T528-290q36-15 74.5-22.5T680-320q39 0 77.5 7.5T832-290q23 9 35.5 29.5T880-216v56H480ZM287-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm113-113ZM80-160v-112q0-34 17-62.5t47-43.5q60-30 124.5-46T400-440q35 0 70 6t70 14l-34 34-34 34q-18-5-36-6.5t-36-1.5q-58 0-113.5 14T180-306q-10 5-15 14t-5 20v32h240v80H80Zm320-80Zm56.5-343.5Q480-607 480-640t-23.5-56.5Q433-720 400-720t-56.5 23.5Q320-673 320-640t23.5 56.5Q367-560 400-560t56.5-23.5Z' />
        </svg>
      </button>
    </div>
  );
};
