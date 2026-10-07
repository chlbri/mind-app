import type { FlowProps } from '@bemedev/mind-flow-fabric';

import { Principal } from './parser';
import type { StateMachineEdgeData, StateMachineNodeData } from './types';

/** Edge connection predicate of the `Flow` component. */
export type EdgesAllowed = NonNullable<
  FlowProps<StateMachineNodeData, StateMachineEdgeData>['edgesAllowed']
>;

/** Default data assigned to new nodes created on the canvas. */
export const DEFAULT_NODE_DATA: StateMachineNodeData = {
  id: 'new-state',
  title: 'New State',
  path: '/new-state',
  stateType: 'atomic',
};

/**
 * Guard preventing the deletion of the principal (unique) machine node.
 *
 * @param args - The guard arguments provided by the flow machine `DELETE` event.
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
 * Only strictly horizontal `output` to `input` connections between nodes of the same
 * edge kind index are allowed. Hierarchy (`top`/`bottom`) handles and
 * child-to-parent shortcuts are rejected.
 *
 * @param from - The source node.
 * @param to - The target node.
 * @param edge - The candidate edge extremities.
 *
 * @returns `true` when the connection is allowed, `false` otherwise.
 */
export const machineEdgesAllowed: EdgesAllowed = (from, to, edge) => {
  const fromPath = from.data?.path;
  const toPath = to.data?.path;
  if (!fromPath || !toPath) return false;

  const none =
    ['bottom', 'top'].includes(edge.fromPosition as any) ||
    ['bottom', 'top'].includes(edge.toPosition as any);

  if (none) return false;

  if (edge.fromPosition === 'right') {
    const isChildOf =
      from.data?.parentPath === to.data?.path ||
      from.data?.parentPath === to.id ||
      fromPath.startsWith(`${toPath}/`);

    return !isChildOf && edge.fromIndex === edge.toIndex;
  }

  return false;
};
