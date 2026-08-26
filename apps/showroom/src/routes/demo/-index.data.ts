import type { EdgesFrom, NodesFrom } from '@bemedev/mind-flow';

import type { ShowroomData } from './-index.types';

export const INITIAL_NODES: NodesFrom<ShowroomData> = [
  {
    id: 'node-0',
    data: {
      title: 'Mind Flow Project',
      content: 'Interactive flowchart graph with generic node data.',
      priority: 5,
    },

    position: { x: 250, y: 150 },
  },
  {
    id: 'node-1',
    data: {
      title: 'Parameterized Content',
      content: 'Flow component is now fully generic and type-safe.',
      priority: 4,
    },

    position: { x: 650, y: 100 },
  },
  {
    id: 'node-2',
    data: {
      title: 'Corner Panels',
      content: 'Top-left, top-right, and bottom-left custom overlay panels.',
      priority: 3,
    },

    position: { x: 650, y: 280 },
  },
];

export const INITIAL_EDGES: EdgesFrom<ShowroomData> = [
  { id: 'edge = node-0 => node-1', from: 'node-0', to: 'node-1' },
  { id: 'edge = node-0 => node-2', from: 'node-0', to: 'node-2' },
];

export const BADGES = [
  { label: 'P1 Low', class: 'bg-blue-100 text-blue-700 border-blue-300' },

  {
    label: 'P2 Normal',
    class: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  },

  { label: 'P3 Medium', class: 'bg-amber-100 text-amber-700 border-amber-300' },
  { label: 'P4 High', class: 'bg-orange-100 text-orange-700 border-orange-300' },
  { label: 'P5 Critical', class: 'bg-red-100 text-red-700 border-red-300' },
];
