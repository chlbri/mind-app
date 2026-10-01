import { FlowMachine } from '@bemedev/mind-machine';
import { createFileRoute } from '@tanstack/solid-router';

import { STORAGE_KEY } from './-settings/constants';
import { DEFAULT_CONFIG } from './-settings/data';

/**
 * Interactive State Machine Showroom route demonstrating `@bemedev/app` graph
 * visualization through the {@linkcode FlowMachine} component.
 */
export const Route = createFileRoute('/machine/')({
  component: () => (
    <div class='relative h-[calc(100vh-64px)] w-[calc(100vw-32px)] overflow-hidden'>
      <FlowMachine history={DEFAULT_CONFIG} localKeys={STORAGE_KEY} />
    </div>
  ),
});
