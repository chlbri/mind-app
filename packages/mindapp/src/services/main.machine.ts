import { createMachine } from '@bemedev/app';
import { toArray, type } from '@bemedev/app/bemedev';
import { nanoid } from 'nanoid';

import {
  dimension,
  edgeJSON,
  extremities,
  newEdge,
  nodeJSON,
  point,
  vector,
} from './main.typings';

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

          ADD_DIMENSION: { actions: ['addDimension'] },

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
          START_NEW_EDGE: { actions: ['startNewEdge'] },
          MOVE_NEW_EDGE: { actions: ['moveNewEdge'] },
          CLEAR_NEW_EDGE: { actions: ['clearNewEdge'] },
          DELETE: { actions: ['delete'], target: '/construction' },
          SELECT: { actions: ['select'] },
          DESELECT: { actions: ['deselect'] },
          ZOOM: { actions: ['zoom'] },
          TOGGLE_ZOOM: { actions: ['toggleZoom'] },
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
      START_NEW_EDGE: 'string',
      MOVE_NEW_EDGE: use(point),
      CLEAR_NEW_EDGE: 'never',
      ZOOM: 'number',
      TOGGLE_ZOOM: 'never',
      ADD_DIMENSION: { id: 'string', dimension: use(dimension) },
    })),

    sync: true,
    pContext: type(({ union, optional, record, use }) => ({
      generatedId: union('string', 'null'),
      previousZoom: optional('number'),
      dimensions: record(use(dimension)),
    })),

    context: type(({ optional, use, array, record }) => ({
      data: optional({
        nodes: array({ ...use(nodeJSON), id: 'string' }),
        edges: array({ ...use(edgeJSON), id: 'string' }),
      }),

      edgesPositions: record(use(vector)),
      newEdge: optional(use(newEdge)),
      selected: optional('string'),
      updatingUI: optional('boolean'),
      zoom: 'number',
    })),
  },
).provideOptions(({ assign, batch, erase, filter }) => ({
  actions: {
    // configure: batch(
    //   assign('context.data', () => ({ nodes: [], edges: [] })),
    //   assign('context.data.nodes', { CONFIGURE: ({ payload: { nodes } }) => nodes }),
    //   assign('context.data.edges', { CONFIGURE: ({ payload: { edges } }) => edges }),
    //   assign('context.edgesPositions', () => ({})),
    //   assign('context.newEdge', () => undefined),
    //   assign('context.updatingUI', () => false),
    //   assign('context.zoom', () => 1),
    //   assign('pContext.generatedId', () => null),
    //   assign('pContext.previousZoom', () => undefined),
    // ),

    addDimension: assign('pContext.dimensions', {
      ADD_DIMENSION: ({ payload: { id, dimension }, pContext: { dimensions } }) => {
        dimensions[id] = dimension;
        return dimensions;
      },
    }),

    generateID: assign('pContext.generatedId', () => nanoid()),

    linkChild: batch(
      assign('context.data.edges', {
        ADD_CHILD: ({ context: { data }, pContext, payload }) => {
          const edges = toArray.typed(data?.edges);
          const from = payload;
          const generatedId = pContext?.generatedId;
          const to = buildNodeID(generatedId);
          const id = buildEdgeId(from, to);
          edges.push({ id, from, to });
          return edges;
        },
      }),

      assign('context.selected', ({ pContext: { generatedId } }) =>
        buildNodeID(generatedId),
      ),
    ),

    linkSibling: batch(
      assign('context.data.edges', {
        ADD_SIBLING: ({ pContext, payload, context: { data } }) => {
          const edges = toArray.typed(data?.edges);
          const generatedId = pContext?.generatedId;
          const from = edges.find(({ to }) => to === payload)?.from;
          if (!from) return edges;

          const to = buildNodeID(generatedId);
          const id = buildEdgeId(from, to);
          edges.push({ from, to, id });
          return edges;
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

    // delete: assign(['context.data.nodes', 'context.data.edges'], {
    //   DELETE: ({ context: { data }, payload }) => {
    //     const nodes = data?.nodes?.filter(({ id }) => id !== payload);
    //     const edges = data?.edges?.filter(
    //       ({ id, from, to }) => id !== payload && from !== payload && to !== payload,
    //     );

    //     return [nodes, edges];
    //   },
    // }),
    delete: batch(
      filter('context.data.edges', {
        DELETE: ({ id, from, to }, _, { payload }) => {
          return id !== payload && from !== payload && to !== payload;
        },
      }),

      filter('context.data.nodes', {
        DELETE: ({ id }, _, { payload }) => id !== payload,
      }),
    ),

    addEdge: batch(
      assign('context.data.edges', {
        ADD_EDGE: ({ context, payload: { from, to } }) => {
          const edges = context.data?.edges ?? [];
          const id = buildEdgeId(from, to);
          if (edges.some(e => e.id === id)) return edges;

          const out = [...edges, { id, from, to }];
          return out;
        },
      }),
      erase('context.newEdge'),
    ),

    clearNewEdge: erase('context.newEdge'),
    deselect: erase('context.selected'),

    zoom: assign(['context.zoom', 'pContext.previousZoom'], {
      ZOOM: ({ context: { zoom = 1 }, payload }) => {
        const next = zoom + payload;
        const clamped = Math.min(Math.max(Number(next.toFixed(2)), 0.2), 3);
        return [clamped, undefined];
      },
    }),

    toggleZoom: assign(['context.zoom', 'pContext.previousZoom'], {
      TOGGLE_ZOOM: ({ context: { zoom = 1 }, pContext: { previousZoom } }) => {
        if (previousZoom !== undefined) {
          return [previousZoom, undefined];
        }
        return [1, zoom];
      },
    }),
  },
}));
