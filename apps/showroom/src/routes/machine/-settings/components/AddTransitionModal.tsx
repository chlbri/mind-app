import {
  clickOutside,
  mouseOut,
  useFlow,
  useClose,
  type MouseOutParam,
} from '@bemedev/mind-flow';
import { nanoid } from 'nanoid';
import { createSignal, onCleanup, onMount, Show, type Component } from 'solid-js';

import { activeAddTransitionEdge, setActiveAddTransitionEdge } from '../signals';
import type { EdgeKind, StateMachineEdgeData, TransitionItem } from '../types';

declare module 'solid-js' {
  // oxlint-disable-next-line typescript/no-namespace
  namespace JSX {
    interface Directives {
      clickOutside: () => void;
      mouseOut: MouseOutParam;
    }
  }
}

/**
 * Panel dialog positioned at the left that allows users to add a new transition
 * (`on`, `after`, or `always`) to an edge connecting two states.
 */
export const TransitionModal: Component = () => {
  void clickOutside;
  void mouseOut;

  const { service, send } = useFlow();
  const activeEdge = activeAddTransitionEdge;

  const {
    closing,
    hasEntered,
    handleClickOutside,
    handleMouseEnter,
    close,
    directClose,
  } = useClose({
    initial: () => !!activeEdge(),
    close: () => setActiveAddTransitionEdge(null),
  });

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

  const targetEdge = () => {
    const target = activeEdge();
    if (!target) return undefined;
    return service.state.context.data?.edges?.find(e => e.id === target.edgeId);
  };

  const edgeKind = (): EdgeKind => {
    const target = activeEdge();
    if (target?.kind) return target.kind;
    const edge = targetEdge();
    const data = edge?.data as StateMachineEdgeData | undefined;
    if (data?.kind) return data.kind;
    if (data?.transitions?.[0]?.kind) return data.transitions[0].kind;
    const fromPos = edge?.fromPosition;
    const toPos = edge?.toPosition;
    if (fromPos === 'top' || toPos === 'bottom') return 'child_parent';
    const idx = edge?.fromIndex ?? edge?.toIndex;
    if (idx === 0) return 'after';
    if (idx === 1) return 'always';
    if (idx === 2) return 'on';
    return 'on';
  };

  const kindInfo = () => {
    const k = edgeKind();
    switch (k) {
      case 'after':
        return {
          title: 'After Delay Transition',
          icon: '⏱',
          badgeClass: 'border-orange-200 bg-orange-50 text-orange-800',
          indicatorClass: 'bg-orange-500',
        };
      case 'always':
        return {
          title: 'Always Transition',
          icon: '⚡',
          badgeClass: 'border-green-200 bg-green-50 text-green-800',
          indicatorClass: 'bg-green-500',
        };
      case 'on':
      default:
        return {
          title: 'On Event Transition',
          icon: '🔀',
          badgeClass: 'border-blue-200 bg-blue-50 text-blue-800',
          indicatorClass: 'bg-blue-500',
        };
    }
  };

  const handleAdd = () => {
    const target = activeEdge();
    if (!target) return;

    const edge = targetEdge();
    const existingData = (edge?.data ?? {}) as StateMachineEdgeData;
    const selectedKind = edgeKind();

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

    send({
      type: 'SET_EDGE_DATA',
      payload: {
        id: target.edgeId,
        data: {
          ...existingData,
          kind: selectedKind,
          transitions: updatedTransitions,
          label:
            updatedTransitions.length === 1
              ? updatedTransitions[0].label
              : `${updatedTransitions.length} transitions`,
        },
      },
    });

    // Reset inputs & close
    setEventName('');
    setGuard('');
    setActionsInput('');
    directClose();
  };

  return (
    <Show when={activeEdge()}>
      {target => (
        <div
          class='pointer-events-all! relative flex w-80 max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-xl backdrop-blur-md transition-all ease-linear'
          classList={{
            'pointer-events-none scale-95 opacity-0 duration-250': closing(),
            'opacity-100 duration-150': !closing() && !hasEntered(),
            'opacity-35 has-focus-within:opacity-100 hover:opacity-100 duration-150':
              !closing() && hasEntered(),
          }}
          onMouseEnter={handleMouseEnter}
          use:mouseOut={[close, 3_150]}
          use:clickOutside={handleClickOutside}
          onMouseDown={e => e.stopPropagation()}
        >
          {/* Header */}
          <div class='flex items-center justify-between border-b border-gray-100 bg-linear-to-r from-indigo-50/80 via-purple-50/80 to-white/80 px-4 py-3'>
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
              aria-label='Close'
              class='cursor-pointer rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700'
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <div class='space-y-3.5 p-4 text-left text-xs'>
            {/* Kind indicator banner */}
            <div>
              <label class='mb-1 block font-semibold text-gray-700'>
                Transition Type (Matched to Edge Handle)
              </label>
              <div
                class={`flex items-center gap-2 rounded-lg border p-2 ${kindInfo().badgeClass}`}
              >
                <span class='text-base'>{kindInfo().icon}</span>
                <span class='font-bold'>{kindInfo().title}</span>
              </div>
            </div>

            {/* Specific inputs */}
            <Show when={edgeKind() === 'on'}>
              <div>
                <label class='mb-1 block font-semibold text-gray-700'>
                  Event Name <span class='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  placeholder='e.g. SUBMIT, RETRY, CANCEL'
                  value={eventName()}
                  onInput={e => setEventName(e.currentTarget.value.toUpperCase())}
                  class='w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-mono text-xs focus:border-indigo-500 focus:outline-none'
                />
              </div>
            </Show>

            <Show when={edgeKind() === 'after'}>
              <div>
                <label class='mb-1 block font-semibold text-gray-700'>
                  Delay Duration / Identifier <span class='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  placeholder='e.g. 3000ms, 5s, TIMEOUT'
                  value={delay()}
                  onInput={e => setDelay(e.currentTarget.value)}
                  class='w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-mono text-xs focus:border-indigo-500 focus:outline-none'
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
                class='w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-mono text-xs focus:border-indigo-500 focus:outline-none'
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
                class='w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-mono text-xs focus:border-indigo-500 focus:outline-none'
              />
            </div>
          </div>

          {/* Footer */}
          <div class='flex justify-end gap-2 border-t border-gray-100 bg-gray-50/80 px-4 py-2.5'>
            <button
              type='button'
              onClick={close}
              class='cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={handleAdd}
              class='cursor-pointer rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700'
            >
              Add Transition
            </button>
          </div>
        </div>
      )}
    </Show>
  );
};
