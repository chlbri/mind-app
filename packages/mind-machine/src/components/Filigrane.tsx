import { useFlow } from '@bemedev/mind-flow';
import { Show, type Component } from 'solid-js';

import { PRINCIPAL_NODE_KEY } from '../constants';

/**
 * Watermark filigrane rendered repeatedly across the flowchart canvas whenever the
 * principal machine node is configured as atomic or when no other canvas nodes
 * exist.
 *
 * Displays the text "atomic machine" in an italic and oblique repeating pattern.
 */
export const AtomicFiligrane: Component = () => {
  const { hooks } = useFlow();

  const isAtomic = hooks.state({
    selector: ({ context: { data } }) => {
      const nodes = data?.nodes ?? [];
      const principal = nodes.find(
        n => n.id === PRINCIPAL_NODE_KEY || (n.data as any)?.principal,
      );
      const canvasNodes = nodes.filter(
        n => n.id !== PRINCIPAL_NODE_KEY && !(n.data as any)?.principal,
      );
      return principal?.data?.stateType === 'atomic' || canvasNodes.length === 0;
    },
  });

  return (
    <Show when={isAtomic()}>
      <div class='pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden opacity-20 select-none'>
        <svg class='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <pattern
              id='atomic-filigrane-pattern'
              width='300'
              height='140'
              patternUnits='userSpaceOnUse'
              patternTransform='rotate(-25 0 0)'
            >
              <text
                x='20'
                y='80'
                class='fill-zinc-500 text-2xl font-bold italic'
                style={{
                  'font-style': 'italic',
                  'font-family': 'system-ui, sans-serif',
                  'letter-spacing': '0.08em',
                }}
              >
                atomic machine
              </text>
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#atomic-filigrane-pattern)' />
        </svg>
      </div>
    </Show>
  );
};
