/* eslint-disable @typescript-eslint/no-namespace */
import { createFileRoute } from '@tanstack/solid-router';
import {
  createDraggable,
  DragDropProvider,
  DragDropSensors,
  DragOverlay,
} from '@thisbeyond/solid-dnd';
import type { Component } from 'solid-js';

/** Props for the {@linkcode Draggable} demonstration component. */
type Props = {
  /** Identifier for the draggable item. */
  id: string | number;
  /** Top offset position in pixels. */
  top: number;
  /** Left offset position in pixels. */
  left: number;
};

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      // use:model
      draggable: any;
    }
  }
}

/** Draggable box demo item component. */
const Draggable: Component<Props> = props => {
  const draggable = createDraggable(props.id);
  return (
    <div
      use:draggable
      class='absolute cursor-crosshair rounded-lg bg-blue-300 px-4 py-2'
      classList={{
        'opacity-10 ring-2 ring-purple-500': draggable.isActiveDraggable,
      }}
      style={{ top: props.top + 'px', left: props.left + 'px' }}
    >
      Draggable {props.id}
    </div>
  );
};

/** Drag and drop demonstration route showcasing `@thisbeyond/solid-dnd`. */
export const Route = createFileRoute('/demo/dtagndrop')({
  component: () => {
    let transform = { x: 0, y: 0 };

    return (
      <DragDropProvider
        onDragMove={({ overlay }) => {
          if (overlay) {
            transform = { ...overlay.transform };
          }
        }}
        onDragEnd={({ draggable }) => {
          const node = draggable.node;
          node.style.setProperty('top', node.offsetTop + transform.y + 'px');
          node.style.setProperty('left', node.offsetLeft + transform.x + 'px');
        }}
      >
        <DragDropSensors />
        <div class='relative h-full min-h-15 w-full'>
          <Draggable id={1} top={30} left={350} />
          <Draggable id={2} top={70} left={125} />
        </div>
        <DragOverlay>
          {draggable => (
            <div class='rounded-lg bg-blue-300 px-4 py-2'>
              Draggable {draggable?.id}
            </div>
          )}
        </DragOverlay>
      </DragDropProvider>
    );
  },
});
