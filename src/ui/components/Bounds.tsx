import { useDragDropContext, type Transformer } from "@thisbeyond/solid-dnd";
import { type Component } from "solid-js";
import { useFlow } from "./FlowChart.context";

const CONSTRAINTS = {
  horizontal: 5,
  vertical: 35,
};

export const DragBounds: Component = () => {
  const {
    board: [ref],
    zoom: [zoom],
  } = useFlow();

  const [state, { addTransformer, removeTransformer, onDragStart, onDragEnd }] =
    useDragDropContext()!;

  const transformer: Transformer = {
    id: "clamp-to-container",
    order: 100,
    callback: (transform) => {
      const container = ref()?.parentElement;
      const activeDraggable = state.active.draggable;
      if (!container || !activeDraggable) return transform;
      const containerRect = container.getBoundingClientRect();
      const draggableLayout = activeDraggable.layout;
      const currentZoom = zoom();

      // #region Convert boundaries to board coordinate space
      const minX =
        (containerRect.left - draggableLayout.left) / currentZoom + CONSTRAINTS.horizontal;

      const maxX = Math.max(
        minX,
        (containerRect.right - draggableLayout.right) / currentZoom - CONSTRAINTS.horizontal,
      );

      const minY = (containerRect.top - draggableLayout.top) / currentZoom + CONSTRAINTS.vertical;

      const maxY = Math.max(
        minY,
        (containerRect.bottom - draggableLayout.bottom) / currentZoom - CONSTRAINTS.vertical,
      );
      // #endregion

      const targetX = transform.x / currentZoom;
      const targetY = transform.y / currentZoom;

      return {
        x: Math.min(Math.max(targetX, minX), maxX),
        y: Math.min(Math.max(targetY, minY), maxY),
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
