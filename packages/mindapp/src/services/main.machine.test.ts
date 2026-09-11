import { interpret } from '@bemedev/app';
import { describe, expect, it } from 'vitest';

import { machine } from './main.machine';
import { DEFAULT_SIZE } from './main.machine.data';
import type { Dimension, Point } from './main.machine.typings';

describe('#02 => main.machine - none handle behavior', () => {
  const setupService = () => {
    const service = interpret(machine, {
      context: {
        zoom: 1,
        edgesPositions: {},
        bounds: { x: 0, y: 0 },
        data: {
          nodes: [
            {
              id: 'node-0',
              position: { x: 100, y: 100 },
              data: {},
              handles: { right: ['output'], left: ['input'], top: ['none'] },
            },
            {
              id: 'node-1',
              position: { x: 400, y: 100 },
              data: {},
              handles: { left: ['none'], right: ['output'] },
            },
          ],
          edges: [],
        },
      },
      pContext: {
        generatedId: null,
        dimensions: {
          'node-0': { width: 100, height: 50, output: { x: 200, y: 125 } },
          'node-1': { width: 100, height: 50, output: { x: 500, y: 125 } },
        },
        getBoardPosition: (clientX, clientY) => ({ x: clientX, y: clientY }),
        clampPosition: (_b, x, y) => ({ x, y }),
        calculateDimensions: (position: Point): Dimension => ({
          width: DEFAULT_SIZE.width,
          height: DEFAULT_SIZE.height,
          output: { x: position.x + 100, y: position.y + 25 },
          input: { x: position.x, y: position.y + 25 },
        }),
      },
    });
    service.start();
    service.send('CONFIGURE_EMPTY');
    return service;
  };

  it('#01 => should not start new edge from a none handle', () => {
    const service = setupService();

    service.send({
      type: 'START_NEW_EDGE',
      payload: { from: 'node-0', position: 'top', index: 0 },
    });

    expect(service.state.context.newEdge).toBeUndefined();
  });

  it('#02 => should start new edge from an output handle', () => {
    const service = setupService();

    service.send({
      type: 'START_NEW_EDGE',
      payload: { from: 'node-0', position: 'right', index: 0 },
    });

    expect(service.state.context.newEdge).toBeDefined();
    expect(service.state.context.newEdge?.from).toBe('node-0');
    expect(service.state.context.newEdge?.fromPosition).toBe('right');
  });

  it('#03 => should allow adding edge programmatically to a none handle', () => {
    const service = setupService();

    service.send({
      type: 'ADD_EDGE',
      payload: {
        from: 'node-0',
        to: 'node-1',
        fromPosition: 'right',
        fromIndex: 0,
        toPosition: 'left',
        toIndex: 0,
      },
    });

    const edges = service.state.context.data?.edges;
    expect(edges).toHaveLength(1);
    expect(edges?.[0].toPosition).toBe('left');
    expect(edges?.[0].toIndex).toBe(0);
  });
});
