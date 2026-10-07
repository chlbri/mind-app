import type { WithFlow } from '@bemedev/mind-flow-fabric';
import { type Component } from 'solid-js';

/**
 * Bottom-left overlay controls rendering the git-like history actions (undo, redo),
 * the zoom reset and the history reset of the state machine diagram.
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

  /**
   * Button class helper toggling the disabled visual state.
   *
   * @param enabled - Whether the action is available.
   *
   * @returns The resolved class string.
   */
  const buttonClass = (enabled: boolean) =>
    `flex h-8 items-center gap-1 rounded-md border border-gray-200 bg-white/95 px-2 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm transition-colors ${
      enabled ? 'cursor-pointer hover:bg-gray-100' : 'cursor-not-allowed opacity-40'
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

      <button
        type='button'
        class={buttonClass(true)}
        onClick={() => send('TOGGLE_ZOOM')}
      >
        Reset view
      </button>
    </div>
  );
};
