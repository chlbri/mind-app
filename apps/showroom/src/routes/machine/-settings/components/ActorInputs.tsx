import { identify } from '@bemedev/app';
import { Index, Show, createSignal, type Component } from 'solid-js';

import type { StateActorData } from '../types';

/** Helper to split comma-separated strings into cleaned array. */
const toList = (val: string): string[] => {
  return val
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
};

export type ActorInputsProps = {
  actors: () => StateActorData[] | undefined;
  onChange: (actors: StateActorData[] | undefined) => void;
};

/**
 * Dedicated editor for `@bemedev/app` actors (`ActorConfig`).
 *
 * Supports both:
 *
 * 1. **Emitter Actors** (`EmitterConfig`): Pausable streams with `next`, `error`, and
 *    `complete`.
 * 2. **Child Actors** (`ChildConfig`): Nested state machines with `on` event routing
 *    and `contexts` mapping.
 */
export const ActorInputs: Component<ActorInputsProps> = props => {
  const actorsList = () => props.actors() ?? [];

  const addActor = (type: 'emitter' | 'child') => {
    const current = actorsList();
    const count = current.length + 1;

    let newActor: StateActorData;
    if (type === 'emitter') {
      newActor = {
        name: `streamSource_${count}`,
        type: 'emitter',
        description: 'Reactive pausable stream source',
        emitter: {
          next: { actions: ['handleNext'] },
          error: { actions: ['handleError'] },
          complete: { actions: ['onComplete'] },
        },
        emissions: {
          next: ['handleNext'],
          error: ['handleError'],
          complete: ['onComplete'],
        },
      };
    } else {
      newActor = {
        name: `childWorker_${count}`,
        type: 'child',
        description: 'Nested child state machine',
        child: {
          on: { DONE: { actions: ['onChildDone'] } },
          contexts: { '.': 'childContext' },
        },
        events: { DONE: ['onChildDone'] },
        contexts: { '.': 'childContext' },
      };
    }

    props.onChange([...current, newActor]);
  };

  const removeActor = (index: number) => {
    const current = actorsList();
    const updated = current.filter((_, i) => i !== index);
    props.onChange(updated.length > 0 ? updated : undefined);
  };

  const updateActor = (index: number, patch: Partial<StateActorData>) => {
    const current = actorsList();
    const updated = current.map((item, i) => {
      if (i === index) {
        const merged = { ...item, ...patch };
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
    props.onChange(updated);
  };

  return (
    <div class='flex flex-col gap-2 rounded-xl border border-gray-200 bg-slate-50/70 p-2.5'>
      {/* Header */}
      <div class='flex items-center justify-between'>
        <div class='flex items-center gap-1.5'>
          <span class='font-semibold text-gray-800'>Actors</span>
          <span class='py-0.2 rounded-full bg-indigo-100 px-1.5 text-[10px] font-bold text-indigo-700'>
            {actorsList().length}
          </span>
        </div>

        <div class='flex items-center gap-1'>
          <button
            type='button'
            onClick={() => addActor('emitter')}
            title='Add Pausable stream emitter'
            class='flex cursor-pointer items-center gap-0.5 rounded-md bg-cyan-600 px-2 py-1 text-[10px] font-medium text-white shadow-xs transition hover:bg-cyan-700 active:scale-95'
          >
            + Emitter
          </button>
          <button
            type='button'
            onClick={() => addActor('child')}
            title='Add Nested child state machine'
            class='flex cursor-pointer items-center gap-0.5 rounded-md bg-indigo-600 px-2 py-1 text-[10px] font-medium text-white shadow-xs transition hover:bg-indigo-700 active:scale-95'
          >
            + Child
          </button>
        </div>
      </div>

      <p class='text-[10px] text-gray-500'>
        Emitters (streams) and child machines attached to this state.
      </p>

      {/* List of Actors */}
      <Show
        when={actorsList().length > 0}
        fallback={
          <div class='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white/60 py-3 text-center'>
            <span class='text-[11px] text-gray-400'>No actors attached</span>
            <div class='mt-1.5 flex gap-2'>
              <button
                type='button'
                onClick={() => addActor('emitter')}
                class='cursor-pointer text-[11px] font-semibold text-cyan-600 hover:text-cyan-700 hover:underline'
              >
                + Add Emitter
              </button>
              <span class='text-gray-300'>|</span>
              <button
                type='button'
                onClick={() => addActor('child')}
                class='cursor-pointer text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline'
              >
                + Add Child Actor
              </button>
            </div>
          </div>
        }
      >
        <div class='flex flex-col gap-2.5'>
          <Index each={actorsList()}>
            {(actor, index) => {
              const [expanded, setExpanded] = createSignal(true);

              return (
                <div class='flex flex-col rounded-lg border border-indigo-200/80 bg-white shadow-xs'>
                  {/* Actor Item Header */}
                  <div class='flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-2'>
                    <button
                      type='button'
                      onClick={() => setExpanded(!expanded())}
                      class='flex cursor-pointer items-center gap-1.5 text-left'
                    >
                      <span class='text-xs'>
                        {actor().type === 'emitter' ? '📡' : '🤖'}
                      </span>
                      <span class='font-mono text-xs font-bold text-gray-800'>
                        {actor().name || 'unnamed'}
                      </span>
                      <span
                        class={`py-0.2 rounded px-1.5 text-[9px] font-bold tracking-wider uppercase ${
                          actor().type === 'emitter'
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {actor().type}
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
                        onClick={() => removeActor(index)}
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
                            value={actor.name}
                            onInput={e =>
                              updateActor(index, { name: e.currentTarget.value })
                            }
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
                          value={actor().description ?? ''}
                          placeholder='Purpose of this actor...'
                          onInput={e =>
                            updateActor(index, {
                              description: e.currentTarget.value || undefined,
                            })
                          }
                        />
                      </div>

                      {/* ---------------- EMITTER CONFIG ---------------- */}
                      <Show when={actor().type === 'emitter'}>
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
                                value={
                                  actor().emitter?.next.actions?.join(', ') ?? ''
                                }
                                placeholder='e.g. appendData, updateState'
                                onInput={e => {
                                  const actions = toList(e.currentTarget.value);
                                  const currentEmitter = actor().emitter ?? {
                                    next: { actions: [] },
                                  };
                                  updateActor(index, {
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
                                  value={actor().emitter?.next.target ?? ''}
                                  placeholder='e.g. /streaming'
                                  onInput={e => {
                                    const currentEmitter = actor().emitter ?? {
                                      next: { actions: [] },
                                    };
                                    updateActor(index, {
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
                                  value={
                                    actor().emitter?.next.guards?.join(', ') ?? ''
                                  }
                                  placeholder='e.g. isValid'
                                  onInput={e => {
                                    const guards = toList(e.currentTarget.value);
                                    const currentEmitter = actor().emitter ?? {
                                      next: { actions: [] },
                                    };
                                    updateActor(index, {
                                      emitter: {
                                        ...currentEmitter,
                                        next: {
                                          ...currentEmitter.next,
                                          guards:
                                            guards.length > 0 ? guards : undefined,
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
                                value={
                                  actor().emitter?.error?.actions?.join(', ') ?? ''
                                }
                                placeholder='e.g. handleStreamError, notifyFailure'
                                onInput={e => {
                                  const actions = toList(e.currentTarget.value);
                                  const currentEmitter = actor().emitter ?? {
                                    next: { actions: [] },
                                  };
                                  updateActor(index, {
                                    emitter: {
                                      ...currentEmitter,
                                      error: {
                                        ...currentEmitter.error,
                                        actions:
                                          actions.length > 0 ? actions : undefined,
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
                                value={
                                  actor().emitter?.complete?.actions?.join(', ') ??
                                  ''
                                }
                                placeholder='e.g. onStreamDone, cleanupConnection'
                                onInput={e => {
                                  const actions = toList(e.currentTarget.value);
                                  const currentEmitter = actor().emitter ?? {
                                    next: { actions: [] },
                                  };
                                  updateActor(index, {
                                    emitter: {
                                      ...currentEmitter,
                                      complete: {
                                        ...currentEmitter.complete,
                                        actions:
                                          actions.length > 0 ? actions : undefined,
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
                      <Show when={actor().type === 'child'}>
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
                                const currentChild = actor().child ?? {};
                                const currentOn = currentChild.on ?? {};
                                const evKey = `EVENT_${Object.keys(currentOn).length + 1}`;
                                updateActor(index, {
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
                            <Index each={identify(actor().child?.on)}>
                              {event => (
                                <div class='flex flex-col gap-1 rounded border border-gray-200 bg-white p-1.5 shadow-2xs'>
                                  <div class='flex items-center justify-between'>
                                    <input
                                      type='text'
                                      class='rounded border border-indigo-200 bg-indigo-50/40 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-900 focus:border-indigo-500 focus:outline-none'
                                      value={event().__id}
                                      onBlur={e => {
                                        const newKey = e.currentTarget.value.trim();
                                        if (!newKey || newKey === event().__id)
                                          return;
                                        const currentChild = actor().config ?? {};
                                        const { [event().__id]: old, ...rest } =
                                          currentChild.on ?? {};
                                        updateActor(index, {
                                          child: {
                                            ...currentChild,
                                            on: { ...rest, [newKey]: old },
                                          },
                                        });
                                      }}
                                    />

                                    <button
                                      type='button'
                                      title='Delete event handler'
                                      onClick={() => {
                                        const currentChild = actor().child ?? {};
                                        const { [event().__id]: _, ...rest } =
                                          currentChild.on ?? {};
                                        updateActor(index, {
                                          child: { ...currentChild, on: rest },
                                        });
                                      }}
                                      class='cursor-pointer rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-600'
                                    >
                                      <svg
                                        class='size-3'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        stroke-width='2'
                                      >
                                        <path d='M18 6L6 18M6 6l12 12' />
                                      </svg>
                                    </button>
                                  </div>

                                  <div class='flex flex-col gap-0.5'>
                                    <label class='text-[9px] text-gray-500'>
                                      Actions (comma-separated)
                                    </label>
                                    <input
                                      type='text'
                                      class='w-full rounded border border-gray-200 px-1.5 py-0.5 font-mono text-[11px] focus:border-indigo-500 focus:outline-none'
                                      value={event().actions?.join(', ') ?? ''}
                                      placeholder='e.g. notifyParent, syncStatus'
                                      onInput={e => {
                                        const actions = toList(
                                          e.currentTarget.value,
                                        );
                                        const currentChild = actor().child ?? {};
                                        const currentOn = currentChild.on ?? {};
                                        updateActor(index, {
                                          child: {
                                            ...currentChild,
                                            on: {
                                              ...currentOn,
                                              [event().__id]: {
                                                ...event(),
                                                actions,
                                              },
                                            },
                                          },
                                        });
                                      }}
                                    />
                                  </div>

                                  <div class='grid grid-cols-2 gap-1.5'>
                                    <div class='flex flex-col gap-0.5'>
                                      <label class='text-[9px] text-gray-500'>
                                        Target State
                                      </label>
                                      <input
                                        type='text'
                                        class='w-full rounded border border-gray-200 px-1.5 py-0.5 font-mono text-[11px] focus:border-indigo-500 focus:outline-none'
                                        value={event().target ?? ''}
                                        placeholder='e.g. /approved'
                                        onInput={e => {
                                          const currentChild = actor().child ?? {};
                                          const currentOn = currentChild.on ?? {};
                                          updateActor(index, {
                                            child: {
                                              ...currentChild,
                                              on: {
                                                ...currentOn,
                                                [event().__id]: {
                                                  ...event(),
                                                  target:
                                                    e.currentTarget.value ||
                                                    undefined,
                                                },
                                              },
                                            },
                                          });
                                        }}
                                      />
                                    </div>

                                    <div class='flex flex-col gap-0.5'>
                                      <label class='text-[9px] text-gray-500'>
                                        Guards
                                      </label>
                                      <input
                                        type='text'
                                        class='w-full rounded border border-gray-200 px-1.5 py-0.5 font-mono text-[11px] focus:border-indigo-500 focus:outline-none'
                                        value={event().guards?.join(', ') ?? ''}
                                        placeholder='e.g. isValid'
                                        onInput={e => {
                                          const guards = toList(
                                            e.currentTarget.value,
                                          );
                                          const currentChild = actor().child ?? {};
                                          const currentOn = currentChild.on ?? {};
                                          updateActor(index, {
                                            child: {
                                              ...currentChild,
                                              on: {
                                                ...currentOn,
                                                [event().__id]: {
                                                  ...event(),
                                                  guards:
                                                    guards.length > 0
                                                      ? guards
                                                      : undefined,
                                                },
                                              },
                                            },
                                          });
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Index>
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
                                const currentChild = actor().child ?? {};
                                const currentContexts = currentChild.contexts ?? {};
                                updateActor(index, {
                                  child: {
                                    ...currentChild,
                                    contexts: {
                                      ...currentContexts,
                                      '.': `stateContext_${Object.keys(currentContexts).length + 1}`,
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
                            <Index
                              each={Object.entries(actor().child?.contexts ?? {})}
                            >
                              {entry => (
                                <div class='flex items-center gap-1.5 rounded border border-gray-200 bg-white p-1 shadow-2xs'>
                                  <input
                                    type='text'
                                    title='Child context path (e.g. . or user.id)'
                                    class='w-1/2 rounded border border-gray-200 px-1 py-0.5 font-mono text-[10px] focus:border-indigo-500 focus:outline-none'
                                    value={entry()[0]}
                                    onBlur={e => {
                                      const newKey = e.currentTarget.value.trim();
                                      if (!newKey || newKey === entry()[0]) return;
                                      const currentChild = actor().child ?? {};
                                      const { [entry()[0]]: oldVal, ...rest } =
                                        currentChild.contexts ?? {};
                                      updateActor(index, {
                                        child: {
                                          ...currentChild,
                                          contexts: { ...rest, [newKey]: oldVal },
                                        },
                                      });
                                    }}
                                  />
                                  <span class='text-xs text-gray-400'>→</span>
                                  <input
                                    type='text'
                                    title='Parent pContext path (e.g. fraudScore)'
                                    class='w-1/2 rounded border border-gray-200 px-1 py-0.5 font-mono text-[10px] focus:border-indigo-500 focus:outline-none'
                                    value={entry()[1]}
                                    onInput={e => {
                                      const currentChild = actor().child ?? {};
                                      const currentContexts =
                                        currentChild.contexts ?? {};
                                      updateActor(index, {
                                        child: {
                                          ...currentChild,
                                          contexts: {
                                            ...currentContexts,
                                            [entry()[0]]: e.currentTarget.value,
                                          },
                                        },
                                      });
                                    }}
                                  />

                                  <button
                                    type='button'
                                    title='Delete mapping'
                                    onClick={() => {
                                      const currentChild = actor().child ?? {};
                                      const { [entry()[0]]: _, ...rest } =
                                        currentChild.contexts ?? {};
                                      updateActor(index, {
                                        child: { ...currentChild, contexts: rest },
                                      });
                                    }}
                                    class='cursor-pointer rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-600'
                                  >
                                    <svg
                                      class='size-3'
                                      viewBox='0 0 24 24'
                                      fill='none'
                                      stroke='currentColor'
                                      stroke-width='2'
                                    >
                                      <path d='M18 6L6 18M6 6l12 12' />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </Index>
                          </div>
                        </div>
                      </Show>
                    </div>
                  </Show>
                </div>
              );
            }}
          </Index>
        </div>
      </Show>
    </div>
  );
};
