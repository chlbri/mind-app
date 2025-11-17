# NodeComponent Dimensions Feature

## Overview

The `NodeComponent` now supports an optional `dimensions` prop that allows you to track the real-time dimensions (x, y, width, height) of a node using Solid.js signals.

## Usage

### Basic Example

```tsx
import { createSignal } from 'solid-js';
import NodeComponent from './NodeComponent';

function MyComponent() {
  // Create signals for dimensions
  const [x, setX] = createSignal(0);
  const [y, setY] = createSignal(0);
  const [width, setWidth] = createSignal(0);
  const [height, setHeight] = createSignal(0);

  return (
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
      onNodeMount={handleNodeMount}
      onClickOutside={handleClickOutside}
    />
  );
}
```

### Accessing Dimensions

The dimensions are reactive and can be accessed anywhere in your component:

```tsx
import { createEffect } from 'solid-js';

createEffect(() => {
  console.log('Node dimensions:', {
    x: x(),
    y: y(),
    width: width(),
    height: height(),
  });
});
```

## API

### dimensions prop (optional)

An object containing Solid.js signal accessors and setters:

```typescript
dimensions?: {
  x: Accessor<number>;
  setX: Setter<number>;
  y: Accessor<number>;
  setY: Setter<number>;
  width: Accessor<number>;
  setWidth: Setter<number>;
  height: Accessor<number>;
  setHeight: Setter<number>;
}
```

- **x**: The x-coordinate of the node's bounding rectangle (relative to viewport)
- **y**: The y-coordinate of the node's bounding rectangle (relative to viewport)
- **width**: The width of the node in pixels
- **height**: The height of the node in pixels

## When are dimensions updated?

Dimensions are automatically updated in the following scenarios:

1. **On mount**: When the component is first mounted to the DOM
2. **On position change**: When the `x` or `y` props change

## Use Cases

### 1. Collision Detection

```tsx
const [x1, setX1] = createSignal(0);
const [y1, setY1] = createSignal(0);
const [width1, setWidth1] = createSignal(0);
const [height1, setHeight1] = createSignal(0);

const [x2, setX2] = createSignal(0);
const [y2, setY2] = createSignal(0);
const [width2, setWidth2] = createSignal(0);
const [height2, setHeight2] = createSignal(0);

const isColliding = () => {
  return (
    x1() < x2() + width2() &&
    x1() + width1() > x2() &&
    y1() < y2() + height2() &&
    y1() + height1() > y2()
  );
};
```

### 2. Distance Calculation

```tsx
const distance = () => {
  const dx = x2() - x1();
  const dy = y2() - y1();
  return Math.sqrt(dx * dx + dy * dy);
};
```

### 3. Positioning Relative Elements

```tsx
const tooltipPosition = () => ({
  x: x() + width() / 2,
  y: y() - 20,
});
```

### 4. Analytics and Debugging

```tsx
createEffect(() => {
  analytics.track('node-dimensions', {
    nodeId: 'node-1',
    dimensions: {
      x: x(),
      y: y(),
      width: width(),
      height: height(),
    },
  });
});
```

## Notes

- The `dimensions` prop is **optional**. The component works normally without it.
- Dimensions are calculated using `getBoundingClientRect()`, which provides viewport-relative coordinates.
- For performance-critical applications, consider debouncing dimension updates if needed.
- The dimensions are updated reactively, so any component using these signals will automatically re-render when they change.

## Testing

Tests are available in `NodeComponent.test.tsx` demonstrating:

- Dimension tracking with the dimensions prop
- Component behavior without the dimensions prop
- Reactive updates when position changes

Run tests with:

```bash
pnpm run test -- NodeComponent.test.tsx
```

## Example

See `NodeComponent.example.tsx` for a complete interactive example demonstrating the dimensions feature.
