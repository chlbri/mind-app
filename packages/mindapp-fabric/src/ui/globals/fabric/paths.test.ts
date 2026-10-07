import { describe, expect, it } from 'vitest';

import { edgePathData, gridPathData, previewPathData } from './paths';

describe('#01 => fabric/paths', () => {
  describe('#01 => edgePathData', () => {
    it('#01 => should build a horizontal cubic curve for horizontal edges', () => {
      const data = edgePathData({ x0: 0, y0: 0, x1: 100, y1: 10 });

      expect(data).toBe('M 0 0 C 50 0, 50 10, 100 10');
    });

    it('#02 => should reverse the curvature for right-to-left edges', () => {
      const data = edgePathData({ x0: 100, y0: 0, x1: 0, y1: 10 });

      expect(data).toBe('M 100 0 C 50 0, 50 10, 0 10');
    });

    it('#03 => should build a vertical curve for vertical edges', () => {
      const data = edgePathData({ x0: 0, y0: 0, x1: 5, y1: 100 });

      expect(data).toBe('M 0 0 C 0 50, 5 50, 5 100');
    });

    it('#04 => should build a straight line when requested', () => {
      const data = edgePathData(
        { x0: 0, y0: 0, x1: 10, y1: 20 },
        { straight: true },
      );

      expect(data).toBe('M 0 0 L 10 20');
    });

    it('#05 => should honor a custom curvature', () => {
      const data = edgePathData({ x0: 0, y0: 0, x1: 100, y1: 0 }, { curvature: 10 });

      expect(data).toBe('M 0 0 C 50 0, 50 0, 100 0');
    });
  });

  describe('#02 => previewPathData', () => {
    it('#01 => should build a straight line between two points', () => {
      expect(previewPathData({ x: 1, y: 2 }, { x: 3, y: 4 })).toBe('M 1 2 L 3 4');
    });
  });

  describe('#03 => gridPathData', () => {
    it('#01 => should build one dot per grid intersection', () => {
      const data = gridPathData(90, 90, 30);

      expect(data.split('M').length - 1).toBe(4);
    });

    it('#02 => should skip intersections outside the given size', () => {
      const data = gridPathData(60, 60, 30);

      expect(data.split('M').length - 1).toBe(1);
    });

    it('#03 => should return an empty path for tiny sizes', () => {
      expect(gridPathData(10, 10, 30)).toBe('');
    });
  });
});
