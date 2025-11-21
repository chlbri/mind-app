import type { inferT } from '@bemedev/app-ts/lib/utils/typings';
import { dequal } from 'dequal';
import { Component, createEffect, onMount } from 'solid-js';
import { produce } from 'solid-js/store';
import type { edgeJSON, nodeJSON } from '../services/main.types';
import EdgesBoard2 from './EdgesBoard2';
import { useFlowContext } from './FlowChart.context';
import { NodesBoard2 } from './NodesBoard2';

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

export const FlowChart2: Component<Props> = props => {
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
    edgesPositions: [, setEdgesPositions],
  } = useFlowContext();

  service.send({
    type: 'CONFIGURE',
    payload: {
      nodes: primaryNodes,
      edges: primaryEdges,
    },
  });

  createEffect(() => {
    console.log('nodes', service.select('context.data.nodes', dequal)());
    console.log('edges', service.select('context.data.edges', dequal)());
  });

  onMount(() => {
    const _edges = service.context(({ data }) => {
      const edges = { ...data?.edges };
      const entries = Object.entries(edges);
      const out2 = entries.map(([id, edge]) => ({
        ...edge,
        id,
      }));
      return out2;
    });
    setEdgesPositions(
      produce(next => {
        const nodes = service.select('context.data.nodes', dequal)();
        _edges().forEach(({ from, id, to }) => {
          const output = dimensions()[from].output;
          const input = dimensions()[to].input;
          if (input)
            next[id] = {
              x0: nodes[from].position.x + output.x,
              y0: nodes[from].position.y + output.y,
              x1: nodes[to].position.x + input.x,
              y1: nodes[to].position.y + input.y,
            };
        });
      }),
    );
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
            console.log('out', '=>', out);
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

            const parentID = edges!.find(
              edge => edge.to === payload,
            )!.from;

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
        if (edge)
          setNewEdge({
            ...edge,
            x1: x,
            y1: y,
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
          <NodesBoard2 />

          <EdgesBoard2 />
        </div>
      </div>
    </div>
  );
};
