import { cn } from 'cn';
import { type JSX, Show } from 'solid-js';

import type { Data } from '#services/main.machine.typings';

import { clickOutside, mouseOut } from '../globals/directives';
import { useHook } from './EditPanel.hooks';
import type { EditPanelProps } from './EditPanel.types';

/**
 * Generic overlay edit panel component for modifying the data of the currently
 * active/double-clicked flowchart node.
 *
 * @template | {@linkcode Data} `D` - Custom node data dictionary type extending
 *   {@linkcode Data}.
 *
 * @param props - Edit panel configuration properties of type
 *   {@linkcode EditPanelProps}.
 *
 * @returns The rendered Solid component or `null` when no node is being edited.
 *
 * @see {@linkcode useHook}, {@linkcode clickOutside}
 */
export const EditPanel = <D extends Data = Data>(
  props: EditPanelProps<D>,
): JSX.Element => {
  void clickOutside;
  void mouseOut;

  // const editing
  const hooks = useHook<D>(props.timeout);
  const classList = () =>
    props.classList instanceof Function ? props.classList(hooks) : props.classList;

  return (
    <Show when={hooks.editingNode()}>
      {node => (
        <div
          class={cn(
            'w-80 cursor-default rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur-md transition-all',
            props.class,
          )}
          classList={{
            ...classList(),
            'pointer-events-none! -z-10': !hooks.editingNode(),
            'pointer-events-all! z-50': !!hooks.editingNode(),
          }}
          style={props.style}
          onMouseDown={e => e.stopPropagation()}
          use:clickOutside={hooks.handleClickOutside}
          onMouseEnter={hooks.handleMouseEnter}
        >
          <div class='flex flex-col gap-3'>
            <Show
              when={props.header}
              keyed

              fallback={
                <div class='flex items-center justify-between border-b border-gray-100 pb-2'>
                  <div class='flex items-center gap-2'>
                    <h3 class='text-sm font-bold text-gray-800'>Edit</h3>

                    <span class='font-mono text-[11px] text-gray-400'>
                      {node().id}
                    </span>
                  </div>

                  <button
                    type='button'
                    onClick={hooks.close}
                    title='Close editor'
                    aria-label='Close editor'

                    class='cursor-pointer rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                  >
                    <svg
                      class='size-4'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      stroke-width='2'
                    >
                      <path d='M18 6L6 18M6 6l12 12' />
                    </svg>
                  </button>
                </div>
              }
            >
              {header => header({ id: node().id, close: hooks.close })}
            </Show>

            {props.children(hooks)}
          </div>
        </div>
      )}
    </Show>
  );
};
