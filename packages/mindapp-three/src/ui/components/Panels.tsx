import type { JSX } from 'solid-js';

import type { WithFlow } from '../Flow.context';
import type { FlowPanels } from './Scene.types';

/**
 * HTML overlay panels positioned around the 3D canvas, rendered above the WebGL
 * layer while keeping the canvas interactive.
 *
 * @param props - Flow value and panel slots of type `WithFlow & { panels }`.
 *
 * @returns The rendered Solid component.
 */
export const Panels = (props: WithFlow & { panels?: FlowPanels }): JSX.Element => {
  return (
    <div class='pointer-events-none absolute inset-0 z-10'>
      {props.panels?.topLeft && (
        <div class='pointer-events-all absolute top-4 left-4'>
          <props.panels.topLeft flow={props.flow} />
        </div>
      )}

      {props.panels?.topRight && (
        <div class='pointer-events-all absolute top-4 right-4'>
          <props.panels.topRight flow={props.flow} />
        </div>
      )}

      {props.panels?.bottomLeft && (
        <div class='pointer-events-all absolute bottom-4 left-4'>
          <props.panels.bottomLeft flow={props.flow} />
        </div>
      )}
    </div>
  );
};
