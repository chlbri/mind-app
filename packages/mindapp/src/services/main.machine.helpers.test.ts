import { interpret } from '@bemedev/app';
import { describe, expect, it } from 'vitest';

import { machine } from './main.machine';
import {
  HANDLE_CONTAINER_OFFSET_X,
  HANDLE_RADIUS,
  NODE_BORDER_WIDTH,
} from './main.machine.data';
import {
  buildEdgeId,
  calculateEdgePosition,
  getHandlePosition,
  parseEdgeId,
} from './main.machine.helpers';
import { reconstructState } from './main.machine.history';
import type { Dimension, NodeProps } from './main.machine.typings';

const HANDLE_OFFSET = HANDLE_CONTAINER_OFFSET_X - NODE_BORDER_WIDTH - HANDLE_RADIUS; // 10.5

describe('#01 => main.machine.helpers', () => {
  describe('#01 => buildEdgeId', () => {
    it('#01 => should format edge ID with default left:0 position and index', () => {
      expect(buildEdgeId('node-a', 'node-b')).toBe('edge = node-a => node-b:left:0');
    });

    it('#02 => should format edge ID with custom position and index', () => {
      expect(buildEdgeId('node-a', 'node-b', 'top', 2)).toBe(
        'edge = node-a => node-b:top:2',
      );
      expect(buildEdgeId('node-a', 'node-b', 'bottom', 1)).toBe(
        'edge = node-a => node-b:bottom:1',
      );
      expect(buildEdgeId('node-a', 'node-b', 'right', 0)).toBe(
        'edge = node-a => node-b:right:0',
      );
    });
  });

  describe('#02 => parseEdgeId', () => {
    it('#01 => should parse standard edge ID with position and index', () => {
      const parsed = parseEdgeId('source => dest:top:2');
      expect(parsed).toEqual({
        from: 'source',
        to: 'dest',
        position: 'top',
        index: 2,
      });
    });

    it('#02 => should parse legacy edge ID without position and index', () => {
      const parsed = parseEdgeId('source => dest');
      expect(parsed).toEqual({
        from: 'source',
        to: 'dest',
        position: undefined,
        index: undefined,
      });
    });

    it('#03 => should return empty object for invalid edge ID strings', () => {
      expect(parseEdgeId('invalid-edge')).toEqual({});
      expect(parseEdgeId('')).toEqual({});
    });
  });

  describe('#03 => getHandlePosition', () => {
    const nodePos = { x: 100, y: 200 };
    const nodeSize = { width: 120, height: 60 };

    it('#01 => should compute top handle coordinates centered at 50% for 1 handle', () => {
      const pos = getHandlePosition(nodePos, nodeSize, 'top', 0, 1);
      expect(pos.x).toBe(100 + 120 * 0.5); // 160
      expect(pos.y).toBe(200 - HANDLE_OFFSET); // 189.5
    });

    it('#02 => should compute top handle coordinates for multiple handles', () => {
      const pos0 = getHandlePosition(nodePos, nodeSize, 'top', 0, 2);
      const pos1 = getHandlePosition(nodePos, nodeSize, 'top', 1, 2);
      expect(pos0.x).toBe(100 + 120 * 0.25); // 130
      expect(pos0.y).toBe(200 - HANDLE_OFFSET);
      expect(pos1.x).toBe(100 + 120 * 0.75); // 190
      expect(pos1.y).toBe(200 - HANDLE_OFFSET);
    });

    it('#03 => should compute bottom handle coordinates', () => {
      const pos = getHandlePosition(nodePos, nodeSize, 'bottom', 0, 1);
      expect(pos.x).toBe(100 + 120 * 0.5);
      expect(pos.y).toBe(200 + 60 + HANDLE_OFFSET); // 270.5
    });

    it('#04 => should compute left handle coordinates', () => {
      const pos = getHandlePosition(nodePos, nodeSize, 'left', 0, 1);
      expect(pos.x).toBe(100 - HANDLE_OFFSET); // 89.5
      expect(pos.y).toBe(200 + 60 * 0.5); // 230
    });

    it('#05 => should compute right handle coordinates', () => {
      const pos = getHandlePosition(nodePos, nodeSize, 'right', 0, 1);
      expect(pos.x).toBe(100 + 120 + HANDLE_OFFSET); // 230.5
      expect(pos.y).toBe(200 + 60 * 0.5); // 230
    });
  });

  describe('#04 => calculateEdgePosition', () => {
    const nodes: (NodeProps & { id: string })[] = [
      {
        id: 'node-0',
        position: { x: 100, y: 100 },
        data: {},
        handles: { right: [{ type: 'output' }], top: [{ type: 'output' }] },
      },
      {
        id: 'node-1',
        position: { x: 300, y: 200 },
        data: {},
        handles: {
          left: [{ type: 'input' }],
          top: [{ type: 'input' }, { type: 'input' }],
        },
      },
    ];

    const dimensions: Record<string, Dimension> = {
      'node-0': {
        width: 100,
        height: 50,
        input: { x: 100, y: 125 },
        output: { x: 200, y: 125 },
        inputOffset: { x: 0, y: 25 },
        outputOffset: { x: 100, y: 25 },
      },
      'node-1': {
        width: 100,
        height: 50,
        input: { x: 300, y: 225 },
        output: { x: 400, y: 225 },
        inputOffset: { x: 0, y: 25 },
        outputOffset: { x: 100, y: 25 },
      },
    };

    it('#01 => should calculate extremities using edge toPosition and toIndex', () => {
      const coords = calculateEdgePosition(
        {
          id: 'node-0 => node-1:top:1',
          from: 'node-0',
          to: 'node-1',
          toPosition: 'top',
          toIndex: 1,
        },
        nodes,
        dimensions,
      );

      // Node-1 has top with 2 handles, index 1 is at 75% width: 300 + 100 * 0.75 = 375
      expect(coords?.x1).toBe(375);
      expect(coords?.y1).toBe(200 - HANDLE_OFFSET);
    });

    it('#02 => should parse edge id when toPosition is not directly set on edge', () => {
      const coords = calculateEdgePosition(
        { id: 'node-0 => node-1:top:0', from: 'node-0', to: 'node-1' },
        nodes,
        dimensions,
      );

      // Node-1 has top with 2 handles, index 0 is at 25% width: 300 + 100 * 0.25 = 325
      expect(coords?.x1).toBe(325);
      expect(coords?.y1).toBe(200 - HANDLE_OFFSET);
    });

    it('#03 => should calculate source position when fromPosition and fromIndex are specified', () => {
      const coords = calculateEdgePosition(
        {
          id: 'node-0 => node-1:left:0',
          from: 'node-0',
          to: 'node-1',
          fromPosition: 'top',
          fromIndex: 0,
        },
        nodes,
        dimensions,
      );

      // Node-0 top output handle: index 0 of 1 handle -> 50% width: 100 + 100 * 0.5 = 150
      expect(coords?.x0).toBe(150);
      expect(coords?.y0).toBe(100 - HANDLE_OFFSET);
    });

    it('#04 => should fallback to dimensions if nodes array is empty but dimensions exist', () => {
      const coords = calculateEdgePosition(
        {
          id: 'node-0 => node-1:top:1',
          from: 'node-0',
          to: 'node-1',
          toPosition: 'top',
          toIndex: 1,
        },
        [],
        dimensions,
      );

      expect(coords?.x1).toBe(375);
      expect(coords?.y1).toBe(200 - HANDLE_OFFSET);
    });

    it('#05 => should return undefined if dimensions for source or target are missing', () => {
      const coords = calculateEdgePosition(
        { id: 'unknown-0 => unknown-1', from: 'unknown-0', to: 'unknown-1' },
        [],
        dimensions,
      );

      expect(coords).toBeUndefined();
    });

    it('#06 => should calculate extremities when connecting to or from a none handle programmatically', () => {
      const customNodes: (NodeProps & { id: string })[] = [
        {
          id: 'node-none-0',
          position: { x: 100, y: 100 },
          data: {},
          handles: { right: [{ type: 'none' }] },
        },
        {
          id: 'node-none-1',
          position: { x: 300, y: 200 },
          data: {},
          handles: { left: [{ type: 'none' }] },
        },
      ];
      const customDimensions: Record<string, Dimension> = {
        'node-none-0': { width: 100, height: 50, output: { x: 200, y: 125 } },
        'node-none-1': { width: 100, height: 50, output: { x: 400, y: 225 } },
      };

      const coords = calculateEdgePosition(
        {
          id: 'node-none-0 => node-none-1:left:0',
          from: 'node-none-0',
          to: 'node-none-1',
          fromPosition: 'right',
          fromIndex: 0,
          toPosition: 'left',
          toIndex: 0,
        },
        customNodes,
        customDimensions,
      );

      expect(coords).toBeDefined();
      expect(coords?.x0).toBe(200 + HANDLE_OFFSET);
      expect(coords?.y0).toBe(125);
      expect(coords?.x1).toBe(300 - HANDLE_OFFSET);
      expect(coords?.y1).toBe(225);
    });
  });

  describe('#06 => machine DELETE principal node protection', () => {
    it('#01 => should not delete node with id "/" or principal property', () => {
      const inst = interpret(machine, {
        context: {
          data: {
            nodes: [
              {
                id: '/',
                data: {
                  principal: { ___root: '@bemedev/mind-flow/uniquePrincipal##' },
                },
                position: { x: 0, y: 0 },
              },
              { id: '/cart', data: {}, position: { x: 10, y: 10 } },
            ],
            edges: [],
          },
          edgesPositions: {},
          zoom: 1,
        },
        pContext: { dimensions: {} } as any,
      });
      inst.start();
      inst.send('CONFIGURE_EMPTY');

      inst.send({ type: 'DELETE', payload: '/' });
      expect(inst.context.data?.nodes?.some((n: any) => n.id === '/')).toBe(true);

      inst.send({ type: 'DELETE', payload: '/cart' });
      expect(inst.context.data?.nodes?.some((n: any) => n.id === '/cart')).toBe(
        false,
      );
      expect(inst.context.data?.nodes?.some((n: any) => n.id === '/')).toBe(true);
    });
  });

  describe('#07 => machine COMMIT history with previous diffing', () => {
    it('#01 => should record initial base commit with structuredClone', () => {
      const inst = interpret(machine, {
        context: {
          data: {
            nodes: [{ id: '/cart', data: {}, position: { x: 0, y: 0 } }],
            edges: [],
          },
          history: [],
          historyIndex: -1,
          edgesPositions: {},
          zoom: 1,
        },
        pContext: { dimensions: {} } as any,
      });
      inst.start();
      inst.send('CONFIGURE_EMPTY');

      inst.send({ type: 'COMMIT', payload: 'initial' });
      expect(inst.context.history).toHaveLength(1);
      expect(inst.context.history?.[0]?.name).toBe('initial');
      expect(inst.context.history?.[0]?.data).toBeDefined();
      expect(inst.context.historyIndex).toBe(0);
    });

    it('#02 => should diff against last commit by default when previous is omitted', () => {
      const inst = interpret(machine, {
        context: {
          data: {
            nodes: [{ id: '/cart', data: {}, position: { x: 0, y: 0 } }],
            edges: [],
          },
          history: [
            {
              data: {
                nodes: [{ id: '/cart', data: {}, position: { x: 0, y: 0 } }],
                edges: [],
              },
              date: Date.now(),
              name: 'initial',
            },
          ],
          historyIndex: 0,
          edgesPositions: {},
          zoom: 1,
        },
        pContext: { dimensions: {} } as any,
      });
      inst.start();
      inst.send('CONFIGURE_EMPTY');

      inst.context.data = {
        nodes: [
          { id: '/cart', data: {}, position: { x: 0, y: 0 } },
          { id: '/checkout', data: {}, position: { x: 100, y: 100 } },
        ],
        edges: [],
      };

      inst.send({ type: 'COMMIT', payload: 'add checkout' });
      expect(inst.context.history).toHaveLength(2);
      expect(inst.context.history?.[1]?.name).toBe('add checkout');
      expect(inst.context.history?.[1]?.diff?.nodes?.addeds).toBeDefined();
      expect(inst.context.historyIndex).toBe(1);
    });

    it('#03 => should diff against last commit using previous index', () => {
      const baseData = {
        nodes: [{ id: '/cart', data: {}, position: { x: 0, y: 0 } }],
        edges: [],
      };
      const inst = interpret(machine, {
        context: {
          data: baseData,
          history: [
            { data: baseData, date: Date.now(), name: 'commit-0' },
            {
              diff: {
                nodes: {
                  addeds: [
                    { id: '/payment', data: {}, position: { x: 50, y: 50 } },
                  ] as any,
                },
              },
              date: Date.now(),
              name: 'commit-1',
            },
          ],
          historyIndex: 1,
          edgesPositions: {},
          zoom: 1,
        },
        pContext: { dimensions: {} } as any,
      });
      inst.start();
      inst.send('CONFIGURE_EMPTY');

      inst.context.data = {
        nodes: [
          { id: '/cart', data: {}, position: { x: 0, y: 0 } },
          { id: '/shipping', data: {}, position: { x: 100, y: 100 } },
        ],
        edges: [],
      };

      inst.send({ type: 'COMMIT', payload: 'branch from 1' });

      expect(inst.context.history).toHaveLength(3);
      const entry2 = inst.context.history?.[2];
      expect(entry2?.name).toBe('branch from 1');
      expect(entry2?.diff?.nodes?.addeds).toBeDefined();
      expect(entry2?.diff?.nodes?.removeds).toEqual(['/payment']);

      const reconstructed = reconstructState(inst.context.history!, 2);
      expect(reconstructed.nodes.map(n => n.id)).toEqual(['/cart', '/shipping']);
    });

    it('#04 => should allow commit without name when payload is omitted', () => {
      const inst = interpret(machine, {
        context: {
          data: {
            nodes: [{ id: '/cart', data: {}, position: { x: 0, y: 0 } }],
            edges: [],
          },
          history: [],
          historyIndex: -1,
          edgesPositions: {},
          zoom: 1,
        },
        pContext: { dimensions: {} } as any,
      });
      inst.start();
      inst.send('CONFIGURE_EMPTY');

      inst.send({ type: 'COMMIT', payload: undefined });
      expect(inst.context.history).toHaveLength(1);
      expect(inst.context.history?.[0]?.name).toBeUndefined();
      expect(inst.context.historyIndex).toBe(0);
    });
  });
});
