import { useFlow } from '@bemedev/mind-flow';
import { nanoid } from 'nanoid';
import { createSignal, onCleanup, onMount, Show, type Component } from 'solid-js';

import { activeAddTransitionEdge, setActiveAddTransitionEdge } from '../signals';
import type { EdgeKind, StateMachineEdgeData, TransitionItem } from '../types';

/**
 * Modal dialog that allows users to add a new transition (`on`, `after`, or
 * `always`) to an edge connecting two states.
 */
export const AddTransitionModal: Component = () => {
  const { service } = useFlow();
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
    if (!target) return;

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
