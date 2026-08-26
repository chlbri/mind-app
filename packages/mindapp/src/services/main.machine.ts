import { createMachine } from '@bemedev/app';
import { toArray, type } from '@bemedev/app/bemedev';
import type { useDragDropContext } from '@thisbeyond/solid-dnd';
import { nanoid } from 'nanoid';

/** Type alias for drag-drop state extracted from {@linkcode useDragDropContext}. */
export type DragDropState = Exclude<ReturnType<typeof useDragDropContext>, null>[0];

import { clamp } from '..';
import {
  DEFAULT_DATA,
  DEFAULT_INPUT_OFFSET,
  DEFAULT_SIZE,
  getDefaultOutputOffset,
  PARENT_CHILD_GAP_WIDTH,
} from './main.machine.data';
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
  data,
  nodeJSON,
  point,
  vector,
  board,
  type Dimension,
  type Point,
  type Board,
  type Vector,
} from './main.machine.typings';

/**
 * State machine managing flowchart state transitions, nodes, edges, selection, and
 * layout actions.
 *
 * @see {@linkcode calculateDimensions}, {@linkcode buildEdgeId}, {@linkcode buildNodeID}, {@linkcode getDefaultOutputOffset}, {@linkcode DEFAULT_INPUT_OFFSET}, {@linkcode DEFAULT_SIZE}, {@linkcode DEFAULT_DATA}
 */
export const machine = createMachine(
  {
    initial: 'idle',

    on: { SET_BOARD: { actions: ['setBoard'] } },
    states: {
      idle: {
        on: {
          CONFIGURE: { actions: ['configure'], target: '/construction' },
          CONFIGURE_EMPTY: '/working',
        },
      },

      construction: { always: { actions: ['buildUI'], target: '/working' } },

      working: {
        on: {
          CONFIGURE: { actions: ['configure'], target: '/construction' },
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

          ADD_SIBLING: {
            actions: [
              'generateID',
              { name: 'placeSibling', description: 'Must be in the ui' },
              'linkSibling',
            ],
            target: '/construction',
          },

          RESIZE: { actions: ['resize', 'buildUI'] },
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
          SET_BOARD: { actions: ['setBoard'] },
          SET_NODE_DATA: { actions: ['setNodeData'] },
          EDIT: { actions: ['edit'] },
          STOP_EDIT: { actions: ['stopEdit'] },
        },
      },
    },
  },
  {
    eventsMap: type(({ intersection, use, array, optional }) => ({
      CONFIGURE: {
        nodes: array(intersection(use(nodeJSON), { id: 'string' })),
        edges: array(intersection(use(edgeJSON), { id: 'string' })),
        defaultData: optional(use(data)),
      },

      SET_BOARD: use(board),
      CONFIGURE_EMPTY: 'never',
      MOVE: { id: 'string', x: 'number', y: 'number' },
      MOVE_IMMEDIATE: { id: 'string', x: 'number', y: 'number' },
      ADD_CHILD: 'string',
      ADD_PARENT: 'never',
      ADD_SIBLING: 'string',
      DELETE: 'string',
      SELECT: 'string',
      DESELECT: 'never',
      EDIT: 'string',
      STOP_EDIT: 'never',
      ADD_EDGE: use(extremities),
      START_NEW_EDGE: 'string',
      MOVE_NEW_EDGE: use(point),
      CLEAR_NEW_EDGE: 'never',
      ZOOM: 'number',
      TOGGLE_ZOOM: 'never',
      RESIZE: { id: 'string', size: { width: 'number', height: 'number' } },
      SET_NODE_DATA: { id: 'string', data: use(data) },
    })),

    sync: true,

    pContext: type(({ union, optional, record, use, custom }) => ({
      generatedId: union('string', 'null'),
      previousZoom: optional('number'),
      dimensions: record(use(dimension)),
      defaultData: optional(use(data)),

      getBoardPosition:
        custom<(clientX: number, clientY: number, board: Board) => Point>(),

      clampPosition:
        custom<
          (
            board: Board,
            x: number,
            y: number,
            nodeWidth?: number,
            nodeHeight?: number,
          ) => Point
        >(),

      calculateDimensions:
        custom<
          (
            position: { x: number; y: number },
            parentDimension?: Pick<
              {
                width: number;
                height: number;
                output: { x: number; y: number };
                input?: { x: number; y: number } | undefined;
                inputOffset?: { x: number; y: number } | undefined;
                outputOffset?: { x: number; y: number } | undefined;
              },
              'width' | 'height' | 'inputOffset' | 'outputOffset'
            >,
          ) => Dimension
        >(),
    })),

    context: type(({ optional, use, array, record }) => ({
      data: optional({
        nodes: array({ ...use(nodeJSON), id: 'string' }),
        edges: array({ ...use(edgeJSON), id: 'string' }),
      }),
      board: optional(use(board)),

      edgesPositions: record(use(vector)),
      newEdge: optional(use(newEdge)),
      selected: optional('string'),
      editing: optional('string'),
      updatingUI: optional('boolean'),
      zoom: 'number',
      bounds: use(point),
    })),
  },
).provideOptions(({ assign, batch, erase, filter, action }) => ({
  actions: {
    configure: batch(
      assign('data', {
        CONFIGURE: ({ payload: { nodes, edges } }) => ({ nodes, edges }),
      }),
      assign('newEdge', () => undefined),
      assign('updatingUI', () => false),
      action(({ pContext }) => {
        pContext.generatedId = null;
      }),
      action({
        CONFIGURE: ({ payload: { nodes, defaultData }, pContext }) => {
          pContext.defaultData = defaultData;
          nodes.forEach(({ id, position }) => {
            pContext.dimensions[id] = calculateDimensions(position);
          });
        },
      }),
    ),

    setNodeData: assign('data.nodes', {
      SET_NODE_DATA: ({ context: { data }, payload: { id, data: newData } }) => {
        return data?.nodes?.map(node => {
          if (node.id === id) {
            return { ...node, data: { ...node.data, ...newData } };
          }
          return node;
        });
      },
    }),

    setBoard: assign('board', { SET_BOARD: ({ payload }) => payload }),
    generateID: action(({ pContext }) => (pContext.generatedId = nanoid())),
    select: assign('selected', { SELECT: ({ payload }) => payload }),
    clearNewEdge: erase('newEdge'),
    deselect: batch(erase('selected'), erase('editing')),
    edit: batch(
      assign('editing', { EDIT: ({ payload }) => payload }),
      assign('selected', { EDIT: ({ payload }) => payload }),
    ),
    stopEdit: erase('editing'),

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
          if (!dimension) return;

          const outputOffset =
            dimension.outputOffset ?? getDefaultOutputOffset(dimension.width);

          const inputOffset = dimension.inputOffset ?? DEFAULT_INPUT_OFFSET;

          const output = {
            x: payload.x + outputOffset.x,
            y: payload.y + outputOffset.y,
          };

          const input = {
            x: payload.x + inputOffset.x,
            y: payload.y + inputOffset.y,
          };

          dimension.output = output;
          dimension.input = input;

          edges?.forEach(({ from, to, id }) => {
            const edgePosition = edgesPositions[id];
            if (!edgePosition) return;

            if (from === payload.id) {
              edgePosition.x0 = output.x;
              edgePosition.y0 = output.y;
            }
            if (to === payload.id) {
              edgePosition.x1 = input.x;
              edgePosition.y1 = input.y;
            }
          });

          return edgesPositions;
        },

        MOVE_IMMEDIATE: ({
          context: { data, edgesPositions },
          payload,
          pContext: { dimensions },
        }) => {
          data?.edges?.forEach(({ from, to, id }) => {
            const dimension = dimensions[payload.id];
            const edgePosition = edgesPositions[id];
            if (!edgePosition || !dimension) return;

            if (from === payload.id) {
              const offset =
                dimension.outputOffset ?? getDefaultOutputOffset(dimension.width);

              const x0 = payload.x + offset.x;
              const y0 = payload.y + offset.y;
              edgePosition.x0 = x0;
              edgePosition.y0 = y0;
              dimension.output = { x: x0, y: y0 };
            }

            if (to === payload.id) {
              const offset = dimension?.inputOffset ?? DEFAULT_INPUT_OFFSET;
              const x1 = payload.x + offset.x;
              const y1 = payload.y + offset.y;
              edgePosition.x1 = x1;
              edgePosition.y1 = y1;
              dimension.input = { x: x1, y: y1 };
            }
          });

          return edgesPositions;
        },

        else: ({ context: { data }, pContext: { dimensions } }) => {
          const nextEdgesPositions: Record<string, Vector> = {};

          data?.edges?.forEach(({ from, id, to }) => {
            const output = dimensions[from]?.output;
            const input = dimensions[to]?.input;

            if (output && input) {
              nextEdgesPositions[id] = {
                x0: output.x,
                y0: output.y,
                x1: input.x,
                y1: input.y,
              };
            }
          });

          return nextEdgesPositions;
        },
      }),

      assign('updatingUI', () => true),
    ),

    resize: action({
      RESIZE: ({
        payload: {
          id,
          size: { width, height },
        },
        context: { data },
        pContext: { dimensions },
      }) => {
        const dimension = dimensions[id];
        if (!dimension) return;

        dimension.width = width;
        dimension.height = height;

        const node = data?.nodes?.find(n => n.id === id);
        const outputOffset = getDefaultOutputOffset(width);
        const inputOffset = dimension.inputOffset ?? DEFAULT_INPUT_OFFSET;

        dimension.outputOffset = outputOffset;
        dimension.inputOffset = inputOffset;

        if (node) {
          dimension.output = {
            x: node.position.x + outputOffset.x,
            y: node.position.y + outputOffset.y,
          };
          dimension.input = {
            x: node.position.x + inputOffset.x,
            y: node.position.y + inputOffset.y,
          };
        } else {
          dimension.output = { x: dimension.output.x, y: dimension.output.y };
        }
      },
    }),

    linkChild: batch(
      assign('data.edges', {
        ADD_CHILD: ({ context: { data }, pContext, payload: from }) => {
          const edges = toArray.typed(data?.edges);
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
      MOVE: ({ context: { data }, payload: { id, x, y } }) => {
        return data?.nodes?.map(node => {
          if (node.id === id) return { ...node, position: { x, y } };
          return node;
        });
      },
    }),

    delete: batch(
      filter('data.edges', {
        DELETE: ({ id, from, to }, _, { payload }) => {
          return id !== payload && from !== payload && to !== payload;
        },
      }),

      filter('data.nodes', { DELETE: ({ id }, _, { payload }) => id !== payload }),
      erase('editing'),
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

    zoom: assign('zoom', {
      ZOOM: ({ context: { zoom }, payload, pContext }) => {
        const next = zoom + payload;
        const clamped = clamp(next, 0.1, 3);
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

    // #region UI
    placeChild: assign('data.nodes', {
      ADD_CHILD: ({ payload, context: { data, board }, pContext }) => {
        if (!board) return data?.nodes;

        const nodes = data?.nodes;
        if (!payload) return nodes;

        const parentNode = nodes?.find(node => node.id === payload);
        if (!parentNode) return nodes;

        const parentDimension = pContext.dimensions[payload];
        const id = `node-${pContext.generatedId}`;
        const width = parentDimension?.width ?? DEFAULT_SIZE.width;
        const height = parentDimension?.height ?? DEFAULT_SIZE.height;
        const initialX = parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;
        const initialY = parentNode.position.y;

        const position = pContext.clampPosition(
          board,
          initialX,
          initialY,
          width,
          height,
        );

        const defaultData = pContext.defaultData ?? DEFAULT_DATA;

        nodes?.push({ id, data: { ...defaultData }, position });

        pContext.dimensions[id] = pContext.calculateDimensions(
          position,
          parentDimension ?? DEFAULT_SIZE,
        );

        return nodes;
      },
    }),

    placeParent: assign('data.nodes', {
      ADD_PARENT: ({ context: { data, zoom = 1, board }, pContext }) => {
        if (!board) return data?.nodes;

        const nodes = data?.nodes;
        const id = `node-${pContext.generatedId}`;
        const container = board.parent;
        const scrollLeft = container?.scrollLeft ?? 0;
        const scrollTop = container?.scrollTop ?? 0;
        const width = container?.width ?? 0;
        const height = container?.height ?? 0;
        const currentZoom = zoom;
        const x = (scrollLeft + width / 2) / currentZoom;
        const y = (scrollTop + height / 2) / currentZoom;
        const position = pContext.clampPosition(
          board,
          x,
          y,
          DEFAULT_SIZE.width,
          DEFAULT_SIZE.height,
        );

        const defaultData = pContext.defaultData ?? DEFAULT_DATA;

        nodes?.push({ id, data: { ...defaultData }, position });

        pContext.dimensions[id] = pContext.calculateDimensions(
          position,
          DEFAULT_SIZE,
        );

        return nodes;
      },
    }),

    placeSibling: assign('data.nodes', {
      ADD_SIBLING: ({ payload, context: { data, board }, pContext }) => {
        if (!board) return data?.nodes;

        const edges = data?.edges;
        const nodes = data?.nodes;
        const parentID = edges?.find(edge => edge.to === payload)?.from;
        if (!parentID) return nodes;

        const parentNode = nodes?.find(node => node.id === parentID);
        if (!parentNode) return nodes;

        const parentDimension = pContext.dimensions[parentID];
        const id = `node-${pContext.generatedId}`;
        const width = parentDimension?.width ?? DEFAULT_SIZE.width;
        const height = parentDimension?.height ?? DEFAULT_SIZE.height;
        const initialX = parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;
        const initialY = parentNode.position.y + PARENT_CHILD_GAP_WIDTH;

        const position = pContext.clampPosition(
          board,
          initialX,
          initialY,
          width,
          height,
        );

        const defaultData = pContext.defaultData ?? DEFAULT_DATA;

        nodes?.push({ id, data: { ...defaultData }, position });

        pContext.dimensions[id] = pContext.calculateDimensions(
          position,
          parentDimension ?? DEFAULT_SIZE,
        );

        return nodes;
      },
    }),

    moveNewEdge: assign('newEdge', {
      MOVE_NEW_EDGE: ({ context: { newEdge, board }, payload, pContext }) => {
        if (!board) return undefined;
        if (!newEdge) return undefined;
        const { x: x1, y: y1 } = pContext.getBoardPosition(
          payload.x,
          payload.y,
          board,
        );
        return { ...newEdge, x1, y1 };
      },
    }),
    // #endregion
  },
}));
