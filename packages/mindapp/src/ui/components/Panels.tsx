import { isDefined } from '@bemedev/app/bemedev';
import { cn } from 'cn';
import { Show, type Component } from 'solid-js';

import type { WithFlow } from '../Flow.context';
import type { FlowPanels } from './FlowChart.types';

/** Properties for the internal {@linkcode Panel} wrapper component. */
type PanelProps = {
  /** Optional component to render inside the panel container. */
  children?: Component<WithFlow>;
  /** CSS class names for positioning and layout. */
  class: string;
} & WithFlow;

/**
 * Overlay slot component rendering an optional panel component with z-index
 * positioning.
 *
 * @param props - Panel properties of type {@linkcode PanelProps}.
 *
 * @returns The rendered panel container element or fallback.
 *
 * @see {@linkcode cn}
 */
const Panel: Component<PanelProps> = props => {
  const exists = isDefined(props.children);
  return (
    <Show when={props.children} keyed>
      {Children => (
        <div class={cn(props.class)} classList={{ 'z-50': exists }}>
          <Children flow={props.flow} />
        </div>
      )}
    </Show>
  );
};

/**
 * Overlay container rendering custom panel slots positioned around the flowchart
 * canvas.
 *
 * @param props - Flow panels layout properties of type {@linkcode FlowPanels} and
 *   {@linkcode WithFlow}.
 *
 * @returns Rendered overlay panels JSX elements.
 */
export const Panels: Component<FlowPanels & WithFlow> = props => {
  return (
    <div class='pointer-events-none absolute inset-0'>
      <Panel
        children={props.topLeft}
        flow={props.flow}
        class='absolute top-4 left-4'
      />
      <Panel
        children={props.topRight}
        flow={props.flow}
        class='absolute top-4 right-4'
      />
      <Panel
        children={props.bottomLeft}
        flow={props.flow}
        class='absolute bottom-4 left-4'
      />
    </div>
  );
};
