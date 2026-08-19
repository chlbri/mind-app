import { createFileRoute } from '@tanstack/solid-router';
import { Flow } from '@bemedev/mind-flow';

export const Route = createFileRoute('/demo/')({
  component: Flow,
  // ssr: false,
});
