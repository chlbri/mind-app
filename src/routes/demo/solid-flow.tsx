import { createFileRoute } from '@tanstack/solid-router';
import { FlowChart } from '~/features/flow/ui/components/FlowChart';

export const Route = createFileRoute('/demo/solid-flow')({
  component: () => {
    return (
      <div class='w-full'>
        <FlowChart />
      </div>
    );
  },
});
