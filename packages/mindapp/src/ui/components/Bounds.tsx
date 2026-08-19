import {
  useDragDropContext,
  type Transformer,
} from '@thisbeyond/solid-dnd';
import { type Component } from 'solid-js';
import { BOUNDS_CONSTRAINTS } from './FlowChart.data';
import { useFlow } from './FlowChart.context';

/**
 * Drag boundary transformer component that clamps draggable nodes within
 * container scroll bounds.
 *
 * @returns `null` as this component performs side-effect transformer
 *   registrations only.
 */
export const DragBounds: Component = () => {
  const {
    board: [ref],
    zoom: [zoom],
  } = useFlow();

  const [
    state,
    { addTransformer, removeTransformer, onDragStart, onDragEnd },
  ] = useDragDropContext()!;

  const transformer: Transformer = {
    id: 'clamp-to-container',
    order: 100,
    callback: transform => {
      const container = ref();
      const activeDraggable = state.active.draggable;
      if (!container || !activeDraggable) return transform;
      const draggableLayout = activeDraggable.layout;
      const currentZoom = zoom();

      // #region Inner visible boundaries (excluding borders and scrollbars)
      const containerRect = container.getBoundingClientRect();
      const innerLeft = container.offsetLeft + containerRect.left;
      const innerTop = container.offsetTop + containerRect.top;
      const innerRight = innerLeft + container.clientWidth;
      const innerBottom = innerTop + container.clientHeight;
      // #endregion

      // #region Convert boundaries to board coordinate space
      const minX =
        innerLeft -
        draggableLayout.left +
        BOUNDS_CONSTRAINTS.horizontal * currentZoom;

      const maxX = Math.max(
        minX,
        innerRight -
          draggableLayout.width / currentZoom -
          BOUNDS_CONSTRAINTS.horizontal * currentZoom,
      );

      const minY =
        innerTop -
        draggableLayout.top +
        BOUNDS_CONSTRAINTS.vertical * currentZoom;

      const maxY = Math.max(
        minY,
        innerBottom -
          draggableLayout.height / currentZoom -
          BOUNDS_CONSTRAINTS.vertical * currentZoom,
      );
      // #endregion

      return {
        x: Math.min(Math.max(transform.x, minX), maxX),
        y: Math.min(Math.max(transform.y, minY), maxY),
      };
    },
  };

  onDragStart(({ draggable }) => {
    addTransformer('draggables', draggable.id, transformer);
  });

  onDragEnd(({ draggable }) => {
    removeTransformer('draggables', draggable.id, transformer.id);
  });

  return null;
};
