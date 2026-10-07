import { describe, expect, it } from 'vitest';

import { PRINCIPAL_NODE_KEY } from './constants';
import { Principal } from './parser';
import { canDelete, DEFAULT_NODE_DATA, machineEdgesAllowed } from './rules';
import type { StateMachineNodeData } from './types';

/**
 * Builds a minimal node entity for edge rule testing.
 *
 * @param path - State path of the node.
 * @param extra - Optional extra node data fields.
 *
 * @returns A node entity with a 3D position and state machine data.
 */
const node = (
  path: string,
  extra?: Partial<StateMachineNodeData>,
): {
  id: string;
  position: { x: number; y: number; z: number };
  data: StateMachineNodeData;
} => ({
  id: path,
  position: { x: 0, y: 0, z: 0 },
  data: { id: path, title: path.slice(1), path, stateType: 'atomic', ...extra },
});

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
      const result = canDelete({
        context: {
          data: { nodes: [{ id: payload, data: { principal: Principal.unique } }] },
        },
        payload,
      });

      expect(result).toBe(false);
    });

    it('#02 => should allow any other node', () => {
      const result = canDelete({
        context: { data: { nodes: [{ id: '/cart', data: { path: '/cart' } }] } },
        payload: '/cart',
      });

      expect(result).toBe(true);
    });

    it('#03 => should allow an unknown node', () => {
      const result = canDelete({
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

      expect(machineEdgesAllowed({} as any, to)).toBe(false);
      expect(machineEdgesAllowed(from, {} as any)).toBe(false);
    });

    it('#02 => should reject self loops', () => {
      const from = node('/cart');

      expect(machineEdgesAllowed(from, from)).toBe(false);
    });

    it('#03 => should reject parent to child shortcuts', () => {
      const from = node('/cart', { parentPath: '/payment' });
      const to = node('/payment');

      expect(machineEdgesAllowed(from, to)).toBe(false);
    });

    it('#04 => should reject nested descendants', () => {
      const from = node('/fulfillment/shipping');
      const to = node('/fulfillment');

      expect(machineEdgesAllowed(from, to)).toBe(false);
    });

    it('#05 => should reject child to parent hierarchy edges', () => {
      const from = node('/payment');
      const to = node('/cart', { parentPath: '/payment' });

      expect(machineEdgesAllowed(from, to)).toBe(false);
    });

    it('#06 => should allow sibling states', () => {
      const from = node('/cart');
      const to = node('/payment');

      expect(machineEdgesAllowed(from, to)).toBe(true);
    });
  });
});
