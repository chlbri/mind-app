import type { WithFlow } from '@bemedev/mind-flow-three';
import { Show, type Component } from 'solid-js';

/**
 * Bottom-left overlay controls rendering the git-like history actions: undo, redo,
 * checkout to the first commit and physics toggle.
 *
 * @param props - Flow engine value of type `WithFlow`.
 *
 * @returns The rendered Solid component.
 */
export const HistoryControls: Component<WithFlow> = props => {
  const { hooks, send } = props.flow;

  const canUndo = hooks.state({
    selector: ({ context }) => (context.historyIndex ?? -1) > 0,
  });

  const canRedo = hooks.state({
    selector: ({ context }) => {
      const { history, historyIndex } = context;
      if (!history || historyIndex === undefined) return false;
      return historyIndex >= 0 && historyIndex < history.length - 1;
    },
  });

  const physicsEnabled = hooks.state({
    selector: ({ context }) => context.physics?.enabled ?? true,
  });

  /** Button class helper toggling the disabled visual state. */
  const buttonClass = (enabled: boolean) =>
    `flex h-8 items-center gap-1 rounded-md border border-gray-700 bg-slate-900/90 px-2 text-xs font-medium text-slate-100 backdrop-blur-sm transition-colors ${
      enabled ? 'hover:bg-slate-700' : 'cursor-not-allowed opacity-40'
    }`;

  return (
    <div class='flex items-center gap-2'>
      <button
        type='button'
        class={buttonClass(canUndo())}
        disabled={!canUndo()}
        onClick={() => send('UNDO')}
      >
        <span aria-hidden='true'>↩</span>
        Undo
      </button>

      <button
        type='button'
        class={buttonClass(canRedo())}
        disabled={!canRedo()}
        onClick={() => send('REDO')}
      >
        Redo
        <span aria-hidden='true'>↪</span>
      </button>

      <Show when={physicsEnabled()}>
        <button
          type='button'
          class={buttonClass(true)}
          onClick={() => send('TOGGLE_PHYSICS')}
        >
          Physics on
        </button>
      </Show>

      <Show when={!physicsEnabled()}>
        <button
          type='button'
          class={buttonClass(true)}
          onClick={() => send('TOGGLE_PHYSICS')}
        >
          Physics off
        </button>
      </Show>
    </div>
  );
};
