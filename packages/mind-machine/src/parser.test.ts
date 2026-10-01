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

  describe('#03 => Transitions', () => {
    it('#01 => should map on transitions to output/input handles of index 2', () => {
      const graph = parseMachineToGraph(
        {
          initial: 'cart',
          states: { cart: { on: { CHECKOUT: '/payment' } }, payment: {} },
        },
        {} as any,
      );

      const edge = graph.edges.find(e => e.id === 'edge:on:/cart=>/payment');

      expect(edge).toBeDefined();
      expect(edge?.fromPosition).toBe('right');
      expect(edge?.toPosition).toBe('left');
      expect(edge?.fromIndex).toBe(2);
      expect(edge?.toIndex).toBe(2);
      expect(edge?.data?.kind).toBe('on');
      expect(edge?.data?.event).toBe('CHECKOUT');
      expect(edge?.data?.label).toBe('on: CHECKOUT');
    });

    it('#02 => should map after transitions to handles of index 0', () => {
      const graph = parseMachineToGraph(
        {
          states: { payment: { after: { '3000ms': '/cancelled' } }, cancelled: {} },
        },
        {} as any,
      );

      const edge = graph.edges.find(e => e.id === 'edge:after:/payment=>/cancelled');

      expect(edge?.fromIndex).toBe(0);
      expect(edge?.toIndex).toBe(0);
      expect(edge?.data?.delay).toBe('3000ms');
      expect(edge?.data?.label).toBe('after: 3000ms');
    });

    it('#03 => should map always transitions to handles of index 1', () => {
      const graph = parseMachineToGraph(
        {
          states: {
            validation: { always: { target: '/fulfillment' } },
            fulfillment: {},
          },
        },
        {} as any,
      );

      const edge = graph.edges.find(
        e => e.id === 'edge:always:/validation=>/fulfillment',
      );

      expect(edge?.fromIndex).toBe(1);
      expect(edge?.toIndex).toBe(1);
      expect(edge?.data?.kind).toBe('always');
      expect(edge?.data?.label).toBe('always');
    });

    it('#04 => should label guarded transitions', () => {
      const graph = parseMachineToGraph(
        {
          states: {
            validation: {
              on: { PAY: { target: '/payment', guards: 'isReady' } },
              always: { guards: 'isApproved', target: '/fulfillment' },
            },
            payment: {},
            fulfillment: {},
          },
        },
        {} as any,
      );

      const on = graph.edges.find(e => e.data?.kind === 'on');
      const always = graph.edges.find(e => e.data?.kind === 'always');

      expect(on?.data?.label).toBe('on: PAY [isReady]');
      expect(always?.data?.label).toBe('always [isApproved]');
    });

    it('#05 => should carry actions on transitions', () => {
      const graph = parseMachineToGraph(
        {
          states: {
            cart: {
              on: { CHECKOUT: { target: '/payment', actions: ['logCheckout'] } },
            },
            payment: {},
          },
        },
        {} as any,
      );

      const edge = graph.edges.find(e => e.data?.kind === 'on');
      expect(edge?.data?.actions).toEqual(['logCheckout']);
      expect(edge?.data?.transitions?.[0]?.actions).toEqual(['logCheckout']);
    });

    it('#06 => should resolve relative targets from the current parent', () => {
      const graph = parseMachineToGraph(
        {
          states: {
            fulfillment: {
              states: { packaging: { on: { SHIP: 'shipping' } }, shipping: {} },
            },
          },
        },
        {} as any,
      );

      const edge = graph.edges.find(
        e => e.from === '/fulfillment/packaging' && e.data?.kind === 'on',
      );
      expect(edge?.to).toBe('/fulfillment/shipping');
    });

    it('#07 => should resolve partial absolute targets', () => {
      const graph = parseMachineToGraph(
        {
          states: {
            cart: { on: { SHIP: '/shipping' } },
            fulfillment: { states: { shipping: {} } },
          },
        },
        {} as any,
      );

      const edge = graph.edges.find(e => e.from === '/cart');
      expect(edge?.to).toBe('/fulfillment/shipping');
    });

    it('#08 => should keep unresolvable targets as absolute paths', () => {
      const graph = parseMachineToGraph(
        { states: { cart: { on: { GONE: '/nowhere' } } } },
        {} as any,
      );

      const edge = graph.edges.find(e => e.from === '/cart');
      expect(edge?.to).toBe('/nowhere');
    });

    it('#09 => should group multiple transitions between the same nodes', () => {
      const graph = parseMachineToGraph(
        {
          states: {
            cart: { on: { CHECKOUT: '/payment', CANCEL: '/payment' } },
            payment: {},
          },
        },
        {} as any,
      );

      const edge = graph.edges.find(e => e.id === 'edge:on:/cart=>/payment');

      expect(graph.edges).toHaveLength(1);
      expect(edge?.data?.label).toBe('2 transitions');
      expect(edge?.data?.transitions).toHaveLength(2);
    });

    it('#10 => should create one edge per distinct always target', () => {
      const graph = parseMachineToGraph(
        {
          states: {
            validation: {
              always: [
                { guards: 'isApproved', target: '/fulfillment' },
                { target: '/rejected' },
              ],
            },
            fulfillment: {},
            rejected: {},
          },
        },
        {} as any,
      );

      expect(graph.edges).toHaveLength(2);
      expect(graph.edges.map(e => e.to).sort()).toEqual([
        '/fulfillment',
        '/rejected',
      ]);
    });

    it('#11 => should ignore empty and malformed targets', () => {
      const graph = parseMachineToGraph(
        {
          states: {
            cart: { on: { EMPTY: undefined, MALFORMED: { foo: 'bar' } } as any },
          },
        },
        {} as any,
      );

      expect(graph.edges).toEqual([]);
    });

    it('#12 => should keep unresolvable relative targets absolute', () => {
      const graph = parseMachineToGraph(
        {
          states: {
            fulfillment: { states: { packaging: { on: { GO: 'nowhere' } } } },
          },
        },
        {} as any,
      );

      const edge = graph.edges.find(
        e => e.from === '/fulfillment/packaging' && e.data?.kind === 'on',
      );
      expect(edge?.to).toBe('/nowhere');
    });

    it('#13 => should read targets from describers and single action strings', () => {
      const graph = parseMachineToGraph(
        {
          states: {
            cart: {
              on: {
                CHECKOUT: { state: '/payment', actions: 'checkout' },
                CANCEL: [{ target: '/payment' }, { target: '/payment' }],
              },
            },
            payment: {},
          },
        } as any,
        {} as any,
      );

      const edge = graph.edges.find(e => e.id === 'edge:on:/cart=>/payment');
      expect(edge?.data?.transitions).toHaveLength(3);
      expect(edge?.data?.transitions?.[0]?.actions).toEqual(['checkout']);
    });
  });

  describe('#04 => Node metadata', () => {
    it('#01 => should normalize entry and exit actions', () => {
      const graph = parseMachineToGraph(
        { states: { cart: { entry: 'initCart', exit: ['clearCart', 'logExit'] } } },
        {} as any,
      );

      const cart = graph.nodes.find(n => n.id === '/cart');
      expect(cart?.data?.entry).toEqual(['initCart']);
      expect(cart?.data?.exit).toEqual(['clearCart', 'logExit']);
    });

    it('#02 => should copy tags and descriptions', () => {
      const graph = parseMachineToGraph(
        {
          states: {
            cart: { tags: ['core', '#payment'], description: 'Cart state' },
          },
        },
        {} as any,
      );

      const cart = graph.nodes.find(n => n.id === '/cart');
      expect(cart?.data?.tags).toEqual(['core', '#payment']);
      expect(cart?.data?.content).toBe('Cart state');
    });

    it('#03 => should extract legacy string activities', () => {
      const graph = parseMachineToGraph(
        { states: { cart: { activities: ['pollStatus', 'heartbeat'] } } } as any,
        {} as any,
      );

      const cart = graph.nodes.find(n => n.id === '/cart');
      expect(cart?.data?.activities).toEqual([
        {
          id: 'pollStatus',
          delay: 'pollStatus',
          actions: ['pollStatus'],
          description: "Periodic activity executed on 'pollStatus' interval",
        },
        {
          id: 'heartbeat',
          delay: 'heartbeat',
          actions: ['heartbeat'],
          description: "Periodic activity executed on 'heartbeat' interval",
        },
      ]);
    });

    it('#04 => should extract activity records with actions and guards', () => {
      const graph = parseMachineToGraph(
        {
          states: {
            payment: {
              activities: {
                CHECK_GATEWAY: {
                  actions: 'pollGatewayStatus',
                  guards: 'isGatewayConnected',
                  description: 'Checks gateway authorization',
                },
              },
            },
          },
        },
        {} as any,
      );

      const payment = graph.nodes.find(n => n.id === '/payment');
      expect(payment?.data?.activities).toEqual([
        {
          id: 'CHECK_GATEWAY_0',
          delay: 'CHECK_GATEWAY',
          actions: ['pollGatewayStatus'],
          guards: ['isGatewayConnected'],
          description: 'Checks gateway authorization',
        },
      ]);
    });

    it('#05 => should preserve structured activity entries', () => {
      const graph = parseMachineToGraph(
        {
          states: {
            payment: {
              activities: [
                { id: 'act', delay: '3000ms', actions: ['tick'], description: 'x' },
              ],
            },
          },
        } as any,
        {} as any,
      );

      const payment = graph.nodes.find(n => n.id === '/payment');
      expect(payment?.data?.activities).toEqual([
        { id: 'act', delay: '3000ms', actions: ['tick'], description: 'x' },
      ]);
    });

    it('#06 => should classify actors as emitter, child, or service', () => {
      const graph = parseMachineToGraph(
        {
          states: {
            payment: {
              actors: {
                stripe: {
                  next: { actions: ['onAuthorized'] },
                  error: { actions: ['onFailure'] },
                  complete: { actions: ['onClose'] },
                },
                cartMachine: {
                  on: { PING: { actions: ['pong'] } },
                  contexts: { '.': 'childCtx' },
                },
                background: { description: 'Runs in background' },
              },
            },
          },
        } as any,
        {} as any,
      );

      const payment = graph.nodes.find(n => n.id === '/payment');
      const actors = payment?.data?.actors ?? [];

      expect(actors.map(actor => actor.type)).toEqual([
        'emitter',
        'child',
        'service',
      ]);
      expect(actors[0]?.emissions).toEqual({
        next: ['onAuthorized'],
        error: ['onFailure'],
        complete: ['onClose'],
      });
      expect(actors[1]?.events).toEqual({ PING: ['pong'] });
      expect(actors[1]?.child?.contexts).toEqual({ '.': 'childCtx' });
    });

    it('#07 => should compute compound and parallel state types', () => {
      const graph = parseMachineToGraph(
        {
          states: {
            fulfillment: { states: { packaging: {} } },
            parallel: { type: 'parallel', states: { a: {}, b: {} } },
          },
        },
        {} as any,
      );

      const compound = graph.nodes.find(n => n.id === '/fulfillment');
      const parallel = graph.nodes.find(n => n.id === '/parallel');
      const atomic = graph.nodes.find(n => n.id === '/fulfillment/packaging');

      expect(compound?.data?.stateType).toBe('compound');
      expect(parallel?.data?.stateType).toBe('parallel');
      expect(atomic?.data?.stateType).toBe('atomic');
    });

    it('#08 => should extract activity strings and describers', () => {
      const graph = parseMachineToGraph(
        {
          states: {
            payment: {
              activities: {
                '1000ms': 'tick',
                '2000ms': [null],
                '3000ms': { name: 'poll', guards: 'isReady' },
              },
            },
          },
        } as any,
        {} as any,
      );

      const payment = graph.nodes.find(n => n.id === '/payment');
      expect(payment?.data?.activities).toEqual([
        {
          id: '1000ms',
          delay: '1000ms',
          actions: ['tick'],
          description: "Runs 'tick' action every 1000ms",
        },
        { id: '2000ms_0', delay: '2000ms', actions: ['2000ms'] },
        {
          id: '3000ms_0',
          delay: '3000ms',
          actions: ['poll'],
          guards: ['isReady'],
          description: undefined,
        },
      ]);
    });

    it('#09 => should name describers and fallback action names', () => {
      const graph = parseMachineToGraph(
        {
          states: {
            payment: {
              activities: { '4000ms': { actions: [{ name: 'named' }, 42] } },
            },
          },
        } as any,
        {} as any,
      );

      const payment = graph.nodes.find(n => n.id === '/payment');
      expect(payment?.data?.activities?.[0]?.actions).toEqual(['named', '42']);
    });

    it('#10 => should ignore primitive activities', () => {
      const graph = parseMachineToGraph(
        { states: { payment: { activities: 'tick' } } } as any,
        {} as any,
      );

      const payment = graph.nodes.find(n => n.id === '/payment');
      expect(payment?.data?.activities).toBeUndefined();
    });
  });

  describe('#05 => Handles and layout', () => {
    it('#01 => should attach input/output handles to every node', () => {
      const graph = parseMachineToGraph({ states: { cart: {} } }, {} as any);

      const cart = graph.nodes.find(n => n.id === '/cart');
      expect(cart?.handles?.left).toHaveLength(3);
      expect(cart?.handles?.right).toHaveLength(3);
      expect(cart?.handles?.left?.every(handle => handle.type === 'input')).toBe(
        true,
      );
      expect(cart?.handles?.right?.every(handle => handle.type === 'output')).toBe(
        true,
      );
    });

    it('#02 => should apply provided positions and auto-layout the rest', () => {
      const graph = parseMachineToGraph(
        { initial: 'cart', states: { cart: {}, payment: {} } },
        { '/cart': { x: 42, y: 24 } } as any,
      );

      const cart = graph.nodes.find(n => n.id === '/cart');
      const payment = graph.nodes.find(n => n.id === '/payment');

      expect(cart?.position).toEqual({ x: 42, y: 24 });
      expect(payment?.position).toEqual({ x: 80, y: 270 });
    });

    it('#03 => should auto-layout without positions', () => {
      const graph = parseMachineToGraph(
        { states: { cart: {}, payment: {} } },
        undefined as any,
      );

      const cart = graph.nodes.find(n => n.id === '/cart');
      expect(cart?.position).toEqual({ x: 80, y: 100 });
    });

    it('#04 => should place the principal node at the origin by default', () => {
      const graph = parseMachineToGraph(
        { name: 'NamedMachine', states: { cart: {} } },
        undefined as any,
      );

      const principal = graph.nodes.find(n => n.id === PRINCIPAL_NODE_KEY);
      expect(principal?.position).toEqual({ x: 0, y: 0 });
      expect(principal?.data?.title).toBe('NamedMachine');
    });
  });
});
