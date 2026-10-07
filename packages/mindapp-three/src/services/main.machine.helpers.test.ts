import { describe, expect, it } from 'vitest';

import {
  buildEdgeId,
  buildNodeID,
  clampPosition3d,
  curveControlPoint,
  distance3d,
  midpoint3d,
  parseEdgeId,
  randomSpherePosition,
} from './main.machine.helpers';

describe('#01 => main.machine.helpers', () => {
  describe('#01 => buildEdgeId', () => {
    it('#01 => should format an edge identifier from extremities', () => {
      expect(buildEdgeId('node-0', 'node-1')).toBe('edge = node-0 => node-1');
    });
  });

  describe('#02 => parseEdgeId', () => {
    it('#01 => should parse source and destination identifiers', () => {
      expect(parseEdgeId('edge = node-0 => node-1')).toEqual({
        from: 'node-0',
        to: 'node-1',
      });
    });

    it('#02 => should return an empty object on mismatch', () => {
      expect(parseEdgeId('random-string')).toEqual({});
    });
  });

  describe('#03 => buildNodeID', () => {
    it('#01 => should prefix the generated identifier', () => {
      expect(buildNodeID('abc')).toBe('node-abc');
      expect(buildNodeID(null)).toBe('node-null');
      expect(buildNodeID()).toBe('node-undefined');
    });
  });

  describe('#04 => distance3d', () => {
    it('#01 => should compute the Euclidean distance', () => {
      expect(distance3d({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 })).toBe(5);
      expect(distance3d({ x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: 1 })).toBe(0);
    });
  });

  describe('#05 => midpoint3d', () => {
    it('#01 => should compute the midpoint of two points', () => {
      expect(midpoint3d({ x: 0, y: 0, z: 0 }, { x: 2, y: 4, z: 6 })).toEqual({
        x: 1,
        y: 2,
        z: 3,
      });
    });
  });

  describe('#06 => curveControlPoint', () => {
    it('#01 => should lift the midpoint along the y axis by default', () => {
      const control = curveControlPoint({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });

      expect(control.x).toBe(0);
      expect(control.z).toBe(5);
      expect(control.y).toBeGreaterThan(0);
    });

    it('#02 => should lift along the requested axis', () => {
      const control = curveControlPoint(
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 0, z: 0 },
        0.5,
        'x',
      );

      expect(control.y).toBe(0);
      expect(control.z).toBe(0);
      expect(control.x).toBeGreaterThan(5);
    });
  });

  describe('#07 => clampPosition3d', () => {
    it('#01 => should clamp each axis within symmetric bounds', () => {
      expect(
        clampPosition3d({ x: 1000, y: -1000, z: 42 }, { x: 100, y: 100, z: 100 }),
      ).toEqual({ x: 100, y: -100, z: 42 });
    });
  });

  describe('#08 => randomSpherePosition', () => {
    it('#01 => should produce a point on the sphere shell', () => {
      const position = randomSpherePosition(15, 0.25);

      const distance = Math.sqrt(
        position.x ** 2 + position.y ** 2 + position.z ** 2,
      );
      expect(distance).toBeCloseTo(15, 5);
    });

    it('#02 => should be deterministic for a given seed', () => {
      expect(randomSpherePosition(10, 0.5)).toEqual(randomSpherePosition(10, 0.5));
    });
  });
});
