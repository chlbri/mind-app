import { createFileRoute } from '@tanstack/solid-router';
import { createSignal } from 'solid-js';
import {
  FlowChart,
  NodeProps,
  type EdgeProps,
} from '~/features/flow/ui/components';
import { MultiText } from '~/globals/ui/molecules';

export const Route = createFileRoute('/demo/solid-flow')({
  ssr: 'data-only',
  component: () => {
    const initialNodes: NodeProps[] = [
      {
        id: 'node-1',
        position: { x: 350, y: 100 },
        data: {
          label: 'Root node',
          content: (
            <MultiText
              texts={['This is a ', 'node', ' with a label']}
              props={{
                1: {
                  class: 'text-red-400',
                },
              }}
            />
          ),
        },
        inputs: 0,
        outputs: 1,
      },
    ];

    const [nodes, setNodes] = createSignal(initialNodes);
    const [edges, setEdges] = createSignal<EdgeProps[]>([]);
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
