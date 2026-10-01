import { Hook } from '@bemedev/mind-flow';
import { createContext } from '@bemedev/mind-machine';
import { createFileRoute } from '@tanstack/solid-router';
import { onMount } from 'solid-js';

import { DEFAULT_CONFIG } from './-settings/data';
import { createHistoryPersister, readStoredPayload } from './-settings/persist';

const [useFlow, FlowMachine] = createContext();

/** Persists the flow history on each registered commit. */
const register = createHistoryPersister();

/**
 * Interactive State Machine Showroom route demonstrating `@bemedev/app` graph
 * visualization through the {@linkcode FlowMachine} component.
 *
 * The persisted history is retrieved here — the library no longer handles storage —
 * and written back through the `register` callback.
 */
export const Route = createFileRoute('/machine/')({
  component: () => {
    const stored = readStoredPayload();

    return (
      <div class='relative h-[calc(100vh-64px)] w-[calc(100vw-32px)] overflow-hidden'>
        <FlowMachine history={stored ?? DEFAULT_CONFIG} register={register}>
          <Hook>
            {() => {
              const { send } = useFlow();

              onMount(() => {
                if (stored) {
                  send({ type: 'BUILD_HISTORY', payload: stored });
                }
              });
            }}
          </Hook>
        </FlowMachine>
      </div>
    );
  },
});
