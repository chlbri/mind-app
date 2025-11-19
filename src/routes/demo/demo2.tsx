import { createFileRoute } from '@tanstack/solid-router';
import { FlowChart } from '~/features/flow/ui/components/Flow';

export const Route = createFileRoute('/demo/demo2')({
  component: () => {
    return (
      <div class='w-full'>
        <FlowChart />
      </div>
    );
  },
});
