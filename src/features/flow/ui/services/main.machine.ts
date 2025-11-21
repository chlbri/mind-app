import { createMachine, typings } from '@bemedev/app-ts';
import { SCHEMAS } from './main.machine.gen';
import { edgeJSON, extremities, nodeJSON, point } from './main.types';

export const buildEdgeId = (out: string, _in: string) => {
  return `edge = ${out} => ${_in}`;
};

export const machine = createMachine(
  {
    __tsSchema: SCHEMAS.machine.__tsSchema,
    initial: 'idle',
    states: {
      idle: {
        on: {
          CONFIGURE: {
            actions: ['configure'],
            target: '/working',
          },
          CONFIGURE_EMPTY: '/working',
        },
      },

      working: {
        exit: ['buildArrays'],
        on: {
          MOVE: {
            actions: ['moveNode', 'buildArrays', 'buildUI'],
          },

          ADD_CHILD: {
            actions: [
              { name: 'placeChild', description: 'Must be in the ui' },
              'linkChild',
              'buildArrays',
              'buildUI',
            ],
          },

          ADD_SIBLING: {
            actions: [
              { name: 'placeSibling', description: 'Must be in the ui' },
              'linkSibling',
              'buildArrays',
              'buildUI',
            ],
          },

          ADD_EDGE: {
            actions: ['addEdge', 'buildArrays', 'buildUI'],
          },

          DELETE: {
            actions: ['delete', 'buildArrays', 'buildUI'],
          },

          SELECT: {
            actions: ['select'],
          },

          DESELECT: {
            actions: ['deselect'],
          },
        },
      },
    },
  },
  typings({
    eventsMap: {
      CONFIGURE: {
        nodes: typings.record(nodeJSON),
        edges: typings.record(edgeJSON),
      },
      CONFIGURE_EMPTY: 'primitive',
      MOVE: typings.intersection(
        {
          id: 'string',
        },
        point,
      ),
      ADD_CHILD: 'string',
      ADD_SIBLING: 'string',
      DELETE: 'string',
      SELECT: 'string',
      DESELECT: 'primitive',
      ADD_EDGE: extremities,
    },
    pContext: typings.partial({
      nodes: typings.array(
        typings.intersection(nodeJSON, { id: 'string' }),
      ),
      edges: typings.array(
        typings.intersection(edgeJSON, { id: 'string' }),
      ),
    }),
    context: typings.partial({
      data: {
        nodes: typings.record(nodeJSON),
        edges: typings.record(edgeJSON),
      },
      selected: 'string',
    }),
  }),
).provideOptions(({ assign, batch }) => ({
  actions: {
    configure: batch(
      assign('context.data', () => ({})),
      assign('context.data.nodes', {
        CONFIGURE: ({ payload: { nodes } }) => nodes,
      }),

      assign('context.data.edges', {
        CONFIGURE: ({ payload: { edges } }) => edges,
      }),
    ),

    buildArrays: batch(
      assign('pContext.nodes', ({ context: { data } }) => {
        return Object.entries({ ...data?.nodes }).map(([id, node]) => ({
          ...node,
          id,
        }));
      }),
      assign('pContext.edges', ({ context: { data } }) => {
        return Object.entries({ ...data?.edges }).map(([id, edge]) => ({
          ...edge,
          id,
        }));
      }),
    ),

    linkChild: assign('context.data.edges', {
      ADD_CHILD: ({ context: { data }, payload, pContext: { nodes } }) => {
        const out = { ...data?.edges };
        const id = buildEdgeId(payload, `node-${nodes?.length}`);

        out[id] = {
          from: payload,
          to: `node-${nodes?.length}`,
        };

        return out;
      },
    }),

    linkSibling: assign('context.data.edges', {
      ADD_SIBLING: ({
        context: { data },
        payload,
        pContext: { nodes, edges },
      }) => {
        const out = { ...data?.edges };
        const from = edges?.find(({ to }) => to === payload)?.from;
        if (!from) return out;
        const id = buildEdgeId(from, `node-${nodes?.length}`);

        out[id] = {
          from,
          to: `node-${nodes?.length}`,
        };

        return out;
      },
    }),

    moveNode: assign('context.data.nodes', {
      MOVE: ({ context: { data }, payload: { id, x, y } }) => {
        const out = { ...data?.nodes };
        out[id] = {
          ...out[id],
          position: { x, y },
        };
        return out;
      },
    }),

    select: assign('context.selected', {
      SELECT: ({ payload }) => payload,
    }),

    delete: batch(
      assign('context.data.nodes', {
        DELETE: ({ context: { data }, payload }) => {
          const out = { ...data?.nodes };
          console.log('Nodes before deletion:', out);

          const out2 = Object.fromEntries(
            Object.entries(out).filter(([id]) => id !== payload),
          );

          console.log('Nodes after deletion:', out2);
          return out2;
        },
      }),

      assign('context.data.edges', {
        DELETE: ({ context: { data }, payload }) => {
          const out = { ...data?.edges };
          console.log('Edges before deletion:', out);

          const entries = Object.entries(out).filter(([id, edge]) => {
            const check =
              id === payload ||
              edge.from === payload ||
              edge.to === payload;

            return !check;
          });

          const out2 = Object.fromEntries(entries);
          console.log('Edges after deletion:', out2);
          return out2;
        },
      }),
    ),

    addEdge: assign('context.data.edges', {
      ADD_EDGE: ({ context: { data }, payload: { from, to } }) => {
        const out = { ...data?.edges };
        const id = buildEdgeId(from, to);

        out[id] = { from, to };
        return out;
      },
    }),

    deselect: assign('context', ({ context: { data } }) => ({
      data,
    })),
  },
}));
