import type { EdgesFrom, NodesFrom } from '@bemedev/mind-flow-three';

import type { ShowroomData, ShowroomEdgeData } from './-simple.types';

/**
 * Initial scene nodes of type {@linkcode ShowroomData}, seeded in the XY plane. The
 * force-directed simulation lays them out in 2D on mount.
 */
export const INITIAL_NODES: NodesFrom<ShowroomData> = [
  {
    id: 'node-0',
    data: {
      title: 'Mind Flow 2D',
      content: 'Flat mindmap layout rendered with three.js in a single plane.',
      priority: 5,
    },
    position: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'node-1',
    data: {
      title: 'Physics Layout',
      content: 'Repulsion, springs and centering settle the nodes automatically.',
      priority: 4,
    },
    position: { x: 14, y: 6, z: 0 },
  },
  {
    id: 'node-2',
    data: {
      title: 'Orbit Camera',
      content: 'Drag to orbit, scroll to dolly, right-drag to pan the scene.',
      priority: 3,
    },
    position: { x: 14, y: -6, z: 0 },
  },
  {
    id: 'node-3',
    data: {
      title: 'Drag & Pin',
      content: 'Drag a node to pin it in place; the simulation reheats on demand.',
      priority: 2,
    },
    position: { x: -14, y: 7, z: 0 },
  },
];

/** Initial 2D scene edges of type {@linkcode ShowroomEdgeData}. */
export const INITIAL_EDGES: EdgesFrom<ShowroomEdgeData> = [
  {
    id: 'edge = node-0 => node-1',
    from: 'node-0',
    to: 'node-1',
    data: { label: 'renders' },
  },
  {
    id: 'edge = node-0 => node-2',
    from: 'node-0',
    to: 'node-2',
    data: { label: 'orbits' },
  },
  {
    id: 'edge = node-0 => node-3',
    from: 'node-0',
    to: 'node-3',
    data: { label: 'pins' },
  },
];

/** Priority badges with Tailwind classes for HTML and hex colors for 3D materials. */
export const PRIORITY_BADGES = [
  {
    code: 'P1',
    label: 'P1 Low',
    class: 'bg-blue-100 text-blue-700 border-blue-300',
    color: '#3b82f6',
  },
  {
    code: 'P2',
    label: 'P2 Normal',
    class: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    color: '#22c55e',
  },
  {
    code: 'P3',
    label: 'P3 Medium',
    class: 'bg-amber-100 text-amber-700 border-amber-300',
    color: '#f59e0b',
  },
  {
    code: 'P4',
    label: 'P4 High',
    class: 'bg-orange-100 text-orange-700 border-orange-300',
    color: '#f97316',
  },
  {
    code: 'P5',
    label: 'P5 Critical',
    class: 'bg-red-100 text-red-700 border-red-300',
    color: '#ef4444',
  },
] as const;

/** Resolves the priority badge of a node data payload, clamped to the palette. */
export const badgeOf = (priority?: number) => {
  const index = Math.min(Math.max((priority ?? 1) - 1, 0), 4);
  return PRIORITY_BADGES[index];
};
