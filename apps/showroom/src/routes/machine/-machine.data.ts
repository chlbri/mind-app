import { createMachine } from '@bemedev/app';
import type { ConfigFrom, EdgesFrom, NodesFrom } from '@bemedev/mind-flow';

import { parseMachineToGraph } from './-machine.parser';
import type { StateMachineEdgeData, StateMachineNodeData } from './-machine.types';

/**
 * A state machine representing the lifecycle of an e-commerce order, from cart
 * selection to payment processing, validation, fulfillment, and potential
 * cancellation or refund.
 */
export const orderMachine = createMachine({
  initial: 'cart',
  states: {
    cart: {
      description: 'Customer cart with selected items ready for checkout.',
      on: { CHECKOUT: '/payment' },
    },

    payment: {
      description: 'Awaiting payment confirmation via payment gateway.',
      actors: {
        stripeGateway: {
          next: { actions: ['onPaymentAuthorized', 'storeReceipt'] },
          error: { actions: ['handlePaymentFailure'] },
          complete: { actions: ['closeGatewayConnection'] },
        },
      },
      on: { PAY_SUCCESS: '/validation', CANCEL: '/cart' },
      after: { PAYMENT_TIMEOUT: '/cancelled' },
    },

    validation: {
      description: 'Automated fraud detection and inventory check.',
      actors: {
        fraudDetector: {
          on: {
            FLAGGED: { actions: ['quarantineOrder'] },
            CLEARED: { actions: ['approveOrder'] },
          },
          contexts: { '.': 'fraudScore' },
        },
      },
      always: [
        { guards: 'isApproved', target: '/fulfillment' },
        { target: '/rejected' },
      ],
      on: { MANUAL_OVERRIDE: '/fulfillment' },
    },

    fulfillment: {
      description: 'Parent order fulfillment process with child states.',
      initial: 'packaging',
      states: {
        packaging: {
          description: 'Warehouse packaging and boxing items.',
          on: { PACKED: '/fulfillment/shipping' },
        },
        shipping: {
          description: 'Carrier transit with real-time GPS tracking stream.',
          actors: {
            gpsTracker: {
              next: { actions: ['updateLiveCoordinates'] },
              complete: { actions: ['notifyDeliveryPending'] },
            },
          },
          on: { DELIVERED: '/fulfillment/completed' },
        },
        completed: {
          type: 'final' as any,
          description: 'Customer confirmed delivery of items.',
        },
      },
      on: { REFUND: '/refunded' },
    },

    cancelled: {
      description: 'Order cancelled due to timeout or user action.',
      on: { RETRY: '/cart' },
    },

    rejected: {
      type: 'final' as any,
      description: 'Order rejected by risk assessment.',
    },

    refunded: {
      type: 'final' as any,
      description: 'Payment returned and order marked refunded.',
    },
  },
});

// Custom manual layout adjustments for optimal visual appeal
const ORDER_GRAPH = parseMachineToGraph(orderMachine);

// Position adjustments for clean horizontal hierarchy
const ORDER_NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  '/cart': { x: 50, y: 140 },
  '/payment': { x: 380, y: 140 },
  '/cancelled': { x: 380, y: 380 },
  '/validation': { x: 740, y: 140 },
  '/rejected': { x: 740, y: 380 },
  '/fulfillment': { x: 1120, y: 50 },
  '/fulfillment/packaging': { x: 1120, y: 220 },
  '/fulfillment/shipping': { x: 1480, y: 220 },
  '/fulfillment/completed': { x: 1840, y: 220 },
  '/refunded': { x: 1480, y: 50 },
};

const ORDER_NODES: NodesFrom<StateMachineNodeData> = ORDER_GRAPH.nodes.map(node => {
  const pos = ORDER_NODE_POSITIONS[node.id];
  return pos ? { ...node, position: pos } : node;
});

const ORDER_EDGES: EdgesFrom<StateMachineEdgeData> = ORDER_GRAPH.edges;

export const config: ConfigFrom<StateMachineNodeData, StateMachineEdgeData> = {
  nodes: ORDER_NODES,
  edges: ORDER_EDGES,
};
