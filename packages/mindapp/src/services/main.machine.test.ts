import { interpret } from '@bemedev/app';
import { describe, expect, it } from 'vitest';

import { machine } from './main.machine';
import {
  DEFAULT_DATA,
  DEFAULT_INPUT_OFFSET,
  DEFAULT_NODES,
  DEFAULT_SIZE,
  getDefaultOutputOffset,
} from './main.machine.data';

const createTestService = () => {
  const service = interpret(machine, {
    context: { zoom: 1, edgesPositions: {}, bounds: { x: 0, y: 0 } },
    pContext: {
      generatedId: null,
      dimensions: {},
      getBoardPosition: (clientX, clientY) => ({ x: clientX, y: clientY }),
      clampPosition: (_board, x, y) => ({ x, y }),
      calculateDimensions: (
        position,
        parentDimension = {
          width: DEFAULT_SIZE.width,
          height: DEFAULT_SIZE.height,
          inputOffset: DEFAULT_INPUT_OFFSET,
        },
      ) => {
        const width = parentDimension.width;
        const height = parentDimension.height;
        const outputOffset =
          parentDimension.outputOffset ?? getDefaultOutputOffset(width);
        const inputOffset = parentDimension.inputOffset ?? DEFAULT_INPUT_OFFSET;
        return {
          width,
          height,
          output: { x: position.x + outputOffset.x, y: position.y + outputOffset.y },
          input: { x: position.x + inputOffset.x, y: position.y + inputOffset.y },
          outputOffset,
          inputOffset,
        };
      },
    },
  });

  service.start();
  return service;
};

describe('#01 => Flow State Machine', () => {
  describe('#01 => Initialization & Configuration', () => {
    it('#01 => should initialize in idle state and transition to working on CONFIGURE', () => {
      const service = createTestService();
      expect(service.state.value).toBe('idle');

      service.send({
        type: 'CONFIGURE',
        payload: {
          nodes: DEFAULT_NODES,
          edges: [],
          defaultData: {
            title: 'Default Title',
            priority: 1,
            content: 'Default Content',
          },
        },
      });

      expect(service.state.value).toBe('working');
      expect(service.state.context.data?.nodes).toHaveLength(1);
      expect(service.state.context.data?.nodes[0].data).toEqual(
        DEFAULT_NODES[0].data,
      );
    });
  });

  describe('#02 => SET_NODE_DATA event', () => {
    it('#01 => should update node data for an existing node', () => {
      const service = createTestService();
      service.send({
        type: 'CONFIGURE',
        payload: { nodes: DEFAULT_NODES, edges: [] },
      });

      service.send({
        type: 'SET_NODE_DATA',
        payload: {
          id: 'node-0',
          data: {
            title: 'Updated Title',
            priority: 4,
            content: 'Updated Content Description',
          },
        },
      });

      const updatedNode = service.state.context.data?.nodes.find(
        n => n.id === 'node-0',
      );
      expect(updatedNode?.data).toEqual({
        content: 'Updated Content Description',
        label: 'Root node',
        title: 'Updated Title',
        priority: 4,
      });
    });
  });

  describe('#03 => Adding nodes with defaultData & DEFAULT_SIZE', () => {
    it('#01 => should create parent node with defaultData and DEFAULT_SIZE', () => {
      const service = createTestService();
      const customDefaultData = {
        title: 'New Task',
        priority: 2,
        content: 'Task content',
      };

      service.send({
        type: 'SET_BOARD',
        payload: {
          self: { left: 0, top: 0, width: 1000, height: 800 },
          parent: { scrollLeft: 0, scrollTop: 0, width: 1000, height: 800 },
        },
      });

      service.send({
        type: 'CONFIGURE',
        payload: { nodes: [], edges: [], defaultData: customDefaultData },
      });

      service.send('ADD_PARENT');

      expect(service.state.context.data?.nodes).toHaveLength(1);
      const created = service.state.context.data?.nodes[0];
      expect(created?.data).toEqual(customDefaultData);
    });

    it('#02 => should fallback to DEFAULT_DATA when defaultData is not provided', () => {
      const service = createTestService();

      service.send({
        type: 'SET_BOARD',
        payload: {
          self: { left: 0, top: 0, width: 1000, height: 800 },
          parent: { scrollLeft: 0, scrollTop: 0, width: 1000, height: 800 },
        },
      });

      service.send({ type: 'CONFIGURE', payload: { nodes: [], edges: [] } });

      service.send('ADD_PARENT');

      expect(service.state.context.data?.nodes).toHaveLength(1);
      const created = service.state.context.data?.nodes[0];
      expect(created?.data).toEqual(DEFAULT_DATA);
    });
  });

  describe('#04 => EDIT & STOP_EDIT events', () => {
    it('#01 => should set editing and selected on EDIT event', () => {
      const service = createTestService();
      service.send({
        type: 'CONFIGURE',
        payload: { nodes: DEFAULT_NODES, edges: [] },
      });

      expect(service.state.context.editing).toBeUndefined();

      service.send({ type: 'EDIT', payload: 'node-0' });

      expect(service.state.context.editing).toBe('node-0');
      expect(service.state.context.selected).toBe('node-0');
    });

    it('#02 => should clear editing on STOP_EDIT event', () => {
      const service = createTestService();
      service.send({
        type: 'CONFIGURE',
        payload: { nodes: DEFAULT_NODES, edges: [] },
      });

      service.send({ type: 'EDIT', payload: 'node-0' });
      expect(service.state.context.editing).toBe('node-0');

      service.send('STOP_EDIT');
      expect(service.state.context.editing).toBeUndefined();
    });

    it('#03 => should clear editing and selected on DESELECT event', () => {
      const service = createTestService();
      service.send({
        type: 'CONFIGURE',
        payload: { nodes: DEFAULT_NODES, edges: [] },
      });

      service.send({ type: 'EDIT', payload: 'node-0' });
      expect(service.state.context.editing).toBe('node-0');
      expect(service.state.context.selected).toBe('node-0');

      service.send('DESELECT');
      expect(service.state.context.editing).toBeUndefined();
      expect(service.state.context.selected).toBeUndefined();
    });
  });
});
