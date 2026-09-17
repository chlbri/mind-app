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

    it('#05 => should combine guard string and guards array', () => {
      expect(normalizeGuards('isValid', ['isApproved', 'hasStock'])).toEqual([
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
        guard: 'isValid',
      };
      const existing: TransitionCheckItem[] = [
        { id: 't1', from: '/cart', kind: 'on', event: 'CHECKOUT', guard: 'isValid' },
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
          guard: 'hasStock, isValid',
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
        guard: 'isValid',
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
        guard: 'isAdmin',
      };
      const existing: TransitionCheckItem[] = [
        {
          id: 't1',
          from: '/cart',
          kind: 'on',
          event: 'CHECKOUT',
          guard: 'isCustomer',
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
        guard: 'isTimeout',
      };
      const existing: TransitionCheckItem[] = [
        {
          id: 't1',
          from: '/payment',
          kind: 'after',
          delay: '5000ms',
          guard: 'isTimeout',
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
        guard: 'isTimeout',
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
        guard: 'guardA',
      };
      const existing: TransitionCheckItem[] = [
        {
          id: 't1',
          from: '/payment',
          kind: 'after',
          delay: '3000ms',
          guard: 'guardB',
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
        guard: 'isApproved',
      };
      const existing: TransitionCheckItem[] = [
        { id: 't1', from: '/validation', kind: 'always', guard: 'isApproved' },
      ];

      const result = checkTransitionConflict(candidate, existing);
      expect(result.hasConflict).toBe(true);
      expect(result.reason).toContain('guard [isApproved]');
    });

    it('#03 => should allow always when one is guarded and one is unguarded', () => {
      const candidate: TransitionCheckCandidate = {
        from: '/validation',
        kind: 'always',
        guard: 'isApproved',
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
        guard: 'isApproved',
      };
      const existing: TransitionCheckItem[] = [
        { id: 't1', from: '/validation', kind: 'always', guard: 'isRejected' },
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
                guard: 'isVip',
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
});
