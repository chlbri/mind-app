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

describe('#05 => main.machine - Git-like history', () => {
  const setupHistoryService = () => {
    const service = interpret(machine, {
      context: {
        zoom: 1,
        edgesPositions: {},
        data: {
          nodes: [
            {
              id: 'node-root',
              position: { x: 50, y: 50 },
              data: { title: 'Root' },
              handles: { right: [{ type: 'output' }], left: [{ type: 'input' }] },
            },
          ],
          edges: [],
        },
        history: [],
        historyIndex: -1,
        board: { self: { left: 0, top: 0, width: 1000, height: 1000 } },
      },
      pContext: {
        generatedId: null,
        dimensions: {
          'node-root': { width: 100, height: 50, output: { x: 150, y: 75 } },
        },
        getBoardPosition: (clientX, clientY) => ({ x: clientX, y: clientY }),
        clampPosition: (_b, x, y) => ({ x, y }),
        calculateDimensions: (position: Point): Dimension => ({
          width: 100,
          height: 50,
          output: { x: position.x + 100, y: position.y + 25 },
          input: { x: position.x, y: position.y + 25 },
        }),
      },
    });
    service.start();
    service.send('CONFIGURE_EMPTY');
    return service;
  };

  it('#01 => should record initial snapshot on COMMIT and update historyIndex', () => {
    const service = setupHistoryService();

    service.send('COMMIT');

    expect(service.state.context.history).toHaveLength(1);
    expect(typeof service.state.context.history?.[0].date).toBe('number');
    expect(service.state.context.history?.[0].data?.nodes).toHaveLength(1);
    expect(service.state.context.historyIndex).toBe(0);
  });

  it('#02 => should record snapshot on ADD_CHILD and support UNDO and REDO', () => {
    const service = setupHistoryService();

    // Baseline commit
    service.send('COMMIT');
    expect(service.state.context.history).toHaveLength(1);
    expect(service.state.context.historyIndex).toBe(0);

    // Adding child automatically records history
    service.send({ type: 'ADD_CHILD', payload: 'node-root' });
    expect(service.state.context.history).toHaveLength(2);
    expect(service.state.context.historyIndex).toBe(1);
    expect(service.state.context.data?.nodes).toHaveLength(2);

    // UNDO: rewinds back to baseline (index 0)
    service.send('UNDO');
    expect(service.state.context.historyIndex).toBe(0);
    expect(service.state.context.data?.nodes).toHaveLength(1);

    // REDO: advances back to child added (index 1)
    service.send('REDO');
    expect(service.state.context.historyIndex).toBe(1);
    expect(service.state.context.data?.nodes).toHaveLength(2);
  });

  it('#03 => should prune forward history when modifying after an UNDO', () => {
    const service = setupHistoryService();

    service.send('COMMIT');
    service.send({ type: 'ADD_CHILD', payload: 'node-root' });
    expect(service.state.context.history).toHaveLength(2);
    expect(service.state.context.historyIndex).toBe(1);

    // UNDO back to index 0
    service.send('UNDO');
    expect(service.state.context.historyIndex).toBe(0);

    // Update node data creates a new branch commit and prunes the undone child commit
    service.send({
      type: 'SET_NODE_DATA',
      payload: { id: 'node-root', data: { title: 'Updated Root' } },
    });

    expect(service.state.context.history).toHaveLength(2);
    expect(service.state.context.historyIndex).toBe(1);
    const currentNodes = service.state.context.data?.nodes;
    expect(currentNodes).toHaveLength(1);
    expect(currentNodes?.[0].data?.title).toBe('Updated Root');

    // REDO should be guarded/no-op because there is no forward history
    service.send('REDO');
    expect(service.state.context.historyIndex).toBe(1);
  });

  it('#04 => should jump to specific commit via CHECKOUT', () => {
    const service = setupHistoryService();

    service.send('COMMIT');
    service.send({ type: 'ADD_CHILD', payload: 'node-root' });
    service.send({
      type: 'SET_NODE_DATA',
      payload: { id: 'node-root', data: { title: 'Renamed' } },
    });

    expect(service.state.context.history).toHaveLength(3);
    expect(service.state.context.historyIndex).toBe(2);

    // Checkout commit #0
    service.send({ type: 'CHECKOUT', payload: 0 });
    expect(service.state.context.historyIndex).toBe(0);
    expect(service.state.context.data?.nodes).toHaveLength(1);
    expect(service.state.context.data?.nodes?.[0].data?.title).toBe('Root');

    // Checkout commit #1
    service.send({ type: 'CHECKOUT', payload: 1 });
    expect(service.state.context.historyIndex).toBe(1);
    expect(service.state.context.data?.nodes).toHaveLength(2);
  });

  it('#05 => should reset history via RESET_HISTORY', () => {
    const service = setupHistoryService();

    service.send('COMMIT');
    service.send({ type: 'ADD_CHILD', payload: 'node-root' });
    expect(service.state.context.history).toHaveLength(2);

    service.send('RESET_HISTORY');
    expect(service.state.context.history).toHaveLength(1);
    expect(service.state.context.historyIndex).toBe(0);
    expect(typeof service.state.context.history?.[0].date).toBe('number');
  });

  it('#06 => should store entry 0 as base snapshot and entries 1+ as diffs', () => {
    const service = setupHistoryService();

    service.send('COMMIT');
    service.send({ type: 'ADD_CHILD', payload: 'node-root' });

    const history = service.state.context.history!;
    expect(history).toHaveLength(2);

    // Entry 0 is the full base snapshot
    expect(history[0].data).toBeDefined();
    expect(history[0].diff).toBeUndefined();

    // Entry 1 is the delta diff relative to entry 0
    expect(history[1].data).toBeUndefined();
    expect(history[1].diff).toBeDefined();
    expect(history[1].diff?.nodes?.addeds).toBeDefined();
    expect(history[1].diff?.edges?.addeds).toBeDefined();
  });

  it('#07 => should not create empty commit when no changes are observed', () => {
    const service = setupHistoryService();

    service.send('COMMIT');
    expect(service.state.context.history).toHaveLength(1);

    // Repeated COMMIT with no changes
    service.send('COMMIT');
    expect(service.state.context.history).toHaveLength(1);

    // Update node data with identical data
    service.send({
      type: 'SET_NODE_DATA',
      payload: { id: 'node-root', data: { title: 'Root' } },
    });
    expect(service.state.context.history).toHaveLength(1);
  });

  it('#08 => should cap history at 100 elements and squash oldest commits', () => {
    const service = setupHistoryService();

    service.send('COMMIT');
    expect(service.state.context.history).toHaveLength(1);

    // Perform 105 sequential mutations
    for (let i = 1; i <= 105; i++) {
      service.send({
        type: 'SET_NODE_DATA',
        payload: { id: 'node-root', data: { title: `Root v${i}` } },
      });
    }

    const history = service.state.context.history!;
    // History must be capped at exactly 100 elements
    expect(history).toHaveLength(100);
    expect(service.state.context.historyIndex).toBe(99);

    // Latest state matches v105
    const latestNode = service.state.context.data?.nodes?.find(
      n => n.id === 'node-root',
    );
    expect(latestNode?.data?.title).toBe('Root v105');

    // Checkout to squashed base (index 0) - which is v6 after squashing first 6 entries (106 total - 100 cap = 6 squashes)
    service.send({ type: 'CHECKOUT', payload: 0 });
    expect(service.state.context.historyIndex).toBe(0);
    const baseNode = service.state.context.data?.nodes?.find(
      n => n.id === 'node-root',
    );
    expect(baseNode?.data?.title).toBe('Root v6');

    // Checkout back to latest (index 99)
    service.send({ type: 'CHECKOUT', payload: 99 });
    expect(service.state.context.historyIndex).toBe(99);
    const restoredNode = service.state.context.data?.nodes?.find(
      n => n.id === 'node-root',
    );
    expect(restoredNode?.data?.title).toBe('Root v105');
  });
});
