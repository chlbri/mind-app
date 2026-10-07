import {
  createLabelSprite,
  createNodeMesh,
  type Node3DComponent,
} from '@bemedev/mind-flow-three';
import { BoxGeometry, Color, Mesh, MeshStandardMaterial, type Sprite } from 'three';

import { PRINCIPAL_NODE_KEY } from '../constants';
import { monoLength } from '../helpers';
import type { StateMachineNodeData } from '../types';

/** Size in world units of the state machine node box. */
export const NODE_SIZE = { width: 5.6, height: 2.6, depth: 1.8 } as const;

/** Node color palette indexed by state classification. */
export const STATE_COLORS = {
  atomic: '#38bdf8',
  compound: '#a855f7',
  parallel: '#f59e0b',
  final: '#22c55e',
} as const;

/**
 * Resolves the base color of a state node from its classification.
 *
 * @param data - State machine node data of type {@linkcode StateMachineNodeData}.
 *
 * @returns The hexadecimal color string of the state type.
 */
export const stateColor = (data: StateMachineNodeData): string => {
  const type = data.stateType as keyof typeof STATE_COLORS;
  return STATE_COLORS[type] ?? STATE_COLORS.atomic;
};

/**
 * Converts a hexadecimal color to its subtle emissive counterpart.
 *
 * @param color - Hexadecimal color string.
 *
 * @returns A dimmed color string of type `string`.
 */
const emissiveOf = (color: string): string => {
  const parsed = new Color(color);
  parsed.multiplyScalar(0.35);
  return `#${parsed.getHexString()}`;
};

/**
 * 3D renderer for `@bemedev/app` state machine nodes.
 *
 * Populates the provided three.js group with a state box colored by classification,
 * a title label sprite, an initial badge and an actor count badge. The principal
 * node is rendered as an oversized glowing box.
 *
 * @param props - Node entity, selection state and target group of type
 *   `Node<StateMachineNodeData> & { selected: boolean; group: Group }`.
 *
 * @see {@linkcode createNodeMesh}, {@linkcode createLabelSprite}
 */
export const StateMachineNode3D: Node3DComponent<StateMachineNodeData> = props => {
  const { group, id } = props;
  const data = (props.data ?? {}) as StateMachineNodeData;
  const isPrincipal = id === PRINCIPAL_NODE_KEY || Boolean(data.principal);
  const color = stateColor(data);
  const width = isPrincipal ? NODE_SIZE.width * 1.4 : NODE_SIZE.width;
  const height = isPrincipal ? NODE_SIZE.height * 1.3 : NODE_SIZE.height;

  const isSelected = props.selected;
  const glow = isSelected ? 0.9 : isPrincipal ? 0.55 : 0.25;

  const existing = group.getObjectByName('state-box') as Mesh | undefined;
  if (existing) {
    existing.geometry.dispose();
    existing.geometry = new BoxGeometry(width, height, NODE_SIZE.depth);
    const material = existing.material as MeshStandardMaterial;
    material.color.set(color);
    material.emissive.set(isSelected || isPrincipal ? color : emissiveOf(color));
    material.emissiveIntensity = glow;
  } else {
    const mesh = createNodeMesh({
      id,
      color,
      width,
      height,
      depth: NODE_SIZE.depth,
    }).getObjectByName('box') as Mesh;
    mesh.name = 'state-box';
    group.add(mesh);

    const material = mesh.material as MeshStandardMaterial;
    material.emissive.set(isSelected || isPrincipal ? color : emissiveOf(color));
    material.emissiveIntensity = glow;
  }

  group.scale.setScalar(isSelected ? 1.08 : 1);

  const title = isPrincipal ? (data.title ?? 'Machine') : (data.title ?? 'State');
  const label = group.getObjectByName('state-label') as Sprite | undefined;

  if (label && label.userData.text !== title) {
    group.remove(label);
    label.traverse(child => {
      const mesh = child as Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const material = mesh.material as MeshStandardMaterial | undefined;
      if (material) {
        material.map?.dispose();
        material.dispose();
      }
    });
  }

  if (!group.getObjectByName('state-label')) {
    const sprite = createLabelSprite({
      text: title,
      color: '#f8fafc',
      fontSize: 40,
      padding: 20,
    });
    sprite.name = 'state-label';
    sprite.userData.text = title;
    const scale = Math.min(1, 8 / Math.max(monoLength(title) / 8, 1));
    sprite.scale.multiplyScalar(scale);
    sprite.position.set(0, height / 2 + 0.9, 0);
    group.add(sprite);
  }

  if (data.isInitial && !group.getObjectByName('initial-badge')) {
    const badge = new Mesh(
      new BoxGeometry(0.5, 0.5, 0.5),
      new MeshStandardMaterial({
        color: new Color('#34d399'),
        emissive: new Color('#34d399'),
        emissiveIntensity: 0.7,
      }),
    );
    badge.name = 'initial-badge';
    badge.position.set(-width / 2 - 0.5, (height / 2) * 0.6, 0);
    group.add(badge);
  }

  const actorCount = data.actors?.length ?? 0;
  if (actorCount > 0 && !group.getObjectByName('actor-badge')) {
    const badge = new Mesh(
      new BoxGeometry(0.45, 0.45, 0.45),
      new MeshStandardMaterial({
        color: new Color('#ec4899'),
        emissive: new Color('#ec4899'),
        emissiveIntensity: 0.6,
      }),
    );
    badge.name = 'actor-badge';
    badge.position.set(width / 2 + 0.4, -height / 2 - 0.4, 0);
    group.add(badge);

    const countLabel = createLabelSprite({
      text: String(actorCount),
      color: '#fdf2f8',
      fontSize: 36,
      padding: 10,
    });
    countLabel.name = 'actor-count';
    countLabel.scale.multiplyScalar(0.35);
    countLabel.position.set(width / 2 + 0.4, -height / 2 - 0.4, 0.4);
    group.add(countLabel);
  }
};
