import { createFileRoute } from '@tanstack/solid-router';
import { FlowChart } from '~/features/flow/ui/components/FlowChart';
import { FlowContext } from '~/features/flow/ui/components/FlowChart.context';

export const Route = createFileRoute('/demo/')({
  component: () => {
    return (
      <div class='w-full'>
        <FlowContext.Provider value={FlowContext.defaultValue}>
          <FlowChart />
        </FlowContext.Provider>
      </div>
    );
  },
});
