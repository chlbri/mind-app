import type { WithFlow } from '@bemedev/mind-flow-three';
import { Show, type Component } from 'solid-js';

import { PRINCIPAL_NODE_KEY } from '../constants';
import type { StateMachineNodeData } from '../types';

/**
 * Top-right overlay panel rendering the Principal (root) machine node metadata.
 *
 * The principal node is rendered in this HTML panel rather than as a regular scene
 * node, keeping the machine hierarchy summary always visible above the 3D canvas.
 *
 * @param props - Flow engine value of type `WithFlow`.
 *
 * @returns The rendered Solid component.
 */
export const PrincipalPanel: Component<WithFlow> = props => {
  const { hooks } = props.flow;

  const principalNode = hooks.state({
    selector: ({ context: { data } }) =>
      (data?.nodes ?? []).find(
        n => n.id === PRINCIPAL_NODE_KEY || (n.data as any)?.principal,
      ),
  });

  const nodeData = (): StateMachineNodeData | undefined =>
    principalNode()?.data as StateMachineNodeData | undefined;

  const stateType = () => nodeData()?.stateType ?? 'atomic';

  const badgeColor = () => {
    switch (stateType()) {
      case 'compound':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'parallel':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      default:
        return 'bg-sky-100 text-sky-700 border-sky-300';
    }
  };

  return (
    <Show when={nodeData()}>
      <div class='flex max-w-80 flex-col rounded-md border border-gray-700 bg-slate-900/90 p-3 text-slate-100 shadow-lg backdrop-blur-sm select-none'>
        <div class='flex items-center justify-between gap-2 border-b border-gray-700 pb-1.5'>
          <span class='truncate text-sm font-bold'>
            {nodeData()?.title || 'Machine'}
          </span>
          <span
            class={`rounded-full border px-2 text-[9px] font-semibold capitalize ${badgeColor()}`}
          >
            {stateType()}
          </span>
        </div>

        <div class='mt-1 font-mono text-[11px] text-slate-400'>
          {nodeData()?.path || '/'}
        </div>

        <Show when={nodeData()?.content}>
          <p class='mt-1 line-clamp-3 text-xs text-slate-300'>
            {nodeData()?.content}
          </p>
        </Show>
      </div>
    </Show>
  );
};
