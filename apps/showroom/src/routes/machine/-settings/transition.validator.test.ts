import type { GuardConfig } from '@bemedev/app';
import { describe, expect, it } from 'vitest';

import {
  areGuardsEqual,
  checkTransitionConflict,
  getTransitionsFromState,
  normalizeGuards,
  type TransitionCheckCandidate,
  type TransitionCheckItem,
} from './transition.validator';

describe('#01 => transition.validator', () => {
  describe('#01 => normalizeGuards', () => {
    it('#01 => should return empty array for undefined or empty string', () => {
      expect(normalizeGuards(undefined)).toEqual([]);
      expect(normalizeGuards('')).toEqual([]);
      expect(normalizeGuards('   ')).toEqual([]);
    });

    it('#02 => should normalize single guard string', () => {
      expect(normalizeGuards('isValid')).toEqual(['isValid']);
      expect(normalizeGuards('  isValid  ')).toEqual(['isValid']);
    });

    it('#03 => should split and trim comma-separated string of guards', () => {
      expect(normalizeGuards('isValid, isApproved')).toEqual([
        'isApproved',
        'isValid',
      ]);
    });

    it('#04 => should sort and deduplicate array of guards', () => {
      expect(normalizeGuards(['isValid', 'isApproved', 'isValid'])).toEqual([
        'isApproved',
        'isValid',
      ]);
    });

    it('#05 => should sort array of multiple guard strings', () => {
      expect(normalizeGuards(['isValid', 'isApproved', 'hasStock'])).toEqual([
        'hasStock',
        'isApproved',
        'isValid',
      ]);
    });
  });

  describe('#02 => areGuardsEqual', () => {
    it('#01 => should return true for two empty guard arrays', () => {
      expect(areGuardsEqual([], [])).toBe(true);
    });

    it('#02 => should return true for identical guard arrays', () => {
      expect(areGuardsEqual(['a', 'b'], ['a', 'b'])).toBe(true);
    });

    it('#03 => should return false when lengths differ', () => {
      expect(areGuardsEqual(['a'], [])).toBe(false);
      expect(areGuardsEqual([], ['a'])).toBe(false);
    });

    it('#04 => should return false when elements differ', () => {
      expect(areGuardsEqual(['a'], ['b'])).toBe(false);
    });
  });

  describe('#03 => on transitions collision check', () => {
    it('#01 => should detect conflict when eventName is repeated without guards from same state', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/cart',
        kind: 'on',
        event: 'CHECKOUT',
      };
      const existing: TransitionCheckItem[] = [
        { id: 't1', from: '/cart', kind: 'on', event: 'CHECKOUT' },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(true);
      expect(result.reason).toContain('An unguarded transition for event');
    });

    it('#02 => should detect conflict when eventName and guard are identical from same state', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/cart',
        kind: 'on',
        event: 'CHECKOUT',
        guards: 'isValid',
      };
      const existing: TransitionCheckItem[] = [
        {
          id: 't1',
          from: '/cart',
          kind: 'on',
          event: 'CHECKOUT',
          guards: 'isValid',
        },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(true);
      expect(result.reason).toContain('guard [isValid]');
    });

    it('#03 => should detect conflict when eventName and guard array (different order) match', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/cart',
        kind: 'on',
        event: 'CHECKOUT',
        guards: ['isValid', 'hasStock'],
      };
      const existing: TransitionCheckItem[] = [
        {
          id: 't1',
          from: '/cart',
          kind: 'on',
          event: 'CHECKOUT',
          guards: 'hasStock, isValid',
        },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(true);
      expect(result.reason).toContain('hasStock, isValid');
    });

    it('#04 => should allow same eventName when one is guarded and one is unguarded', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/cart',
        kind: 'on',
        event: 'CHECKOUT',
        guards: 'isValid',
      };
      const existing: TransitionCheckItem[] = [
        { id: 't1', from: '/cart', kind: 'on', event: 'CHECKOUT' },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(false);
    });

    it('#05 => should allow same eventName with different guards', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/cart',
        kind: 'on',
        event: 'CHECKOUT',
        guards: 'isAdmin',
      };
      const existing: TransitionCheckItem[] = [
        {
          id: 't1',
          from: '/cart',
          kind: 'on',
          event: 'CHECKOUT',
          guards: 'isCustomer',
        },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(false);
    });

    it('#06 => should allow different eventNames with no guards', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/cart',
        kind: 'on',
        event: 'CANCEL',
      };
      const existing: TransitionCheckItem[] = [
        { id: 't1', from: '/cart', kind: 'on', event: 'CHECKOUT' },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(false);
    });
  });

  describe('#04 => after transitions collision check', () => {
    it('#01 => should detect conflict when delay is repeated without guards from same state', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/payment',
        kind: 'after',
        delay: '3000ms',
      };
      const existing: TransitionCheckItem[] = [
        { id: 't1', from: '/payment', kind: 'after', delay: '3000ms' },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(true);
      expect(result.reason).toContain('An unguarded transition for delay');
    });

    it('#02 => should detect conflict when delay and guard are identical from same state', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/payment',
        kind: 'after',
        delay: '5000ms',
        guards: 'isTimeout',
      };
      const existing: TransitionCheckItem[] = [
        {
          id: 't1',
          from: '/payment',
          kind: 'after',
          delay: '5000ms',
          guards: 'isTimeout',
        },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(true);
      expect(result.reason).toContain('guard [isTimeout]');
    });

    it('#03 => should allow same delay when one is guarded and one is unguarded', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/payment',
        kind: 'after',
        delay: '3000ms',
        guards: 'isTimeout',
      };
      const existing: TransitionCheckItem[] = [
        { id: 't1', from: '/payment', kind: 'after', delay: '3000ms' },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(false);
    });

    it('#04 => should allow same delay with different guards', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/payment',
        kind: 'after',
        delay: '3000ms',
        guards: 'guardA',
      };
      const existing: TransitionCheckItem[] = [
        {
          id: 't1',
          from: '/payment',
          kind: 'after',
          delay: '3000ms',
          guards: 'guardB',
        },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(false);
    });

    it('#05 => should allow different delays', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/payment',
        kind: 'after',
        delay: '1000ms',
      };
      const existing: TransitionCheckItem[] = [
        { id: 't1', from: '/payment', kind: 'after', delay: '3000ms' },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(false);
    });
  });

  describe('#05 => always transitions collision check', () => {
    it('#01 => should detect conflict when always is repeated without guards from same state', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/validation',
        kind: 'always',
      };
      const existing: TransitionCheckItem[] = [
        { id: 't1', from: '/validation', kind: 'always' },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(true);
      expect(result.reason).toContain(
        "An unguarded 'always' transition already exists",
      );
    });

    it('#02 => should detect conflict when always and guard are identical from same state', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/validation',
        kind: 'always',
        guards: 'isApproved',
      };
      const existing: TransitionCheckItem[] = [
        { id: 't1', from: '/validation', kind: 'always', guards: 'isApproved' },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(true);
      expect(result.reason).toContain('guard [isApproved]');
    });

    it('#03 => should allow always when one is guarded and one is unguarded', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/validation',
        kind: 'always',
        guards: 'isApproved',
      };
      const existing: TransitionCheckItem[] = [
        { id: 't1', from: '/validation', kind: 'always' },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(false);
    });

    it('#04 => should allow always with different guards', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/validation',
        kind: 'always',
        guards: 'isApproved',
      };
      const existing: TransitionCheckItem[] = [
        { id: 't1', from: '/validation', kind: 'always', guards: 'isRejected' },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(false);
    });
  });

  describe('#06 => state boundaries and edit self', () => {
    it('#01 => should allow identical transitions from different source states', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/stateA',
        kind: 'on',
        event: 'NEXT',
      };
      const existing: TransitionCheckItem[] = [
        { id: 't1', from: '/stateB', kind: 'on', event: 'NEXT' },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(false);
    });

    it('#02 => should not conflict with itself when in edit mode matching transitionId', () => {
      const candidate: TransitionCheckCandidate = {
        id: 'edit_target_id',
        from: '/stateA',
        kind: 'on',
        event: 'NEXT',
      };
      const existing: TransitionCheckItem[] = [
        { id: 'edit_target_id', from: '/stateA', kind: 'on', event: 'NEXT' },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(false);
    });

    it('#03 => should ignore child_parent transition kind', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/child',
        kind: 'child_parent',
      };
      const existing: TransitionCheckItem[] = [
        { id: 't1', from: '/child', kind: 'child_parent' },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(false);
    });
  });

  describe('#07 => getTransitionsFromState', () => {
    it('#01 => should extract transitions from multiple edges matching fromState', () => {
      const edges = [
        {
          id: 'edge1',
          from: '/cart',
          to: '/payment',
          data: {
            fromState: '/cart',
            transitions: [
              { id: 't1', kind: 'on' as const, label: 'on: NEXT', event: 'NEXT' },
              {
                id: 't2',
                kind: 'on' as const,
                label: 'on: NEXT [isVip]',
                event: 'NEXT',
                guards: 'isVip',
              },
            ],
          },
        },
        {
          id: 'edge2',
          from: '/cart',
          to: '/cancelled',
          data: { fromState: '/cart', kind: 'after' as const, delay: '5000ms' },
        },
        {
          id: 'edge3',
          from: '/payment',
          to: '/cart',
          data: { fromState: '/payment', kind: 'on' as const, event: 'CANCEL' },
        },
      ];

      const transitions = getTransitionsFromState(edges, '/cart');
      expect(transitions).toHaveLength(3);
      expect(transitions.map(t => t.id)).toEqual(['t1', 't2', 'edge2']);
    });

    it('#02 => should handle new edge without data and detect conflicts from source state', () => {
      const edges = [
        {
          id: 'existing_edge',
          from: '/cart',
          to: '/payment',
          data: {
            fromState: '/cart',
            transitions: [
              {
                id: 't1',
                kind: 'on' as const,
                label: 'on: CHECKOUT',
                event: 'CHECKOUT',
              },
            ],
          },
        },
        // New edge created by user dragging between /cart and /cancelled (no data yet)
        { id: 'new_edge', from: '/cart', to: '/cancelled' },
      ];

      // Existing transitions from /cart
      const fromTransitions = getTransitionsFromState(edges, '/cart');
      expect(fromTransitions).toHaveLength(1);

      // Candidate on the new edge
      const candidate: TransitionCheckCandidate = {
        from: '/cart',
        kind: 'on',
        event: 'CHECKOUT',
      };

      const result = checkTransitionConflict(candidate, fromTransitions);
      expect(result.hasConflict).toBe(true);
      expect(result.reason).toContain(
        "An unguarded transition for event 'CHECKOUT' already exists",
      );
    });
  });

  describe('#08 => normalizeGuards with GuardAnd and GuardOr objects', () => {
    it('#01 => should normalize simple GuardAnd object with sorted operands', () => {
      const guards: GuardConfig = { and: ['b', 'a'] };
      expect(normalizeGuards(guards)).toEqual([{ and: ['a', 'b'] }]);
    });

    it('#02 => should normalize simple GuardOr object with sorted operands', () => {
      const guards: GuardConfig = { or: ['y', 'x'] };
      expect(normalizeGuards(guards)).toEqual([{ or: ['x', 'y'] }]);
    });

    it('#03 => should normalize nested and/or objects recursively', () => {
      const guards: GuardConfig = { and: ['b', { or: ['d', 'c'] }, 'a'] };
      expect(normalizeGuards(guards)).toEqual([
        { and: [{ or: ['c', 'd'] }, 'a', 'b'] },
      ]);
    });

    it('#04 => should deduplicate identical guard objects in guards array', () => {
      const guards: GuardConfig[] = [{ and: ['a', 'b'] }, { and: ['b', 'a'] }];
      expect(normalizeGuards(guards)).toEqual([{ and: ['a', 'b'] }]);
    });

    it('#05 => should parse and normalize guard object from JSON string', () => {
      const jsonGuard = '{"and": ["b", "a"]}';
      expect(normalizeGuards(jsonGuard)).toEqual([{ and: ['a', 'b'] }]);
    });

    it('#06 => should normalize guard with describer object', () => {
      const guards: GuardConfig = {
        name: 'checkAge',
        description: 'Check if adult',
      };
      expect(normalizeGuards(guards)).toEqual([
        { name: 'checkAge', description: 'Check if adult' },
      ]);
    });
  });

  describe('#09 => areGuardsEqual with complex GuardConfig (deepEqual)', () => {
    it('#01 => should return true for identical GuardAnd objects', () => {
      const g1: GuardConfig = { and: ['a', 'b'] };
      const g2: GuardConfig = { and: ['a', 'b'] };
      expect(areGuardsEqual(g1, g2)).toBe(true);
    });

    it('#02 => should return true for GuardAnd objects with different operand ordering', () => {
      const g1: GuardConfig = { and: ['a', 'b'] };
      const g2: GuardConfig = { and: ['b', 'a'] };
      expect(areGuardsEqual(g1, g2)).toBe(true);
    });

    it('#03 => should return true for GuardOr objects with different operand ordering', () => {
      const g1: GuardConfig = { or: ['y', 'x'] };
      const g2: GuardConfig = { or: ['x', 'y'] };
      expect(areGuardsEqual(g1, g2)).toBe(true);
    });

    it('#04 => should return false for GuardAnd vs GuardOr with same operands', () => {
      const g1: GuardConfig = { and: ['a', 'b'] };
      const g2: GuardConfig = { or: ['a', 'b'] };
      expect(areGuardsEqual(g1, g2)).toBe(false);
    });

    it('#05 => should return false for GuardAnd with different operands', () => {
      const g1: GuardConfig = { and: ['a', 'b'] };
      const g2: GuardConfig = { and: ['a', 'c'] };
      expect(areGuardsEqual(g1, g2)).toBe(false);
    });

    it('#06 => should return true for nested GuardAnd/GuardOr with commutative inner order', () => {
      const g1: GuardConfig = { and: ['b', { or: ['d', 'c'] }, 'a'] };
      const g2: GuardConfig = { and: [{ or: ['c', 'd'] }, 'a', 'b'] };
      expect(areGuardsEqual(g1, g2)).toBe(true);
    });

    it('#07 => should return true when comparing JSON string and object representations', () => {
      const g1 = '{"and": ["b", "a"]}';
      const g2: GuardConfig = { and: ['a', 'b'] };
      expect(areGuardsEqual(g1, g2)).toBe(true);
    });

    it('#08 => should return false when comparing guarded transition with unguarded transition', () => {
      const g1: GuardConfig = { and: ['a', 'b'] };
      expect(areGuardsEqual(g1, undefined)).toBe(false);
      expect(areGuardsEqual(undefined, g1)).toBe(false);
    });
  });

  describe('#10 => on transitions collision check with complex GuardConfig', () => {
    it('#01 => should detect conflict when eventName and GuardAnd match with different operand order', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/cart',
        kind: 'on',
        event: 'SUBMIT',
        guards: { and: ['b', 'a'] },
      };
      const existing: TransitionCheckItem[] = [
        {
          id: 't1',
          from: '/cart',
          kind: 'on',
          event: 'SUBMIT',
          guards: { and: ['a', 'b'] },
        },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(true);
      expect(result.reason).toContain('and(a, b)');
    });

    it('#02 => should detect conflict when eventName and GuardOr match', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/cart',
        kind: 'on',
        event: 'SUBMIT',
        guards: { or: ['x', 'y'] },
      };
      const existing: TransitionCheckItem[] = [
        {
          id: 't1',
          from: '/cart',
          kind: 'on',
          event: 'SUBMIT',
          guards: { or: ['y', 'x'] },
        },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(true);
      expect(result.reason).toContain('or(x, y)');
    });

    it('#03 => should not detect conflict when eventName matches but GuardAnd vs GuardOr differ', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/cart',
        kind: 'on',
        event: 'SUBMIT',
        guards: { and: ['a', 'b'] },
      };
      const existing: TransitionCheckItem[] = [
        {
          id: 't1',
          from: '/cart',
          kind: 'on',
          event: 'SUBMIT',
          guards: { or: ['a', 'b'] },
        },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(false);
    });

    it('#04 => should not detect conflict when eventName matches but operands differ', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/cart',
        kind: 'on',
        event: 'SUBMIT',
        guards: { and: ['a', 'b'] },
      };
      const existing: TransitionCheckItem[] = [
        {
          id: 't1',
          from: '/cart',
          kind: 'on',
          event: 'SUBMIT',
          guards: { and: ['a', 'c'] },
        },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(false);
    });

    it('#05 => should detect conflict when candidate has JSON string and existing has object', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/cart',
        kind: 'on',
        event: 'SUBMIT',
        guards: '{"and": ["b", "a"]}',
      };
      const existing: TransitionCheckItem[] = [
        {
          id: 't1',
          from: '/cart',
          kind: 'on',
          event: 'SUBMIT',
          guards: { and: ['a', 'b'] },
        },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(true);
      expect(result.reason).toContain('and(a, b)');
    });
  });

  describe('#11 => after transitions collision check with complex GuardConfig', () => {
    it('#01 => should detect conflict when delay and GuardAnd match regardless of operand ordering', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/idle',
        kind: 'after',
        delay: '5000ms',
        guards: { and: ['isInactive', 'isOffline'] },
      };
      const existing: TransitionCheckItem[] = [
        {
          id: 't1',
          from: '/idle',
          kind: 'after',
          delay: '5000ms',
          guards: { and: ['isOffline', 'isInactive'] },
        },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(true);
      expect(result.reason).toContain("delay '5000ms'");
      expect(result.reason).toContain('and(isInactive, isOffline)');
    });

    it('#02 => should detect conflict when delay and GuardOr match', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/idle',
        kind: 'after',
        delay: '5000ms',
        guards: { or: ['isTimedOut', 'isCancelled'] },
      };
      const existing: TransitionCheckItem[] = [
        {
          id: 't1',
          from: '/idle',
          kind: 'after',
          delay: '5000ms',
          guards: { or: ['isCancelled', 'isTimedOut'] },
        },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(true);
      expect(result.reason).toContain("delay '5000ms'");
      expect(result.reason).toContain('or(isCancelled, isTimedOut)');
    });

    it('#03 => should not detect conflict when delay matches but guards differ', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/idle',
        kind: 'after',
        delay: '5000ms',
        guards: { and: ['a', 'b'] },
      };
      const existing: TransitionCheckItem[] = [
        {
          id: 't1',
          from: '/idle',
          kind: 'after',
          delay: '5000ms',
          guards: { and: ['a', 'c'] },
        },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(false);
    });

    it('#04 => should detect conflict between unguarded after transitions with same delay', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/idle',
        kind: 'after',
        delay: '5000ms',
      };
      const existing: TransitionCheckItem[] = [
        { id: 't1', from: '/idle', kind: 'after', delay: '5000ms' },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(true);
      expect(result.reason).toContain("delay '5000ms'");
    });
  });

  describe('#12 => always transitions collision check with complex GuardConfig', () => {
    it('#01 => should detect conflict when GuardAnd matches regardless of operand ordering', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/loading',
        kind: 'always',
        guards: { and: ['isReady', 'hasToken'] },
      };
      const existing: TransitionCheckItem[] = [
        {
          id: 't1',
          from: '/loading',
          kind: 'always',
          guards: { and: ['hasToken', 'isReady'] },
        },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(true);
      expect(result.reason).toContain("always' transition");
      expect(result.reason).toContain('and(hasToken, isReady)');
    });

    it('#02 => should detect conflict when GuardOr matches', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/loading',
        kind: 'always',
        guards: { or: ['retryExceeded', 'fatalError'] },
      };
      const existing: TransitionCheckItem[] = [
        {
          id: 't1',
          from: '/loading',
          kind: 'always',
          guards: { or: ['fatalError', 'retryExceeded'] },
        },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(true);
      expect(result.reason).toContain("always' transition");
      expect(result.reason).toContain('or(fatalError, retryExceeded)');
    });

    it('#03 => should not detect conflict when always transitions have different guards', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/loading',
        kind: 'always',
        guards: { and: ['isReady', 'hasToken'] },
      };
      const existing: TransitionCheckItem[] = [
        {
          id: 't1',
          from: '/loading',
          kind: 'always',
          guards: { or: ['isReady', 'hasToken'] },
        },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(false);
    });

    it('#04 => should detect conflict between unguarded always transitions', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/loading',
        kind: 'always',
      };
      const existing: TransitionCheckItem[] = [
        { id: 't1', from: '/loading', kind: 'always' },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(true);
      expect(result.reason).toContain("unguarded 'always' transition");
    });
  });
});
