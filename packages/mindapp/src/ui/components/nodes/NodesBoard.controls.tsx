import { type Component } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import type { WithFlow } from '../../Flow.context';

/** Properties for the {@linkcode NodesBoardControls} component. */
export type NodesControlsProps = {
  /** Flow engine value of type {@linkcode FlowContext}. */
  flow: WithFlow['flow'];
  /** Callback to recalculate and update scroll percentages on the board. */
  updateScrollPercentages: () => void;

  /** Optional custom controls addon component of type {@linkcode Component}. */
  addons?: Component<WithFlow>;
};

/**
 * Viewport navigation and zoom controls overlay, providing zoom in/out, zoom reset,
 * and root node addition actions.
 *
 * @param props - Component properties of type {@linkcode NodesControlsProps}.
 *
 * @returns The rendered controls toolbar element.
 */
export const NodesBoardControls: Component<NodesControlsProps> = props => {
  const { hooks, send } = props.flow;

  /** Reactive zoom factor of the canvas. */
  const zoom = hooks.state({ selector: s => s.context.zoom ?? 1 });

  /** Addon component rendered next to the zoom buttons. */
  const addons = props.addons ?? DefaultControlsAddons;

  /** Destructured scroll percentages updater of the board. */
  const { updateScrollPercentages } = props;

  return (
    <div class='absolute right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl border border-gray-200 bg-white/90 p-2 shadow-lg backdrop-blur-md'>
      <button
        type='button'
        class='flex size-9 cursor-pointer items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-700 shadow-sm transition-all duration-150 hover:bg-gray-200 active:scale-95'
        onClick={() => {
          updateScrollPercentages();
          send({ type: 'ZOOM', payload: -0.1 });
        }}
        title='Zoom out'
        aria-label='Zoom out'
      >
        -
      </button>

      <button
        type='button'
        class='h-9 cursor-pointer rounded-lg px-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100'
        onClick={() => {
          updateScrollPercentages();
          send('TOGGLE_ZOOM');
        }}
        title='Reset zoom'
        aria-label='Reset zoom'
      >
        {Math.round(zoom() * 100)}%
      </button>

      <button
        type='button'
        class='flex size-9 cursor-pointer items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-700 shadow-sm transition-all duration-150 hover:bg-gray-200 active:scale-95'
        onClick={() => {
          updateScrollPercentages();
          send({ type: 'ZOOM', payload: 0.1 });
        }}
        title='Zoom in'
        aria-label='Zoom in'
      >
        +
      </button>

      <div class='h-5 w-px bg-gray-300' />
      <Dynamic component={addons} flow={props.flow} />
    </div>
  );
};

/**
 * Default action addon rendering a button to add a root parent node to the board.
 *
 * @param props - Component properties of type {@linkcode WithFlow}.
 *
 * @returns The rendered addon element.
 */
export const DefaultControlsAddons: Component<WithFlow> = props => {
  const { send } = props.flow;
  return (
    <div class='flex items-center justify-center'>
      <button
        type='button'
        class='flex size-9 cursor-pointer items-center justify-center rounded-lg bg-blue-600 text-white shadow transition-all duration-150 hover:bg-blue-700 active:scale-95'
        onClick={() => send({ type: 'ADD_PARENT', payload: undefined })}
        title='Add parent node'
        aria-label='Add parent node'
      >
        <svg class='size-5' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' />
        </svg>
      </button>
    </div>
  );
};
