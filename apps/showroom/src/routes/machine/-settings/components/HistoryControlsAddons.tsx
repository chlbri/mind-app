import { clickOutside, cn, useFlow, type HistoryEntry } from '@bemedev/mind-flow';
import {
  Check,
  ChevronDown,
  GitBranch,
  GitCommitHorizontal,
  Redo,
  Undo,
} from 'lucide-solid';
import { createSignal, For, Show, type Component } from 'solid-js';

import { createHandles } from '../helpers';

/**
 * Formats a single commit's delta summary or base snapshot details for display in
 * the checkout select dropdown.
 *
 * @param entry - The commit history entry of type {@linkcode HistoryEntry}.
 * @param index - The sequential index of the commit.
 *
 * @returns Human-readable commit summary string.
 */
export const formatCommitSummary = (entry: HistoryEntry, index: number): string => {
  if (index === 0) {
    const nodeCount = entry.data?.nodes?.length ?? 0;
    const edgeCount = entry.data?.edges?.length ?? 0;
    return `Initial snapshot (${nodeCount} node${nodeCount !== 1 ? 's' : ''}, ${edgeCount} edge${edgeCount !== 1 ? 's' : ''})`;
  }

  const parts: string[] = [];
  const nodes = entry.diff?.nodes;
  const edges = entry.diff?.edges;

  if (nodes) {
    if (nodes.addeds) {
      const count = Array.isArray(nodes.addeds) ? nodes.addeds.length : 1;
      parts.push(`+${count} node${count > 1 ? 's' : ''}`);
    }
    if (nodes.updateds) {
      const count = Array.isArray(nodes.updateds) ? nodes.updateds.length : 1;
      parts.push(`~${count} node${count > 1 ? 's' : ''}`);
    }
    if (nodes.removeds && nodes.removeds.length > 0) {
      parts.push(
        `-${nodes.removeds.length} node${nodes.removeds.length > 1 ? 's' : ''}`,
      );
    }
  }

  if (edges) {
    if (edges.addeds) {
      const count = Array.isArray(edges.addeds) ? edges.addeds.length : 1;
      parts.push(`+${count} edge${count > 1 ? 's' : ''}`);
    }
    if (edges.updateds) {
      const count = Array.isArray(edges.updateds) ? edges.updateds.length : 1;
      parts.push(`~${count} edge${count > 1 ? 's' : ''}`);
    }
    if (edges.removeds && edges.removeds.length > 0) {
      parts.push(
        `-${edges.removeds.length} edge${edges.removeds.length > 1 ? 's' : ''}`,
      );
    }
  }

  return parts.length > 0 ? parts.join(', ') : 'Minor update';
};

/**
 * Formats a millisecond timestamp to local time string.
 *
 * @param timestamp - Timestamp in milliseconds.
 *
 * @returns Formatted time string (HH:MM:SS).
 */
export const formatTime = (timestamp: number): string => {
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '';
  }
};

/**
 * Custom flowchart controls addon component providing Undo, Redo, Commit, and a rich
 * Checkout commit select dropdown menu.
 *
 * @returns The rendered history controls toolbar elements.
 *
 * @see {@linkcode useFlow},
 */
export const HistoryControlsAddons: Component = () => {
  void clickOutside;
  const { send, hooks } = useFlow();
  const [isOpen, setIsOpen] = createSignal(false);
  const [isCommitOpen, setIsCommitOpen] = createSignal(false);
  const [commitName, setCommitName] = createSignal<string>();
  const history = hooks.state({ selector: s => s.context.history ?? [] });
  const hasHistory = () => history().length > 0;
  const historyIndex = hooks.state({ selector: s => s.context.historyIndex ?? -1 });
  const canUndo = () => historyIndex() > 0;
  const canRedo = () => historyIndex() >= 0 && historyIndex() < history().length - 1;

  const currentCommitLabel = () => {
    const idx = historyIndex();
    const list = history();
    if (idx < 0 || list.length === 0) return 'No commits';

    const current = list[idx];
    if (current?.name) return `#${idx}: ${current.name}`;

    return `Commit #${idx}`;
  };

  const handleCommit = () => {
    const payload = commitName()?.trim();
    send({ type: 'COMMIT', payload });
    setCommitName('');
    setIsCommitOpen(false);
  };

  return (
    <div class='flex items-center gap-1.5'>
      {/* Root Node Addition Action */}
      <button
        type='button'
        class='flex size-9 cursor-pointer items-center justify-center rounded-lg bg-blue-600 text-white shadow transition-all duration-150 hover:bg-blue-700 active:scale-95'
        onClick={() =>
          send({ type: 'ADD_PARENT', payload: { handles: createHandles() } })
        }
        title='Add parent node'
        aria-label='Add parent node'
      >
        <svg class='size-5' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' />
        </svg>
      </button>

      <div class='h-5 w-px bg-gray-200' />

      {/* Undo Button */}
      <button
        type='button'
        disabled={!canUndo()}
        class={cn(
          'flex size-9 cursor-pointer items-center justify-center rounded-lg text-gray-700 shadow-sm transition-all duration-150',
          canUndo()
            ? 'bg-gray-100 hover:bg-gray-200 active:scale-95'
            : 'cursor-not-allowed bg-gray-50 text-gray-300 shadow-none',
        )}
        onClick={() => send('UNDO')}
        title={canUndo() ? `Undo to #${historyIndex() - 1}` : 'Nothing to undo'}
        aria-label='Undo'
      >
        <Undo class='size-4' />
      </button>

      {/* Redo Button */}
      <button
        type='button'
        disabled={!canRedo()}
        class={cn(
          'flex size-9 cursor-pointer items-center justify-center rounded-lg text-gray-700 shadow-sm transition-all duration-150',
          canRedo()
            ? 'bg-gray-100 hover:bg-gray-200 active:scale-95'
            : 'cursor-not-allowed bg-gray-50 text-gray-300 shadow-none',
        )}
        onClick={() => send('REDO')}
        title={canRedo() ? `Redo to #${historyIndex() + 1}` : 'Nothing to redo'}
        aria-label='Redo'
      >
        <Redo class='size-4' />
      </button>

      {/* Commit Button with Name Bubble Popover */}
      <div class='relative' use:clickOutside={() => setIsCommitOpen(false)}>
        <button
          type='button'
          class='flex size-9 cursor-pointer items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm transition-all duration-150 hover:bg-indigo-100 hover:text-indigo-700 active:scale-95'
          onClick={() => {
            setIsCommitOpen(prev => !prev);
            setIsOpen(false);
          }}
          title='Commit current changes'
          aria-label='Commit changes'
        >
          <GitCommitHorizontal class='size-4.5' />
        </button>

        <Show when={isCommitOpen()}>
          <div class='animate-in fade-in zoom-in-95 absolute bottom-full left-1/2 z-50 mb-3 w-64 -translate-x-1/2 rounded-xl border border-gray-200 bg-white/95 p-3 shadow-2xl backdrop-blur-md'>
            {/* Speech bubble pointer notch pointing downwards toward button */}
            <div class='absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-r border-b border-gray-200 bg-white' />

            <div class='flex items-center justify-between pb-1.5'>
              <span class='text-xs font-semibold text-gray-700'>Commit Changes</span>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                handleCommit();
              }}
              class='space-y-2'
            >
              <input
                ref={el => setTimeout(() => el?.focus(), 50)}
                type='text'
                value={commitName()}
                onInput={e => setCommitName(e.currentTarget.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') setIsCommitOpen(false);
                }}
                placeholder='Commit name (optional)...'
                class='w-full rounded-lg border border-gray-200 bg-gray-50/50 px-2.5 py-1.5 text-xs text-gray-800 placeholder-gray-400 transition-colors focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none'
              />

              <div class='flex items-center justify-end gap-1.5'>
                <button
                  type='button'
                  onClick={() => setIsCommitOpen(false)}
                  class='cursor-pointer rounded-md px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  class='cursor-pointer rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow transition-all hover:bg-indigo-700 active:scale-95'
                >
                  Commit
                </button>
              </div>
            </form>
          </div>
        </Show>
      </div>

      <div class='h-5 w-px bg-gray-200' />

      {/* Checkout Select / Dropdown */}
      <div class='relative' use:clickOutside={() => setIsOpen(false)}>
        <button
          type='button'
          onClick={() => {
            setIsOpen(prev => !prev);
            setIsCommitOpen(false);
          }}
          class={cn(
            'flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium shadow-sm transition-colors',
            hasHistory()
              ? 'cursor-pointer border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-98'
              : 'cursor-not-allowed border-gray-100 bg-gray-50/50 text-gray-300 shadow-none',
          )}
          title={hasHistory() ? 'Checkout commit' : 'No commit history'}
          aria-haspopup='listbox'
          aria-expanded={isOpen()}
          disabled={!hasHistory()}
        >
          <GitBranch
            class={cn(
              'size-3.5',
              hasHistory() ? 'text-indigo-600' : 'text-gray-300',
            )}
          />
          <span class='max-w-24 truncate'>{currentCommitLabel()}</span>
          <Show when={hasHistory()}>
            <ChevronDown
              class={cn(
                'size-3 text-gray-400 transition-transform duration-200',
                isOpen() && 'rotate-180',
              )}
            />
          </Show>
        </button>

        <Show when={isOpen()}>
          <div class='animate-in fade-in zoom-in-95 absolute right-0 bottom-full z-50 mb-2 w-80 rounded-xl border border-gray-200 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md'>
            <div class='flex items-center justify-between border-b border-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-500'>
              <span>Git History</span>
              <span class='rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600'>
                {history().length} / 100
              </span>
            </div>

            <Show
              when={history().length > 0}
              fallback={
                <div class='p-3 text-center text-xs text-gray-400'>
                  No commits yet. Edit the graph or click Commit to record one.
                </div>
              }
            >
              <div class='mt-1 max-h-60 space-y-1 overflow-y-auto pr-0.5'>
                <For each={history()}>
                  {(entry, idx) => {
                    const isSelected = () => idx() === historyIndex();
                    return (
                      <button
                        type='button'
                        class={cn(
                          'flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors',
                          isSelected()
                            ? 'border border-indigo-200/60 bg-indigo-50 font-medium text-indigo-900'
                            : 'text-gray-700 hover:bg-gray-100',
                        )}
                        onClick={() => {
                          send({ type: 'CHECKOUT', payload: idx() });
                          setIsOpen(false);
                        }}
                      >
                        <div class='flex min-w-0 flex-col pr-2'>
                          <div class='flex items-center gap-1.5'>
                            <span
                              class={cn(
                                'rounded px-1.5 py-0.2 text-[10px] font-semibold',
                                isSelected()
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-200 text-gray-700',
                              )}
                            >
                              #{idx()}
                            </span>
                            <Show when={entry.name}>
                              <span class='max-w-36 truncate font-medium text-gray-900'>
                                {entry.name}
                              </span>
                            </Show>
                            <Show when={isSelected()}>
                              <span class='rounded bg-indigo-100 px-1 text-[9px] font-bold text-indigo-700'>
                                HEAD
                              </span>
                            </Show>
                            <span class='ml-auto truncate text-[11px] text-gray-400'>
                              {formatTime(entry.date)}
                            </span>
                          </div>
                          <span class='mt-0.5 truncate text-[11px] text-gray-600'>
                            {formatCommitSummary(entry, idx())}
                          </span>
                        </div>

                        <Show when={isSelected()}>
                          <Check class='size-4 shrink-0 text-indigo-600' />
                        </Show>
                      </button>
                    );
                  }}
                </For>
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
};
