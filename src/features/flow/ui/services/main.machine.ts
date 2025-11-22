import { createMachine, typings } from '@bemedev/app-ts';
import { SCHEMAS } from './main.machine.gen';
import { edgeJSON, extremities, nodeJSON, point } from './main.types';
import { nanoid } from 'nanoid';

export const buildEdgeId = (out: string, _in: string) => {
  return `edge = ${out} => ${_in}`;
};

export const buildNodeID = (generated: string | null) => {
  return `node-${generated}`;
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
        on: {
          MOVE: {
            actions: ['moveNode', 'buildArrays', 'buildUI'],
          },
          MOVE_IMMEDIATE: {
            actions: [
              {
                name: 'buildImmediateUI',
                description: 'Must be in the ui',
              },
            ],
          },

          ADD_CHILD: {
            actions: [
              'generateID',
              { name: 'placeChild', description: 'Must be in the ui' },
              'linkChild',
              'buildArrays',
              'buildUI',
            ],
          },

          ADD_SIBLING: {
            actions: [
              'generateID',
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
      MOVE_IMMEDIATE: typings.intersection(
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
    pContext: {
      nodes: typings.maybe(
        typings.array(typings.intersection(nodeJSON, { id: 'string' })),
      ),
      edges: typings.maybe(
        typings.array(typings.intersection(edgeJSON, { id: 'string' })),
      ),
      generatedId: typings.union('string', 'null'),
    },
    context: typings.partial({
      data: {
        nodes: typings.record(nodeJSON),
        edges: typings.record(edgeJSON),
      },
      selected: 'string',
      updatingUI: 'boolean',
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
      assign('context.updatingUI', () => false),
      assign('pContext.generatedId', () => null),
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
      assign('pContext.generatedId', () => null),
    ),

    generateID: assign('pContext.generatedId', () => nanoid()),

    linkChild: batch(
      assign('context.data.edges', {
        ADD_CHILD: ({
          context: { data },
          payload,
          pContext: { generatedId },
        }) => {
          const out = { ...data?.edges };
          const nodeID = buildNodeID(generatedId);
          const id = buildEdgeId(payload, nodeID);

          out[id] = {
            from: payload,
            to: nodeID,
          };

          return out;
        },
      }),
      assign('context.selected', ({ pContext: { generatedId } }) =>
        buildNodeID(generatedId),
      ),
    ),

    linkSibling: batch(
      assign('context.data.edges', {
        ADD_SIBLING: ({
          context: { data },
          payload,
          pContext: { edges, generatedId },
        }) => {
          const out = { ...data?.edges };
          const from = edges?.find(({ to }) => to === payload)?.from;
          if (!from) return out;
          const nodeID = buildNodeID(generatedId);
          const id = buildEdgeId(from, nodeID);

          out[id] = {
            from,
            to: nodeID,
          };

          return out;
        },
      }),
      assign('context.selected', ({ pContext: { generatedId } }) =>
        buildNodeID(generatedId),
      ),
    ),

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
          console.log('Deleting node with ID:', payload);

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
