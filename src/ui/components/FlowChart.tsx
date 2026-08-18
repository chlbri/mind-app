import type { inferT } from '@bemedev/app/typings';
import { Component, onMount } from 'solid-js';
import type { edgeJSON, nodeJSON } from '../../services/main.typings';
import { useFlow } from './FlowChart.context';
import { NodesBoard } from './NodesBoard';
import { DEFAULT_NODES } from './FlowChart.data';

export type NodeProps = inferT<typeof nodeJSON>;

export type EdgeProps = inferT<typeof edgeJSON>;

export type FlowProps = {
  config?: {
    nodes?: (NodeProps & { id: string })[];
    edges?: (EdgeProps & { id: string })[];
  };
  onNodeAdded?: (node: NodeProps) => void;
  onNodeDeleted?: (nodeId: string) => void;
  onEdgeAdded?: (edge: EdgeProps) => void;
  onEdgeDeleted?: (edgeId: string) => void;
};

// const PARENT_CHILD_GAP_WIDTH = 75;

export const FlowChart: Component<FlowProps> = props => {
  const primaryNodes = props.config?.nodes ?? DEFAULT_NODES;
  const primaryEdges = props.config?.edges;

  const {
    service,
    newEdge: [newEdge, setNewEdge],
    getBoardPoint,
  } = useFlow();

  onMount(() => {
    service.send({
      type: 'CONFIGURE',
      payload: { nodes: primaryNodes, edges: primaryEdges ?? [] },
    });
  });

  return (
    <div
      class='relative w-full h-full'
      onMouseUp={() => setNewEdge()}
      onMouseMove={event => {
        const edge = newEdge();
        if (edge) {
          const boardPoint = getBoardPoint(event.clientX, event.clientY);
          setNewEdge({ ...edge, x1: boardPoint.x, y1: boardPoint.y });
        }
      }}
      style={{}}
    >
      <div
        class='relative h-full w-full bg-white bg-size-[30px_30px]'
        style={{
          cursor: newEdge() ? 'inherit' : 'crosshair',
          'background-image':
            'radial-gradient(circle, #b8b8b8bf 1px, rgba(0, 0, 0, 0) 1px)',
        }}
      >
        <NodesBoard />
      </div>
    </div>
  );
};
