import { useDragDropContext, type Transformer } from "@thisbeyond/solid-dnd";
import { type Component } from "solid-js";
import { BOUNDS_CONSTRAINTS } from "./FlowChart.data";
import { useFlow } from "./FlowChart.context";

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
      const draggableLayout = activeDraggable.layout;

      // #region Inner visible boundaries (excluding borders and scrollbars)
      const containerRect = container.getBoundingClientRect();
      const innerLeft = containerRect.left + container.clientLeft;
      const innerTop = containerRect.top + container.clientTop;
      const innerRight = innerLeft + container.clientWidth;
      const innerBottom = innerTop + container.clientHeight;
      // #endregion

      // #region Convert boundaries to board coordinate space
      const currentZoom = zoom();
      const minX = innerLeft - draggableLayout.left + BOUNDS_CONSTRAINTS.horizontal * currentZoom;

      const maxX = Math.max(
        minX,
        innerRight - draggableLayout.right - BOUNDS_CONSTRAINTS.horizontal * currentZoom,
      );

      const minY = innerTop - draggableLayout.top + BOUNDS_CONSTRAINTS.vertical * currentZoom;

      const maxY = Math.max(
        minY,
        innerBottom - draggableLayout.bottom - BOUNDS_CONSTRAINTS.vertical * currentZoom,
      );
      // #endregion

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
