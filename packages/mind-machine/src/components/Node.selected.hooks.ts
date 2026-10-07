import { isDirectChildOfPrincipal, PRINCIPAL_NODE_KEY } from '../constants';
import { createHandles } from '../helpers';
import type { StateMachineNodeData } from '../types';
import type { StateMachineNodeSelectedProps } from './Node.selected.types';

export const useNodeSelected = (props: StateMachineNodeSelectedProps) => {
  const { send, hooks, service } = props.flow;

  /** Sender bound to the `SET_NODE_DATA` event of the flow service. */
  const setData = service.sender('SET_NODE_DATA');

  const nodes = hooks.state({
    selector: ({ context: { data } }) => data?.nodes ?? [],
  });

  /** Selected state node record from the flow context. */
  const currentNode = () => nodes().find(n => n.id === props.id);

  const childrenIDs = () => {
    const path: string | undefined = currentNode()?.data?.path;
    return nodes()
      .filter(({ data }) => {
        const _data = data as StateMachineNodeData;
        return path === _data.parentPath;
      })
      .map(({ id }) => id);
  };

  /**
   * Resolves the direct parent node of the selected node, falling back to the
   * principal node for root-level states.
   */
  const parentNode = () => {
    const current = currentNode();
    if (!current) return undefined;
    const parentPath = current.data?.parentPath;
    if (parentPath && parentPath !== PRINCIPAL_NODE_KEY) {
      const found = nodes().find(
        n => n.id === parentPath || n.data?.path === parentPath,
      );
      if (found) return found;
    }
    if (
      parentPath === PRINCIPAL_NODE_KEY ||
      isDirectChildOfPrincipal(current.data?.path ?? props.id)
    ) {
      return nodes().find(
        n => n.id === PRINCIPAL_NODE_KEY || (n.data as any)?.principal,
      );
    }
    return undefined;
  };

  /** Tells whether the parent state is a compound state. */
  const isParentCompound = () => parentNode()?.data?.stateType === 'compound';

  /** Lists the sibling nodes sharing the same parent as the selected node. */
  const siblings = () => {
    const parent = parentNode();
    if (!parent) return [];
    const isParentPrincipal =
      parent.id === PRINCIPAL_NODE_KEY ||
      (parent.data as any)?.principal ||
      parent.data?.path === PRINCIPAL_NODE_KEY;

    if (isParentPrincipal) {
      return nodes().filter(
        n =>
          n.id !== PRINCIPAL_NODE_KEY &&
          !(n.data as any)?.principal &&
          (n.data?.parentPath === PRINCIPAL_NODE_KEY ||
            isDirectChildOfPrincipal(n.data?.path ?? n.id)),
      );
    }

    const pPath = parent.data?.path ?? parent.id;
    return nodes().filter(
      n =>
        n.id !== parent.id &&
        (n.data?.parentPath === pPath || n.data?.parentPath === parent.id),
    );
  };

  const deleteNode = () => {
    if (props.id === PRINCIPAL_NODE_KEY) return;
    const allNodesList = nodes();
    const currentNode = allNodesList.find(n => n.id === props.id);
    const parentPath = currentNode?.data?.parentPath;

    const canvasNodes = allNodesList.filter(
      n => n.id !== PRINCIPAL_NODE_KEY && !(n.data as any)?.principal,
    );

    const remainingCanvasNodes = canvasNodes.filter(n => n.id !== props.id);

    // If all canvas nodes are deleted, principal node is immediately atomic
    if (remainingCanvasNodes.length === 0) {
      const principal = allNodesList.find(
        n => n.id === PRINCIPAL_NODE_KEY || (n.data as any)?.principal,
      );
      if (principal) {
        setData({ id: principal.id, data: { stateType: 'atomic' } });
      }
    } else if (parentPath) {
      const parent = allNodesList.find(
        n => n.id === parentPath || n.data?.path === parentPath,
      );
      const remainingSiblings = allNodesList.filter(
        n =>
          n.id !== props.id &&
          (n.data?.parentPath === parentPath ||
            n.data?.parentPath === parent?.id ||
            (parentPath === PRINCIPAL_NODE_KEY &&
              isDirectChildOfPrincipal(n.data?.path ?? n.id))),
      );

      if (
        remainingSiblings.length === 0 &&
        parent &&
        parent.data?.stateType !== 'final'
      ) {
        setData({ id: parent.id, data: { stateType: 'atomic' } });
      } else if (parent?.data?.stateType === 'compound') {
        const doing =
          remainingSiblings.length === 1 ||
          (remainingSiblings.length > 1 && currentNode?.data?.isInitial);

        if (doing) {
          setData({ id: remainingSiblings[0].id, data: { isInitial: true } });
        }
      }
    }

    send({ type: 'DELETE', payload: props.id });

    childrenIDs().forEach(payload => {
      send({ type: 'DELETE', payload });
    });
  };

  const setInitial = () => {
    setData({ id: props.id, data: { isInitial: true } });

    siblings().forEach(sibling => {
      if (sibling.id !== props.id && sibling.data?.isInitial) {
        setData({ id: sibling.id, data: { isInitial: false } });
      }
    });
  };

  const addChild = () => {
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
      typeof document !== 'undefined' ? document.getElementById(props.id) : null;
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
    if (existingChildren.length === 1 && !existingChildren[0].data?.isInitial) {
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
  };

  const showInitialButton = () =>
    isParentCompound() && !currentNode()?.data?.isInitial;

  return { showInitialButton, deleteNode, setInitial, addChild };
};
