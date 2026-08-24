import { createMachine } from '@bemedev/app';
import { toArray, type } from '@bemedev/app/bemedev';
import { nanoid } from 'nanoid';

import { DEFAULT_INPUT_OFFSET, getDefaultOutputOffset } from './main.machine.data';
import {
  buildEdgeId,
  buildNodeID,
  calculateDimensions,
} from './main.machine.helpers';
import {
  dimension,
  edgeJSON,
  extremities,
  newEdge,
  nodeJSON,
  point,
  vector,
} from './main.machine.typings';

/**
 * State machine managing flowchart state transitions, nodes, edges, selection, and
 * layout actions.
 *
 * @see {@linkcode calculateDimensions}, {@linkcode buildEdgeId}, {@linkcode buildNodeID}, {@linkcode getDefaultOutputOffset}, {@linkcode DEFAULT_INPUT_OFFSET}
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
            actions: [{ name: 'buildUI', description: 'Must be in the ui' }],
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
).provideOptions(({ assign, batch, erase, filter, action }) => ({
  actions: {
    configure: batch(
      assign('data', { CONFIGURE: ({ payload }) => payload }),
      assign('newEdge', () => undefined),
      assign('updatingUI', () => false),
      action(({ pContext }) => {
        pContext.generatedId = null;
      }),
      action({
        CONFIGURE: ({ payload: { nodes }, pContext: { dimensions } }) => {
          nodes.forEach(({ id, position }) => {
            dimensions[id] = calculateDimensions(position);
          });
        },
      }),
    ),

    startNewEdge: assign('newEdge', {
      START_NEW_EDGE: ({ payload: from, pContext: { dimensions } }) => {
        const { x, y } = dimensions[from].output;
        return { from, x0: x, y0: y, x1: x, y1: y };
      },
    }),

    buildUI: batch(
      assign('edgesPositions', {
        MOVE: ({
          context: { data, edgesPositions },
          payload,
          pContext: { dimensions },
        }) => {
          const edges = data?.edges;
          const dimension = dimensions[payload.id];

          const outputOffset =
            dimension?.outputOffset ?? getDefaultOutputOffset(dimension?.width);

          const inputOffset = dimension?.inputOffset ?? DEFAULT_INPUT_OFFSET;

          const output = {
            x: payload.x + outputOffset.x,
            y: payload.y + outputOffset.y,
          };

          const input = {
            x: payload.x + inputOffset.x,
            y: payload.y + inputOffset.y,
          };

          if (dimension) {
            dimension.output = output;
            dimension.input = input;
          }

          edges?.forEach(({ from, to, id }) => {
            if (from === payload.id) {
              edgesPositions[id].x0 = output.x;
              edgesPositions[id].y0 = output.y;
            }
            if (to === payload.id) {
              edgesPositions[id].x1 = input.x;
              edgesPositions[id].y1 = input.y;
            }
          });

          return edgesPositions;
        },
        MOVE_IMMEDIATE: ({
          context: { data, edgesPositions },
          payload,
          pContext: { dimensions },
        }) => {
          const edges = data?.edges;

          edges?.forEach(({ from, to, id }) => {
            if (from === payload.id) {
              const dimension = dimensions[payload.id];
              const offset =
                dimension?.outputOffset ?? getDefaultOutputOffset(dimension?.width);

              const x0 = payload.x + offset.x;
              const y0 = payload.y + offset.y;
              edgesPositions[id].x0 = x0;
              edgesPositions[id].y0 = y0;

              if (dimension) {
                dimension.output.x = x0;
                dimension.output.y = y0;
              }
            }

            if (to === payload.id) {
              const dimension = dimensions[payload.id];
              const offset = dimension?.inputOffset ?? DEFAULT_INPUT_OFFSET;

              const x1 = payload.x + offset.x;
              const y1 = payload.y + offset.y;
              edgesPositions[id].x1 = x1;
              edgesPositions[id].y1 = y1;

              if (dimension) {
                dimension.input = { x: x1, y: y1 };
              }
            }
          });

          return edgesPositions;
        },
        else: ({ context: { data, edgesPositions }, pContext: { dimensions } }) => {
          const edges = data?.edges ?? [];
          edgesPositions = {};

          edges.forEach(({ from, id, to }) => {
            const output = dimensions[from]?.output;
            const input = dimensions[to]?.input;

            if (output && input) {
              edgesPositions[id] = {
                x0: output.x,
                y0: output.y,
                x1: input.x,
                y1: input.y,
              };
            } else {
              delete edgesPositions[id];
            }
          });

          return edgesPositions;
        },
      }),

      assign('updatingUI', () => true),
    ),

    addDimension: action({
      ADD_DIMENSION: ({ payload: { id, dimension }, pContext: { dimensions } }) => {
        dimensions[id] = dimension;
      },
    }),

    generateID: action(({ pContext }) => {
      pContext.generatedId = nanoid();
    }),

    linkChild: batch(
      assign('data.edges', {
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

      assign('selected', ({ pContext: { generatedId } }) =>
        buildNodeID(generatedId),
      ),
    ),

    linkSibling: batch(
      assign('data.edges', {
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

      assign('selected', ({ pContext: { generatedId } }) =>
        buildNodeID(generatedId),
      ),
    ),

    selectParent: assign('selected', ({ pContext: { generatedId } }) =>
      buildNodeID(generatedId),
    ),

    moveNode: assign('data.nodes', {
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

    select: assign('selected', { SELECT: ({ payload }) => payload }),

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
      filter('data.edges', {
        DELETE: ({ id, from, to }, _, { payload }) => {
          return id !== payload && from !== payload && to !== payload;
        },
      }),

      filter('data.nodes', { DELETE: ({ id }, _, { payload }) => id !== payload }),
    ),

    addEdge: batch(
      assign('data.edges', {
        ADD_EDGE: ({ context, payload: { from, to } }) => {
          const edges = context.data?.edges ?? [];
          const id = buildEdgeId(from, to);
          if (edges.some(e => e.id === id)) return edges;

          const out = [...edges, { id, from, to }];
          return out;
        },
      }),
      erase('newEdge'),
    ),

    clearNewEdge: erase('newEdge'),
    deselect: erase('selected'),

    zoom: assign('zoom', {
      ZOOM: ({ context: { zoom }, payload, pContext }) => {
        const next = zoom + payload;
        const clamped = Math.min(Math.max(Number(next.toFixed(2)), 0.2), 3);
        pContext.previousZoom = undefined;
        return clamped;
      },
    }),

    toggleZoom: assign('zoom', {
      TOGGLE_ZOOM: ({ context: { zoom }, pContext }) => {
        const previous = pContext.previousZoom;

        if (previous !== undefined) {
          pContext.previousZoom = undefined;
          return previous;
        }

        pContext.previousZoom = zoom;
        return 1;
      },
    }),
  },
}));
