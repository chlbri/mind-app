import { Circle, Path, Rect, Textbox } from 'fabric';
import { describe, expect, it } from 'vitest';

import {
  createEdgePath,
  createGridPath,
  createHandleCircle,
  createNodeLabel,
  createNodeRect,
  createPreviewPath,
  disposeFabricObject,
  FABRIC_COLORS,
  labelOf,
  setEdgeSelected,
  setNodeSelected,
} from './factories';

describe('#01 => fabric/factories', () => {
  describe('#01 => createNodeRect', () => {
    it('#01 => should create a draggable rounded rectangle', () => {
      const rect = createNodeRect({ id: 'node-1', left: 10, top: 20 });

      expect(rect).toBeInstanceOf(Rect);
      expect(rect.left).toBe(10);
      expect(rect.top).toBe(20);
      expect(rect.rx).toBe(8);
      expect(rect.selectable).toBe(true);
      expect(rect.hasControls).toBe(false);
      expect((rect as any).nodeId).toBe('node-1');
    });

    it('#02 => should honor custom dimensions and colors', () => {
      const rect = createNodeRect({
        id: 'node-2',
        left: 0,
        top: 0,
        width: 100,
        height: 40,
        fill: '#000000',
        stroke: '#ffffff',
      });

      expect(rect.width).toBe(100);
      expect(rect.height).toBe(40);
      expect(rect.fill).toBe('#000000');
      expect(rect.stroke).toBe('#ffffff');
    });
  });

  describe('#02 => createNodeLabel', () => {
    it('#01 => should create a centered non-interactive textbox', () => {
      const label = createNodeLabel({
        id: 'node-1',
        text: 'Hello',
        left: 5,
        top: 5,
        width: 120,
      });

      expect(label).toBeInstanceOf(Textbox);
      expect(label.text).toBe('Hello');
      expect(label.originX).toBe('center');
      expect(label.originY).toBe('center');
      expect(label.selectable).toBe(false);
      expect(label.evented).toBe(false);
    });

    it('#02 => should keep its center on the requested position', () => {
      const label = createNodeLabel({
        id: 'node-1',
        text: 'Centered',
        left: 96,
        top: 25,
        width: 168,
      });

      label.set({ left: 300, top: 200 });
      const center = label.getCenterPoint();

      expect(center.x).toBeCloseTo(300, 5);
      expect(center.y).toBeCloseTo(200, 5);
    });
  });

  describe('#03 => createHandleCircle', () => {
    it('#01 => should create a non-draggable handle with metadata', () => {
      const circle = createHandleCircle({
        id: 'node-1',
        side: 'right',
        index: 0,
        type: 'output',
        left: 30,
        top: 40,
      });

      expect(circle).toBeInstanceOf(Circle);
      expect(circle.selectable).toBe(false);
      expect(circle.hoverCursor).toBe('crosshair');
      expect((circle as any).nodeId).toBe('node-1');
      expect((circle as any).handleSide).toBe('right');
      expect((circle as any).handleIndex).toBe(0);
      expect((circle as any).handleType).toBe('output');
    });

    it('#02 => should use the default handle color and custom colors', () => {
      const fallback = createHandleCircle({
        id: 'a',
        side: 'left',
        index: 0,
        type: 'input',
        left: 0,
        top: 0,
      });
      const custom = createHandleCircle({
        id: 'b',
        side: 'left',
        index: 0,
        type: 'input',
        left: 0,
        top: 0,
        color: '#123456',
      });

      expect(fallback.fill).toBe(FABRIC_COLORS.handle);
      expect(custom.fill).toBe('#123456');
      expect(fallback.hoverCursor).toBe('default');
    });
  });

  describe('#04 => createEdgePath', () => {
    it('#01 => should create a stroked path with its identifier', () => {
      const path = createEdgePath({ id: 'edge-1', data: 'M 0 0 L 10 10' });

      expect(path).toBeInstanceOf(Path);
      expect(path.fill).toBe('');
      expect(path.stroke).toBe(FABRIC_COLORS.edge);
      expect((path as any).edgeId).toBe('edge-1');
    });

    it('#02 => should accept a dash pattern and custom color', () => {
      const path = createEdgePath({
        id: 'edge-2',
        data: 'M 0 0 L 10 10',
        stroke: '#abcdef',
        strokeDashArray: [4, 2],
      });

      expect(path.stroke).toBe('#abcdef');
      expect(path.strokeDashArray).toEqual([4, 2]);
    });
  });

  describe('#05 => preview and grid paths', () => {
    it('#01 => should create a dashed preview path', () => {
      const path = createPreviewPath('M 0 0 L 1 1');

      expect(path.stroke).toBe(FABRIC_COLORS.preview);
      expect(path.strokeDashArray).toEqual([6, 4]);
    });

    it('#02 => should create a non-interactive grid path', () => {
      const path = createGridPath('M 0 0 l 0.01 0');

      expect(path.evented).toBe(false);
      expect(path.selectable).toBe(false);
    });
  });

  describe('#06 => selection styling', () => {
    it('#01 => should highlight and reset a node', () => {
      const rect = createNodeRect({ id: 'node-1', left: 0, top: 0 });
      const label = createNodeLabel({
        id: 'node-1',
        text: 'A',
        left: 0,
        top: 0,
        width: 100,
      });

      setNodeSelected(rect, label, true);
      expect(rect.stroke).toBe(FABRIC_COLORS.nodeSelected);
      expect(rect.fill).toBe('#fff7ed');

      setNodeSelected(rect, label, false);
      expect(rect.stroke).toBe(FABRIC_COLORS.nodeStroke);
      expect(rect.fill).toBe(FABRIC_COLORS.node);
    });

    it('#02 => should highlight and reset an edge', () => {
      const path = createEdgePath({ id: 'edge-1', data: 'M 0 0 L 1 1' });

      setEdgeSelected(path, true);
      expect(path.stroke).toBe(FABRIC_COLORS.edgeSelected);
      expect(path.strokeWidth).toBe(3);

      setEdgeSelected(path, false);
      expect(path.stroke).toBe(FABRIC_COLORS.edge);
      expect(path.strokeWidth).toBe(2);
    });
  });

  describe('#07 => labelOf', () => {
    it('#01 => should resolve common label keys in order', () => {
      expect(labelOf({ label: 'L' }, 'fallback')).toBe('L');
      expect(labelOf({ title: 'T' }, 'fallback')).toBe('T');
      expect(labelOf({ content: 'C' }, 'fallback')).toBe('C');
      expect(labelOf({ text: 'X' }, 'fallback')).toBe('X');
    });

    it('#02 => should fall back on missing or blank values', () => {
      expect(labelOf(undefined, 'fallback')).toBe('fallback');
      expect(labelOf({}, 'fallback')).toBe('fallback');
      expect(labelOf({ title: '   ' }, 'fallback')).toBe('fallback');
    });
  });

  describe('#08 => disposeFabricObject', () => {
    it('#01 => should dispose an object without throwing', () => {
      const rect = createNodeRect({ id: 'node-1', left: 0, top: 0 });
      expect(() => disposeFabricObject(rect)).not.toThrow();
    });
  });
});
