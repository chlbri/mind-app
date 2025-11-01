# @thisbeyond/solid-dnd Documentation

## Overview

`@thisbeyond/solid-dnd` is a lightweight, performant, and extensible drag
and drop toolkit specifically designed for SolidJS. It leverages
fine-grained reactivity primitives for coordination and provides zero
dependencies (except SolidJS itself).

**Website:** https://solid-dnd.com/  
**Repository:** https://github.com/thisbeyond/solid-dnd  
**Version:** 0.7.5

## Installation

```bash
pnpm add @thisbeyond/solid-dnd
```

## Key Features

- **Built for SolidJS**: Leverages fine-grained reactivity primitives for
  coordination
- **Flexible**: Supports simple drag and drop, sortable lists, multiple
  containers, and beyond
- **Extendable**: Build custom sensors, collision detection algorithms, and
  presets
- **Zero dependencies**: Just pair with Solid and you're good to go
- **Performant**: No component re-rendering, uses CSS transforms and
  transitions for smooth performance

## Core Concepts

### 1. DragDropProvider

The root provider that enables drag and drop functionality in your
application.

```tsx
import { DragDropProvider } from '@thisbeyond/solid-dnd';

const App = () => {
  return (
    <DragDropProvider>
      {/* Your drag and drop components */}
    </DragDropProvider>
  );
};
```

### 2. DragDropSensors

Detects and manages dragging interactions. Pointer sensor is provided by
default.

```tsx
import { DragDropProvider, DragDropSensors } from '@thisbeyond/solid-dnd';

const App = () => {
  return (
    <DragDropProvider>
      <DragDropSensors>
        {/* Your drag and drop components */}
      </DragDropSensors>
    </DragDropProvider>
  );
};
```

### 3. createDraggable

Creates a draggable element. Maintains full control over appearance and
behavior.

```tsx
import { createDraggable } from '@thisbeyond/solid-dnd';

const Draggable = props => {
  const draggable = createDraggable(props.id);

  return (
    <div use:draggable class='draggable-item'>
      {props.children}
    </div>
  );
};
```

### 4. createDroppable

Manages droppable areas. Can be conditionally enabled/disabled based on
context.

```tsx
import { createDroppable } from '@thisbeyond/solid-dnd';

const Droppable = props => {
  const droppable = createDroppable(props.id);

  return (
    <div use:droppable class='droppable-zone'>
      {props.children}
    </div>
  );
};
```

### 5. useDragDropContext

Access the drag drop context to handle drop events and manage state.

```tsx
import { useDragDropContext } from '@thisbeyond/solid-dnd';

const Sandbox = () => {
  const [, { onDragEnd }] = useDragDropContext();

  onDragEnd(({ draggable, droppable }) => {
    if (droppable) {
      // Handle the drop
      // Note: solid-dnd doesn't automatically move elements.
      // You control how to handle the drop.
    }
  });

  return <div>{/* Your content */}</div>;
};
```

### 6. DragOverlay

Displays a representation of a dragged element removed from the normal
document flow.

```tsx
import { DragOverlay } from '@thisbeyond/solid-dnd';

const Sandbox = () => {
  return (
    <>
      <DragOverlay>
        <div class='drag-preview'>Dragging...</div>
      </DragOverlay>
      {/* Your other content */}
    </>
  );
};
```

## Collision Detection

The library provides multiple collision detection algorithms:

- **`mostIntersecting`**: Detects the most intersecting droppable zone
- **`closestCorners`**: Finds the closest corner of droppable zones
- **`closestCenter`**: Finds the droppable zone with the closest center

These can be customized or extended with your own algorithms.

## Sortable Lists

Built-in support for drag and drop list reordering (currently vertical
sorting only).

```tsx
import { Sortable, Draggable } from "@thisbeyond/solid-dnd";

const SortableList = () => {
  const [items, setItems] = createSignal([...]);

  return (
    <Sortable>
      <For each={items()}>
        {(item) => (
          <Draggable id={item.id}>
            <div>{item.name}</div>
          </Draggable>
        )}
      </For>
    </Sortable>
  );
};
```

## Multiple Containers

Support for multiple isolated drag and drop areas using nested
`DragDropProvider`:

```tsx
const App = () => {
  return (
    <div>
      <DragDropProvider>
        <DragDropSensors>{/* Container 1 */}</DragDropSensors>
      </DragDropProvider>

      <DragDropProvider>
        <DragDropSensors>
          {/* Container 2 - isolated from Container 1 */}
        </DragDropSensors>
      </DragDropProvider>
    </div>
  );
};
```

## Complete Example

```tsx
import {
  DragDropProvider,
  DragDropSensors,
  createDraggable,
  createDroppable,
  useDragDropContext,
} from '@thisbeyond/solid-dnd';
import { createSignal } from 'solid-js';

const Draggable = props => {
  const draggable = createDraggable(props.id);
  return (
    <div use:draggable class='item'>
      {props.id}
    </div>
  );
};

const Droppable = props => {
  const droppable = createDroppable(props.id);
  return (
    <div use:droppable class='zone'>
      {props.children}
    </div>
  );
};

const App = () => {
  const [draggedItem, setDraggedItem] = createSignal(null);

  const handleDragEnd = ({ draggable, droppable }) => {
    if (droppable) {
      console.log(`Dropped ${draggable.id} into ${droppable.id}`);
      setDraggedItem({ draggable: draggable.id, droppable: droppable.id });
    }
  };

  const Sandbox = () => {
    const [, { onDragEnd }] = useDragDropContext();
    onDragEnd(handleDragEnd);

    return (
      <div>
        <Draggable id='item-1' />
        <Droppable id='zone-1'>
          <p>Drop items here</p>
        </Droppable>
      </div>
    );
  };

  return (
    <DragDropProvider>
      <DragDropSensors>
        <Sandbox />
      </DragDropSensors>
    </DragDropProvider>
  );
};

export default App;
```

## Best Practices

1. **Always wrap with DragDropProvider**: Ensure your drag and drop
   components are wrapped with both `DragDropProvider` and
   `DragDropSensors`

2. **Control state manually**: The library doesn't automatically move
   elements. You maintain full control over state updates

3. **Use CSS transforms for performance**: Leverage CSS transforms and
   transitions for smooth animations

4. **Conditional droppable zones**: Disable droppables conditionally based
   on the current drag context to improve UX

5. **Multiple containers**: Use nested `DragDropProvider` instances for
   isolated drag and drop containers

6. **Customize collision detection**: Choose the appropriate collision
   detection algorithm for your use case

## Styling Tips

```css
/* Draggable item */
.draggable-item {
  cursor: grab;
  user-select: none;
}

.draggable-item:active {
  cursor: grabbing;
}

/* Droppable zone */
.droppable-zone {
  min-height: 100px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.droppable-zone.drag-over {
  background-color: #e3f2fd;
  border-color: #2196f3;
}

/* Drag preview overlay */
.drag-preview {
  opacity: 0.8;
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  padding: 8px 16px;
}
```

## Resources

- **Official Documentation**: https://solid-dnd.com/
- **GitHub Repository**: https://github.com/thisbeyond/solid-dnd
- **NPM Package**: https://www.npmjs.com/package/@thisbeyond/solid-dnd
- **Creator**: Martin Pengelly-Phillips

## Contributing

For issues, feature requests, or contributions, visit the
[GitHub repository](https://github.com/thisbeyond/solid-dnd).

## License

MIT
