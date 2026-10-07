import { createEdgePath } from '@bemedev/mind-flow-fabric';
import { describe, expect, it } from 'vitest';

import { edgeKind, StateMachineEdgeFabric } from './Edge.fabric';

/** Builds an edge path between two points for renderer testing. */
const path = () => createEdgePath({ id: 'edge', data: 'M 0 0 L 10 10' });

describe('#01 => StateMachineEdgeFabric', () => {
  describe('#01 => edgeKind', () => {
    it('#01 => should resolve the kind from the edge data', () => {
      expect(edgeKind({ kind: 'after' })).toBe('after');
      expect(edgeKind({ kind: 'child_parent' })).toBe('child_parent');
    });

    it('#02 => should fall back to the on category', () => {
      expect(edgeKind()).toBe('on');
    });
  });

  describe('#02 => rendering', () => {
    it('#01 => should add a centered label badge', () => {
      const edgePath = path();

      const extras = StateMachineEdgeFabric({
        id: 'edge:on:/cart=>/payment',
        from: '/cart',
        to: '/payment',
        data: { kind: 'on', label: 'on: CHECKOUT' },
        selected: false,
        path: edgePath,
      });

      expect(extras?.length).toBe(2);
      expect(edgePath.strokeDashArray).toBeUndefined();
    });

    it('#02 => should dash hierarchy edges', () => {
      const edgePath = path();

      StateMachineEdgeFabric({
        id: 'edge:hierarchy:/cart=>/',
        from: '/cart',
        to: '/',
        data: { kind: 'child_parent' },
        selected: false,
        path: edgePath,
      });

      expect(edgePath.strokeDashArray).toEqual([6, 4]);
    });

    it('#03 => should highlight the selected edge', () => {
      const edgePath = path();

      StateMachineEdgeFabric({
        id: 'edge:on:/cart=>/payment',
        from: '/cart',
        to: '/payment',
        data: { kind: 'on', label: 'on: CHECKOUT' },
        selected: true,
        path: edgePath,
      });

      expect(edgePath.stroke).toBe('#f97316');
      expect(edgePath.strokeWidth).toBe(3);
    });
  });
});
