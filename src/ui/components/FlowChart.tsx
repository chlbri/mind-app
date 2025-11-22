import type { inferT } from '@bemedev/app-ts/lib/utils/typings';
import { Component } from 'solid-js';
import type { edgeJSON, nodeJSON } from '../../services/main.types';
import { EdgesBoard } from './EdgesBoard';
import { useFlow } from './FlowChart.context';
import { NodesBoard } from './NodesBoard';

export type NodeProps = inferT<typeof nodeJSON>;

export type EdgeProps = inferT<typeof edgeJSON>;

interface Props {
  config?: {
    nodes?: Record<string, NodeProps>;
    edges?: Record<string, EdgeProps>;
  };
  onNodeAdded?: (node: NodeProps) => void;
  onNodeDeleted?: (nodeId: string) => void;
  onEdgeAdded?: (edge: EdgeProps) => void;
  onEdgeDeleted?: (edgeId: string) => void;
}

// const PARENT_CHILD_GAP_WIDTH = 75;

export const FlowChart: Component<Props> = props => {
  const DEFAULT_NODES: Record<string, NodeProps> = {
    'node-0': {
      data: {
        content: 'Some text',
        label: 'Root node',
      },
      input: false,
      position: {
        x: 350,
        y: 100,
      },
    },
  };

  const primaryNodes = props.config?.nodes ?? DEFAULT_NODES;
  const primaryEdges = { ...props.config?.edges };

  const {
    service,
    newEdge: [newEdge, setNewEdge],
    board: [board],
  } = useFlow();

  service.send({
    type: 'CONFIGURE',
    payload: {
      nodes: primaryNodes,
      edges: primaryEdges,
    },
  });

  return (
    <div
      class='relative w-full h-full overflow-hidden'
      onMouseUp={() => {
        setNewEdge();
      }}
      onMouseMove={({ x, y }) => {
        const edge = newEdge();
        const _board = board();
        if (edge && _board)
          setNewEdge({
            ...edge,
            x1: x - _board.x,
            y1: y - _board.y,
          });
      }}
    >
      <div class='w-full h-full overflow-scroll'>
        <div
          class='relative h-[150vh] w-[2160px] bg-white bg-size-[30px_30px]'
          style={{
            cursor: newEdge() ? 'inherit' : 'crosshair',
            'background-image':
              'radial-gradient(circle, #b8b8b8bf 1px, rgba(0, 0, 0, 0) 1px)',
          }}
        >
          <NodesBoard />

          <EdgesBoard />
        </div>
      </div>
    </div>
  );
};
