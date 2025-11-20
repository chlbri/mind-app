import { createContext, createSignal } from 'solid-js';
import type { EdgeJSON, NodeJSON, Point } from './types';

type Dimensions = Point & {
  width: number;
  height: number;
};

export const FlowContext = createContext(
  {
    dimensions: createSignal<Record<string, Dimensions>>({}),
    nodes: createSignal<Record<string, NodeJSON>>({}),
    edges: createSignal<Record<string, EdgeJSON>>({}),
  },
  {
    name: 'FlowContext',
  },
);
