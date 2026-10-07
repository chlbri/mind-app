import { createLabelSprite, type Edge3DComponent } from '@bemedev/mind-flow-three';
import { Mesh, MeshStandardMaterial } from 'three';

import { EDGES_COLORS } from '../constants';
import type { EdgeKind, StateMachineEdgeData } from '../types';

/**
 * Resolves the edge category from its data, falling back to the `on` category.
 *
 * @param data - Edge data of type {@linkcode StateMachineEdgeData}.
 *
 * @returns The edge category of type {@linkcode EdgeKind}.
 */
export const edgeKind = (data?: StateMachineEdgeData): EdgeKind => {
  return (data?.kind ?? 'on') as EdgeKind;
};

/**
 * 3D renderer for `@bemedev/app` state machine edges.
 *
 * Recolors the edge tube with the category color, applies an emissive highlight when
 * selected and adds a midpoint label sprite describing the transitions. The
 * `child_parent` hierarchy category keeps a dashed appearance expressed through a
 * lower emissive glow.
 *
 * @param props - Edge entity, resolved extremities, selection state and target mesh
 *   of type `Edge<StateMachineEdgeData> & { from3d, to3d, selected, mesh }`.
 *
 * @see {@linkcode createLabelSprite}
 */
export const StateMachineEdge3D: Edge3DComponent<StateMachineEdgeData> = props => {
  const { mesh, from3d, to3d } = props;
  const data = (props.data ?? {}) as StateMachineEdgeData;
  const kind = edgeKind(data);
  const color = EDGES_COLORS[kind];
  const isHierarchy = kind === 'child_parent';

  const material = mesh.material as MeshStandardMaterial;
  material.color.set(color);
  material.emissive.set(props.selected ? color : isHierarchy ? color : '#000000');
  material.emissiveIntensity = props.selected ? 0.6 : isHierarchy ? 0.2 : 0;
  material.transparent = isHierarchy;
  material.opacity = isHierarchy ? 0.75 : 1;

  const previous = mesh.getObjectByName('edge-label');
  if (previous) {
    mesh.remove(previous);
    previous.traverse(child => {
      const target = child as Mesh;
      if (target.geometry) target.geometry.dispose();
      const targetMaterial = target.material as MeshStandardMaterial | undefined;
      if (targetMaterial) {
        targetMaterial.map?.dispose();
        targetMaterial.dispose();
      }
    });
  }

  const label = data.label ?? `on: ${data.event ?? kind}`;
  if (!label) return;

  const sprite = createLabelSprite({
    text: label,
    color: '#e2e8f0',
    fontSize: 36,
    padding: 18,
    ...(isHierarchy ? { background: 'transparent' } : {}),
  });
  sprite.name = 'edge-label';
  sprite.scale.multiplyScalar(0.6);
  sprite.position.set(
    (from3d.x + to3d.x) / 2,
    (from3d.y + to3d.y) / 2 + 0.8,
    (from3d.z + to3d.z) / 2,
  );
  mesh.add(sprite);
};
