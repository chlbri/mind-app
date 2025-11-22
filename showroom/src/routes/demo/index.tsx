import { createFileRoute } from '@tanstack/solid-router';
import { FlowChart, Provider } from './-index.context';

export const Route = createFileRoute('/demo/')({
  component: () => {
    return (
      <div class='w-full h-full'>
        <Provider>
          <FlowChart />
        </Provider>
        YUIgoyigyuv
      </div>
    );
  },
});
