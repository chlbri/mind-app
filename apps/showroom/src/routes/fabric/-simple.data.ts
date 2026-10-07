import type { EdgesFrom, NodesFrom } from '@bemedev/mind-flow-fabric';

import type { ShowroomData, ShowroomEdgeData } from './-simple.types';

/** Initial canvas nodes of type {@linkcode ShowroomData}. */
export const INITIAL_NODES: NodesFrom<ShowroomData> = [
  {
    id: 'node-0',
    data: {
      title: 'Mind Flow Fabric',
      content: 'Interactive flowchart rendered on an HTML5 canvas with fabric.js.',
      priority: 5,
    },
    position: { x: 260, y: 160 },
  },
  {
    id: 'node-1',
    data: {
      title: 'Canvas Objects',
      content: 'Nodes are draggable rectangles with handles and labels.',
      priority: 4,
    },
    position: { x: 660, y: 90 },
  },
  {
    id: 'node-2',
    data: {
      title: 'Pan & Zoom',
      content: 'Drag the background to pan, scroll to zoom around the pointer.',
      priority: 3,
    },
    position: { x: 660, y: 300 },
  },
  {
    id: 'node-3',
    data: {
      title: 'Double-click to edit',
      content: 'Double-click a node to open the top-left edit panel.',
      priority: 2,
    },
    position: { x: 260, y: 400 },
  },
];

/** Initial canvas edges of type {@linkcode ShowroomEdgeData}. */
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
    data: { label: 'navigates' },
  },
  {
    id: 'edge = node-0 => node-3',
    from: 'node-0',
    to: 'node-3',
    data: { label: 'edits' },
  },
];

/** Priority badges with Tailwind classes and canvas hex colors. */
export const PRIORITY_BADGES = [
  {
    code: 'P1',
    label: 'P1 Low',
    class: 'bg-blue-100 text-blue-700 border-blue-300',
    color: '#3b82f6',
    fill: '#eff6ff',
  },
  {
    code: 'P2',
    label: 'P2 Normal',
    class: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    color: '#22c55e',
    fill: '#f0fdf4',
  },
  {
    code: 'P3',
    label: 'P3 Medium',
    class: 'bg-amber-100 text-amber-700 border-amber-300',
    color: '#f59e0b',
    fill: '#fffbeb',
  },
  {
    code: 'P4',
    label: 'P4 High',
    class: 'bg-orange-100 text-orange-700 border-orange-300',
    color: '#f97316',
    fill: '#fff7ed',
  },
  {
    code: 'P5',
    label: 'P5 Critical',
    class: 'bg-red-100 text-red-700 border-red-300',
    color: '#ef4444',
    fill: '#fef2f2',
  },
] as const;

/**
 * Resolves the priority badge of a node data payload, clamped to the palette.
 *
 * @param priority - Priority level of the node, defaults to `1`.
 *
 * @returns The resolved priority badge.
 */
export const badgeOf = (priority?: number) => {
  const index = Math.min(Math.max((priority ?? 1) - 1, 0), 4);
  return PRIORITY_BADGES[index];
};
