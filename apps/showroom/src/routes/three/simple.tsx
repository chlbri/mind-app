import { createContext } from '@bemedev/mind-flow-three';
import { createFileRoute } from '@tanstack/solid-router';

import {
  ShowroomControls,
  ShowroomEditPanel,
  ShowroomEdge3D,
  ShowroomNode3D,
} from './-simple.components';
import { INITIAL_EDGES, INITIAL_NODES } from './-simple.data';
import type { ShowroomData, ShowroomEdgeData } from './-simple.types';

const [, Flow] = createContext();

/** Interactive 2D mindmap demonstration route, rendered with three.js. */
export const Route = createFileRoute('/three/simple')({
  component: () => (
    <div class='h-[calc(100vh-64px)] w-[calc(100vw-32px)]'>
      <Flow<ShowroomData, ShowroomEdgeData>
        delay={1_000}
        dimensions={2}
        cameraPosition={{ x: 0, y: 0, z: 45 }}
        config={{ nodes: INITIAL_NODES, edges: INITIAL_EDGES }}
        Node={ShowroomNode3D}
        Edge={ShowroomEdge3D}
        panels={{ topLeft: ShowroomEditPanel, bottomLeft: ShowroomControls }}
        defaultData={{
          title: 'New Node',
          content: 'Edit this description in the top-left panel.',
          priority: 1,
        }}
      />
    </div>
  ),
});
