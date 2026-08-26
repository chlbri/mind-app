import { toArray } from '@bemedev/app';
import { createState } from '@bemedev/app-solidjs';
import { Flow, useFlow } from '@bemedev/mind-flow';
import { createFileRoute } from '@tanstack/solid-router';
import { dequal } from 'dequal';
import { type Component, Show } from 'solid-js';

/** Serialized node data dictionary type used in the showroom demo. */
export type ShowroomData = {
  /** Node title. */
  title: string;
  /** Detailed content / notes for the node. */
  content: string;
  /** Priority level from 1 (lowest) to 5 (highest). */
  priority: number;
};

/**
 * Custom node renderer for Showroom displaying title, priority badge, and content.
 *
 * @param props - Node data properties of type {@linkcode ShowroomData}.
 *
 * @returns The rendered Solid component.
 */
const ShowroomNode: Component<ShowroomData> = props => {
  const getBadge = (p = 1) => {
    switch (Number(p)) {
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
 * double-click.
 *
 * @returns The rendered Solid component.
 *
 * @see {@linkcode useFlow}
 */
const ShowroomEditPanel: Component = () => {
  const service = useFlow();

  const editingNode = createState(service, {
    selector: ({ context }) => {
      const editingId = context.editing;
      if (!editingId) return null;
      const list = toArray.typed(context.data?.nodes);
      const item = list.find(n => n.id === editingId);
      if (!item) return null;
      return { id: item.id, data: item.data as unknown as ShowroomData };
    },
    equals: dequal,
  });

  const updateField = (field: keyof ShowroomData, value: string | number) => {
    const current = editingNode();
    if (!current) return;
    service.send({
      type: 'SET_NODE_DATA',
      payload: { id: current.id, data: { ...current.data, [field]: value } },
    });
  };

  return (
    <Show when={editingNode()}>
      {node => (
        <div
          class='w-80 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur-md transition-all'
          onMouseDown={e => e.stopPropagation()}
        >
          <div class='flex flex-col gap-3'>
            <div class='flex items-center justify-between border-b border-gray-100 pb-2'>
              <div class='flex items-center gap-2'>
                <h3 class='text-sm font-bold text-gray-800'>Edit Node Data</h3>
                <span class='font-mono text-[11px] text-gray-400'>{node().id}</span>
              </div>
              <button
                type='button'
                onClick={() => service.send('STOP_EDIT')}
                class='cursor-pointer rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                title='Close editor'
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
                onInput={e => updateField('priority', Number(e.currentTarget.value))}
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
        </div>
      )}
    </Show>
  );
};

const initialNodes = [
  {
    id: 'node-0',
    data: {
      title: 'Mind Flow Project',
      content: 'Interactive flowchart graph with generic node data.',
      priority: 5,
    },
    input: false,
    position: { x: 250, y: 150 },
  },
  {
    id: 'node-1',
    data: {
      title: 'Parameterized Content',
      content: 'Flow component is now fully generic and type-safe.',
      priority: 4,
    },
    input: true,
    position: { x: 650, y: 100 },
  },
  {
    id: 'node-2',
    data: {
      title: 'Corner Panels',
      content: 'Top-left, top-right, and bottom-left custom overlay panels.',
      priority: 3,
    },
    input: true,
    position: { x: 650, y: 280 },
  },
];

const initialEdges = [
  { id: 'edge = node-0 => node-1', from: 'node-0', to: 'node-1' },
  { id: 'edge = node-0 => node-2', from: 'node-0', to: 'node-2' },
];

/** Interactive Mind Flow chart demonstration route. */
export const Route = createFileRoute('/demo/')({
  component: () => (
    <Flow<ShowroomData>
      config={{ nodes: initialNodes, edges: initialEdges }}
      defaultData={{
        title: 'New Node',
        content: 'Edit this description in the top-left panel.',
        priority: 1,
      }}
      nodeComponent={ShowroomNode}
      panels={{ topLeft: <ShowroomEditPanel /> }}
    />
  ),
  ssr: 'data-only',
});
