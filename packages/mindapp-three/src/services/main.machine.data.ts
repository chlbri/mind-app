import type { Node } from './main.machine.typings';

// #region Node & Scene Layout Constants
/** Default width, height and depth dimensions for 3D flowchart nodes. */
export const DEFAULT_SIZE = { width: 3, height: 1.2, depth: 1.2 } as const;

/** Default node width in world units. */
export const DEFAULT_NODE_WIDTH = DEFAULT_SIZE.width;

/** Default node height in world units. */
export const DEFAULT_NODE_HEIGHT = DEFAULT_SIZE.height;

/** Default node depth in world units. */
export const DEFAULT_NODE_DEPTH = DEFAULT_SIZE.depth;

/** Default node data payload applied when creating new nodes. */
export const DEFAULT_DATA = { content: '<Nouveau nœud>' };

/** Default label text color applied to node sprites. */
export const DEFAULT_LABEL_COLOR = '#1f2937';

/** Default node base color applied to 3D materials. */
export const DEFAULT_NODE_COLOR = '#64748b';

/** Color applied to selected node materials. */
export const SELECTED_NODE_COLOR = '#f97316';

/** Color applied to pinned node materials. */
export const FIXED_NODE_COLOR = '#8b5cf6';

/** Default edge color applied to 3D tube materials. */
export const DEFAULT_EDGE_COLOR = '#94a3b8';

/** Color applied to selected edge materials. */
export const SELECTED_EDGE_COLOR = '#f97316';
// #endregion

// #region Camera Constants
/** Initial camera distance from the scene origin. */
export const DEFAULT_CAMERA_DISTANCE = 30;

/** Minimum camera distance allowed by zoom clamping. */
export const MIN_ZOOM = 0.2;

/** Maximum camera distance factor allowed by zoom clamping. */
export const MAX_ZOOM = 5;

/** Perspective camera field of view in degrees. */
export const CAMERA_FOV = 50;

/** Near clipping plane distance of the perspective camera. */
export const CAMERA_NEAR = 0.1;

/** Far clipping plane distance of the perspective camera. */
export const CAMERA_FAR = 2000;
// #endregion

// #region Physics Constants
/** Default force-directed simulation options. */
export const DEFAULT_PHYSICS_OPTIONS = {
  /** Strength of the pairwise repulsion force. */
  repulsion: 120,
  /** Rest length of edge springs in world units. */
  springLength: 12,
  /** Strength of edge springs. */
  springStrength: 0.6,
  /** Strength of the pull toward the scene origin. */
  centering: 0.02,
  /** Velocity damping factor applied on each tick. */
  damping: 0.35,
  /** Maximum node speed in world units per tick. */
  maxSpeed: 8,
  /** Initial simulation heat. */
  alpha: 1,
  /** Heat threshold below which the simulation sleeps. */
  alphaMin: 0.001,
  /** Multiplicative heat decay applied on each tick. */
  alphaDecay: 0.022,
} as const;

/** World-space bounds constraining node positions. */
export const BOUNDS_CONSTRAINTS = { x: 500, y: 500, z: 500 } as const;
// #endregion

// #region Scene Constants
/** Size of the ground grid helper in world units. */
export const GRID_SIZE = 200;

/** Number of divisions of the ground grid helper. */
export const GRID_DIVISIONS = 40;

/** Ambient light intensity of the 3D scene. */
export const AMBIENT_LIGHT_INTENSITY = 0.7;

/** Directional light intensity of the 3D scene. */
export const DIRECTIONAL_LIGHT_INTENSITY = 1.1;

/** Background color of the 3D scene. */
export const SCENE_BACKGROUND = '#0b1220';
// #endregion

/** Default node items of type `Node` provided when no initial configuration is given. */
export const DEFAULT_NODES: Node[] = [
  {
    id: 'node-0',
    data: { content: 'Some text', label: 'Root node' },
    position: { x: 0, y: 0, z: 0 },
  },
];
