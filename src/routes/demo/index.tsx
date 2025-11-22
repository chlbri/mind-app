import { createFileRoute } from '@tanstack/solid-router';
import { FlowChart } from '~/features/flow/ui/components/FlowChart';
import { Provider } from '~/features/flow/ui/components/FlowChart.context';

export const Route = createFileRoute('/demo/')({
  component: () => {
    return (
      <div class='w-full'>
        <Provider>
          <FlowChart />
        </Provider>
      </div>
    );
  },
});
