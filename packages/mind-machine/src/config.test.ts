import { describe, expect, it } from 'vitest';

import { configFromHistory } from './config';
import { PRINCIPAL_NODE_KEY } from './constants';

const machineConfig = {
  id: 'orderProcess',
  initial: 'cart',
  states: {
    cart: { on: { CHECKOUT: '/payment' } },
    payment: { after: { TIMEOUT: '/cart' } },
  },
};

describe('#01 => configFromHistory', () => {
  describe('#01 => empty sources', () => {
    it('#01 => should return an empty config for missing values', () => {
      expect(configFromHistory()).toEqual({ nodes: [], edges: [] });
      expect(configFromHistory(null)).toEqual({ nodes: [], edges: [] });
      expect(configFromHistory(0)).toEqual({ nodes: [], edges: [] });
    });

    it('#02 => should return an empty config for unknown objects', () => {
      expect(configFromHistory({ foo: 'bar' })).toEqual({ nodes: [], edges: [] });
      expect(configFromHistory('machine')).toEqual({ nodes: [], edges: [] });
    });
  });

  describe('#02 => raw config', () => {
    it('#01 => should pass through an existing flowchart config', () => {
      const config = { nodes: [{ id: 'a' }], edges: [] };
      expect(configFromHistory(config)).toBe(config);
    });
  });

  describe('#03 => history sources', () => {
    it('#01 => should reconstruct a raw history array at its last commit', () => {
      const config = configFromHistory([
        { data: { nodes: [{ id: 'a' }], edges: [] }, date: 1 },
        { diff: { nodes: { addeds: { id: 'b' } } }, date: 2, previous: 0 },
      ] as any);

      expect(config.nodes?.map(node => node.id)).toEqual(['a', 'b']);
    });

    it('#02 => should reconstruct a persisted payload at its history index', () => {
      const config = configFromHistory({
        history: [
          { data: { nodes: [{ id: 'a' }], edges: [] }, date: 1 },
          { diff: { nodes: { addeds: { id: 'b' } } }, date: 2, previous: 0 },
        ],
        historyIndex: 0,
      });

      expect(config.nodes?.map(node => node.id)).toEqual(['a']);
    });

    it('#03 => should default a persisted payload to its last commit', () => {
      const config = configFromHistory({
        history: [
          { data: { nodes: [{ id: 'a' }], edges: [] }, date: 1 },
          { diff: { nodes: { addeds: { id: 'b' } } }, date: 2, previous: 0 },
        ],
      });

      expect(config.nodes?.map(node => node.id)).toEqual(['a', 'b']);
    });
  });

  describe('#04 => machine sources', () => {
    it('#01 => should parse a state machine configuration', () => {
      const config = configFromHistory(machineConfig);

      const ids = config.nodes?.map(node => node.id);
      expect(ids).toEqual([PRINCIPAL_NODE_KEY, '/cart', '/payment']);
      expect(config.edges?.map(edge => edge.id)).toEqual([
        'edge:on:/cart=>/payment',
        'edge:after:/payment=>/cart',
      ]);
    });

    it('#02 => should parse a state machine instance', () => {
      const config = configFromHistory({ config: machineConfig });
      expect(config.nodes).toHaveLength(3);
    });
  });
});
