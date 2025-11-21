import { createFileRoute } from '@tanstack/solid-router';
import { FlowContext } from '~/features/flow/ui/components/FlowChart.context';
import { FlowChart2 } from '~/features/flow/ui/components/FlowChart2';

export const Route = createFileRoute('/demo/demo2')({
  component: () => {
    return (
      <div class='w-full'>
        <FlowContext.Provider value={FlowContext.defaultValue}>
          <FlowChart2 />
        </FlowContext.Provider>
      </div>
    );
  },
});
