import { Component, createEffect, createSignal, For } from 'solid-js';
import type { EdgeVector } from '../../services/main.types';
import EdgeComponent from './EdgeComponent.old';

interface Vector {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface EdgesPositions {
  [id: string]: Vector;
}

interface EdgesActive {
  [id: string]: boolean;
}

type Props = {
  newEdge?: EdgeVector;
  edgesActives: EdgesActive;
  edgesPositions: EdgesPositions;
  onDeleteEdge: (edgeId: string) => void;
};

const EdgesBoard: Component<Props> = props => {
  const [ids, setIds] = createSignal<string[]>([]);
  const [selected, setSelected] = createSignal<string>();

  createEffect(() => {
    const newIds = Object.keys(props.edgesActives).filter(
      elem => props.edgesActives[elem],
    );
    setIds(newIds);
  });

  return (
    <svg class='pointer-events-none absolute top-0 w-full h-full'>
      {props.newEdge && (
        <EdgeComponent
          id='__#new-edge#__TEMP'
          isNew={true}
          x0={props.newEdge.x0}
          y0={props.newEdge.y0}
          x1={props.newEdge.x1}
          y1={props.newEdge.y1}
          onClickDelete={() => {}}
          onClickEdge={() => {}}
          onClickOutside={() => {}}
        />
      )}
      <For each={ids()}>
        {edgeId => {
          return (
            <EdgeComponent
              id={edgeId}
              isNew={false}
              x0={props.edgesPositions[edgeId]?.x0 || 0}
              y0={props.edgesPositions[edgeId]?.y0 || 0}
              x1={props.edgesPositions[edgeId]?.x1 || 0}
              y1={props.edgesPositions[edgeId]?.y1 || 0}
              onClickDelete={() => {
                props.onDeleteEdge(edgeId);
              }}
              onClickEdge={() => {
                setSelected(edgeId);
              }}
              onClickOutside={() => {
                if (selected() === edgeId) setSelected();
              }}
            />
          );
        }}
      </For>
    </svg>
  );
};

export default EdgesBoard;
