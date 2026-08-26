import { EditPanel, mouseOut, type MouseOutParam } from '@bemedev/mind-flow';
import { type Component } from 'solid-js';

import type { ShowroomData } from './-index.types';

declare module 'solid-js' {
  // oxlint-disable-next-line typescript/no-namespace
  namespace JSX {
    interface Directives {
      clickOutside: () => void;
      mouseOut: MouseOutParam;
      draggable: { skipTransform?: boolean };
    }
  }
}

/**
 * Custom node renderer for Showroom displaying title, priority badge, and content.
 *
 * @param props - Node data properties of type {@linkcode ShowroomData}.
 *
 * @returns The rendered Solid component.
 */
export const ShowroomNode: Component<ShowroomData> = props => {
  const getBadge = (p = 1) => {
    switch (p) {
      case 5:
        return {
          label: 'P5 Critical',
          class: 'bg-red-100 text-red-700 border-red-300',
        };
      case 4:
        return {
          label: 'P4 High',
          class: 'bg-orange-100 text-orange-700 border-orange-300',
        };
      case 3:
        return {
          label: 'P3 Medium',
          class: 'bg-amber-100 text-amber-700 border-amber-300',
        };
      case 2:
        return {
          label: 'P2 Normal',
          class: 'bg-emerald-100 text-emerald-700 border-emerald-300',
        };
      case 1:
      default:
        return {
          label: 'P1 Low',
          class: 'bg-blue-100 text-blue-700 border-blue-300',
        };
    }
  };

  const badge = () => getBadge(props.priority);

  return (
    <div class='flex max-w-72 min-w-56 flex-col gap-2 p-3.5 select-none'>
      <div class='flex items-center justify-between gap-2 border-b border-gray-100 pb-2'>
        <span class='truncate text-sm font-bold text-gray-800'>
          {props.title || 'Untitled Node'}
        </span>
        <span
          class={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge().class}`}
        >
          {badge().label}
        </span>
      </div>
      <p class='line-clamp-3 text-xs whitespace-pre-wrap text-gray-600'>
        {props.content || 'No content provided'}
      </p>
    </div>
  );
};

/**
 * Top-left edit panel component that allows modifying the node's data upon
 * double-click using {@linkcode EditPanel}.
 *
 * @returns The rendered Solid component.
 *
 * @see type {@linkcode ShowroomData}
 */
export const ShowroomEditPanel: Component = () => {
  const toPriority = (value: string) => Number(value) as ShowroomData['priority'];
  void mouseOut;

  return (
    <EditPanel<ShowroomData>
      class='w-60 transition-all ease-linear'
      classList={({ closing }) => ({
        'pointer-events-none scale-95 opacity-0 duration-250': closing(),
        'opacity-35 hover:opacity-100 duration-150': !closing(),
      })}
    >
      {({ editing: node, updateField, close }) => {
        return (
          <div use:mouseOut={[close, 3_150]} class='flex flex-col gap-3'>
            <div class='flex flex-col gap-1'>
              <label class='text-xs font-semibold text-gray-600'>Title</label>
              <input
                type='text'
                class='w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none'
                value={node().data?.title ?? ''}
                onInput={e => updateField('title', e.currentTarget.value)}
                placeholder='Enter title...'
              />
            </div>

            <div class='flex flex-col gap-1'>
              <div class='flex items-center justify-between'>
                <label class='text-xs font-semibold text-gray-600'>
                  Priority (1-5)
                </label>

                <span class='text-xs font-bold text-blue-600'>
                  {node().data?.priority ?? 1}
                </span>
              </div>

              <input
                type='range'
                min='1'
                max='5'
                step='1'
                class='w-full cursor-pointer accent-blue-600'
                value={node().data?.priority ?? 1}
                onInput={e =>
                  updateField('priority', toPriority(e.currentTarget.value))
                }
              />
            </div>

            <div class='flex flex-col gap-1'>
              <label class='text-xs font-semibold text-gray-600'>Content</label>
              <textarea
                rows={3}
                class='w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none'
                value={node().data?.content ?? ''}
                onInput={e => updateField('content', e.currentTarget.value)}
                placeholder='Enter node description / details...'
              />
            </div>
          </div>
        );
      }}
    </EditPanel>
  );
};
