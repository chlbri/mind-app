import { describe, expect, it } from 'vitest';

import { PRINCIPAL_NODE_KEY } from './constants';
import { Principal } from './parser';
import {
  canDeleteGuard,
  DEFAULT_NODE_DATA,
  machineEdgesAllowed,
  type EdgesAllowed,
} from './rules';
import type { StateMachineNodeData } from './types';

const node = (
  path: string,
  extra?: Partial<StateMachineNodeData>,
): {
  id: string;
  position: { x: number; y: number };
  data: StateMachineNodeData;
} => ({
  id: path,
  position: { x: 0, y: 0 },
  data: { id: path, title: path.slice(1), path, stateType: 'atomic', ...extra },
});

const edge = (extra?: Record<string, unknown>) =>
  ({
    from: '/cart',
    to: '/payment',
    fromPosition: 'right',
    toPosition: 'left',
    fromIndex: 0,
    toIndex: 0,
    ...extra,
  }) as Parameters<EdgesAllowed>[2];

describe('#01 => rules', () => {
  describe('#01 => DEFAULT_NODE_DATA', () => {
    it('#01 => should describe a new atomic state', () => {
      expect(DEFAULT_NODE_DATA).toEqual({
        id: 'new-state',
        title: 'New State',
        path: '/new-state',
        stateType: 'atomic',
      });
    });
  });

  describe('#02 => canDeleteGuard', () => {
    it('#01 => should reject the unique principal node', () => {
      const payload = PRINCIPAL_NODE_KEY;
      const result = canDeleteGuard({
        context: {
          data: { nodes: [{ id: payload, data: { principal: Principal.unique } }] },
        },
        payload,
      });

      expect(result).toBe(false);
    });

    it('#02 => should allow any other node', () => {
      const result = canDeleteGuard({
        context: { data: { nodes: [{ id: '/cart', data: { path: '/cart' } }] } },
        payload: '/cart',
      });

      expect(result).toBe(true);
    });

    it('#03 => should allow an unknown node', () => {
      const result = canDeleteGuard({
        context: { data: { nodes: [] } },
        payload: '/unknown',
      });

      expect(result).toBe(true);
    });
  });

  describe('#03 => machineEdgesAllowed', () => {
    it('#01 => should reject nodes without paths', () => {
      const from = node('/cart');
      const to = node('/payment');

      expect(machineEdgesAllowed({} as any, to, edge())).toBe(false);
      expect(machineEdgesAllowed(from, {} as any, edge())).toBe(false);
    });

    it('#02 => should reject hierarchy handles', () => {
      const from = node('/cart');
      const to = node('/payment');

      expect(machineEdgesAllowed(from, to, edge({ fromPosition: 'bottom' }))).toBe(
        false,
      );
      expect(machineEdgesAllowed(from, to, edge({ toPosition: 'top' }))).toBe(false);
    });

    it('#03 => should reject parent to child shortcuts', () => {
      const from = node('/cart', { parentPath: '/payment' });
      const to = node('/payment');

      expect(machineEdgesAllowed(from, to, edge())).toBe(false);
    });

    it('#04 => should reject nested descendants', () => {
      const from = node('/fulfillment/shipping');
      const to = node('/fulfillment');

      expect(machineEdgesAllowed(from, to, edge())).toBe(false);
    });

    it('#05 => should reject mismatched handle indices', () => {
      const from = node('/cart');
      const to = node('/payment');

      expect(machineEdgesAllowed(from, to, edge({ fromIndex: 0, toIndex: 2 }))).toBe(
        false,
      );
    });

    it('#06 => should reject non-right source handles', () => {
      const from = node('/cart');
      const to = node('/payment');

      expect(machineEdgesAllowed(from, to, edge({ fromPosition: 'left' }))).toBe(
        false,
      );
    });

    it('#07 => should allow same-kind horizontal transitions', () => {
      const from = node('/cart');
      const to = node('/payment');

      expect(machineEdgesAllowed(from, to, edge())).toBe(true);
      expect(machineEdgesAllowed(from, to, edge({ fromIndex: 2, toIndex: 2 }))).toBe(
        true,
      );
    });
  });
});
