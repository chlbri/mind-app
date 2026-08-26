import { Show, type Component } from 'solid-js';

import type { FlowPanels } from './FlowChart.types';

/**
 * Overlay container rendering custom panel slots positioned around the flowchart
 * canvas.
 *
 * @param props - Flow panels layout properties of type {@linkcode FlowPanels}.
 *
 * @returns Rendered overlay panels JSX elements.
 */
export const Panels: Component<FlowPanels> = props => {
  return (
    <>
      <Show when={props.topLeft} keyed>
        {Panel => <div class='absolute top-4 left-4 z-50'>{<Panel />}</div>}
      </Show>

      {/* Top-Right Panel */}
      <Show when={props.topRight} keyed>
        {Panel => <div class='absolute top-4 right-4 z-50'>{<Panel />}</div>}
      </Show>

      {/* Bottom-Left Panel */}
      <Show when={props.bottomLeft} keyed>
        {Panel => <div class='absolute bottom-4 left-4 z-50'>{<Panel />}</div>}
      </Show>
    </>
  );
};
