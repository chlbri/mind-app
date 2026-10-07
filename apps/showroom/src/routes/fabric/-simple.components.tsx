import {
  EditPanel,
  type EdgeFabricComponent,
  type NodeFabricComponent,
  type WithFlow,
} from '@bemedev/mind-flow-fabric';
import { Rect, Text, type FabricObject } from 'fabric';
import { type Component } from 'solid-js';

import { badgeOf } from './-simple.data';
import type { ShowroomData, ShowroomEdgeData } from './-simple.types';

/** Default node dimensions in pixels used by the showroom canvas. */
export const NODE_SIZE = { width: 192, height: 50 } as const;

/**
 * Fabric node renderer for the showroom: restyles the node body with the priority
 * colors and returns a priority badge pill at the top-right corner.
 *
 * @param props - Node entity, selection state, node rectangle and label of type
 *   `NodeProps<ShowroomData> & { id, selected, rect, label }`.
 *
 * @see {@linkcode badgeOf}
 */
export const ShowroomNodeFabric: NodeFabricComponent<ShowroomData> = props => {
  const { selected, rect, label } = props;
  const data = (props.data ?? {}) as ShowroomData;
  const badge = badgeOf(data.priority);
  const width = rect.width ?? NODE_SIZE.width;

  rect.set({
    fill: selected ? '#fff7ed' : badge.fill,
    stroke: selected ? '#f97316' : badge.color,
    strokeWidth: selected ? 2.5 : 1.5,
    rx: 10,
    ry: 10,
  });

  label.set({ fill: selected ? '#9a3412' : '#1f2937', fontWeight: '600' });

  const badgeWidth = 58;
  const badgeHeight = 16;

  const background = new Rect({
    left: width - badgeWidth + 8,
    top: -8,
    width: badgeWidth,
    height: badgeHeight,
    rx: badgeHeight / 2,
    ry: badgeHeight / 2,
    fill: badge.color,
    selectable: false,
    evented: false,
    objectCaching: false,
  });

  const text = new Text(badge.code, {
    left: width - badgeWidth + 8 + badgeWidth / 2,
    top: -8 + badgeHeight / 2,
    originX: 'center',
    originY: 'center',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fill: '#ffffff',
    selectable: false,
    evented: false,
    objectCaching: false,
  });

  return [background, text];
};

/**
 * Fabric edge renderer for the showroom: recolors the edge path and returns a
 * centered label badge.
 *
 * @param props - Edge entity, selection state and edge path of type
 *   `Edge<ShowroomEdgeData> & { id, selected, path }`.
 */
export const ShowroomEdgeFabric: EdgeFabricComponent<ShowroomEdgeData> = props => {
  const { path, selected } = props;
  const data = (props.data ?? {}) as ShowroomEdgeData;
  const color = selected ? '#f97316' : '#94a3b8';

  path.set({ stroke: color, strokeWidth: selected ? 3 : 2 });

  const text = data.label ?? 'link';
  const center = path.getCenterPoint();
  const width = Math.max(34, text.length * 6 + 14);
  const height = 18;

  const background = new Rect({
    left: center.x,
    top: center.y,
    width,
    height,
    rx: height / 2,
    ry: height / 2,
    originX: 'center',
    originY: 'center',
    fill: '#ffffff',
    stroke: color,
    strokeWidth: 1,
    selectable: false,
    evented: false,
    objectCaching: false,
  });

  const label = new Text(text, {
    left: center.x,
    top: center.y,
    originX: 'center',
    originY: 'center',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fill: color,
    selectable: false,
    evented: false,
    objectCaching: false,
  });

  const extras: FabricObject[] = [background, label];
  return extras;
};

/**
 * Top-left edit panel component editing the double-clicked node through the
 * `EditPanel` of `@bemedev/mind-flow-fabric`.
 *
 * @param props - Flow engine value of type `WithFlow`.
 *
 * @returns The rendered Solid component.
 *
 * @see {@linkcode EditPanel}
 */
export const ShowroomEditPanel: Component<WithFlow> = props => {
  return (
    <EditPanel<ShowroomData>
      flow={props.flow}
      class='w-64 transition-all ease-linear'
      classList={({ closing }) => ({
        'pointer-events-none scale-95 opacity-0 duration-250': closing(),
        'opacity-35 has-focus-within:opacity-100 hover:opacity-100 duration-150':
          !closing(),
      })}
    >
      {({ editingNode: node, updateField }) => (
        <div class='flex flex-col gap-3'>
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
                updateField(
                  'priority',
                  Number(e.currentTarget.value) as ShowroomData['priority'],
                )
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
      )}
    </EditPanel>
  );
};

/**
 * Bottom-left controls panel demonstrating the fabric engine events: add a node at a
 * random position, delete the selected node, and count the graph nodes.
 *
 * @param props - Flow engine value of type `WithFlow`.
 *
 * @returns The rendered Solid component.
 */
export const ShowroomControls: Component<WithFlow> = props => {
  const { hooks, send } = props.flow;

  const nodeCount = hooks.state({
    selector: s => s.context.data?.nodes?.length ?? 0,
  });

  const selectedId = hooks.state({ selector: s => s.context.selected });

  /** Sequential counter naming the nodes created from this panel. */
  let added = 0;

  const addNode = () => {
    added += 1;
    const priority = (((added - 1) % 5) + 1) as ShowroomData['priority'];

    send({
      type: 'ADD_PARENT',
      payload: {
        id: `node-added-${added}`,
        data: {
          title: `New Node ${added}`,
          content: 'Created from the bottom-left controls panel.',
          priority,
        },
      },
    });

    send({ type: 'COMMIT', payload: undefined });
  };

  const removeSelected = () => {
    const id = selectedId();
    if (!id) return;
    send({ type: 'DELETE', payload: id });
    send({ type: 'COMMIT', payload: undefined });
  };

  /**
   * Button class helper toggling the disabled visual state.
   *
   * @param enabled - Whether the action is available.
   *
   * @returns The resolved class string.
   */
  const buttonClass = (enabled: boolean) =>
    `rounded-md border border-gray-200 bg-white/95 px-2.5 py-1.5 font-medium shadow-sm transition-colors ${
      enabled ? 'cursor-pointer hover:bg-gray-100' : 'cursor-not-allowed opacity-40'
    }`;

  return (
    <div class='flex items-center gap-2 rounded-lg border border-gray-200 bg-white/95 p-2 text-xs text-gray-700 shadow-md backdrop-blur-sm'>
      <button type='button' class={buttonClass(true)} onClick={addNode}>
        + Add node
      </button>

      <button
        type='button'
        class={buttonClass(!!selectedId())}
        disabled={!selectedId()}
        onClick={removeSelected}
      >
        Delete selected
      </button>

      <span class='px-1 text-gray-400'>{nodeCount()} nodes</span>
    </div>
  );
};
