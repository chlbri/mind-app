import type { inferT } from '@bemedev/app-ts/lib/utils/typings';
import { Component, createEffect, onMount } from 'solid-js';
import type { edgeJSON, nodeJSON } from '../services/main.types';
import { EdgesBoard } from './EdgesBoard';
import { useFlowContext } from './FlowChart.context';
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

const PARENT_CHILD_GAP_WIDTH = 75;

export const FlowChart: Component<Props> = props => {
  const DEFAULT_NODES: Record<string, NodeProps> = {
    'node-0': {
      data: {
        content: 'Somme text',
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
    dimensions: [dimensions],
    service,
    newEdge: [newEdge, setNewEdge],
    board: [board],
  } = useFlowContext();

  service.send({
    type: 'CONFIGURE',
    payload: {
      nodes: primaryNodes,
      edges: primaryEdges,
    },
  });

  createEffect(() => {
    // console.log('nodes', service.select('context.data.nodes', dequal)());
    // console.log('edges', edgesPositions());
    // console.log('selected', service.select('context.selected')());
  });

  onMount(() => {
    service.addOptions(({ assign }) => ({
      actions: {
        placeChild: assign('context.data.nodes', {
          ADD_CHILD: ({
            payload,
            context: { data },
            pContext: { nodes },
          }) => {
            const out = { ...data?.nodes };
            const parentNode = out[payload];
            const id = `node-${nodes?.length}`;
            const width = dimensions()[payload].width;

            const x =
              parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;

            out[id] = {
              data: { content: '<Nouveau nœud>' },
              input: true,
              position: { x, y: parentNode.position.y },
            };

            return out;
          },
        }),

        placeSibling: assign('context.data.nodes', {
          ADD_SIBLING: ({
            payload,
            context: { data },
            pContext: { nodes, edges },
          }) => {
            const out = { ...data?.nodes };

            const parentID = edges?.find(
              edge => edge.to === payload,
            )?.from;

            if (!parentID) return out;

            const parentNode = out[parentID];
            const id = `node-${nodes?.length}`;
            const width = dimensions()[parentID].width;

            const x =
              parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;

            out[id] = {
              data: { content: '<Nouveau nœud>' },
              input: true,
              position: { x, y: parentNode.position.y + 100 },
            };

            return out;
          },
        }),
      },
    }));
  });

  // EDGE HANDLERS

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
