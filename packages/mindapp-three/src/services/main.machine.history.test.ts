import { describe, expect, it } from 'vitest';

import {
  calculateDiff,
  MAX_HISTORY_SIZE,
  reconstructState,
  squashOldestCommit,
} from './main.machine.history';
import type { FlowchartData, HistoryEntry } from './main.machine.typings';

/** Builds a node entity with a 3D position. */
const node = (id: string, x = 0, y = 0, z = 0) => ({
  id,
  data: { content: id },
  position: { x, y, z },
});

/** Builds an edge entity between two nodes. */
const edge = (from: string, to: string) => ({
  id: `edge = ${from} => ${to}`,
  from,
  to,
});

describe('#01 => main.machine.history', () => {
  describe('#01 => calculateDiff', () => {
    it('#01 => should return null when both states are empty', () => {
      expect(calculateDiff(undefined, undefined)).toBeNull();
      expect(
        calculateDiff({ nodes: [], edges: [] }, { nodes: [], edges: [] }),
      ).toBeNull();
    });

    it('#02 => should diff an initial state into additions', () => {
      const diff = calculateDiff(undefined, {
        nodes: [node('a'), node('b')],
        edges: [edge('a', 'b')],
      });

      expect(diff?.nodes?.addeds).toEqual([node('a'), node('b')]);
      expect(diff?.edges?.addeds).toEqual(edge('a', 'b'));
    });

    it('#03 => should collapse a single addition to an object', () => {
      const diff = calculateDiff(undefined, { nodes: [node('a')], edges: [] });
      expect(diff?.nodes?.addeds).toEqual(node('a'));
    });

    it('#04 => should diff removals when the next state is empty', () => {
      const diff = calculateDiff(
        { nodes: [node('a')], edges: [edge('a', 'b')] },
        undefined,
      );

      expect(diff?.nodes?.removeds).toEqual(['a']);
      expect(diff?.edges?.removeds).toEqual(['edge = a => b']);
    });

    it('#05 => should detect added, updated and removed entities', () => {
      const diff = calculateDiff(
        { nodes: [node('a'), node('b')], edges: [] },
        { nodes: [node('a', 5), node('c')], edges: [] },
      );

      expect(diff?.nodes?.addeds).toEqual(node('c'));
      expect(diff?.nodes?.updateds).toEqual(node('a', 5));
      expect(diff?.nodes?.removeds).toEqual(['b']);
    });

    it('#06 => should detect edge changes only', () => {
      const previous: FlowchartData = { nodes: [node('a'), node('b')], edges: [] };
      const next: FlowchartData = {
        nodes: [node('a'), node('b')],
        edges: [edge('a', 'b')],
      };

      const diff = calculateDiff(previous, next);
      expect(diff?.nodes).toBeUndefined();
      expect(diff?.edges?.addeds).toEqual(edge('a', 'b'));
    });
  });

  describe('#02 => reconstructState', () => {
    it('#01 => should return an empty state for empty histories', () => {
      expect(reconstructState([], 0)).toEqual({ nodes: [], edges: [] });
      expect(reconstructState([], -1)).toEqual({ nodes: [], edges: [] });
    });

    it('#02 => should clone the base snapshot', () => {
      const history: HistoryEntry[] = [
        { data: { nodes: [node('a')], edges: [] }, date: 1 },
      ];

      const state = reconstructState(history, 0);
      expect(state.nodes).toEqual([node('a')]);

      state.nodes?.push(node('b'));
      expect(history[0].data?.nodes?.length).toBe(1);
    });

    it('#03 => should replay a delta chain', () => {
      const history: HistoryEntry[] = [
        { data: { nodes: [node('a')], edges: [] }, date: 1 },
        { diff: { nodes: { addeds: node('b') } }, date: 2, previous: 0 },
        {
          diff: { nodes: { addeds: node('c'), removeds: ['a'] } },
          date: 3,
          previous: 1,
        },
      ];

      expect(reconstructState(history, 1).nodes?.map(n => n.id)).toEqual(['a', 'b']);
      expect(reconstructState(history, 2).nodes?.map(n => n.id)).toEqual(['b', 'c']);
    });

    it('#04 => should apply edge diffs and merge updates', () => {
      const history: HistoryEntry[] = [
        { data: { nodes: [node('a')], edges: [] }, date: 1 },
        {
          diff: {
            nodes: { updateds: { ...node('a'), data: { content: 'updated' } } },
            edges: { addeds: edge('a', 'a') },
          },
          date: 2,
        },
      ];

      const state = reconstructState(history, 1);
      expect(state.nodes?.[0]?.data?.content).toBe('updated');
      expect(state.edges?.length).toBe(1);
    });

    it('#05 => should bound the target index to the last entry', () => {
      const history: HistoryEntry[] = [
        { data: { nodes: [node('a')], edges: [] }, date: 1 },
      ];

      expect(reconstructState(history, 99).nodes?.length).toBe(1);
    });
  });

  describe('#03 => squashOldestCommit', () => {
    it('#01 => should leave single-entry histories untouched', () => {
      const history: HistoryEntry[] = [
        { data: { nodes: [node('a')], edges: [] }, date: 1 },
      ];

      expect(squashOldestCommit(history)).toBe(history);
      expect(history.length).toBe(1);
    });

    it('#02 => should fold the second entry into the base snapshot', () => {
      const history: HistoryEntry[] = [
        { data: { nodes: [node('a')], edges: [] }, date: 1 },
        { diff: { nodes: { addeds: node('b') } }, date: 2 },
        { diff: { nodes: { addeds: node('c') } }, date: 3 },
      ];

      squashOldestCommit(history);

      expect(history.length).toBe(2);
      expect(history[0].data?.nodes?.map(n => n.id)).toEqual(['a', 'b']);
      expect(history[1].diff?.nodes?.addeds).toEqual(node('c'));
    });

    it('#03 => should handle a diff-less second entry', () => {
      const history: HistoryEntry[] = [
        { data: { nodes: [node('a')], edges: [] }, date: 1 },
        { data: { nodes: [node('b')], edges: [] }, date: 2 },
      ];

      squashOldestCommit(history);
      expect(history[0].data?.nodes?.map(n => n.id)).toEqual(['b']);
    });

    it('#04 => should expose the history size cap', () => {
      expect(MAX_HISTORY_SIZE).toBe(100);
    });
  });
});
