import {
  BoxGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  QuadraticBezierCurve3,
  Sprite,
  SpriteMaterial,
  TubeGeometry,
  Vector3,
  type Object3D,
} from 'three';

import {
  DEFAULT_EDGE_COLOR,
  DEFAULT_LABEL_COLOR,
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  SELECTED_EDGE_COLOR,
  SELECTED_NODE_COLOR,
} from '#services/main.machine.data';
import { curveControlPoint } from '#services/main.machine.helpers';
import type { Point3D } from '#services/main.machine.typings';

/** Options driving the creation of a node label sprite. */
export type LabelSpriteOptions = {
  /** Text rendered on the label. */
  text: string;
  /** Label text color, defaults to {@linkcode DEFAULT_LABEL_COLOR}. */
  color?: string;
  /** Label font size in pixels, defaults to `48`. */
  fontSize?: number;
  /** Label background color, defaults to transparent. */
  background?: string;
  /** Label padding in pixels, defaults to `16`. */
  padding?: number;
};

/**
 * Creates a text label as a three.js sprite backed by a canvas texture.
 *
 * The sprite always faces the camera and scales with its text length. Environments
 * without a 2D canvas context (e.g. jsdom) produce an empty transparent sprite.
 *
 * @param options - Label options of type {@linkcode LabelSpriteOptions}.
 *
 * @returns The label sprite of type `Sprite`.
 */
export const createLabelSprite = (options: LabelSpriteOptions): Sprite => {
  const {
    text,
    color = DEFAULT_LABEL_COLOR,
    fontSize = 48,
    background = 'transparent',
    padding = 16,
  } = options;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  const sprite = new Sprite(new SpriteMaterial({ transparent: true }));
  sprite.name = 'label';

  if (!context) return sprite;

  const font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
  context.font = font;
  const metrics = context.measureText(text);
  const width = Math.ceil(metrics.width) + padding * 2;
  const height = fontSize + padding * 2;

  canvas.width = width;
  canvas.height = height;

  context.font = font;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  if (background !== 'transparent') {
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
  }

  context.fillStyle = color;
  context.fillText(text, width / 2, height / 2);

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;

  sprite.material.map = texture;
  sprite.material.needsUpdate = true;

  const scale = 0.02;
  sprite.scale.set(width * scale, height * scale, 1);

  return sprite;
};

/** Options driving the creation of a 3D node group. */
export type NodeMeshOptions = {
  /** Node identifier stored on the group name and userData. */
  id: string;
  /** Node label text rendered above the box. */
  label?: string;
  /** Box base color, defaults to {@linkcode DEFAULT_NODE_COLOR}. */
  color?: string;
  /** Box width in world units, defaults to {@linkcode DEFAULT_NODE_WIDTH}. */
  width?: number;
  /** Box height in world units, defaults to {@linkcode DEFAULT_NODE_HEIGHT}. */
  height?: number;
  /** Box depth in world units, defaults to `1.2`. */
  depth?: number;
};

/**
 * Creates a 3D node as a group: a rounded-looking box mesh with an emissive border
 * plane and a camera-facing label sprite.
 *
 * @param options - Node options of type {@linkcode NodeMeshOptions}.
 *
 * @returns The node group of type `Group` named after the node id.
 */
export const createNodeMesh = (options: NodeMeshOptions): Group => {
  const {
    id,
    label,
    color = DEFAULT_NODE_COLOR,
    width = DEFAULT_NODE_WIDTH,
    height = DEFAULT_NODE_HEIGHT,
    depth = 1.2,
  } = options;

  const group = new Group();
  group.name = id;
  group.userData = { nodeId: id };

  const geometry = new BoxGeometry(width, height, depth);
  const material = new MeshStandardMaterial({
    color: new Color(color),
    roughness: 0.45,
    metalness: 0.1,
  });

  const mesh = new Mesh(geometry, material);
  mesh.name = 'box';
  mesh.userData = { nodeId: id };
  group.add(mesh);

  const borderGeometry = new PlaneGeometry(width * 1.02, height * 1.02);
  const borderMaterial = new MeshStandardMaterial({
    color: new Color(color),
    emissive: new Color(color),
    emissiveIntensity: 0.6,
    side: DoubleSide,
    transparent: true,
    opacity: 0.35,
  });
  const border = new Mesh(borderGeometry, borderMaterial);
  border.name = 'border';
  border.position.set(0, 0, depth / 2 + 0.01);
  border.visible = false;
  group.add(border);

  if (label) {
    const sprite = createLabelSprite({ text: label });
    sprite.name = 'label';
    sprite.position.set(0, height / 2 + 0.9, 0);
    group.add(sprite);
  }

  return group;
};

/**
 * Applies the selection visual state to a node group.
 *
 * @param group - Node group created by {@linkcode createNodeMesh}.
 * @param selected - Whether the node is selected.
 */
export const setNodeSelected = (group: Group, selected: boolean): void => {
  const box = group.getObjectByName('box') as Mesh | undefined;
  const border = group.getObjectByName('border') as Mesh | undefined;

  if (box) {
    const material = box.material as MeshStandardMaterial;
    material.color.set(selected ? SELECTED_NODE_COLOR : DEFAULT_NODE_COLOR);
    material.emissive.set(selected ? SELECTED_NODE_COLOR : '#000000');
    material.emissiveIntensity = selected ? 0.45 : 0;
  }
  if (border) border.visible = selected;
};

/** Options driving the creation of a 3D edge tube. */
export type EdgeTubeOptions = {
  /** Edge identifier stored on the mesh name and userData. */
  id: string;
  /** Source 3D position of type {@linkcode Point3D}. */
  from: Point3D;
  /** Target 3D position of type {@linkcode Point3D}. */
  to: Point3D;
  /** Tube base color, defaults to {@linkcode DEFAULT_EDGE_COLOR}. */
  color?: string;
  /** Tube radius in world units, defaults to `0.08`. */
  radius?: number;
  /** Curve lift factor, defaults to `0.25`. */
  lift?: number;
};

/**
 * Creates a 3D edge as a tube mesh following a quadratic Bézier curve between two
 * positions.
 *
 * @param options - Edge options of type {@linkcode EdgeTubeOptions}.
 *
 * @returns The edge mesh of type `Mesh` named after the edge id.
 */
export const createEdgeTube = (options: EdgeTubeOptions): Mesh => {
  const {
    id,
    from,
    to,
    color = DEFAULT_EDGE_COLOR,
    radius = 0.08,
    lift = 0.25,
  } = options;

  const control = curveControlPoint(from, to, lift);
  const curve = new QuadraticBezierCurve3(
    new Vector3(from.x, from.y, from.z),
    new Vector3(control.x, control.y, control.z),
    new Vector3(to.x, to.y, to.z),
  );

  const geometry = new TubeGeometry(curve, 32, radius, 8, false);
  const material = new MeshStandardMaterial({
    color: new Color(color),
    roughness: 0.6,
    metalness: 0.05,
  });

  const mesh = new Mesh(geometry, material);
  mesh.name = id;
  mesh.userData = { edgeId: id, radius, lift };

  return mesh;
};

/**
 * Rebuilds an edge tube geometry in place when its extremities move.
 *
 * The tube radius and curve lift are preserved from the values stored by
 * {@linkcode createEdgeTube} in `userData`, unless explicitly overridden.
 *
 * @param mesh - Edge mesh created by {@linkcode createEdgeTube}.
 * @param from - Source 3D position of type {@linkcode Point3D}.
 * @param to - Target 3D position of type {@linkcode Point3D}.
 * @param lift - Curve lift factor, defaults to the value stored on the mesh.
 * @param radius - Tube radius, defaults to the value stored on the mesh.
 */
export const updateEdgeTube = (
  mesh: Mesh,
  from: Point3D,
  to: Point3D,
  lift: number = (mesh.userData.lift as number | undefined) ?? 0.25,
  radius: number = (mesh.userData.radius as number | undefined) ?? 0.08,
): void => {
  const control = curveControlPoint(from, to, lift);
  const curve = new QuadraticBezierCurve3(
    new Vector3(from.x, from.y, from.z),
    new Vector3(control.x, control.y, control.z),
    new Vector3(to.x, to.y, to.z),
  );

  mesh.geometry.dispose();
  mesh.geometry = new TubeGeometry(curve, 32, radius, 8, false);
};

/**
 * Applies the selection visual state to an edge mesh.
 *
 * @param mesh - Edge mesh created by {@linkcode createEdgeTube}.
 * @param selected - Whether the edge is selected.
 */
export const setEdgeSelected = (mesh: Mesh, selected: boolean): void => {
  const material = mesh.material as MeshStandardMaterial;
  material.color.set(selected ? SELECTED_EDGE_COLOR : DEFAULT_EDGE_COLOR);
  material.emissive.set(selected ? SELECTED_EDGE_COLOR : '#000000');
  material.emissiveIntensity = selected ? 0.5 : 0;
};

/**
 * Recursively disposes every geometry and material of an object tree.
 *
 * @param object - Root object of type `Object3D` to dispose.
 */
export const disposeObject3D = (object: Object3D): void => {
  object.traverse(child => {
    const mesh = child as Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = mesh.material as
      | MeshStandardMaterial
      | SpriteMaterial
      | undefined;
    if (material) {
      material.map?.dispose();
      material.dispose();
    }
  });
};
