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
              handles: {
                right: [{ type: 'output' }],
                left: [{ type: 'input' }],
                top: [{ type: 'none' }],
              },
            },
            {
              id: 'node-1',
              position: { x: 400, y: 100 },
              data: {},
              handles: { left: [{ type: 'none' }], right: [{ type: 'output' }] },
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

describe('#03 => main.machine - custom colored handles and object configurations', () => {
  const setupService = () => {
    const service = interpret(machine, {
      context: {
        zoom: 1,
        edgesPositions: {},
        bounds: { x: 0, y: 0 },
        data: {
          nodes: [
            {
              id: 'state-0',
              position: { x: 100, y: 100 },
              data: { title: 'State 0' },
              handles: {
                right: [
                  { type: 'output', color: '#f97316' },
                  { type: 'output', color: '#22c55e' },
                  { type: 'output', color: '#3b82f6' },
                ],
                left: [
                  { type: 'input', color: '#f97316' },
                  { type: 'input', color: '#22c55e' },
                  { type: 'input', color: '#3b82f6' },
                ],
                top: [{ type: 'none' }],
                bottom: [{ type: 'none' }],
              },
            },
            {
              id: 'state-1',
              position: { x: 400, y: 100 },
              data: { title: 'State 1' },
              handles: {
                right: [
                  { type: 'output', color: '#f97316' },
                  { type: 'output', color: '#22c55e' },
                  { type: 'output', color: '#3b82f6' },
                ],
                left: [
                  { type: 'input', color: '#f97316' },
                  { type: 'input', color: '#22c55e' },
                  { type: 'input', color: '#3b82f6' },
                ],
                top: [{ type: 'none' }],
                bottom: [{ type: 'none' }],
              },
            },
          ],
          edges: [],
        },
      },
      pContext: {
        generatedId: null,
        dimensions: {
          'state-0': { width: 120, height: 60, output: { x: 220, y: 130 } },
          'state-1': { width: 120, height: 60, output: { x: 520, y: 130 } },
        },
        getBoardPosition: (clientX, clientY) => ({ x: clientX, y: clientY }),
        clampPosition: (_b, x, y) => ({ x, y }),
        calculateDimensions: (position: Point): Dimension => ({
          width: DEFAULT_SIZE.width,
          height: DEFAULT_SIZE.height,
          output: { x: position.x + 120, y: position.y + 30 },
          input: { x: position.x, y: position.y + 30 },
        }),
      },
    });
    service.start();
    service.send('CONFIGURE_EMPTY');
    return service;
  };

  it('#01 => should start new edge from a specific colored output handle index', () => {
    const service = setupService();

    service.send({
      type: 'START_NEW_EDGE',
      payload: { from: 'state-0', position: 'right', index: 1 },
    });

    expect(service.state.context.newEdge).toBeDefined();
    expect(service.state.context.newEdge?.from).toBe('state-0');
    expect(service.state.context.newEdge?.fromPosition).toBe('right');
    expect(service.state.context.newEdge?.fromIndex).toBe(1);
  });

  it('#02 => should block starting new edge from top/bottom none handles', () => {
    const service = setupService();

    service.send({
      type: 'START_NEW_EDGE',
      payload: { from: 'state-0', position: 'top', index: 0 },
    });
    expect(service.state.context.newEdge).toBeUndefined();

    service.send({
      type: 'START_NEW_EDGE',
      payload: { from: 'state-0', position: 'bottom', index: 0 },
    });
    expect(service.state.context.newEdge).toBeUndefined();
  });

  it('#03 => should connect edge with specific handle positions and indices', () => {
    const service = setupService();

    service.send({
      type: 'ADD_EDGE',
      payload: {
        from: 'state-0',
        to: 'state-1',
        fromPosition: 'right',
        fromIndex: 2,
        toPosition: 'left',
        toIndex: 2,
      },
    });

    const edges = service.state.context.data?.edges;
    expect(edges).toHaveLength(1);
    expect(edges?.[0].fromPosition).toBe('right');
    expect(edges?.[0].fromIndex).toBe(2);
    expect(edges?.[0].toPosition).toBe('left');
    expect(edges?.[0].toIndex).toBe(2);
  });
});

describe('#04 => main.machine - ADD_PARENT and MOVE', () => {
  const setupService = () => {
    const service = interpret(machine, {
      context: {
        zoom: 1,
        edgesPositions: {},
        bounds: { x: 0, y: 0 },
        data: {
          nodes: [
            {
              id: 'parent-0',
              position: { x: 100, y: 100 },
              data: { title: 'Parent Node' },
              handles: {
                top: [{ type: 'none' }],
                bottom: [{ type: 'none' }],
                right: [{ type: 'output' }],
                left: [{ type: 'input' }],
              },
            },
          ],
          edges: [],
        },
      },
      pContext: {
        generatedId: null,
        dimensions: {
          'parent-0': { width: 120, height: 60, output: { x: 220, y: 130 } },
        },
        getBoardPosition: (clientX, clientY) => ({ x: clientX, y: clientY }),
        clampPosition: (_b, x, y) => ({ x, y }),
        calculateDimensions: (position: Point): Dimension => ({
          width: 120,
          height: 60,
          output: { x: position.x + 120, y: position.y + 30 },
          input: { x: position.x, y: position.y + 30 },
        }),
      },
    });
    service.start();
    service.send('CONFIGURE_EMPTY');
    return service;
  };

  it('#01 => should add parent node with generated ID and link edge from parent bottom to child top', () => {
    const service = setupService();

    service.send({ type: 'ADD_PARENT', payload: { parentId: 'parent-0' } });

    const selectedId = service.state.context.selected;
    expect(selectedId).toBeDefined();
    expect(selectedId).toMatch(/^node-/);

    const nodes = service.state.context.data?.nodes;
    expect(nodes).toHaveLength(2);
    const newNode = nodes?.find(n => n.id === selectedId);
    expect(newNode).toBeDefined();

    // Placed relative to parent bottom-right: x = 100 + 120 + 100 = 320, y = 100 + 60 + 250 = 410
    expect(newNode?.position).toEqual({ x: 320, y: 410 });

    const edges = service.state.context.data?.edges;
    expect(edges).toHaveLength(1);
    expect(edges?.[0].from).toBe('parent-0');
    expect(edges?.[0].to).toBe(selectedId);
    expect(edges?.[0].fromPosition).toBe('bottom');
    expect(edges?.[0].toPosition).toBe('top');
  });

  it('#02 => should add parent node with specific id', () => {
    const service = setupService();

    service.send({
      type: 'ADD_PARENT',
      payload: { id: 'child-custom-1', parentId: 'parent-0' },
    });

    expect(service.state.context.selected).toBe('child-custom-1');

    const nodes = service.state.context.data?.nodes;
    expect(nodes).toHaveLength(2);
    const newNode = nodes?.find(n => n.id === 'child-custom-1');
    expect(newNode).toBeDefined();

    const edges = service.state.context.data?.edges;
    expect(edges).toHaveLength(1);
    expect(edges?.[0].from).toBe('parent-0');
    expect(edges?.[0].to).toBe('child-custom-1');
  });

  it('#03 => should move the newly added node via MOVE event to 250px bottom and 100px right', () => {
    const service = setupService();

    service.send({
      type: 'ADD_PARENT',
      payload: { id: 'child-node', parentId: 'parent-0' },
    });

    // Move to 250px bottom and 100px right according to parent bottom right corner
    // Parent bottom-right is: x = 100 + 120 = 220, y = 100 + 60 = 160
    const targetX = 220 + 100; // 320
    const targetY = 160 + 250; // 410

    service.send({
      type: 'MOVE',
      payload: { id: 'child-node', x: targetX, y: targetY },
    });

    const node = service.state.context.data?.nodes?.find(n => n.id === 'child-node');
    expect(node?.position).toEqual({ x: targetX, y: targetY });

    // Verify edgesPositions are updated for the moved node
    const edge = service.state.context.data?.edges?.[0];
    expect(edge).toBeDefined();
    const edgePos = service.state.context.edgesPositions[edge!.id];
    expect(edgePos).toBeDefined();
    expect(edgePos.x0).toBeGreaterThan(0);
    expect(edgePos.y0).toBeGreaterThan(0);
  });
});
