import type { Point3D } from './main.machine.typings';

/**
 * Constructs a unique edge identifier string from source and destination node IDs.
 *
 * @param out - The source node ID string.
 * @param _in - The destination node ID string.
 *
 * @returns Formatted edge identifier string.
 */
export const buildEdgeId = (out: string, _in: string) => {
  return `edge = ${out} => ${_in}`;
};

/**
 * Parses source and destination node IDs encoded within an edge identifier string
 * (e.g. `edge = node-0 => node-1`).
 *
 * @param id - The edge identifier string.
 *
 * @returns Object containing optional parsed fields `from` and `to`.
 */
export const parseEdgeId = (id: string): { from?: string; to?: string } => {
  const match = id.match(/^(?:edge\s*=\s*)?([^\s=>]+)\s*=>\s*([^:\s]+)$/);
  if (match) {
    return { from: match[1], to: match[2] };
  }
  return {};
};

/**
 * Constructs a formatted node identifier string from a generated ID.
 *
 * @param generated - The generated unique ID string or `null`/`undefined`.
 *
 * @returns Formatted node identifier string.
 */
export const buildNodeID = (generated?: string | null) => {
  return `node-${generated}`;
};

/**
 * Computes the Euclidean distance between two 3D points.
 *
 * @param a - First 3D point of type {@linkcode Point3D}.
 * @param b - Second 3D point of type {@linkcode Point3D}.
 *
 * @returns The Euclidean distance between `a` and `b`.
 */
export const distance3d = (a: Point3D, b: Point3D): number => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/**
 * Computes the midpoint between two 3D points.
 *
 * @param a - First 3D point of type {@linkcode Point3D}.
 * @param b - Second 3D point of type {@linkcode Point3D}.
 *
 * @returns The midpoint of type {@linkcode Point3D}.
 */
export const midpoint3d = (a: Point3D, b: Point3D): Point3D => {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
};

/**
 * Computes the control point of a quadratic Bézier curve connecting two 3D points,
 * lifted along a lift axis to arc the curve away from a straight line.
 *
 * @param from - Source 3D point of type {@linkcode Point3D}.
 * @param to - Target 3D point of type {@linkcode Point3D}.
 * @param lift - Lift factor applied along the lift axis, defaults to `0.25`.
 * @param axis - Lift axis, defaults to `'y'`.
 *
 * @returns The Bézier control point of type {@linkcode Point3D}.
 */
export const curveControlPoint = (
  from: Point3D,
  to: Point3D,
  lift = 0.25,
  axis: 'x' | 'y' | 'z' = 'y',
): Point3D => {
  const mid = midpoint3d(from, to);
  const distance = distance3d(from, to);
  const offset = distance * lift;

  return {
    x: axis === 'x' ? mid.x + offset : mid.x,
    y: axis === 'y' ? mid.y + offset : mid.y,
    z: axis === 'z' ? mid.z + offset : mid.z,
  };
};

/**
 * Resolves the 3D positions of an edge's source and target nodes.
 *
 * @param edge - Edge entity connecting source and target nodes.
 * @param nodes - List of node objects carrying a `position` of type
 *   {@linkcode Point3D}.
 *
 * @returns A tuple of source and target positions, or `undefined` when either node
 *   is missing.
 */
export const calculateEdgePosition = (
  edge: { from: string; to: string },
  nodes: { id: string; position: Point3D }[] = [],
): [Point3D, Point3D] | undefined => {
  const fromNode = nodes.find(n => n.id === edge.from);
  const toNode = nodes.find(n => n.id === edge.to);
  if (!fromNode || !toNode) return undefined;
  return [fromNode.position, toNode.position];
};

/**
 * Clamps a 3D position within symmetric world bounds.
 *
 * @param position - Candidate 3D position of type {@linkcode Point3D}.
 * @param bounds - Symmetric bounds per axis, defaults to `500`.
 *
 * @returns The clamped 3D position of type {@linkcode Point3D}.
 */
export const clampPosition3d = (
  position: Point3D,
  bounds: { x: number; y: number; z: number } = { x: 500, y: 500, z: 500 },
): Point3D => {
  const clamp = (value: number, max: number) => Math.min(Math.max(value, -max), max);

  return {
    x: clamp(position.x, bounds.x),
    y: clamp(position.y, bounds.y),
    z: clamp(position.z, bounds.z),
  };
};

/**
 * Generates a deterministic pseudo-random 3D position on a sphere shell, used to
 * seed new nodes around the scene origin.
 *
 * @param radius - Sphere shell radius, defaults to `15`.
 * @param seed - Deterministic seed, defaults to `Math.random()`.
 *
 * @returns A 3D position of type {@linkcode Point3D} on the sphere shell.
 */
export const randomSpherePosition = (
  radius = 15,
  seed: number = Math.random(),
): Point3D => {
  const theta = seed * Math.PI * 2;
  const phi = Math.acos(2 * ((seed * 7919) % 1) - 1);
  const sinPhi = Math.sin(phi);

  return {
    x: radius * sinPhi * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * sinPhi * Math.sin(theta),
  };
};
