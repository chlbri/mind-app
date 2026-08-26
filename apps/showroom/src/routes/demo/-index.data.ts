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
    input: false,
    position: { x: 250, y: 150 },
  },
  {
    id: 'node-1',
    data: {
      title: 'Parameterized Content',
      content: 'Flow component is now fully generic and type-safe.',
      priority: 4,
    },
    input: true,
    position: { x: 650, y: 100 },
  },
  {
    id: 'node-2',
    data: {
      title: 'Corner Panels',
      content: 'Top-left, top-right, and bottom-left custom overlay panels.',
      priority: 3,
    },
    input: true,
    position: { x: 650, y: 280 },
  },
];

export const INITIAL_EDGES: EdgesFrom<ShowroomData> = [
  { id: 'edge = node-0 => node-1', from: 'node-0', to: 'node-1' },
  { id: 'edge = node-0 => node-2', from: 'node-0', to: 'node-2' },
];
