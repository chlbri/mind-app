import { describe, expect, it } from 'vitest';

import { PRINCIPAL_NODE_KEY } from './constants';
import { parseMachineToGraph, Principal } from './parser';

describe('#01 => parser', () => {
  describe('#01 => Principal Node', () => {
    it('#01 => should create the principal node with unique symbol and main properties', () => {
      const graph = parseMachineToGraph(
        {
          id: 'orderProcess',
          description: 'Main order processing machine',
          initial: 'cart',
          states: { cart: { on: { CHECKOUT: '/payment' } }, payment: {} },
        },
        {} as any,
      );

      const principalNode = graph.nodes.find(n => n.id === PRINCIPAL_NODE_KEY);
      expect(principalNode).toBeDefined();
      expect(principalNode?.data?.id).toBe(PRINCIPAL_NODE_KEY);
      expect(principalNode?.data?.path).toBe(PRINCIPAL_NODE_KEY);
      expect(principalNode?.data?.title).toBe('orderProcess');
      expect(principalNode?.data?.content).toBe('Main order processing machine');
      expect(principalNode?.data?.stateType).toBe('compound');
      expect((principalNode?.data as any)?.principal).toBe(Principal.unique);
      expect((principalNode?.data as any)?.principal?.___root).toBe(
        '@bemedev/mind-flow/uniquePrincipal##',
      );
    });

    it('#02 => should set principal node stateType to atomic if no root states exist', () => {
      const graph = parseMachineToGraph(
        { id: 'emptyMachine', states: {} },
        {} as any,
      );

      const principalNode = graph.nodes.find(n => n.id === PRINCIPAL_NODE_KEY);
      expect(principalNode).toBeDefined();
      expect(principalNode?.data?.stateType).toBe('atomic');
      expect(graph.nodes.length).toBe(1);
    });

    it('#03 => should set principal node stateType to parallel if type is parallel', () => {
      const graph = parseMachineToGraph(
        {
          id: 'parallelMachine',
          type: 'parallel',
          states: { serviceA: {}, serviceB: {} },
        },
        {} as any,
      );

      const principalNode = graph.nodes.find(n => n.id === PRINCIPAL_NODE_KEY);
      expect(principalNode?.data?.stateType).toBe('parallel');

      const serviceA = graph.nodes.find(n => n.id === '/serviceA');
      const serviceB = graph.nodes.find(n => n.id === '/serviceB');
      expect(serviceA?.data?.isInitial).toBe(false);
      expect(serviceB?.data?.isInitial).toBe(false);
    });
  });

  describe('#02 => Level 1 (Direct Children) Hierarchy', () => {
    it('#01 => should set parentPath of level 1 nodes to PRINCIPAL_NODE_KEY', () => {
      const graph = parseMachineToGraph(
        {
          initial: 'cart',
          states: { cart: { on: { CHECKOUT: '/payment' } }, payment: {} },
        },
        {} as any,
      );

      const cartNode = graph.nodes.find(n => n.id === '/cart');
      const paymentNode = graph.nodes.find(n => n.id === '/payment');

      expect(cartNode?.data?.parentPath).toBe(PRINCIPAL_NODE_KEY);
      expect(paymentNode?.data?.parentPath).toBe(PRINCIPAL_NODE_KEY);
      expect(cartNode?.data?.isInitial).toBe(true);
      expect(paymentNode?.data?.isInitial).toBe(false);
    });

    it('#02 => should not generate child_parent edge to principal node on canvas', () => {
      const graph = parseMachineToGraph(
        { initial: 'cart', states: { cart: {}, payment: {} } },
        {} as any,
      );

      const edgeToPrincipal = graph.edges.find(
        e => e.to === PRINCIPAL_NODE_KEY || e.from === PRINCIPAL_NODE_KEY,
      );
      expect(edgeToPrincipal).toBeUndefined();
    });

    it('#03 => should preserve child_parent edge for nested compound states', () => {
      const graph = parseMachineToGraph(
        {
          initial: 'fulfillment',
          states: {
            fulfillment: {
              initial: 'packaging',
              states: { packaging: {}, shipping: {} },
            },
          },
        },
        {} as any,
      );

      const packagingNode = graph.nodes.find(n => n.id === '/fulfillment/packaging');
      expect(packagingNode?.data?.parentPath).toBe('/fulfillment');

      const hierarchyEdge = graph.edges.find(
        e => e.from === '/fulfillment/packaging' && e.to === '/fulfillment',
      );
      expect(hierarchyEdge).toBeDefined();
      expect(hierarchyEdge?.data?.kind).toBe('child_parent');
    });
  });
});
