import { createContext, createSignal, useContext } from 'solid-js';
import { buildService } from '../services/main';
import type { Point } from '../services/main.types';
import { dequal } from 'dequal/lite';

type Dimensions = {
  width: number;
  height: number;
  id: string;
  output: Point;
  input?: Point;
};

export const FlowContext = createContext(
  {
    dimensions: createSignal<Record<string, Dimensions>>(
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
