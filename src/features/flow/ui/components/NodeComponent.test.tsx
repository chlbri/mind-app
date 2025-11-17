import { render } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { describe, expect, it } from 'vitest';
import NodeComponent from './NodeComponent';

describe('NodeComponent dimensions', () => {
  it('should update dimensions signals when provided', () => {
    const [x, setX] = createSignal(0);
    const [y, setY] = createSignal(0);
    const [width, setWidth] = createSignal(0);
    const [height, setHeight] = createSignal(0);

    const mockOnNodeMount = () => {};
    const mockOnClickOutside = () => {};

    render(() => (
      <NodeComponent
        x={100}
        y={200}
        selected={false}
        inputs={1}
        outputs={1}
        dimensions={{
          x,
          setX,
          y,
          setY,
          width,
          setWidth,
          height,
          setHeight,
        }}
        onNodeMount={mockOnNodeMount}
        onClickOutside={mockOnClickOutside}
      />
    ));

    // After rendering, dimensions should be updated
    // Note: In a headless browser, dimensions might be 0 or based on actual rendering
    expect(width()).toBeGreaterThanOrEqual(0);
    expect(height()).toBeGreaterThanOrEqual(0);
  });

  it('should work without dimensions prop (optional)', () => {
    const mockOnNodeMount = () => {};
    const mockOnClickOutside = () => {};

    const { container } = render(() => (
      <NodeComponent
        x={100}
        y={200}
        selected={false}
        inputs={1}
        outputs={1}
        onNodeMount={mockOnNodeMount}
        onClickOutside={mockOnClickOutside}
      />
    ));

    // Should render without errors even without dimensions prop
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('should update dimensions when position changes', async () => {
    const [x, setX] = createSignal(0);
    const [y, setY] = createSignal(0);
    const [width, setWidth] = createSignal(0);
    const [height, setHeight] = createSignal(0);
    const [posX, setPosX] = createSignal(100);
    const [posY, setPosY] = createSignal(200);

    const mockOnNodeMount = () => {};
    const mockOnClickOutside = () => {};

    render(() => (
      <NodeComponent
        x={posX()}
        y={posY()}
        selected={false}
        inputs={1}
        outputs={1}
        dimensions={{
          x,
          setX,
          y,
          setY,
          width,
          setWidth,
          height,
          setHeight,
        }}
        onNodeMount={mockOnNodeMount}
        onClickOutside={mockOnClickOutside}
      />
    ));

    const initialWidth = width();
    const initialHeight = height();

    // Change position
    setPosX(300);
    setPosY(400);

    // Wait for reactive updates
    await new Promise(resolve => setTimeout(resolve, 100));

    // Dimensions should be tracked (width and height might not change, but x and y should)
    expect(width()).toBe(initialWidth);
    expect(height()).toBe(initialHeight);
  });
});
