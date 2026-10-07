import type { FlowProps } from '@bemedev/mind-flow-three';

import { Principal } from './parser';
import type { StateMachineEdgeData, StateMachineNodeData } from './types';

/** Edge connection predicate of the 3D `Flow` component. */
export type EdgesAllowed = NonNullable<
  FlowProps<StateMachineNodeData, StateMachineEdgeData>['edgesAllowed']
>;

/** Default data assigned to new nodes created in the scene. */
export const DEFAULT_NODE_DATA: StateMachineNodeData = {
  id: 'new-state',
  title: 'New State',
  path: '/new-state',
  stateType: 'atomic',
};

/**
 * Guard preventing the deletion of the principal (unique) machine node.
 *
 * @param args - The guard arguments provided by the flow machine `REMOVE_NODE`
 *   event.
 *
 * @returns `false` when the target node is the unique principal node, `true`
 *   otherwise.
 */
export const canDelete = ({ context: { data }, payload }: any): boolean => {
  const node = data?.nodes?.find((n: any) => n.id === payload);
  return (node?.data as any)?.principal !== Principal.unique;
};

/**
 * Edge connection rule for state machine diagrams.
 *
 * Only transitions between two distinct states of the same hierarchy level are
 * allowed: hierarchy shortcuts, self loops and transitions crossing a parent-child
 * boundary are rejected.
 *
 * @param from - The source node entity.
 * @param to - The target node entity.
 *
 * @returns `true` when the connection is allowed, `false` otherwise.
 */
export const machineEdgesAllowed: EdgesAllowed = (from, to) => {
  const fromPath = from.data?.path;
  const toPath = to.data?.path;

  if (!fromPath || !toPath) return false;
  if (fromPath === toPath) return false;

  const isChildOf =
    from.data?.parentPath === toPath ||
    from.data?.parentPath === to.id ||
    fromPath.startsWith(`${toPath}/`);

  const isParentOf =
    to.data?.parentPath === fromPath ||
    to.data?.parentPath === from.id ||
    toPath.startsWith(`${fromPath}/`);

  return !isChildOf && !isParentOf;
};
