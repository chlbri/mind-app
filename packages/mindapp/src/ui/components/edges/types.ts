import type { Accessor, Component } from 'solid-js';

import type { Data, Vector } from '#services/main.machine.typings';

/** Properties for rendering an SVG connection edge between two points. */
export type EdgeProps<D extends Data = Data> = {
  /** Unique identifier of the edge. */
  id: string;
  /** Whether this is a temporary edge currently being dragged. */
  isNew?: boolean;
  data?: D;
  middle?: Component<{
    vector: Accessor<Vector | undefined>;
    id: string;
    data?: D;
    selected?: Accessor<boolean>;
  }>;
  stroke?: string;
  strokeDasharray?: string;
};
