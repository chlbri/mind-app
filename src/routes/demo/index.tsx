import { createFileRoute } from '@tanstack/solid-router';
import { FlowChart, Provider } from '~/lib';

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
