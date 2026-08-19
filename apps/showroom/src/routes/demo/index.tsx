import { Flow } from '@bemedev/mind-flow';
import { createFileRoute } from '@tanstack/solid-router';

/** Interactive Mind Flow chart demonstration route. */
export const Route = createFileRoute('/demo/')({
  component: Flow,
  beforeLoad: () => {
    console.log('WORK FINE !!!');
  },
});
