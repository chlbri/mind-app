import { interpret } from '@bemedev/app';
import { describe, expect, it } from 'vitest';

import { machine } from './main.machine';
import { DEFAULT_PHYSICS_OPTIONS, MAX_ZOOM, MIN_ZOOM } from './main.machine.data';

/** Builds a started service with the default context. */
const service = () => {
  const s = interpret(machine, {
    context: {
      zoom: 1,
      physics: { enabled: true, alpha: DEFAULT_PHYSICS_OPTIONS.alpha },
    },
    pContext: { generatedId: null, clampPosition: p => p },
  });
  s.start();
  return s;
};

/** Configures a two-node graph on the service. */
const configure = (s: ReturnType<typeof service>) => {
  s.send({
    type: 'CONFIGURE',
    payload: {
      nodes: [
        { id: 'node-0', data: { content: 'A' }, position: { x: 0, y: 0, z: 0 } },
        { id: 'node-1', data: { content: 'B' }, position: { x: 10, y: 0, z: 0 } },
      ],
      edges: [],
    },
  });
};

describe('#01 => main.machine', () => {
  describe('#01 => lifecycle', () => {
    it('#01 => should start idle and configure the graph', () => {
      const s = service();
      configure(s);

      expect(s.state.context.data?.nodes?.length).toBe(2);
      expect(s.state.context.data?.edges?.length).toBe(0);
    });

    it('#02 => should accept an empty configuration', () => {
      const s = service();
      s.send('CONFIGURE_EMPTY');

      expect(s.state.context.data).toBeUndefined();
    });
  });

  describe('#02 => nodes', () => {
    it('#01 => should add and remove a node', () => {
      const s = service();
      configure(s);

      s.send({ type: 'ADD_NODE', payload: {} });
      expect(s.state.context.data?.nodes?.length).toBe(3);

      const added = s.state.context.data?.nodes?.at(-1);
      expect(added?.id).toBeDefined();

      s.send({ type: 'REMOVE_NODE', payload: added!.id });
      expect(s.state.context.data?.nodes?.length).toBe(2);
    });

    it('#02 => should move a node in 3D space', () => {
      const s = service();
      configure(s);

      s.send({ type: 'MOVE', payload: { id: 'node-0', x: 5, y: 6, z: 7 } });

      const node = s.state.context.data?.nodes?.find(n => n.id === 'node-0');
      expect(node?.position).toEqual({ x: 5, y: 6, z: 7 });
    });

    it('#03 => should pin and release a node', () => {
      const s = service();
      configure(s);

      s.send({ type: 'PIN_NODE', payload: { id: 'node-0', fixed: true } });
      expect(s.state.context.data?.nodes?.find(n => n.id === 'node-0')?.fixed).toBe(
        true,
      );

      s.send({ type: 'PIN_NODE', payload: { id: 'node-0', fixed: false } });
      expect(s.state.context.data?.nodes?.find(n => n.id === 'node-0')?.fixed).toBe(
        false,
      );
    });

    it('#04 => should merge node data', () => {
      const s = service();
      configure(s);

      s.send({
        type: 'SET_NODE_DATA',
        payload: { id: 'node-0', data: { content: 'Updated' } },
      });

      expect(
        s.state.context.data?.nodes?.find(n => n.id === 'node-0')?.data?.content,
      ).toBe('Updated');
    });

    it('#05 => should apply a batch of simulated positions', () => {
      const s = service();
      configure(s);

      s.send({ type: 'APPLY_PHYSICS', payload: { 'node-0': { x: 1, y: 2, z: 3 } } });

      const node = s.state.context.data?.nodes?.find(n => n.id === 'node-0');
      expect(node?.position).toEqual({ x: 1, y: 2, z: 3 });
    });
  });

  describe('#03 => edges', () => {
    it('#01 => should add a deduplicated edge and select it', () => {
      const s = service();
      configure(s);

      s.send({ type: 'ADD_EDGE', payload: { from: 'node-0', to: 'node-1' } });
      s.send({ type: 'ADD_EDGE', payload: { from: 'node-0', to: 'node-1' } });

      expect(s.state.context.data?.edges?.length).toBe(1);
      expect(s.state.context.selected).toBe('edge = node-0 => node-1');
    });

    it('#02 => should reject edges referencing unknown nodes', () => {
      const s = service();
      configure(s);

      s.send({ type: 'ADD_EDGE', payload: { from: 'node-0', to: 'ghost' } });
      expect(s.state.context.data?.edges?.length).toBe(0);
    });

    it('#03 => should remove an edge', () => {
      const s = service();
      configure(s);

      s.send({ type: 'ADD_EDGE', payload: { from: 'node-0', to: 'node-1' } });
      s.send({ type: 'REMOVE_EDGE', payload: 'edge = node-0 => node-1' });
      expect(s.state.context.data?.edges?.length).toBe(0);
    });

    it('#04 => should merge edge data', () => {
      const s = service();
      configure(s);

      s.send({ type: 'ADD_EDGE', payload: { from: 'node-0', to: 'node-1' } });
      s.send({
        type: 'SET_EDGE_DATA',
        payload: { id: 'edge = node-0 => node-1', data: { label: 'L' } },
      });

      expect(s.state.context.data?.edges?.[0]?.data?.label).toBe('L');
    });

    it('#05 => should cascade edge removal when a node is deleted', () => {
      const s = service();
      configure(s);

      s.send({ type: 'ADD_EDGE', payload: { from: 'node-0', to: 'node-1' } });
      s.send({ type: 'REMOVE_NODE', payload: 'node-0' });

      expect(s.state.context.data?.edges?.length).toBe(0);
      expect(s.state.context.data?.nodes?.length).toBe(1);
    });
  });

  describe('#04 => selection and edition', () => {
    it('#01 => should select, deselect and edit nodes', () => {
      const s = service();
      configure(s);

      s.send({ type: 'SELECT', payload: 'node-0' });
      expect(s.state.context.selected).toBe('node-0');

      s.send({ type: 'EDIT', payload: 'node-1' });
      expect(s.state.context.editing).toBe('node-1');
      expect(s.state.context.selected).toBe('node-1');

      s.send('STOP_EDIT');
      expect(s.state.context.editing).toBeUndefined();
      expect(s.state.context.selected).toBe('node-1');

      s.send('DESELECT');
      expect(s.state.context.selected).toBeUndefined();
      expect(s.state.context.editing).toBeUndefined();
    });
  });

  describe('#05 => zoom and physics', () => {
    it('#01 => should clamp the zoom factor', () => {
      const s = service();
      configure(s);

      s.send({ type: 'ZOOM', payload: 100 });
      expect(s.state.context.zoom).toBe(MAX_ZOOM);

      s.send({ type: 'ZOOM', payload: -100 });
      expect(s.state.context.zoom).toBe(MIN_ZOOM);
    });

    it('#02 => should toggle between the previous zoom and 1', () => {
      const s = service();
      configure(s);

      s.send({ type: 'ZOOM', payload: 1 });
      expect(s.state.context.zoom).toBe(2);

      s.send('TOGGLE_ZOOM');
      expect(s.state.context.zoom).toBe(1);

      s.send('TOGGLE_ZOOM');
      expect(s.state.context.zoom).toBe(2);
    });

    it('#03 => should toggle the physics simulation', () => {
      const s = service();
      configure(s);

      s.send('TOGGLE_PHYSICS');
      expect(s.state.context.physics.enabled).toBe(false);

      s.send('TOGGLE_PHYSICS');
      expect(s.state.context.physics.enabled).toBe(true);
    });
  });

  describe('#06 => history', () => {
    it('#01 => should record commits, undo, redo and checkout', () => {
      const s = service();
      configure(s);

      s.send({ type: 'COMMIT', payload: 'initial' });
      expect(s.state.context.history?.length).toBe(1);

      s.send({ type: 'ADD_NODE', payload: { position: { x: 1, y: 1, z: 1 } } });
      s.send({ type: 'COMMIT', payload: undefined });
      expect(s.state.context.history?.length).toBe(2);

      s.send('UNDO');
      expect(s.state.context.data?.nodes?.length).toBe(2);

      s.send('REDO');
      expect(s.state.context.data?.nodes?.length).toBe(3);

      s.send({ type: 'CHECKOUT', payload: 0 });
      expect(s.state.context.data?.nodes?.length).toBe(2);
    });

    it('#02 => should skip commits without changes', () => {
      const s = service();
      configure(s);

      s.send({ type: 'COMMIT', payload: undefined });
      s.send({ type: 'COMMIT', payload: undefined });

      expect(s.state.context.history?.length).toBe(1);
    });

    it('#03 => should reset the history to a single snapshot', () => {
      const s = service();
      configure(s);

      s.send({ type: 'COMMIT', payload: undefined });
      s.send('RESET_HISTORY');

      expect(s.state.context.history?.length).toBe(1);
      expect(s.state.context.historyIndex).toBe(0);
    });

    it('#04 => should build an external history', () => {
      const s = service();

      s.send({
        type: 'BUILD_HISTORY',
        payload: {
          history: [
            {
              data: {
                nodes: [{ id: 'node-0', data: {}, position: { x: 0, y: 0, z: 0 } }],
                edges: [],
              },
              date: 1,
            },
          ],
          historyIndex: 0,
        },
      });

      expect(s.state.context.history?.length).toBe(1);
      expect(s.state.context.historyIndex).toBe(0);
    });

    it('#05 => should ignore undo without history and redo at the tail', () => {
      const s = service();
      configure(s);

      s.send('UNDO');
      expect(s.state.context.data?.nodes?.length).toBe(2);

      s.send({ type: 'COMMIT', payload: undefined });
      s.send('REDO');
      expect(s.state.context.historyIndex).toBe(0);
    });
  });
});
