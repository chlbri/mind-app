import { createContext, createSignal, useContext } from 'solid-js';
import { buildService } from '../services/main';
import type { Point, Vector } from '../services/main.types';
import { dequal } from 'dequal/lite';

type Dimensions = {
  width: number;
  height: number;
  output: Point;
  input?: Point;
};

type Edge = {
  from: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
};

export const FlowContext = createContext(
  {
    dimensions: createSignal<Record<string, Dimensions>>(
      {},
      {
        equals: dequal,
      },
    ),
    newEdge: createSignal<Edge>(),
    board: createSignal<Point>(),
    edgesPositions: createSignal<Record<string, Vector>>(
      {},
      {
        equals: dequal,
      },
    ),

    service: buildService(),
  },
  { name: 'FlowContext' },
);

export const useFlowContext = () => useContext(FlowContext);
