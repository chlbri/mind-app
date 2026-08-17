import { useDragDropContext, type Transformer } from "@thisbeyond/solid-dnd";
import type { Component } from "solid-js";

export const DragBounds: Component<{
  ref: () => HTMLDivElement | undefined;
}> = (props) => {
  const [state, { addTransformer, removeTransformer, onDragStart, onDragEnd }] =
    useDragDropContext()!;

  const transformer: Transformer = {
    id: "clamp-to-container",
    order: 100,
    callback: (transform) => {
      const container = props.ref();
      const activeDraggable = state.active.draggable;
      if (!container || !activeDraggable) return transform;

      const containerRect = container.getBoundingClientRect();
      const draggableLayout = activeDraggable.layout;

      const minX = containerRect.left - draggableLayout.left + 5;
      const maxX = Math.max(minX, containerRect.right - draggableLayout.right - 5);
      const minY = containerRect.top - draggableLayout.top + 30;
      const maxY = Math.max(minY, containerRect.bottom - 5 - draggableLayout.bottom);

      return {
        x: Math.min(Math.max(transform.x, minX), maxX),
        y: Math.min(Math.max(transform.y, minY), maxY),
      };
    },
  };

  onDragStart(({ draggable }) => {
    addTransformer("draggables", draggable.id, transformer);
  });

  onDragEnd(({ draggable }) => {
    removeTransformer("draggables", draggable.id, transformer.id);
  });

  return null;
};
