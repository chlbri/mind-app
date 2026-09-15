import { deepEqual } from '@bemedev/app/utils';
import { clamp, cn, useFlow, type EdgeMiddleProps } from '@bemedev/mind-flow';
import { For, Show, type Component } from 'solid-js';

import { monoLength } from '../helpers';
import { setActiveAddTransitionEdge } from '../signals';
import type { EdgeKind, StateMachineEdgeData } from '../types';

export const StateMachineEdgeMiddle: Component<
  EdgeMiddleProps<StateMachineEdgeData>
> = props => {
  const { hooks, send } = useFlow();

  const edgeRecord = hooks.state({
    selector: ({ context }) => context.data?.edges?.find(e => e.id === props.id),
    equals: deepEqual<any>,
  });

  const edgeData = () =>
    (props.data ?? edgeRecord()?.data) as StateMachineEdgeData | undefined;

  const selected =
    props.selected ??
    hooks.state({ selector: s => s.context.selected === props.id });

  const transitions = () => {
    const data = edgeData();
    if (
      data?.transitions &&
      Array.isArray(data.transitions) &&
      data.transitions.length > 0
    ) {
      return data.transitions;
    }

    return [];
  };

  const addColors = () => getKindConfig(props.data?.kind);

  const getKindConfig = (k?: EdgeKind) => {
    switch (k) {
      case 'child_parent':
        return {
          bg: 'bg-purple-600',
          add: 'bg-purple-500',
          ring: 'rounded-xl ring-2 ring-offset-4 ring-purple-600',
          border: 'border-purple-800',
          text: 'text-white',
          fill: '#8b5cf6',
          stroke: '#c4b5fd',
          icon: '⮑',
          name: 'Child-to-Parent',
        };
      case 'after':
        return {
          bg: 'bg-orange-500',
          add: 'bg-orange-400',
          ring: 'rounded-xl ring-2 ring-offset-8 ring-orange-600',
          border: 'border-orange-800',
          text: 'text-white',
          fill: '#f97316',
          stroke: '#fed7aa',
          icon: '⏱',
          name: 'After',
        };
      case 'always':
        return {
          bg: 'bg-green-600',
          add: 'bg-green-700',
          ring: 'rounded-xl ring-2 ring-offset-8 ring-green-600',
          border: 'border-green-800',
          text: 'text-white',
          fill: '#22c55e',
          stroke: '#bbf7d0',
          icon: '⚡',
          name: 'Always',
        };
      case 'on':
      default:
        return {
          bg: 'bg-blue-600',
          add: 'bg-blue-500',
          ring: 'rounded-xl ring-2 ring-offset-8 ring-blue-600',
          border: 'border-blue-800',
          text: 'text-white',
          fill: '#3b82f6',
          stroke: '#bfdbfe',
          icon: '🔀',
          name: 'On',
        };
    }
  };

  const badgeWidth = () => {
    const added = selected() ? 30 : 12;
    const min = selected() ? 130 : 100;

    const text = transitions()
      .map(t => {
        const { icon, name } = getKindConfig(t.kind);
        return `${icon}   ${t.label ?? name}`;
      })
      .sort((a, b) => a.length - b.length)[0];

    return clamp(monoLength(text) + added, min, 210);
  };

  const ITEM_HEIGHT = 22;
  const GAP = 4;
  const count = () => Math.max(0, transitions().length);

  const totalHeight = () => {
    const itemsH = count() * ITEM_HEIGHT + (count() - 1) * GAP;
    const addH = showAdd() ? ITEM_HEIGHT + GAP : 0;
    return itemsH + addH + 4;
  };

  const deleteTransition = (transitionId: string) => {
    const current = transitions();

    if (current.length <= 1) {
      send({ type: 'DELETE', payload: props.id });
    } else {
      const updated = current.filter(t => t.id !== transitionId);
      send({
        type: 'SET_EDGE_DATA',
        payload: {
          id: props.id,
          data: {
            ...edgeData(),
            transitions: updated,
            label:
              updated.length === 1
                ? updated[0].label
                : `${updated.length} transitions`,
          } as any,
        },
      });
    }
  };

  const showAdd = () => {
    const _transitions = transitions();

    if (_transitions.length === 1) {
      const transition = _transitions[0];
      if (transition.kind === 'child_parent') return false;
    }

    if (_transitions.length === 0) return selected();
    return selected();
  };

  const ring = () => {
    const kind = getKindConfig(props.data?.kind);
    return kind.ring;
  };

  return (
    <foreignObject
      x={-badgeWidth() / 2}
      y={-totalHeight() / 2}
      width={badgeWidth()}
      height={totalHeight()}
      style={{ overflow: 'visible', 'pointer-events': 'none' }}
      class='z-100'
    >
      <div
        class={cn(
          `flex cursor-pointer flex-col items-center justify-center gap-px border-none select-none`,
          selected() && ring(),
        )}
        style={{
          width: '100%',
          height: `${totalHeight()}px`,
          'pointer-events': 'none',
        }}
        classList={{ 'bg-gray-50/80': selected() }}
      >
        {/* Stacked Transition Badges */}
        <For each={transitions()}>
          {t => {
            const conf = () => getKindConfig(t.kind);

            return (
              <div
                class={`flex w-full items-center justify-center gap-1`}
                style={{ padding: '2px 8px', 'pointer-events': 'all' }}
                onMouseDown={e => {
                  e.stopPropagation();
                  send({ type: 'SELECT', payload: props.id });
                }}
              >
                <p
                  class={`flex max-w-full min-w-0 items-center gap-1 rounded-full border px-2 py-1 font-mono text-[10px] font-bold shadow-sm ${conf().bg} ${conf().text}`}
                >
                  <span class='shrink-0'>{conf().icon}</span>
                  <span class='min-w-0 flex-1 truncate text-center'>
                    {t.label || conf().name}
                  </span>
                </p>

                {/* Delete button for this transition when edge is selected */}
                <Show when={showAdd()}>
                  <button
                    type='button'
                    class='ml-1 h-3.5 w-3.5 shrink-0 cursor-pointer rounded-full bg-red-500 text-[9px] font-black text-white shadow-sm hover:bg-red-600'
                    title='Delete transition'
                    onMouseDown={e => {
                      e.stopPropagation();
                      deleteTransition(t.id);
                    }}
                  >
                    X
                  </button>
                </Show>
              </div>
            );
          }}
        </For>

        {/* "+ Add transition" button when selected */}
        <Show when={showAdd()}>
          <div
            class='flex w-full items-center justify-center'
            style={{ 'pointer-events': 'all' }}
          >
            <button
              type='button'
              class={cn(
                'flex cursor-pointer items-center justify-center rounded-full border px-2 py-1 text-[9.5px] font-bold shadow-sm mx-2',
                addColors().add,
                addColors().text,
                addColors().border,
              )}
              style={{ width: '100%' }}
              onMouseDown={e => {
                e.stopPropagation();
                setActiveAddTransitionEdge({
                  edgeId: props.id,
                  from: edgeData()?.fromState ?? '',
                  to: edgeData()?.toState ?? '',
                  kind: edgeData()?.kind ?? transitions()[0]?.kind,
                });
              }}
            >
              + Add
            </button>
            <Show when={transitions().length === 0}>
              <button
                type='button'
                class='ml-1 h-3.5 w-3.5 shrink-0 cursor-pointer rounded-full bg-red-500 text-[9px] font-black text-white shadow-sm hover:bg-red-600'
                title='Delete transition'
                onMouseDown={e => {
                  e.stopPropagation();
                  send({ type: 'DELETE', payload: props.id });
                }}
              >
                X
              </button>
            </Show>
          </div>
        </Show>
      </div>
    </foreignObject>
  );
};
