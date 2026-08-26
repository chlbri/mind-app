import { Flow } from '@bemedev/mind-flow';
import { createFileRoute } from '@tanstack/solid-router';

import { ShowroomEditPanel, ShowroomNode } from './-index.components';
import { INITIAL_EDGES, INITIAL_NODES } from './-index.data';
import type { ShowroomData } from './-index.types';

/** Interactive Mind Flow chart demonstration route. */
export const Route = createFileRoute('/demo/')({
  component: () => (
    <Flow<ShowroomData>
      config={{ nodes: INITIAL_NODES, edges: INITIAL_EDGES }}
      defaultData={{
        title: 'New Node',
        content: 'Edit this description in the top-left panel.',
        priority: 1,
      }}
      nodeComponent={ShowroomNode}
      panels={{ topLeft: <ShowroomEditPanel /> }}
    />
  ),
  ssr: 'data-only',
});
