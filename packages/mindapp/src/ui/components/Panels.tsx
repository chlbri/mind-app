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
        {Panel => {
          const Component = typeof Panel === 'function' ? <Panel /> : Panel;
          return <div class='absolute top-4 left-4 z-50'>{Component}</div>;
        }}
      </Show>

      {/* Top-Right Panel */}
      <Show when={props.topRight} keyed>
        {Panel => {
          const Component = typeof Panel === 'function' ? <Panel /> : Panel;
          return <div class='absolute top-4 right-4 z-50'>{Component}</div>;
        }}
      </Show>

      {/* Bottom-Left Panel */}
      <Show when={props.bottomLeft} keyed>
        {Panel => {
          const Component = typeof Panel === 'function' ? <Panel /> : Panel;
          return <div class='absolute bottom-4 left-4 z-50'>{Component}</div>;
        }}
      </Show>
    </>
  );
};
