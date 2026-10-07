import { createContext } from '@bemedev/mind-flow-fabric';
import { createFileRoute } from '@tanstack/solid-router';

import {
  ShowroomControls,
  ShowroomEditPanel,
  ShowroomEdgeFabric,
  ShowroomNodeFabric,
} from './-simple.components';
import { INITIAL_EDGES, INITIAL_NODES } from './-simple.data';
import type { ShowroomData, ShowroomEdgeData } from './-simple.types';

const [, Flow] = createContext();

/** Interactive flowchart demonstration route rendered with fabric.js. */
export const Route = createFileRoute('/fabric/simple')({
  component: () => (
    <div class='h-[calc(100vh-64px)] w-[calc(100vw-32px)]'>
      <Flow<ShowroomData, ShowroomEdgeData>
        delay={1_000}
        config={{ nodes: INITIAL_NODES, edges: INITIAL_EDGES }}
        Node={ShowroomNodeFabric}
        Edge={ShowroomEdgeFabric}
        panels={{ topLeft: ShowroomEditPanel, bottomLeft: ShowroomControls }}
        defaultData={{
          title: 'New Node',
          content: 'Double-click a node to edit its data.',
          priority: 1,
        }}
      />
    </div>
  ),
});
