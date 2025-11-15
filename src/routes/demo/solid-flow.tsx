import { createFileRoute } from '@tanstack/solid-router';
import { createSignal } from 'solid-js';
import {
  FlowChart,
  NodeProps,
  type EdgeProps,
} from '~/features/flow/ui/components';

export const Route = createFileRoute('/demo/solid-flow')({
  ssr: 'data-only',
  component: () => {
    const initialNodes: NodeProps[] = [
      {
        id: 'node-1',
        position: { x: 50, y: 100 },
        data: {
          content: <p>This is a simple node</p>,
        },
        inputs: 0,
        outputs: 1,
      },
      {
        id: 'node-2',
        position: { x: 350, y: 100 },
        data: {
          label: 'Node with label',
          content: <p>This is a node with a label</p>,
        },
        inputs: 1,
        outputs: 1,
      },
      {
        id: 'node-3',
        position: { x: 350, y: 300 },
        data: {
          label: 'Node with label 2',
          content: <p>This is a node with Alfred a label</p>,
        },
        inputs: 1,
        outputs: 1,
      },
    ];

    const initialEdges: EdgeProps[] = [
      {
        id: 'node-1:node-2',
        sourceNode: 'node-1',
        sourceOutput: 0,
        targetNode: 'node-2',
        targetInput: 0,
      },
    ];

    const [nodes, setNodes] = createSignal(initialNodes);
    const [edges, setEdges] = createSignal(initialEdges);
    return (
      <div class='w-full'>
        <FlowChart
          nodes={nodes()}
          edges={edges()}
          onNodesChange={setNodes}
          onEdgesChange={setEdges}
        />
      </div>
    );
  },
});
