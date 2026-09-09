import { describe, expect, it } from 'vitest';

import { orderMachine } from './-machine.data';
import { parseMachineToGraph } from './-machine.parser';

describe('State Machine Graph Parser', () => {
  const graph = parseMachineToGraph(orderMachine);

  describe('#01 => Node flattening ("no inside children nodes")', () => {
    it('#01 => should extract all states including substates as standalone nodes', () => {
      const nodeIds = graph.nodes.map(n => n.id);

      // Root states
      expect(nodeIds).toContain('/cart');
      expect(nodeIds).toContain('/payment');
      expect(nodeIds).toContain('/validation');
      expect(nodeIds).toContain('/fulfillment');
      expect(nodeIds).toContain('/cancelled');
      expect(nodeIds).toContain('/rejected');
      expect(nodeIds).toContain('/refunded');

      // Substates of compound state /fulfillment (flattened into canvas nodes)
      expect(nodeIds).toContain('/fulfillment/packaging');
      expect(nodeIds).toContain('/fulfillment/shipping');
      expect(nodeIds).toContain('/fulfillment/completed');
    });

    it('#02 => should correctly classify state types', () => {
      const fulfillmentNode = graph.nodes.find(n => n.id === '/fulfillment');
      const cartNode = graph.nodes.find(n => n.id === '/cart');
      const rejectedNode = graph.nodes.find(n => n.id === '/rejected');

      expect(fulfillmentNode?.data.stateType).toBe('compound');
      expect(cartNode?.data.stateType).toBe('initial');
      expect(rejectedNode?.data.stateType).toBe('final');
    });
  });

  describe('#02 => 4 Types of Edges', () => {
    it('#01 => should create child-to-parent edges for all substates', () => {
      const hierarchyEdges = graph.edges.filter(
        e => e.data?.kind === 'child_parent',
      );

      expect(hierarchyEdges.length).toBe(3);

      const packagingEdge = hierarchyEdges.find(
        e => e.from === '/fulfillment/packaging',
      );
      expect(packagingEdge).toBeDefined();
      expect(packagingEdge?.to).toBe('/fulfillment');
      expect(packagingEdge?.data?.kind).toBe('child_parent');

      const shippingEdge = hierarchyEdges.find(
        e => e.from === '/fulfillment/shipping',
      );
      expect(shippingEdge).toBeDefined();
      expect(shippingEdge?.to).toBe('/fulfillment');
    });

    it('#02 => should create after transition edge for delay timeouts', () => {
      const afterEdges = graph.edges.filter(e => e.data?.kind === 'after');

      expect(afterEdges.length).toBeGreaterThanOrEqual(1);

      const paymentTimeout = afterEdges.find(e => e.from === '/payment');
      expect(paymentTimeout).toBeDefined();
      expect(paymentTimeout?.to).toBe('/cancelled');
      expect(paymentTimeout?.data?.delay).toBe('PAYMENT_TIMEOUT');
    });

    it('#03 => should create always transition edge for eventless transitions', () => {
      const alwaysEdges = graph.edges.filter(e => e.data?.kind === 'always');

      expect(alwaysEdges.length).toBeGreaterThanOrEqual(1);

      const validationToFulfillment = alwaysEdges.find(
        e => e.from === '/validation' && e.to === '/fulfillment',
      );
      expect(validationToFulfillment).toBeDefined();
      expect(validationToFulfillment?.data?.guard).toBe('isApproved');
    });

    it('#04 => should create on transition edge for event-driven transitions', () => {
      const onEdges = graph.edges.filter(e => e.data?.kind === 'on');

      expect(onEdges.length).toBeGreaterThanOrEqual(1);

      const checkoutEdge = onEdges.find(
        e => e.from === '/cart' && e.to === '/payment',
      );
      expect(checkoutEdge).toBeDefined();
      expect(checkoutEdge?.data?.event).toBe('CHECKOUT');
    });

    it('#05 => should group multiple transitions between the same two nodes into a single edge with transitions list', () => {
      const validationToFulfillment = graph.edges.find(
        e => e.from === '/validation' && e.to === '/fulfillment',
      );

      expect(validationToFulfillment).toBeDefined();
      expect(validationToFulfillment?.data?.transitions).toHaveLength(2);

      const kinds = validationToFulfillment?.data?.transitions?.map(t => t.kind);
      expect(kinds).toContain('always');
      expect(kinds).toContain('on');
    });
  });

  describe('#03 => Actor Extraction for Top-Right Bubble', () => {
    it('#01 => should extract attached actors with their emissions or event handlers', () => {
      const paymentNode = graph.nodes.find(n => n.id === '/payment');
      expect(paymentNode?.data.actors).toBeDefined();
      expect(paymentNode?.data.actors?.length).toBe(1);

      const stripeActor = paymentNode?.data.actors?.[0];
      expect(stripeActor?.name).toBe('stripeGateway');
      expect(stripeActor?.type).toBe('emitter');
      expect(stripeActor?.emissions?.next).toEqual([
        'onPaymentAuthorized',
        'storeReceipt',
      ]);
      expect(stripeActor?.emissions?.error).toEqual(['handlePaymentFailure']);
    });

    it('#02 => should extract child actor machines with event listeners', () => {
      const validationNode = graph.nodes.find(n => n.id === '/validation');
      expect(validationNode?.data.actors).toBeDefined();

      const fraudActor = validationNode?.data.actors?.[0];
      expect(fraudActor?.name).toBe('fraudDetector');
      expect(fraudActor?.type).toBe('child');
      expect(fraudActor?.contexts).toEqual({ '.': 'fraudScore' });
    });
  });
});
