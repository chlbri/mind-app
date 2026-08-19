import { createFileRoute } from '@tanstack/solid-router';
import { Flow } from '@bemedev/mind-flow';

/** Interactive Mind Flow chart demonstration route. */
export const Route = createFileRoute('/demo/')({
  component: Flow,
  beforeLoad: () => {
    console.log('WORK FINE !!!');
  },
});
