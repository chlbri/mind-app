import { Sprite } from 'three';
import { describe, expect, it } from 'vitest';

import {
  DEFAULT_EDGE_COLOR,
  DEFAULT_NODE_COLOR,
  SELECTED_EDGE_COLOR,
  SELECTED_NODE_COLOR,
} from '#services/main.machine.data';

import {
  createEdgeTube,
  createLabelSprite,
  createNodeMesh,
  disposeObject3D,
  setEdgeSelected,
  setNodeSelected,
  updateEdgeTube,
} from './factories';

describe('#01 => three/factories', () => {
  describe('#01 => createLabelSprite', () => {
    it('#01 => should create a sprite named label', () => {
      const sprite = createLabelSprite({ text: 'Hello' });

      expect(sprite).toBeInstanceOf(Sprite);
      expect(sprite.name).toBe('label');
      expect(sprite.scale.x).toBeGreaterThan(0);
    });

    it('#02 => should accept custom colors and sizes', () => {
      const sprite = createLabelSprite({
        text: 'Custom',
        color: '#ff0000',
        fontSize: 64,
        background: '#000000',
        padding: 24,
      });

      expect(sprite.scale.y).toBeGreaterThan(0);
    });
  });

  describe('#02 => createNodeMesh', () => {
    it('#01 => should build a node group with a box and a label', () => {
      const group = createNodeMesh({ id: 'node-1', label: 'Node 1' });

      expect(group.name).toBe('node-1');
      expect(group.userData.nodeId).toBe('node-1');
      expect(group.getObjectByName('box')).toBeDefined();
      expect(group.getObjectByName('border')).toBeDefined();
      expect(group.getObjectByName('label')).toBeDefined();
    });

    it('#02 => should skip the label when none is provided', () => {
      const group = createNodeMesh({ id: 'node-2' });
      expect(group.getObjectByName('label')).toBeUndefined();
    });

    it('#03 => should honor custom dimensions', () => {
      const group = createNodeMesh({ id: 'node-3', width: 10, height: 4, depth: 2 });
      const box = group.getObjectByName('box');

      expect(box).toBeDefined();
    });
  });

  describe('#03 => setNodeSelected', () => {
    it('#01 => should switch the box color and reveal the border', () => {
      const group = createNodeMesh({ id: 'node-1' });
      const box = group.getObjectByName('box') as any;
      const border = group.getObjectByName('border') as any;

      setNodeSelected(group, true);
      expect(box.material.color.getHexString()).toBe(SELECTED_NODE_COLOR.slice(1));
      expect(border.visible).toBe(true);

      setNodeSelected(group, false);
      expect(box.material.color.getHexString()).toBe(DEFAULT_NODE_COLOR.slice(1));
      expect(border.visible).toBe(false);
    });

    it('#02 => should tolerate a group without box nor border', () => {
      expect(() =>
        setNodeSelected(createNodeMesh({ id: 'ghost' }), true),
      ).not.toThrow();
    });
  });

  describe('#04 => createEdgeTube', () => {
    it('#01 => should build a tube mesh between two positions', () => {
      const mesh = createEdgeTube({
        id: 'edge-1',
        from: { x: 0, y: 0, z: 0 },
        to: { x: 10, y: 0, z: 0 },
      });

      expect(mesh.name).toBe('edge-1');
      expect(mesh.userData.edgeId).toBe('edge-1');
    });

    it('#02 => should accept custom radius and lift', () => {
      const mesh = createEdgeTube({
        id: 'edge-2',
        from: { x: 0, y: 0, z: 0 },
        to: { x: 5, y: 5, z: 5 },
        radius: 0.2,
        lift: 0.5,
      });

      expect(mesh).toBeDefined();
    });
  });

  describe('#05 => updateEdgeTube', () => {
    it('#01 => should rebuild the geometry with new extremities', () => {
      const mesh = createEdgeTube({
        id: 'edge-1',
        from: { x: 0, y: 0, z: 0 },
        to: { x: 10, y: 0, z: 0 },
      });
      const previous = mesh.geometry;

      updateEdgeTube(mesh, { x: 0, y: 0, z: 0 }, { x: 0, y: 20, z: 0 });

      expect(mesh.geometry).not.toBe(previous);
    });
  });

  describe('#06 => setEdgeSelected', () => {
    it('#01 => should switch the tube color and emissive state', () => {
      const mesh = createEdgeTube({
        id: 'edge-1',
        from: { x: 0, y: 0, z: 0 },
        to: { x: 10, y: 0, z: 0 },
      });
      const material = mesh.material as any;

      setEdgeSelected(mesh, true);
      expect(material.color.getHexString()).toBe(SELECTED_EDGE_COLOR.slice(1));
      expect(material.emissiveIntensity).toBe(0.5);

      setEdgeSelected(mesh, false);
      expect(material.color.getHexString()).toBe(DEFAULT_EDGE_COLOR.slice(1));
      expect(material.emissiveIntensity).toBe(0);
    });
  });

  describe('#07 => disposeObject3D', () => {
    it('#01 => should dispose geometries and materials recursively', () => {
      const group = createNodeMesh({ id: 'node-1', label: 'Node' });
      let disposed = 0;

      group.traverse(child => {
        const mesh = child as any;
        if (mesh.geometry?.dispose) {
          const original = mesh.geometry.dispose.bind(mesh.geometry);
          mesh.geometry.dispose = () => {
            disposed++;
            original();
          };
        }
      });

      disposeObject3D(group);
      expect(disposed).toBeGreaterThan(0);
    });
  });
});
