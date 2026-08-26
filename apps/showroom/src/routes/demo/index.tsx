import { Flow } from '@bemedev/mind-flow';
import { createFileRoute } from '@tanstack/solid-router';

import { ShowroomEditPanel, ShowroomNode } from './-index.components';
import { INITIAL_EDGES, INITIAL_NODES } from './-index.data';
import type { ShowroomData } from './-index.types';

/** Interactive Mind Flow chart demonstration route. */
export const Route = createFileRoute('/demo/')({
  component: () => (
    <div class='h-[calc(100vh-64px)] w-[calc(100vw-32px)]'>
      <Flow<ShowroomData>
        delay={1_000}
        config={{ nodes: INITIAL_NODES, edges: INITIAL_EDGES }}
        defaultData={{
          title: 'New Node',
          content: 'Edit this description in the top-left panel.',
          priority: 1,
        }}
        component={ShowroomNode}
        panels={{ topLeft: <ShowroomEditPanel /> }}
      />
    </div>
  ),
});
