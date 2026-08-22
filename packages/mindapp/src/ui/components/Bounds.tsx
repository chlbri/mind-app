import { useState } from '@bemedev/app-solidjs';
import { useDragDropContext, type Transformer } from '@thisbeyond/solid-dnd';
import { type Component } from 'solid-js';

import { BOUNDS_CONSTRAINTS } from '#services/main.machine.data';

import { useFlow } from './FlowChart.context';

/**
 * Drag boundary transformer component that clamps draggable nodes within container
 * scroll bounds.
 *
 * @returns `null` as this component performs side-effect transformer registrations
 *   only.
 *
 * @see {@linkcode useFlow}, {@linkcode BOUNDS_CONSTRAINTS}
 */
export const DragBounds: Component = () => {
  const {
    board: [ref],
    service,
  } = useFlow();

  const zoom = useState(service, { selector: s => s.context.zoom ?? 1 });

  const [state, { addTransformer, removeTransformer, onDragStart, onDragEnd }] =
    useDragDropContext()!;

  const transformer: Transformer = {
    id: 'clamp-to-container',
    order: 100,
    callback: transform => {
      const container = ref();
      const activeDraggable = state.active.draggable;
      if (!container || !activeDraggable) return transform;

      const node = activeDraggable.node as HTMLElement;
      if (!node) return transform;

      const currentZoom = zoom();

      // #region Board space boundaries (unscaled CSS pixels relative to board container)
      const minBoardX = BOUNDS_CONSTRAINTS.horizontal;
      const maxBoardX = Math.max(
        minBoardX,
        container.clientWidth / currentZoom -
          node.offsetWidth -
          BOUNDS_CONSTRAINTS.horizontal,
      );

      const minBoardY = BOUNDS_CONSTRAINTS.vertical;
      const maxBoardY = Math.max(
        minBoardY,
        container.clientHeight / currentZoom -
          node.offsetHeight -
          BOUNDS_CONSTRAINTS.vertical,
      );
      // #endregion

      // #region Convert board boundaries to transformer delta space (in screen pixels)
      const minTransformX = (minBoardX - node.offsetLeft) * currentZoom;
      const maxTransformX = (maxBoardX - node.offsetLeft) * currentZoom;

      const minTransformY = (minBoardY - node.offsetTop) * currentZoom;
      const maxTransformY = (maxBoardY - node.offsetTop) * currentZoom;
      // #endregion

      return {
        x: Math.min(Math.max(transform.x, minTransformX), maxTransformX),
        y: Math.min(Math.max(transform.y, minTransformY), maxTransformY),
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
