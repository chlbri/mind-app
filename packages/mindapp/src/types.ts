import type { JSX } from 'solid-js';

/** Overlay panel slots positioned around the flowchart canvas. */
export type FlowPanels = {
  /** Top-left corner overlay panel slot. */
  topLeft?: JSX.Element;
  /** Top-right corner overlay panel slot. */
  topRight?: JSX.Element;
  /** Bottom-left corner overlay panel slot. */
  bottomLeft?: JSX.Element;
};
