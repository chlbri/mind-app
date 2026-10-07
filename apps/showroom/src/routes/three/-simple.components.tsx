import {
  createLabelSprite,
  disposeObject3D,
  type Edge3DComponent,
  type Node3DComponent,
  type WithFlow,
} from '@bemedev/mind-flow-three';
import { Show, type Component } from 'solid-js';
import { BoxGeometry, Mesh, MeshStandardMaterial, type Sprite } from 'three';

import { badgeOf } from './-simple.data';
import type { ShowroomData, ShowroomEdgeData } from './-simple.types';

/** Box dimensions in world units of a showroom 3D node. */
export const NODE_SIZE = { width: 6, height: 2.4, depth: 2.4 } as const;

/** Edge colors of the showroom 3D edges. */
export const EDGE_COLORS = { base: '#94a3b8', selected: '#f97316' } as const;

/**
 * Custom 3D node renderer for the showroom: a priority-colored box with an emissive
 * glow, scaled up and brightened when selected, and a `P{n} · title` label sprite.
 *
 * Idempotent: children are looked up by name and updated in place, so the renderer
 * can be re-invoked on data or selection changes.
 *
 * @param props - Node entity, selection state and target group of type
 *   `Node<ShowroomData> & { selected: boolean; group: Group }`.
 *
 * @see {@linkcode createLabelSprite}, {@linkcode badgeOf}
 */
export const ShowroomNode3D: Node3DComponent<ShowroomData> = props => {
  const { group, id } = props;
  const data = (props.data ?? {}) as ShowroomData;
  const badge = badgeOf(data.priority);
  const title = data.title || 'Untitled Node';

  let box = group.getObjectByName('showroom-box') as Mesh | undefined;

  if (!box) {
    box = new Mesh(
      new BoxGeometry(NODE_SIZE.width, NODE_SIZE.height, NODE_SIZE.depth),
      new MeshStandardMaterial({ roughness: 0.35, metalness: 0.15 }),
    );
    box.name = 'showroom-box';
    box.userData = { nodeId: id };
    group.add(box);
  }

  const material = box.material as MeshStandardMaterial;
  material.color.set(badge.color);
  material.emissive.set(badge.color);
  material.emissiveIntensity = props.selected ? 0.7 : 0.18;

  group.scale.setScalar(props.selected ? 1.12 : 1);

  const text = `${badge.code} · ${title}`;
  const label = group.getObjectByName('showroom-label') as Sprite | undefined;

  if (label && label.userData.text !== text) {
    group.remove(label);
    disposeObject3D(label);
  }

  if (!group.getObjectByName('showroom-label')) {
    const sprite = createLabelSprite({
      text,
      color: '#f8fafc',
      fontSize: 44,
      padding: 18,
    });
    sprite.name = 'showroom-label';
    sprite.userData.text = text;
    sprite.scale.multiplyScalar(0.8);
    sprite.position.set(0, NODE_SIZE.height / 2 + 1.1, 0);
    group.add(sprite);
  }
};

/**
 * Custom 3D edge renderer for the showroom: colors the tube and renders a midpoint
 * label sprite from the edge data, highlighted when the edge is selected.
 *
 * @param props - Edge entity, resolved extremities, selection state and target mesh
 *   of type `Edge<ShowroomEdgeData> & { id, from3d, to3d, selected, mesh }`.
 *
 * @see {@linkcode createLabelSprite}, {@linkcode EDGE_COLORS}
 */
export const ShowroomEdge3D: Edge3DComponent<ShowroomEdgeData> = props => {
  const { mesh, from3d, to3d } = props;
  const data = (props.data ?? {}) as ShowroomEdgeData;
  const color = props.selected ? EDGE_COLORS.selected : EDGE_COLORS.base;

  const material = mesh.material as MeshStandardMaterial;
  material.color.set(color);
  material.emissive.set(color);
  material.emissiveIntensity = props.selected ? 0.55 : 0.08;

  const text = data.label ?? 'link';
  const label = mesh.getObjectByName('showroom-edge-label') as Sprite | undefined;

  if (label && label.userData.text !== text) {
    mesh.remove(label);
    disposeObject3D(label);
  }

  if (!mesh.getObjectByName('showroom-edge-label')) {
    const sprite = createLabelSprite({
      text,
      color: '#cbd5e1',
      fontSize: 30,
      padding: 14,
    });
    sprite.name = 'showroom-edge-label';
    sprite.userData.text = text;
    sprite.scale.multiplyScalar(0.5);
    sprite.position.set(
      (from3d.x + to3d.x) / 2,
      (from3d.y + to3d.y) / 2 + 1,
      (from3d.z + to3d.z) / 2,
    );
    mesh.add(sprite);
  }
};

/**
 * Top-left edit panel component editing the currently double-clicked node through
 * the `SET_NODE_DATA` event.
 *
 * Single-clicking a node only selects it in the scene; double-clicking opens this
 * panel. The panel falls back to a hint card when no node is being edited.
 *
 * @param props - Flow engine value of type `WithFlow`.
 *
 * @returns The rendered Solid component.
 */
export const ShowroomEditPanel: Component<WithFlow> = props => {
  const { hooks, send } = props.flow;

  const editingId = hooks.state({ selector: s => s.context.editing });

  const editingNode = hooks.state({
    selector: s =>
      s.context.data?.nodes?.find(node => node.id === s.context.editing),
  });

  const data = (): Partial<ShowroomData> =>
    (editingNode()?.data ?? {}) as Partial<ShowroomData>;

  const updateField = <K extends keyof ShowroomData>(
    field: K,
    value: ShowroomData[K],
  ) => {
    const id = editingId();
    if (!id) return;
    send({ type: 'SET_NODE_DATA', payload: { id, data: { [field]: value } } });
  };

  const badge = () => badgeOf(data().priority);

  return (
    <Show
      when={editingId()}
      fallback={
        <div class='w-60 rounded-lg border border-slate-700 bg-slate-900/90 p-3 text-xs text-slate-300 shadow-lg backdrop-blur-sm'>
          Double-click a node to edit its data.
        </div>
      }
    >
      <div class='flex w-64 flex-col gap-3 rounded-lg border border-slate-700 bg-slate-900/90 p-3 text-slate-100 shadow-lg backdrop-blur-sm'>
        <div class='flex items-center justify-between gap-2 border-b border-slate-700 pb-2'>
          <span class='truncate text-sm font-bold'>
            {data().title || 'Untitled Node'}
          </span>
          <span
            class={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge().class}`}
          >
            {badge().label}
          </span>
        </div>

        <div class='flex flex-col gap-1'>
          <label class='text-xs font-semibold text-slate-300'>Title</label>
          <input
            type='text'
            class='w-full rounded-lg border border-slate-600 bg-slate-950/60 px-3 py-1.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none'
            value={data().title ?? ''}
            onInput={e => updateField('title', e.currentTarget.value)}
            placeholder='Enter title...'
          />
        </div>

        <div class='flex flex-col gap-1'>
          <div class='flex items-center justify-between'>
            <label class='text-xs font-semibold text-slate-300'>
              Priority (1-5)
            </label>
            <span class='text-xs font-bold text-blue-400'>
              {data().priority ?? 1}
            </span>
          </div>
          <input
            type='range'
            min='1'
            max='5'
            step='1'
            class='w-full cursor-pointer accent-blue-500'
            value={data().priority ?? 1}
            onInput={e =>
              updateField(
                'priority',
                Number(e.currentTarget.value) as ShowroomData['priority'],
              )
            }
          />
        </div>

        <div class='flex flex-col gap-1'>
          <label class='text-xs font-semibold text-slate-300'>Content</label>
          <textarea
            rows={3}
            class='w-full rounded-lg border border-slate-600 bg-slate-950/60 px-3 py-1.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none'
            value={data().content ?? ''}
            onInput={e => updateField('content', e.currentTarget.value)}
            placeholder='Enter node description / details...'
          />
        </div>
      </div>
    </Show>
  );
};

/**
 * Bottom-left controls panel demonstrating the engine events: add a node at a random
 * position in the plane, toggle the physics simulation, and reset the camera zoom.
 *
 * @param props - Flow engine value of type `WithFlow`.
 *
 * @returns The rendered Solid component.
 */
export const ShowroomControls: Component<WithFlow> = props => {
  const { hooks, send } = props.flow;

  const physicsEnabled = hooks.state({
    selector: s => s.context.physics?.enabled ?? true,
  });

  const nodeCount = hooks.state({
    selector: s => s.context.data?.nodes?.length ?? 0,
  });

  /** Sequential counter naming the nodes created from this panel. */
  let added = 0;

  const addNode = () => {
    added += 1;
    const priority = (((added - 1) % 5) + 1) as ShowroomData['priority'];

    send({
      type: 'ADD_NODE',
      payload: {
        position: {
          x: (Math.random() - 0.5) * 30,
          y: (Math.random() - 0.5) * 20,
          z: 0,
        },
        data: {
          title: `New Node ${added}`,
          content: 'Created from the bottom-left controls panel.',
          priority,
        },
      },
    });

    send({ type: 'COMMIT', payload: undefined });
  };

  return (
    <div class='flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/90 p-2 text-xs text-slate-100 shadow-lg backdrop-blur-sm'>
      <button
        type='button'
        class='rounded-md border border-slate-600 bg-slate-800 px-2.5 py-1.5 font-medium transition-colors hover:bg-slate-700'
        onClick={addNode}
      >
        + Add node
      </button>

      <button
        type='button'
        class='rounded-md border border-slate-600 bg-slate-800 px-2.5 py-1.5 font-medium transition-colors hover:bg-slate-700'
        onClick={() => send('TOGGLE_PHYSICS')}
      >
        Physics: {physicsEnabled() ? 'on' : 'off'}
      </button>

      <button
        type='button'
        class='rounded-md border border-slate-600 bg-slate-800 px-2.5 py-1.5 font-medium transition-colors hover:bg-slate-700'
        onClick={() => send('TOGGLE_ZOOM')}
      >
        Reset view
      </button>

      <span class='px-1 text-slate-400'>{nodeCount()} nodes</span>
    </div>
  );
};
