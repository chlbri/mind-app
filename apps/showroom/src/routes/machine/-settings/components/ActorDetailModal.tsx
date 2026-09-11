import { For, onCleanup, onMount, Show, type Component } from 'solid-js';

import { activeActorNode, setActiveActorNode } from '../signals';

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
