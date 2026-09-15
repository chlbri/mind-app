import { describe, expect, it } from 'vitest';

import { parseMachineToGraph } from './parser';

describe('#01 => parseMachineToGraph', () => {
  describe('#01 => Transition separation by handle kind', () => {
    it('#01 => should separate on, always, and after transitions into distinct edges', () => {
      const graph = parseMachineToGraph(
        {
          initial: 'idle',
          states: {
            idle: {
              on: { START: '/active' },
              always: [{ target: '/active', guards: 'isReady' }],
              after: { '1000ms': '/active' },
            },
            active: {},
          },
        },
        {
          '/idle': { x: 0, y: 0 },
          '/active': { x: 300, y: 0 },
        },
      );

      expect(graph.edges).toHaveLength(3);

      const afterEdge = graph.edges.find(e => e.data?.kind === 'after');
      const alwaysEdge = graph.edges.find(e => e.data?.kind === 'always');
      const onEdge = graph.edges.find(e => e.data?.kind === 'on');

      expect(afterEdge).toBeDefined();
      expect(afterEdge?.id).toBe('edge:after:/idle=>/active');
      expect(afterEdge?.fromPosition).toBe('right');
      expect(afterEdge?.toPosition).toBe('left');
      expect(afterEdge?.fromIndex).toBe(0);
      expect(afterEdge?.toIndex).toBe(0);
      expect(afterEdge?.data?.transitions).toHaveLength(1);
      expect(afterEdge?.data?.transitions?.[0].kind).toBe('after');

      expect(alwaysEdge).toBeDefined();
      expect(alwaysEdge?.id).toBe('edge:always:/idle=>/active');
      expect(alwaysEdge?.fromPosition).toBe('right');
      expect(alwaysEdge?.toPosition).toBe('left');
      expect(alwaysEdge?.fromIndex).toBe(1);
      expect(alwaysEdge?.toIndex).toBe(1);
      expect(alwaysEdge?.data?.transitions).toHaveLength(1);
      expect(alwaysEdge?.data?.transitions?.[0].kind).toBe('always');

      expect(onEdge).toBeDefined();
      expect(onEdge?.id).toBe('edge:on:/idle=>/active');
      expect(onEdge?.fromPosition).toBe('right');
      expect(onEdge?.toPosition).toBe('left');
      expect(onEdge?.fromIndex).toBe(2);
      expect(onEdge?.toIndex).toBe(2);
      expect(onEdge?.data?.transitions).toHaveLength(1);
      expect(onEdge?.data?.transitions?.[0].kind).toBe('on');
    });
  });

  describe('#02 => Grouping transitions of identical kind', () => {
    it('#02 => should group multiple always transitions onto the same always edge', () => {
      const graph = parseMachineToGraph(
        {
          initial: 'check',
          states: {
            check: {
              always: [
                { guards: 'isValid', target: '/success' },
                { target: '/success' },
              ],
            },
            success: {},
          },
        },
        {
          '/check': { x: 0, y: 0 },
          '/success': { x: 300, y: 0 },
        },
      );

      expect(graph.edges).toHaveLength(1);
      const alwaysEdge = graph.edges[0];

      expect(alwaysEdge.id).toBe('edge:always:/check=>/success');
      expect(alwaysEdge.data?.kind).toBe('always');
      expect(alwaysEdge.fromIndex).toBe(1);
      expect(alwaysEdge.toIndex).toBe(1);
      expect(alwaysEdge.data?.transitions).toHaveLength(2);
      expect(alwaysEdge.data?.transitions?.every(t => t.kind === 'always')).toBe(
        true,
      );
      expect(alwaysEdge.data?.label).toBe('2 transitions');
    });
  });

  describe('#03 => Hierarchy edges', () => {
    it('#03 => should create child_parent edge attached to top and bottom handles', () => {
      const graph = parseMachineToGraph(
        {
          initial: 'parent',
          states: {
            parent: {
              initial: 'child',
              states: {
                child: {},
              },
            },
          },
        },
        {
          '/parent': { x: 0, y: 0 },
          '/parent/child': { x: 0, y: 200 },
        },
      );

      const hierarchyEdge = graph.edges.find(e => e.data?.kind === 'child_parent');
      expect(hierarchyEdge).toBeDefined();
      expect(hierarchyEdge?.id).toBe('edge:hierarchy:/parent/child=>/parent');
      expect(hierarchyEdge?.fromPosition).toBe('top');
      expect(hierarchyEdge?.toPosition).toBe('bottom');
      expect(hierarchyEdge?.fromIndex).toBe(0);
      expect(hierarchyEdge?.toIndex).toBe(0);
    });
  });

  describe('#04 => Showroom Machine Graph Validation', () => {
    it('#04 => should separate validation to fulfillment into always and on edges', () => {
      const graph = parseMachineToGraph(
        {
          initial: 'validation',
          states: {
            validation: {
              always: [
                { guards: 'isApproved', target: '/fulfillment' },
                { target: '/rejected' },
              ],
              on: { MANUAL_OVERRIDE: '/fulfillment' },
            },
            fulfillment: {},
            rejected: {},
          },
        },
        {
          '/validation': { x: 0, y: 0 },
          '/fulfillment': { x: 300, y: 0 },
          '/rejected': { x: 0, y: 300 },
        },
      );

      const validationToFulfillmentEdges = graph.edges.filter(
        e => e.from === '/validation' && e.to === '/fulfillment',
      );

      expect(validationToFulfillmentEdges).toHaveLength(2);

      const alwaysEdge = validationToFulfillmentEdges.find(
        e => e.data?.kind === 'always',
      );
      const onEdge = validationToFulfillmentEdges.find(e => e.data?.kind === 'on');

      expect(alwaysEdge).toBeDefined();
      expect(alwaysEdge?.fromIndex).toBe(1);
      expect(alwaysEdge?.toIndex).toBe(1);
      expect(alwaysEdge?.data?.transitions).toHaveLength(1);
      expect(alwaysEdge?.data?.transitions?.[0].kind).toBe('always');

      expect(onEdge).toBeDefined();
      expect(onEdge?.fromIndex).toBe(2);
      expect(onEdge?.toIndex).toBe(2);
      expect(onEdge?.data?.transitions).toHaveLength(1);
      expect(onEdge?.data?.transitions?.[0].kind).toBe('on');
    });
  });
});

