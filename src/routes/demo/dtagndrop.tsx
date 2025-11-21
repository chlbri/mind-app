import { createFileRoute } from '@tanstack/solid-router';
import {
  createDraggable,
  DragDropProvider,
  DragDropSensors,
  DragOverlay,
} from '@thisbeyond/solid-dnd';
import type { Component } from 'solid-js';

type Props = {
  id: string | number;
  top: number;
  left: number;
};

const Draggable: Component<Props> = props => {
  const draggable = createDraggable(props.id);
  return (
    <div
      use:draggable
      class='bg-blue-300 px-4 py-2 rounded-lg absolute'
      classList={{ 'opacity-10': draggable.isActiveDraggable }}
      style={{ top: props.top + 'px', left: props.left + 'px' }}
    >
      Draggable {props.id}
    </div>
  );
};

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
          node.style.setProperty(
            'top',
            node.offsetTop + transform.y + 'px',
          );
          node.style.setProperty(
            'left',
            node.offsetLeft + transform.x + 'px',
          );
        }}
      >
        <DragDropSensors />
        <div class='min-h-15 w-full h-full relative'>
          <Draggable id={1} top={30} left={350} />
          <Draggable id={2} top={70} left={125} />
        </div>
        <DragOverlay>
          {draggable => (
            <div class='bg-blue-300 px-4 py-2 rounded-lg'>
              Draggable {draggable?.id}
            </div>
          )}
        </DragOverlay>
      </DragDropProvider>
    );
  },
});
