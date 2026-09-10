import { createState } from '@bemedev/app-solidjs';
import { deepEqual } from '@bemedev/app/utils';
import {
  EdgeCursive,
  EdgeStraight,
  useFlow,
  type EdgeProps,
  type Vector,
} from '@bemedev/mind-flow';
import { nanoid } from 'nanoid';
import {
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
  type Accessor,
  type Component,
} from 'solid-js';

import type {
  EdgeKind,
  StateMachineEdgeData,
  StateMachineNodeData,
  TransitionItem,
} from './-machine.types';

export const [activeActorNode, setActiveActorNode] =
  createSignal<StateMachineNodeData | null>(null);

export type ActiveAddTransition = { edgeId: string; from: string; to: string };

export const [activeAddTransitionEdge, setActiveAddTransitionEdge] =
  createSignal<ActiveAddTransition | null>(null);

/** Global edge filter signal to toggle visibility of the 4 edge types. */
export const [edgeFilters, setEdgeFilters] = createSignal<Record<EdgeKind, boolean>>(
  { child_parent: true, after: true, always: true, on: true },
);

/**
 * Custom node renderer for `@bemedev/app` state machines.
 *
 * Displays state metadata, hierarchy path, entry/exit actions, and an interactive
 * bubble at the top-right corner if the state has actors attached.
 */
export const StateMachineNode: Component<StateMachineNodeData> = props => {
  const actorCount = () => props.actors?.length ?? 0;
  const hasActors = () => actorCount() > 0;

  const badgeColor = () => {
    switch (props.stateType) {
      case 'compound':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'initial':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'final':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-sky-100 text-sky-700 border-sky-300';
    }
  };

  return (
    <div class='relative flex max-w-72 min-w-64 flex-col rounded-md p-3 select-none'>
      {/* Top-Right Actor Bubble:
          "Actors will be show inside a bubble at the top-right corner of the node,
           and on click, a window will detail it." */}
      <Show when={hasActors()}>
        <button
          type='button'
          title={`${actorCount()} actor(s) attached — Click to inspect details`}
          class='absolute -top-3.5 -right-3.5 z-30 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-linear-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white shadow-md ring-2 ring-white transition-transform duration-200 hover:scale-115 active:scale-95'
          onMouseDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation();
            setActiveActorNode(props);
          }}
        >
          {/* Sparkle / Bot icon representation */}
          <svg
            class='h-3.5 w-3.5 fill-current'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d='M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18 2.5 2.5 0 0 0 10 15.5 2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5' />
          </svg>

          {/* Actor count badge pill */}
          <span class='absolute -bottom-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-extrabold text-white ring-1 ring-white'>
            {actorCount()}
          </span>

          {/* Pulsing indicator ring */}
          <span class='absolute -top-0.5 -right-0.5 flex h-2 w-2'>
            <span class='absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75'></span>
            <span class='relative inline-flex h-2 w-2 rounded-full bg-pink-500'></span>
          </span>
        </button>
      </Show>

      {/* Node Header */}
      <div class='flex items-center justify-between gap-2 border-b border-gray-100 pb-1.5'>
        <div class='flex items-center gap-1.5 truncate'>
          <span class='truncate text-sm font-bold text-gray-900'>
            {props.title || 'State'}
          </span>
          <Show when={props.isInitial}>
            <span class='rounded bg-emerald-50 px-1 py-0.5 text-[9px] font-semibold text-emerald-700'>
              initial
            </span>
          </Show>
        </div>

        <span
          class={`py-0.2 rounded-full border px-2 text-[9px] font-semibold capitalize ${badgeColor()}`}
        >
          {props.stateType}
        </span>
      </div>

      {/* State Path Display */}
      <div class='mt-1 truncate font-mono text-[11px] text-gray-400'>
        {props.path || '/'}
      </div>

      {/* State Description */}
      <Show when={props.content}>
        <p class='mt-1 line-clamp-2 text-xs text-gray-600'>{props.content}</p>
      </Show>

      {/* Entry / Exit Actions */}
      <div class='mt-2 flex flex-wrap gap-1'>
        <Show when={props.entry && props.entry.length > 0}>
          <span class='rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[10px] text-blue-700'>
            entry: {props.entry?.join(', ')}
          </span>
        </Show>
        <Show when={props.exit && props.exit.length > 0}>
          <span class='rounded bg-amber-50 px-1.5 py-0.5 font-mono text-[10px] text-amber-700'>
            exit: {props.exit?.join(', ')}
          </span>
        </Show>
      </div>

      {/* Actor Indicator Banner at bottom */}
      <Show when={hasActors()}>
        <div class='mt-2 flex items-center justify-between rounded border border-purple-200/60 bg-purple-50/70 px-2 py-1 text-[10px] text-purple-800'>
          <span class='flex items-center gap-1 font-semibold'>
            <span>⚡</span>
            <span>
              {actorCount()} Actor{actorCount() > 1 ? 's' : ''} attached
            </span>
          </span>
          <button
            type='button'
            class='cursor-pointer text-[10px] font-bold text-purple-700 hover:underline'
            onClick={e => {
              e.stopPropagation();
              setActiveActorNode(props);
            }}
          >
            Details →
          </button>
        </div>
      </Show>
    </div>
  );
};

/** Properties received by the custom edge middle component. */
export type StateMachineEdgeMiddleProps = {
  vector: Accessor<Vector | undefined>;
  id: string;
  data?: StateMachineEdgeData;
  selected?: Accessor<boolean>;
};

/**
 * Custom middle component for {@linkcode EdgeCursive} rendering pure SVG badges and
 * interactive delete and add handles for transitions linking two states.
 *
 * Rendered relative to the EdgeComponent midpoint at (0, 0).
 *
 * Displays:
 *
 * 1. Stacked categorized pill badges for each transition linking the two states.
 * 2. Per-transition delete handle when selected.
 * 3. An interactive "+ Add transition" button when selected to add further transitions.
 */
export const StateMachineEdgeMiddle: Component<
  StateMachineEdgeMiddleProps
> = props => {
  const { service } = useFlow();

  const edgeRecord = createState(service, {
    selector: ({ context }) => context.data?.edges?.find(e => e.id === props.id),
    equals: deepEqual<any>,
  });

  const edgeData = () =>
    (props.data ?? edgeRecord()?.data) as StateMachineEdgeData | undefined;

  const selected =
    props.selected ??
    createState(service, { selector: s => s.context.selected === props.id });

  const transitions = () => {
    const data = edgeData();
    if (
      data?.transitions &&
      Array.isArray(data.transitions) &&
      data.transitions.length > 0
    ) {
      return data.transitions;
    }
    const k: EdgeKind = data?.kind ?? 'on';
    return [
      {
        id: props.id,
        kind: k,
        label: data?.label ?? (k === 'on' ? 'On Transition' : k),
        event: data?.event,
        delay: data?.delay,
        guard: data?.guard,
        actions: data?.actions,
      },
    ];
  };

  const getKindConfig = (k?: EdgeKind) => {
    switch (k) {
      case 'child_parent':
        return {
          bg: 'bg-purple-600',
          border: 'border-purple-300',
          text: 'text-white',
          fill: '#7c3aed',
          stroke: '#c4b5fd',
          icon: '⮑',
          name: 'Child-to-Parent',
        };
      case 'after':
        return {
          bg: 'bg-amber-600',
          border: 'border-amber-200',
          text: 'text-white',
          fill: '#d97706',
          stroke: '#fde68a',
          icon: '⏱',
          name: 'After',
        };
      case 'always':
        return {
          bg: 'bg-emerald-600',
          border: 'border-emerald-200',
          text: 'text-white',
          fill: '#059669',
          stroke: '#a7f3d0',
          icon: '⚡',
          name: 'Always',
        };
      case 'on':
      default:
        return {
          bg: 'bg-blue-600',
          border: 'border-blue-200',
          text: 'text-white',
          fill: '#2563eb',
          stroke: '#bfdbfe',
          icon: '🔀',
          name: 'On',
        };
    }
  };

  const BADGE_WIDTH = 110;
  const ITEM_HEIGHT = 22;
  const GAP = 4;

  const count = () => Math.max(1, transitions().length);
  const totalHeight = () => {
    const itemsH = count() * ITEM_HEIGHT + (count() - 1) * GAP;
    const addH = showAdd() ? ITEM_HEIGHT + GAP : 0;
    return itemsH + addH + 4;
  };

  const deleteTransition = (transitionId: string) => {
    const current = transitions();
    if (current.length <= 1) {
      service.send({ type: 'DELETE', payload: props.id });
    } else {
      const updated = current.filter(t => t.id !== transitionId);
      service.send({
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

  return (
    <foreignObject
      x={-BADGE_WIDTH / 2}
      y={-totalHeight() / 2}
      width={BADGE_WIDTH}
      height={totalHeight()}
      style={{ overflow: 'visible', 'pointer-events': 'none' }}
    >
      <div
        class={`flex min-w-40 cursor-pointer flex-col items-center justify-center gap-0.5 select-none`}
        style={{
          width: '100%',
          height: `${totalHeight()}px`,
          'pointer-events': 'none',
        }}
        classList={{
          'rounded-xl ring-2 ring-offset-4 ring-indigo-400': showAdd(),
          'rounded-xl ring-1 ring-offset-1 ring-orange-400':
            !showAdd() && selected(),
        }}
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
                  service.send({ type: 'SELECT', payload: props.id });
                }}
              >
                <p
                  class={`flex max-w-full min-w-0 items-center gap-1 rounded-full border px-3 py-0.5 text-[10px] font-bold shadow-sm ${conf().bg} ${conf().text}`}
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
          <button
            type='button'
            class='flex cursor-pointer items-center justify-center rounded-full border border-indigo-200 bg-indigo-600 text-[9.5px] font-bold text-white shadow-sm hover:bg-indigo-700'
            style={{ width: '100%', padding: '2px 8px', 'pointer-events': 'all' }}
            onMouseDown={e => {
              e.stopPropagation();
              setActiveAddTransitionEdge({
                edgeId: props.id,
                from: edgeData()?.fromState ?? '',
                to: edgeData()?.toState ?? '',
              });
            }}
          >
            + Add transition
          </button>
        </Show>
      </div>
    </foreignObject>
  );
};

/**
 * State machine edge component using {@linkcode EdgeCursive} with a customized
 * {@linkcode StateMachineEdgeMiddle} component displaying edge type metadata, stacked
 * transitions, and interactive add/delete controls.
 */
export const StateMachineEdge: Component<
  EdgeProps<StateMachineEdgeData>
> = props => {
  const { service } = useFlow();

  const edgeRecord = createState(service, {
    selector: ({ context }) => context.data?.edges?.find(e => e.id === props.id),
    equals: deepEqual<any>,
  });

  const edgeData = () =>
    (props.data ?? edgeRecord()?.data) as StateMachineEdgeData | undefined;

  const transitions = () => edgeData()?.transitions ?? [];

  const isMulti = () => transitions().length > 1;
  const kind = () => {
    return transitions()[0]?.kind ?? edgeData()?.kind ?? 'on';
  };

  const strokeColor = () => {
    if (isMulti()) return '#6366f1'; // Indigo for multi-transition connections
    const k = kind();
    switch (k) {
      case 'child_parent':
        return '#8b5cf6'; // Violet
      case 'after':
        return '#f59e0b'; // Amber
      case 'always':
        return '#10b981'; // Emerald
      case 'on':
      default:
        return '#3b82f6'; // Blue
    }
  };

  const strokeDasharray = () => {
    const k = transitions()[0]?.kind ?? edgeData()?.kind ?? 'on';
    return k === 'child_parent' && !isMulti() ? '6 4' : undefined;
  };

  return (
    <Show
      fallback={
        <EdgeCursive<StateMachineEdgeData>
          {...props}
          stroke={strokeColor()}
          strokeDasharray={strokeDasharray()}
          middle={StateMachineEdgeMiddle}
        />
      }
      when={kind() === 'child_parent'}
    >
      <EdgeStraight<StateMachineEdgeData>
        {...props}
        stroke={strokeColor()}
        strokeDasharray={strokeDasharray()}
        middle={StateMachineEdgeMiddle}
      />
    </Show>
  );
};

/**
 * Window component that displays full details for actors attached to a state when
 * their top-right bubble is clicked.
 */
export const ActorDetailModal: Component = () => {
  const node = activeActorNode;
  const close = () => setActiveActorNode(null);

  // Close on Escape key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  };

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      onCleanup(() => window.removeEventListener('keydown', handleKeyDown));
    }
  });

  return (
    <Show when={node()}>
      {n => (
        <div
          class='animate-in fade-in fixed inset-0 z-500 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs duration-150'
          onClick={close}
        >
          <div
            class='relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl'
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div class='flex items-center justify-between border-b border-gray-100 bg-linear-to-r from-purple-50 via-indigo-50 to-white px-6 py-4'>
              <div class='flex items-center gap-3'>
                <div class='flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-tr from-purple-600 to-indigo-600 text-white shadow-md'>
                  <svg
                    class='h-6 w-6 fill-current'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path d='M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18 2.5 2.5 0 0 0 10 15.5 2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5' />
                  </svg>
                </div>
                <div>
                  <h2 class='text-lg font-bold text-gray-900'>
                    State Actors — <span class='text-indigo-600'>{n().title}</span>
                  </h2>
                  <p class='font-mono text-xs text-gray-500'>{n().path}</p>
                </div>
              </div>

              <button
                type='button'
                onClick={close}
                class='cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700'
                title='Close window'
              >
                <svg
                  class='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  stroke-width='2'
                >
                  <path
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div class='flex-1 space-y-4 overflow-y-auto p-6 text-left'>
              <div class='text-xs text-gray-600'>
                This state has{' '}
                <span class='font-bold text-purple-700'>
                  {n().actors?.length ?? 0} actor(s)
                </span>{' '}
                attached in the `@bemedev/app` configuration. Actors are
                automatically managed by the interpreter during this state's active
                lifecycle.
              </div>

              <For each={n().actors}>
                {actor => (
                  <div class='space-y-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4 shadow-xs'>
                    {/* Actor Title & Badge */}
                    <div class='flex items-center justify-between border-b border-gray-200/60 pb-2'>
                      <div class='flex items-center gap-2'>
                        <span class='font-mono text-sm font-bold text-gray-900'>
                          {actor.name}
                        </span>
                        <span
                          class={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                            actor.type === 'emitter'
                              ? 'border border-purple-300 bg-purple-100 text-purple-800'
                              : 'border border-cyan-300 bg-cyan-100 text-cyan-800'
                          }`}
                        >
                          {actor.type === 'emitter'
                            ? 'Stream Emitter'
                            : 'Child Actor Machine'}
                        </span>
                      </div>
                    </div>

                    {/* Actor Description */}
                    <p class='text-xs leading-relaxed text-gray-600'>
                      {actor.description}
                    </p>

                    {/* Emissions Breakdown (for Emitters) */}
                    <Show when={actor.type === 'emitter' && actor.emissions}>
                      <div class='space-y-1.5 rounded-lg border border-gray-200 bg-white p-3 text-xs'>
                        <span class='block font-semibold text-gray-700'>
                          Reactive Stream Handlers:
                        </span>
                        <Show when={actor.emissions?.next}>
                          <div class='flex items-start gap-2'>
                            <span class='rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-800'>
                              next
                            </span>
                            <span class='font-mono text-gray-700'>
                              actions: [{actor.emissions?.next?.join(', ')}]
                            </span>
                          </div>
                        </Show>
                        <Show when={actor.emissions?.error}>
                          <div class='flex items-start gap-2'>
                            <span class='rounded bg-red-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-red-800'>
                              error
                            </span>
                            <span class='font-mono text-gray-700'>
                              actions: [{actor.emissions?.error?.join(', ')}]
                            </span>
                          </div>
                        </Show>
                        <Show when={actor.emissions?.complete}>
                          <div class='flex items-start gap-2'>
                            <span class='rounded bg-blue-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-blue-800'>
                              complete
                            </span>
                            <span class='font-mono text-gray-700'>
                              actions: [{actor.emissions?.complete?.join(', ')}]
                            </span>
                          </div>
                        </Show>
                      </div>
                    </Show>

                    {/* Child Events Breakdown */}
                    <Show
                      when={
                        actor.type === 'child' &&
                        actor.events &&
                        Object.keys(actor.events).length > 0
                      }
                    >
                      <div class='space-y-1.5 rounded-lg border border-gray-200 bg-white p-3 text-xs'>
                        <span class='block font-semibold text-gray-700'>
                          Forwarded Events from Child Machine:
                        </span>
                        <For each={Object.entries(actor.events ?? {})}>
                          {([ev, actions]) => (
                            <div class='flex items-center gap-2 font-mono text-[11px]'>
                              <span class='font-bold text-cyan-700'>{ev}</span>
                              <span class='text-gray-400'>→</span>
                              <span class='text-gray-700'>
                                actions: [{actions.join(', ')}]
                              </span>
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>

                    {/* Context Mapping */}
                    <Show when={actor.contexts}>
                      <div class='rounded-lg border border-gray-200 bg-white p-2.5 text-xs'>
                        <span class='mb-1 block font-semibold text-gray-700'>
                          Context Synchronization:
                        </span>
                        <For each={Object.entries(actor.contexts ?? {})}>
                          {([childProp, parentProp]) => (
                            <div class='font-mono text-[11px] text-gray-600'>
                              child.context{' '}
                              <span class='text-purple-600'>({childProp})</span> →
                              parent.pContext.{parentProp}
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>

                    {/* Code Configuration Snippet */}
                    <div class='space-y-1'>
                      <span class='text-[10px] font-semibold tracking-wider text-gray-400 uppercase'>
                        @bemedev/app Declaration Snippet
                      </span>
                      <pre class='overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-gray-100'>
                        {JSON.stringify({ [actor.name]: actor.config }, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </For>
            </div>

            {/* Modal Footer */}
            <div class='flex justify-end border-t border-gray-100 bg-gray-50 px-6 py-3'>
              <button
                type='button'
                onClick={close}
                class='cursor-pointer rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-slate-700'
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </Show>
  );
};

/**
 * Modal dialog that allows users to add a new transition (`on`, `after`, or
 * `always`) to an edge connecting two states.
 */
export const AddTransitionModal: Component = () => {
  let service: ReturnType<typeof useFlow>['service'] | undefined;
  try {
    service = useFlow()?.service;
  } catch {
    // gracefully handle when rendered outside Provider
  }
  const activeEdge = activeAddTransitionEdge;
  const close = () => setActiveAddTransitionEdge(null);

  const [kind, setKind] = createSignal<EdgeKind>('on');
  const [eventName, setEventName] = createSignal('');
  const [delay, setDelay] = createSignal('3000ms');
  const [guard, setGuard] = createSignal('');
  const [actionsInput, setActionsInput] = createSignal('');

  // Close on Escape key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  };

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      onCleanup(() => window.removeEventListener('keydown', handleKeyDown));
    }
  });

  const handleAdd = () => {
    const target = activeEdge();
    if (!target || !service) return;

    const edge = service.state.context.data?.edges?.find(
      e => e.id === target.edgeId,
    );
    const existingData = (edge?.data ?? {}) as StateMachineEdgeData;
    const existingTransitions =
      existingData.transitions ??
      (existingData.kind
        ? [
            {
              id: target.edgeId,
              kind: existingData.kind,
              label: existingData.label ?? existingData.kind,
              event: existingData.event,
              delay: existingData.delay,
              guard: existingData.guard,
              actions: existingData.actions,
            },
          ]
        : []);

    const selectedKind = kind();
    const actions = actionsInput()
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    let label = '';
    let ev: string | undefined = undefined;
    let del: string | undefined = undefined;
    const grd = guard().trim() || undefined;

    if (selectedKind === 'on') {
      ev = eventName().trim() || 'NEXT';
      label = `on: ${ev}${grd ? ` [${grd}]` : ''}`;
    } else if (selectedKind === 'after') {
      del = delay().trim() || '3000ms';
      label = `after: ${del}${grd ? ` [${grd}]` : ''}`;
    } else if (selectedKind === 'always') {
      label = `always${grd ? ` [${grd}]` : ''}`;
    } else {
      label = `child of ${target.to.split('/').pop()}`;
    }

    const newTransition: TransitionItem = {
      id: `transition:${selectedKind}:${nanoid(6)}`,
      kind: selectedKind,
      label,
      event: ev,
      delay: del,
      guard: grd,
      actions: actions.length > 0 ? actions : undefined,
    };

    const updatedTransitions = [...existingTransitions, newTransition];

    service.send({
      type: 'SET_EDGE_DATA',
      payload: {
        id: target.edgeId,
        data: {
          ...existingData,
          transitions: updatedTransitions,
          label: `${updatedTransitions.length} transitions`,
        } as any,
      },
    });

    // Reset inputs & close
    setEventName('');
    setGuard('');
    setActionsInput('');
    close();
  };

  return (
    <Show when={activeEdge()}>
      {target => (
        <div
          class='animate-in fade-in fixed inset-0 z-500 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs duration-150'
          onClick={close}
        >
          <div
            class='relative flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl'
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div class='flex items-center justify-between border-b border-gray-100 bg-linear-to-r from-indigo-50 via-purple-50 to-white px-5 py-3.5'>
              <div class='flex items-center gap-2.5'>
                <span class='flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-xs'>
                  +
                </span>
                <div>
                  <h3 class='text-sm font-bold text-gray-900'>Add Transition</h3>
                  <p class='font-mono text-[11px] text-gray-500'>
                    {target().from} <span class='text-indigo-600'>➔</span>{' '}
                    {target().to}
                  </p>
                </div>
              </div>

              <button
                type='button'
                onClick={close}
                class='cursor-pointer rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700'
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <div class='space-y-4 p-5 text-left text-xs'>
              {/* Kind selector */}
              <div>
                <label class='mb-1.5 block font-semibold text-gray-700'>
                  Transition Type
                </label>
                <div class='grid grid-cols-3 gap-2'>
                  <button
                    type='button'
                    onClick={() => setKind('on')}
                    class={`flex cursor-pointer flex-col items-center rounded-lg border p-2 transition-all ${
                      kind() === 'on'
                        ? 'border-blue-500 bg-blue-50 font-bold text-blue-800 ring-2 ring-blue-300'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span class='text-base'>🔀</span>
                    <span class='mt-1 text-[11px]'>On Event</span>
                  </button>

                  <button
                    type='button'
                    onClick={() => setKind('after')}
                    class={`flex cursor-pointer flex-col items-center rounded-lg border p-2 transition-all ${
                      kind() === 'after'
                        ? 'border-amber-500 bg-amber-50 font-bold text-amber-800 ring-2 ring-amber-300'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span class='text-base'>⏱</span>
                    <span class='mt-1 text-[11px]'>After Delay</span>
                  </button>

                  <button
                    type='button'
                    onClick={() => setKind('always')}
                    class={`flex cursor-pointer flex-col items-center rounded-lg border p-2 transition-all ${
                      kind() === 'always'
                        ? 'border-emerald-500 bg-emerald-50 font-bold text-emerald-800 ring-2 ring-emerald-300'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span class='text-base'>⚡</span>
                    <span class='mt-1 text-[11px]'>Always</span>
                  </button>
                </div>
              </div>

              {/* Specific inputs */}
              <Show when={kind() === 'on'}>
                <div>
                  <label class='mb-1 block font-semibold text-gray-700'>
                    Event Name <span class='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    placeholder='e.g. SUBMIT, RETRY, CANCEL'
                    value={eventName()}
                    onInput={e => setEventName(e.currentTarget.value.toUpperCase())}
                    class='w-full rounded-lg border border-gray-300 px-3 py-1.5 font-mono text-xs focus:border-indigo-500 focus:outline-none'
                  />
                </div>
              </Show>

              <Show when={kind() === 'after'}>
                <div>
                  <label class='mb-1 block font-semibold text-gray-700'>
                    Delay Duration / Identifier <span class='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    placeholder='e.g. 3000ms, 5s, TIMEOUT'
                    value={delay()}
                    onInput={e => setDelay(e.currentTarget.value)}
                    class='w-full rounded-lg border border-gray-300 px-3 py-1.5 font-mono text-xs focus:border-indigo-500 focus:outline-none'
                  />
                </div>
              </Show>

              <div>
                <label class='mb-1 block font-semibold text-gray-700'>
                  Guard Condition <span class='text-gray-400'>(optional)</span>
                </label>
                <input
                  type='text'
                  placeholder='e.g. isValid, isApproved'
                  value={guard()}
                  onInput={e => setGuard(e.currentTarget.value)}
                  class='w-full rounded-lg border border-gray-300 px-3 py-1.5 font-mono text-xs focus:border-indigo-500 focus:outline-none'
                />
              </div>

              <div>
                <label class='mb-1 block font-semibold text-gray-700'>
                  Actions{' '}
                  <span class='text-gray-400'>(optional, comma-separated)</span>
                </label>
                <input
                  type='text'
                  placeholder='e.g. notifyUser, logTransition'
                  value={actionsInput()}
                  onInput={e => setActionsInput(e.currentTarget.value)}
                  class='w-full rounded-lg border border-gray-300 px-3 py-1.5 font-mono text-xs focus:border-indigo-500 focus:outline-none'
                />
              </div>
            </div>

            {/* Footer */}
            <div class='flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-3'>
              <button
                type='button'
                onClick={close}
                class='cursor-pointer rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={handleAdd}
                class='cursor-pointer rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700'
              >
                Add Transition
              </button>
            </div>
          </div>
        </div>
      )}
    </Show>
  );
};
