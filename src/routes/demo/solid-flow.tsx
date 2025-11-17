import { createFileRoute } from '@tanstack/solid-router';
import { FlowChart } from '~/features/flow/ui/components/FlowChart';
import { MultiText } from '~/globals/ui/molecules';

export const Route = createFileRoute('/demo/solid-flow')({
  component: () => {
    return (
      <div class='w-full'>
        <FlowChart
          config={{
            nodes: [
              {
                id: 'node-1',
                position: { x: 350, y: 100 },
                data: {
                  label: 'Root node',
                  content: (
                    <MultiText
                      texts={['This is a ', 'red node', ' with a label']}
                      props={{
                        1: {
                          class: 'text-red-400 font-semibold text-lg',
                        },
                      }}
                    />
                  ),
                },
                inputs: 0,
                outputs: 1,
              },
            ],
          }}
        />
      </div>
    );
  },
});
