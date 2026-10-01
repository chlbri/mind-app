import { toArray } from '@bemedev/app/bemedev';
import { deepEqual } from '@bemedev/app/utils';
import { createDraggable } from '@thisbeyond/solid-dnd';
import { type Component, For, type JSX, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { getHandleOffsetPercent } from '#services/main.machine.helpers';
import type {
  Data,
  HandlePosition,
  NodeHandles_T,
} from '#services/main.machine.typings';

import type { FlowContext, WithFlow } from '../../Flow.context';
import { resize } from '../../globals/directives';
import { DEFAULT_HANDLES } from './data';
import { NodeHandles } from './Node.handles';

export { getHandleOffsetPercent };

/** Properties for rendering an individual flowchart node component. */
export type NodeComponentProps<D extends Data = Data> = {
  /** Unique identifier of the node. */
  id: string;
  /** Flow engine value of type {@linkcode FlowContext}. */
  flow: FlowContext;
  /** Custom node component to render inside the node container. */
  children?: Component<D & WithFlow>;
  /** Custom component rendered for node selection action controls. */
  Selected: Component<{ id: string } & WithFlow>;
  /**
   * Optional handle configurations overriding default node handles of type
   * {@linkcode NodeHandles_T}.
   */
  handles?: NodeHandles_T;
};

/**
 * Interactive flowchart node component supporting dragging, selection, handle
 * connections, and child/sibling creation.
 *
 * @template | {@linkcode Data} `D` - Custom node data dictionary type extending
 *   {@linkcode Data}.
 *
 * @param props - Node rendering properties of type {@linkcode NodeComponentProps}.
 *
 * @returns The rendered Solid component.
 *
 * @see -- type {@linkcode NodeHandles_T}, {@linkcode getHandleOffsetPercent}
 */
export const NodeComponent = <D extends Data = Data>(
  props: NodeComponentProps<D>,
): JSX.Element => {
  const { hooks, send } = props.flow;

  /** Reactive ongoing new edge preview, if any. */
  const newEdge = hooks.state({ selector: s => s.context.newEdge });

  /** Draggable binding of this node for the solid-dnd library. */
  const draggable = createDraggable(props.id);

  void draggable;

  /** Reactive position, data and handles of this node. */
  const node = hooks.state({
    selector: ({ context }) => {
      const list = toArray.typed(context.data?.nodes);
      const item = list.find(n => n.id === props.id);
      return {
        x: item?.position.x ?? 0,
        y: item?.position.y ?? 0,
        data: (item?.data ?? {}) as D,
        handles: item?.handles,
      };
    },
    equals: deepEqual<any>,
  });

  /** Tells whether this node is currently selected. */
  const selected = hooks.state({
    selector: ({ context }) => context.selected === props.id,
  });

  /** Handles of the node, falling back to the defaults. */
  const resolvedHandles = (): NodeHandles_T => {
    const custom = props.handles ?? node().handles;
    if (custom !== undefined) return custom;
    return DEFAULT_HANDLES;
  };

  /**
   * Completes an ongoing edge drag onto the given handle of this node.
   *
   * @param side - Container side of the target handle of type
   *   {@linkcode HandlePosition}.
   * @param index - Zero-based index of the target handle on that side.
   */
  const handleAddEdge = (side: HandlePosition, index: number) => {
    const handles = resolvedHandles();
    const handle = handles[side]?.[index];
    if (handle?.type === 'none') {
      send('CLEAR_NEW_EDGE');
      return;
    }
    const edge = newEdge();
    const from = edge?.from;
    if (from && from !== props.id) {
      send({
        type: 'ADD_EDGE',
        payload: {
          from,
          to: props.id,
          toPosition: side,
          toIndex: index,
          fromPosition: edge?.fromPosition,
          fromIndex: edge?.fromIndex,
        },
      });
    }
    send('CLEAR_NEW_EDGE');
  };

  /**
   * Starts an outgoing edge drag from the given handle of this node.
   *
   * @param side - Container side of the source handle of type
   *   {@linkcode HandlePosition}.
   * @param index - Zero-based index of the source handle on that side.
   */
  const handleStartEdge = (side: HandlePosition, index: number) => {
    const handles = resolvedHandles();
    const handle = handles[side]?.[index];
    if (handle?.type === 'none') return;
    send('DESELECT');
    send({
      type: 'START_NEW_EDGE',
      payload: { from: props.id, position: side, index },
    });
  };

  return (
    <div
      classList={{
        'flex flex-col absolute cursor-grab bg-white rounded-md shadow-md select-none transition-[border,box-shadow] duration-200 ease-in-out hover:shadow-lg draggable': true,
        'border border-[#e38c29] z-100': selected(),
        'border border-[#e6d4be] z-1': !selected(),
      }}

      style={{ top: `${node().y}px`, left: `${node().x}px` }}
      class='group min-w-48'
      use:draggable={{ skipTransform: true }}
      id={props.id}

      onMouseDown={e => {
        e.stopPropagation();
        send({ type: 'SELECT', payload: props.id });
      }}
      onDblClick={e => {
        e.stopPropagation();
        send({ type: 'EDIT', payload: props.id });
      }}
    >
      <div
        class='pointer-events-none absolute -top-7.5 right-0 z-300 flex items-center justify-end space-x-2 transition-all duration-200 ease-in-out'
        classList={{
          'w-full opacity-100': selected(),
          'w-0 -right-3 opacity-0 overflow-hidden': !selected(),
        }}
      >
        <props.Selected id={props.id} flow={props.flow} />
      </div>

      <div ref={resize(props.id, props.flow)}>
        <Show
          when={props.children}
          fallback={
            <div class='p-3 select-none'>
              <Show when={node().data.label} keyed>
                {label => (
                  <span class='mb-2 block min-w-max border-b border-[#f0f0f0] pb-2 font-semibold whitespace-nowrap text-red-600 select-none'>
                    {String(label)}
                  </span>
                )}
              </Show>

              <Show when={node().data.content} keyed>
                {content => <div class='select-none'>{String(content)}</div>}
              </Show>

              <Show when={!node().data.label && !node().data.content}>
                <For each={Object.entries(node().data)}>
                  {([key, val]) => (
                    <div>
                      <span class='font-semibold'>{key}: </span>
                      <span>{String(val)}</span>
                    </div>
                  )}
                </For>
              </Show>
            </div>
          }
        >
          <Dynamic component={props.children} {...node().data} flow={props.flow} />
        </Show>
      </div>

      <NodeHandles
        resolvedHandles={resolvedHandles}
        id={props.id}
        onAddEdge={handleAddEdge}
        onStartEdge={handleStartEdge}
      />
    </div>
  );
};
