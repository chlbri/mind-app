import { deepEqual } from '@bemedev/app';
import { useFlow } from '@bemedev/mind-flow';
import { createSignal, For, Show, type Component } from 'solid-js';

import { toList } from '../../helpers';
import type { StateActorData, StateMachineNodeData } from '../../types';
import { ActorChildContextItem } from './child.context';
import { ActorChildEventItem } from './child.event';

export type ActorItemProps = {
  id: string;
  updateField: <K extends keyof StateMachineNodeData>(
    field: K,
    value: StateMachineNodeData[K],
  ) => void;
  onRemove: () => void;
};

/**
 * Child item component representing a single actor (emitter or child state machine).
 * Retrieves its state reactively from the state machine using its stable `id`.
 */
export const ActorItem: Component<ActorItemProps> = props => {
  const { hooks } = useFlow();
  const [expanded, setExpanded] = createSignal(true);

  const allActors = hooks.state({
    selector: ({ context }) => {
      const editingId = context.editing;
      if (!editingId) return [];
      const node = context.data?.nodes?.find(n => n.id === editingId);
      return (node?.data as StateMachineNodeData | undefined)?.actors ?? [];
    },
    equals: deepEqual<StateActorData[]>,
  });

  const actor = hooks.state({
    selector: ({ context }) => {
      const editingId = context.editing;
      if (!editingId) return undefined;
      const node = context.data?.nodes?.find(n => n.id === editingId);
      const actors = (node?.data as StateMachineNodeData | undefined)?.actors;
      return actors?.find((a, i) => (a.id ?? a.name ?? String(i)) === props.id);
    },
    equals: deepEqual<StateActorData | undefined>,
  });

  const updateActor = (patch: Partial<StateActorData>) => {
    const current = allActors();
    const updated = current.map((item, i) => {
      if ((item.id ?? item.name ?? String(i)) === props.id) {
        const merged: StateActorData = { ...item, ...patch };
        // Synchronize backward-compatibility fields
        if (merged.type === 'emitter' && merged.emitter) {
          merged.emissions = {
            next: merged.emitter.next?.actions,
            error: merged.emitter.error?.actions,
            complete: merged.emitter.complete?.actions,
          };
        } else if (merged.type === 'child' && merged.child) {
          const events: Record<string, string[]> = {};
          if (merged.child.on) {
            Object.entries(merged.child.on).forEach(([ev, h]) => {
              events[ev] = h.actions ?? [];
            });
          }
          merged.events = events;
          merged.contexts = merged.child.contexts;
        }
        return merged;
      }
      return item;
    });
    props.updateField('actors', updated);
  };

  const eventKeys = hooks.state({
    selector: ({ context }) => {
      const editingId = context.editing;
      if (!editingId) return [];
      const node = context.data?.nodes?.find(n => n.id === editingId);
      const actors = (node?.data as StateMachineNodeData | undefined)?.actors;
      const currentActor = actors?.find(
        (a, i) => (a.id ?? a.name ?? String(i)) === props.id,
      );
      return Object.keys(currentActor?.child?.on ?? {});
    },
    equals: deepEqual<string[]>,
  });

  const contextKeys = hooks.state({
    selector: ({ context }) => {
      const editingId = context.editing;
      if (!editingId) return [];
      const node = context.data?.nodes?.find(n => n.id === editingId);
      const actors = (node?.data as StateMachineNodeData | undefined)?.actors;
      const currentActor = actors?.find(
        (a, i) => (a.id ?? a.name ?? String(i)) === props.id,
      );
      return Object.keys(currentActor?.child?.contexts ?? {});
    },
    equals: deepEqual<string[]>,
  });

  return (
    <Show when={actor()}>
      {act => (
        <div class='flex flex-col rounded-lg border border-indigo-200/80 bg-white shadow-xs'>
          {/* Actor Item Header */}
          <div class='flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-2'>
            <button
              type='button'
              onClick={() => setExpanded(!expanded())}
              class='flex cursor-pointer items-center gap-1.5 text-left'
            >
              <span class='text-xs'>{act().type === 'emitter' ? '📡' : '🤖'}</span>
              <span class='font-mono text-xs font-bold text-gray-800'>
                {act().name || 'unnamed'}
              </span>
              <span
                class={`py-0.2 rounded px-1.5 text-[9px] font-bold tracking-wider uppercase ${
                  act().type === 'emitter'
                    ? 'bg-cyan-100 text-cyan-800'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {act().type}
              </span>
            </button>

            <div class='flex items-center gap-1'>
              <button
                type='button'
                title={expanded() ? 'Collapse' : 'Expand'}
                onClick={() => setExpanded(!expanded())}
                class='cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-200'
              >
                <svg
                  class={`size-3 transition-transform ${expanded() ? 'rotate-180' : ''}`}
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  stroke-width='2'
                >
                  <path d='M6 9l6 6 6-6' />
                </svg>
              </button>

              <button
                type='button'
                title='Remove actor'
                onClick={props.onRemove}
                class='cursor-pointer rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600'
              >
                <svg
                  class='size-3.5'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  stroke-width='2'
                >
                  <path d='M18 6L6 18M6 6l12 12' />
                </svg>
              </button>
            </div>
          </div>

          {/* Actor Details Body */}
          <Show when={expanded()}>
            <div class='flex flex-col gap-2 p-2'>
              {/* Name & Type row */}
              <div class='grid grid-cols-2 gap-2'>
                <div class='flex flex-col gap-0.5'>
                  <label class='text-[10px] font-semibold text-gray-600'>
                    Actor Name <span class='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    class='w-full rounded border border-gray-200 bg-white px-2 py-1 font-mono text-xs focus:border-indigo-500 focus:outline-none'
                    value={act().name}
                    onInput={e => updateActor({ name: e.currentTarget.value })}
                  />
                </div>
              </div>

              {/* Description */}
              <div class='flex flex-col gap-0.5'>
                <label class='text-[10px] font-semibold text-gray-600'>
                  Description
                </label>
                <input
                  type='text'
                  class='w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none'
                  value={act().description ?? ''}
                  placeholder='Purpose of this actor...'
                  onInput={e =>
                    updateActor({ description: e.currentTarget.value || undefined })
                  }
                />
              </div>

              {/* ---------------- EMITTER CONFIG ---------------- */}
              <Show when={act().type === 'emitter'}>
                <div class='flex flex-col gap-2 rounded border border-cyan-200/80 bg-cyan-50/30 p-2'>
                  <div class='flex items-center gap-1 text-[10px] font-bold text-cyan-900'>
                    <span>📡</span>
                    <span>Emitter Handlers</span>
                  </div>

                  {/* next (required) */}
                  <div class='flex flex-col gap-1 rounded border border-cyan-100 bg-white p-1.5 shadow-2xs'>
                    <div class='flex items-center justify-between text-[10px] font-bold text-cyan-700'>
                      <span>next emission</span>
                      <span class='text-[9px] font-normal text-gray-400'>
                        On each stream emission
                      </span>
                    </div>

                    <div class='flex flex-col gap-0.5'>
                      <label class='text-[9px] text-gray-500'>Actions</label>
                      <input
                        type='text'
                        class='w-full rounded border border-gray-200 px-1.5 py-0.5 font-mono text-[11px] focus:border-cyan-500 focus:outline-none'
                        value={act().emitter?.next.actions?.join(', ') ?? ''}
                        placeholder='e.g. appendData, updateState'
                        onInput={e => {
                          const actions = toList(e.currentTarget.value);
                          const currentEmitter = act().emitter ?? {
                            next: { actions: [] },
                          };
                          updateActor({
                            emitter: {
                              ...currentEmitter,
                              next: { ...currentEmitter.next, actions },
                            },
                          });
                        }}
                      />
                    </div>

                    <div class='grid grid-cols-2 gap-1.5'>
                      <div class='flex flex-col gap-0.5'>
                        <label class='text-[9px] text-gray-500'>
                          Target State (optional)
                        </label>
                        <input
                          type='text'
                          class='w-full rounded border border-gray-200 px-1.5 py-0.5 font-mono text-[11px] focus:border-cyan-500 focus:outline-none'
                          value={act().emitter?.next.target ?? ''}
                          placeholder='e.g. /streaming'
                          onInput={e => {
                            const currentEmitter = act().emitter ?? {
                              next: { actions: [] },
                            };
                            updateActor({
                              emitter: {
                                ...currentEmitter,
                                next: {
                                  ...currentEmitter.next,
                                  target: e.currentTarget.value || undefined,
                                },
                              },
                            });
                          }}
                        />
                      </div>

                      <div class='flex flex-col gap-0.5'>
                        <label class='text-[9px] text-gray-500'>
                          Guards (optional)
                        </label>
                        <input
                          type='text'
                          class='w-full rounded border border-gray-200 px-1.5 py-0.5 font-mono text-[11px] focus:border-cyan-500 focus:outline-none'
                          value={act().emitter?.next.guards?.join(', ') ?? ''}
                          placeholder='e.g. isValid'
                          onInput={e => {
                            const guards = toList(e.currentTarget.value);
                            const currentEmitter = act().emitter ?? {
                              next: { actions: [] },
                            };
                            updateActor({
                              emitter: {
                                ...currentEmitter,
                                next: {
                                  ...currentEmitter.next,
                                  guards: guards.length > 0 ? guards : undefined,
                                },
                              },
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* error (optional) */}
                  <div class='flex flex-col gap-1 rounded border border-red-100 bg-white p-1.5 shadow-2xs'>
                    <div class='flex items-center justify-between text-[10px] font-bold text-red-700'>
                      <span>error handler</span>
                      <span class='text-[9px] font-normal text-gray-400'>
                        On stream error
                      </span>
                    </div>

                    <div class='flex flex-col gap-0.5'>
                      <label class='text-[9px] text-gray-500'>Actions</label>
                      <input
                        type='text'
                        class='w-full rounded border border-gray-200 px-1.5 py-0.5 font-mono text-[11px] focus:border-red-500 focus:outline-none'
                        value={act().emitter?.error?.actions?.join(', ') ?? ''}
                        placeholder='e.g. handleStreamError, notifyFailure'
                        onInput={e => {
                          const actions = toList(e.currentTarget.value);
                          const currentEmitter = act().emitter ?? {
                            next: { actions: [] },
                          };
                          updateActor({
                            emitter: {
                              ...currentEmitter,
                              error: {
                                ...currentEmitter.error,
                                actions: actions.length > 0 ? actions : undefined,
                              },
                            },
                          });
                        }}
                      />
                    </div>
                  </div>

                  {/* complete (optional) */}
                  <div class='flex flex-col gap-1 rounded border border-emerald-100 bg-white p-1.5 shadow-2xs'>
                    <div class='flex items-center justify-between text-[10px] font-bold text-emerald-700'>
                      <span>complete handler</span>
                      <span class='text-[9px] font-normal text-gray-400'>
                        When stream closes
                      </span>
                    </div>

                    <div class='flex flex-col gap-0.5'>
                      <label class='text-[9px] text-gray-500'>Actions</label>
                      <input
                        type='text'
                        class='w-full rounded border border-gray-200 px-1.5 py-0.5 font-mono text-[11px] focus:border-emerald-500 focus:outline-none'
                        value={act().emitter?.complete?.actions?.join(', ') ?? ''}
                        placeholder='e.g. onStreamDone, cleanupConnection'
                        onInput={e => {
                          const actions = toList(e.currentTarget.value);
                          const currentEmitter = act().emitter ?? {
                            next: { actions: [] },
                          };
                          updateActor({
                            emitter: {
                              ...currentEmitter,
                              complete: {
                                ...currentEmitter.complete,
                                actions: actions.length > 0 ? actions : undefined,
                              },
                            },
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Show>

              {/* ---------------- CHILD CONFIG ---------------- */}
              <Show when={act().type === 'child'}>
                <div class='flex flex-col gap-2 rounded border border-indigo-200/80 bg-indigo-50/30 p-2'>
                  {/* on handlers */}
                  <div class='flex items-center justify-between'>
                    <div class='flex items-center gap-1 text-[10px] font-bold text-indigo-900'>
                      <span>📩</span>
                      <span>Handled Child Events (on)</span>
                    </div>

                    <button
                      type='button'
                      onClick={() => {
                        const currentChild = act().child ?? {};
                        const currentOn = currentChild.on ?? {};
                        const evKey = `EVENT_${Object.keys(currentOn).length + 1}`;
                        updateActor({
                          child: {
                            ...currentChild,
                            on: {
                              ...currentOn,
                              [evKey]: { actions: ['handleEvent'] },
                            },
                          },
                        });
                      }}
                      class='cursor-pointer text-[10px] font-semibold text-indigo-600 hover:text-indigo-800'
                    >
                      + Add Event
                    </button>
                  </div>

                  <div class='flex flex-col gap-1.5'>
                    <For each={eventKeys()}>
                      {evKey => (
                        <ActorChildEventItem
                          actorId={props.id}
                          eventKey={evKey}
                          updateField={props.updateField}
                        />
                      )}
                    </For>
                  </div>

                  {/* Contexts mapping */}
                  <div class='mt-1 flex items-center justify-between border-t border-indigo-100 pt-1.5'>
                    <div class='flex items-center gap-1 text-[10px] font-bold text-indigo-900'>
                      <span>🔄</span>
                      <span>Context Mapping (child → pContext)</span>
                    </div>

                    <button
                      type='button'
                      onClick={() => {
                        const currentChild = act().child ?? {};
                        const currentContexts = currentChild.contexts ?? {};
                        const nextIndex = Object.keys(currentContexts).length + 1;
                        updateActor({
                          child: {
                            ...currentChild,
                            contexts: {
                              ...currentContexts,
                              [`.path_${nextIndex}`]: `stateContext_${nextIndex}`,
                            },
                          },
                        });
                      }}
                      class='cursor-pointer text-[10px] font-semibold text-indigo-600 hover:text-indigo-800'
                    >
                      + Add Mapping
                    </button>
                  </div>

                  <div class='flex flex-col gap-1'>
                    <For each={contextKeys()}>
                      {ctxKey => (
                        <ActorChildContextItem
                          actorId={props.id}
                          contextKey={ctxKey}
                          updateField={props.updateField}
                        />
                      )}
                    </For>
                  </div>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      )}
    </Show>
  );
};
