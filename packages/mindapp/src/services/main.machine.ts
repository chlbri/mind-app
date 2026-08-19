import { createMachine } from '@bemedev/app';
import { type } from '@bemedev/app/bemedev';
import { nanoid } from 'nanoid';

import { edgeJSON, extremities, nodeJSON } from './main.typings';

/**
 * Constructs a unique edge identifier string from source and destination node IDs.
 *
 * @param out - The source node ID string.
 * @param _in - The destination node ID string.
 *
 * @returns Formatted edge identifier string.
 */
export const buildEdgeId = (out: string, _in: string) => {
  return `edge = ${out} => ${_in}`;
};

/**
 * Constructs a formatted node identifier string from a generated ID.
 *
 * @param generated - The generated unique ID string or `null`/`undefined`.
 *
 * @returns Formatted node identifier string.
 */
export const buildNodeID = (generated?: string | null) => {
  return `node-${generated}`;
};

/**
 * State machine managing flowchart state transitions, nodes, edges, selection, and
 * layout actions.
 */
export const machine = createMachine(
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          CONFIGURE: { actions: ['configure'], target: '/working' },
          CONFIGURE_EMPTY: '/working',
        },
      },

      construction: { always: { actions: ['buildUI'], target: '/working' } },

      working: {
        on: {
          MOVE_IMMEDIATE: {
            actions: [
              { name: 'buildImmediateUI', description: 'Must be in the ui' },
            ],
          },

          ADD_CHILD: {
            actions: [
              'generateID',
              { name: 'placeChild', description: 'Must be in the ui' },
              'linkChild',
            ],
            target: '/construction',
          },

          ADD_PARENT: {
            actions: [
              'generateID',
              { name: 'placeParent', description: 'Must be in the ui' },
              'selectParent',
            ],
            target: '/construction',
          },

          ADD_SIBLING: {
            actions: [
              'generateID',
              { name: 'placeSibling', description: 'Must be in the ui' },
              'linkSibling',
            ],
            target: '/construction',
          },

          MOVE: { actions: ['moveNode', 'buildUI'], target: '/construction' },
          ADD_EDGE: { actions: ['addEdge'], target: '/construction' },
          DELETE: { actions: ['delete'], target: '/construction' },
          SELECT: { actions: ['select'] },
          DESELECT: { actions: ['deselect'] },
        },
      },
    },
  },
  {
    eventsMap: type(({ intersection, use, array }) => ({
      CONFIGURE: {
        nodes: array(intersection(use(nodeJSON), { id: 'string' })),
        edges: array(intersection(use(edgeJSON), { id: 'string' })),
      },

      CONFIGURE_EMPTY: 'never',
      MOVE: { id: 'string', x: 'number', y: 'number' },
      MOVE_IMMEDIATE: { id: 'string', x: 'number', y: 'number' },
      ADD_CHILD: 'string',
      ADD_PARENT: 'never',
      ADD_SIBLING: 'string',
      DELETE: 'string',
      SELECT: 'string',
      DESELECT: 'never',
      ADD_EDGE: use(extremities),
    })),

    sync: true,
    pContext: type(({ union }) => ({ generatedId: union('string', 'null') })),

    context: type(({ optional, use, array }) => ({
      data: optional({
        nodes: array({ ...use(nodeJSON), id: 'string' }),
        edges: array({ ...use(edgeJSON), id: 'string' }),
      }),

      selected: optional('string'),
      updatingUI: optional('boolean'),
    })),
  },
).provideOptions(({ assign, batch, erase }) => ({
  actions: {
    configure: batch(
      assign('context.data', () => ({ nodes: [], edges: [] })),
      assign('context.data.nodes', { CONFIGURE: ({ payload: { nodes } }) => nodes }),
      assign('context.data.edges', { CONFIGURE: ({ payload: { edges } }) => edges }),
      assign('context.updatingUI', () => false),
      assign('pContext.generatedId', () => null),
    ),

    generateID: assign('pContext.generatedId', () => nanoid()),

    linkChild: batch(
      assign('context.data.edges', {
        ADD_CHILD: ({ context, pContext, payload }) => {
          const data = context.data;
          const from = payload;
          const generatedId = pContext?.generatedId;
          const to = buildNodeID(generatedId);
          const id = buildEdgeId(from, to);
          return [...(data?.edges ?? []), { id, from, to }];
        },
      }),

      assign('context.selected', ({ pContext: { generatedId } }) =>
        buildNodeID(generatedId),
      ),
    ),

    linkSibling: batch(
      assign('context.data.edges', {
        ADD_SIBLING: ({ pContext, payload, context }) => {
          const edges = context.data?.edges;
          const generatedId = pContext?.generatedId;
          const out = [...(edges ?? [])];
          const from = edges?.find(({ to }) => to === payload)?.from;
          if (!from) return out;

          const to = buildNodeID(generatedId);
          const id = buildEdgeId(from, to);
          out.push({ from, to, id });
          return out;
        },
      }),

      assign('context.selected', ({ pContext: { generatedId } }) =>
        buildNodeID(generatedId),
      ),
    ),

    selectParent: assign('context.selected', ({ pContext: { generatedId } }) =>
      buildNodeID(generatedId),
    ),

    moveNode: assign('context.data.nodes', {
      MOVE: ({ context: { data }, payload }) => {
        const { id, x, y } = payload;
        if (!id) return data?.nodes ?? [];

        return (
          data?.nodes?.map(d => {
            if (d.id === id) {
              return { ...d, position: { x, y } };
            }
            return d;
          }) ?? []
        );
      },
    }),

    select: assign('context.selected', { SELECT: ({ payload }) => payload }),

    delete: assign(['context.data.nodes', 'context.data.edges'], {
      DELETE: ({ context: { data }, payload }) => {
        const nodes = data?.nodes?.filter(({ id }) => id !== payload);
        const edges = data?.edges?.filter(
          ({ id, from, to }) => id !== payload && from !== payload && to !== payload,
        );

        return [nodes, edges];
      },
    }),

    addEdge: assign('context.data.edges', {
      ADD_EDGE: ({ context, payload: { from, to } }) => {
        const edges = context.data?.edges ?? [];
        const id = buildEdgeId(from, to);
        if (edges.some(e => e.id === id)) return edges;

        const out = [...edges, { id, from, to }];
        return out;
      },
    }),

    deselect: erase('context.selected'),
  },
}));
