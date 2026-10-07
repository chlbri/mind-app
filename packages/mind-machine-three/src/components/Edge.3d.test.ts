import { createEdgeTube } from '@bemedev/mind-flow-three';
import { describe, expect, it } from 'vitest';

import { StateMachineEdge3D, edgeKind } from './Edge.3d';

/** Builds an edge tube mesh between two 3D positions. */
const tube = () =>
  createEdgeTube({
    id: 'edge',
    from: { x: 0, y: 0, z: 0 },
    to: { x: 10, y: 0, z: 0 },
  });

describe('#01 => StateMachineEdge3D', () => {
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
    it('#01 => should add a midpoint label sprite to the mesh', () => {
      const mesh = tube();

      StateMachineEdge3D({
        id: 'edge:on:/cart=>/payment',
        from: '/cart',
        to: '/payment',
        data: { kind: 'on', label: 'on: CHECKOUT' },
        from3d: { x: 0, y: 0, z: 0 },
        to3d: { x: 10, y: 0, z: 0 },
        selected: false,
        mesh,
      });

      const label = mesh.getObjectByName('edge-label');
      expect(label).toBeDefined();
      expect(label?.position.x).toBe(5);
      expect(label?.position.z).toBe(0);
    });

    it('#02 => should render a hierarchy edge as translucent', () => {
      const mesh = tube();

      StateMachineEdge3D({
        id: 'edge:hierarchy:/cart=>/',
        from: '/cart',
        to: '/',
        data: { kind: 'child_parent' },
        from3d: { x: 0, y: 0, z: 0 },
        to3d: { x: 10, y: 0, z: 0 },
        selected: true,
        mesh,
      });

      expect(mesh.getObjectByName('edge-label')).toBeDefined();
      expect((mesh.material as any).transparent).toBe(true);
    });
  });
});
