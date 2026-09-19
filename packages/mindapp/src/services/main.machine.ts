import { createMachine } from '@bemedev/app';
import { toArray, type } from '@bemedev/app/bemedev';
import type { useDragDropContext } from '@thisbeyond/solid-dnd';
import { nanoid } from 'nanoid';

/** Type alias for drag-drop state extracted from {@linkcode useDragDropContext}. */
export type DragDropState = Exclude<ReturnType<typeof useDragDropContext>, null>[0];

import { clamp } from '..';
import {
  DEFAULT_DATA,
  DEFAULT_SIZE,
  getDefaultInputOffset,
  getDefaultOutputOffset,
  PARENT_CHILD_GAP_WIDTH,
} from './main.machine.data';
import {
  buildEdgeId,
  buildNodeID,
  calculateDimensions,
  calculateEdgePosition,
  getHandlePosition,
} from './main.machine.helpers';
import {
  board,
  data,
  dimension,
  edgeJSON,
  extremities,
  newEdge,
  nodeHandles,
  nodeJSON,
  point,
  vector,
  type Board,
  type Dimension,
  type HandlePosition,
  type Point,
  type Vector,
} from './main.machine.typings';

/**
 * State machine managing flowchart state transitions, nodes, edges, selection, and
 * layout actions.
 *
 * @see {@linkcode calculateDimensions}, {@linkcode buildEdgeId}, {@linkcode buildNodeID}, {@linkcode getDefaultOutputOffset}, {@linkcode DEFAULT_SIZE}, {@linkcode DEFAULT_DATA}
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

      construction: { always: { actions: ['buildUI'], target: '/register' } },
      register: { always: { actions: ['register'], target: '/working' } },

      working: {
        on: {
          CONFIGURE: { actions: ['configure'], target: '/construction' },
          RESIZE: { actions: ['resize', 'buildUI'], target: '/register' },
          MOVE: { actions: ['moveNode', 'buildUI'], target: '/construction' },
          START_NEW_EDGE: { actions: ['startNewEdge'], target: '/register' },
          MOVE_NEW_EDGE: { actions: ['moveNewEdge'], target: '/register' },
          CLEAR_NEW_EDGE: { actions: ['clearNewEdge'], target: '/register' },
          DELETE: { actions: ['delete'], target: '/construction' },
          SELECT: { actions: ['select'], target: '/register' },
          DESELECT: { actions: ['deselect'], target: '/register' },
          ZOOM: { actions: ['zoom'], target: '/register' },
          TOGGLE_ZOOM: { actions: ['toggleZoom'], target: '/register' },
          SET_BOARD: { actions: ['setBoard'], target: '/register' },
          SET_NODE_DATA: { actions: ['setNodeData'], target: '/register' },
          SET_EDGE_DATA: { actions: ['setEdgeData'], target: '/register' },
          EDIT: { actions: ['edit'], target: '/register' },
          STOP_EDIT: { actions: ['stopEdit'], target: '/register' },

          ADD_EDGE: {
            actions: ['addEdge'],
            target: '/construction',
            guards: 'edgesAllowed',
          },

          MOVE_IMMEDIATE: {
            actions: [{ name: 'buildUI', description: 'Must be in the ui' }],
            target: '/register',
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
              'linkParent',
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
        },
      },
    },
  },
  {
    eventsMap: type(({ intersection, use, array, optional, custom, partial }) => ({
      SET_BOARD: use(board),
      CONFIGURE_EMPTY: 'never',
      MOVE: { id: 'string', x: 'number', y: 'number' },
      MOVE_IMMEDIATE: { id: 'string', x: 'number', y: 'number' },
      ADD_CHILD: 'string',
      ADD_PARENT: optional(
        partial({
          id: 'string',
          parentId: 'string',
          data: use(data),
          handles: use(nodeHandles),
        }),
      ),
      ADD_SIBLING: 'string',
      DELETE: 'string',
      SELECT: 'string',
      DESELECT: 'never',
      EDIT: 'string',
      STOP_EDIT: 'never',
      ADD_EDGE: use(extremities),
      MOVE_NEW_EDGE: use(point),
      CLEAR_NEW_EDGE: 'never',
      ZOOM: 'number',
      TOGGLE_ZOOM: 'never',
      RESIZE: { id: 'string', size: { width: 'number', height: 'number' } },
      SET_NODE_DATA: { id: 'string', data: use(data) },
      SET_EDGE_DATA: { id: 'string', data: use(data) },

      START_NEW_EDGE: custom<
        string | { from: string; position: HandlePosition | string; index: number }
      >(),

      CONFIGURE: {
        nodes: array(intersection(use(nodeJSON), { id: 'string' })),
        edges: array(intersection(use(edgeJSON), { id: 'string' })),
        defaultData: optional(use(data)),
      },
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
    })),
  },
).provideOptions(({ assign, batch, erase, filter, action }) => ({
  actions: {
    register: action(() => {}),
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
            const existing = pContext.dimensions[id];
            pContext.dimensions[id] = existing
              ? calculateDimensions(position, existing)
              : calculateDimensions(position);
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

    setEdgeData: assign('data.edges', {
      SET_EDGE_DATA: ({ context: { data }, payload: { id, data: newData } }) => {
        return data?.edges?.map(edge => {
          if (edge.id === id) {
            return { ...edge, data: { ...edge.data, ...newData } };
          }
          return edge;
        });
      },
    }),

    setBoard: assign('board', { SET_BOARD: ({ payload }) => payload }),
    generateID: action({
      ADD_PARENT: ({ pContext, payload }) => {
        const customId =
          typeof payload === 'object' && payload ? payload.id : undefined;
        pContext.generatedId = customId ?? nanoid();
      },
      else: ({ pContext }) => {
        pContext.generatedId = nanoid();
      },
    }),
    select: assign('selected', { SELECT: ({ payload }) => payload }),
    clearNewEdge: erase('newEdge'),
    deselect: batch(erase('selected'), erase('editing')),
    stopEdit: erase('editing'),

    edit: batch(
      assign('editing', { EDIT: ({ payload }) => payload }),
      assign('selected', { EDIT: ({ payload }) => payload }),
    ),

    startNewEdge: assign('newEdge', {
      START_NEW_EDGE: ({ payload, pContext: { dimensions }, context: { data } }) => {
        const from = typeof payload === 'string' ? payload : payload.from;
        const fromPosition =
          typeof payload === 'object' ? payload.position : undefined;
        const fromIndex = typeof payload === 'object' ? payload.index : undefined;

        const fromNode = data?.nodes?.find(n => n.id === from);
        const dimension = dimensions[from];
        if (!dimension) return undefined;

        const width = dimension.width ?? DEFAULT_SIZE.width;
        const height = dimension.height ?? DEFAULT_SIZE.height;
        const nodePos = fromNode?.position ?? { x: 0, y: 0 };

        let side: HandlePosition = (fromPosition as HandlePosition) ?? 'right';
        let idx = fromIndex ?? 0;
        if (!fromPosition && fromNode?.handles) {
          const sides: HandlePosition[] = ['right', 'bottom', 'top', 'left'];
          for (const s of sides) {
            const hIdx = fromNode.handles[s]?.findIndex(h => h.type === 'output');
            if (hIdx !== undefined && hIdx !== -1) {
              side = s;
              idx = hIdx;
              break;
            }
          }
        }
        const handle = fromNode?.handles?.[side]?.[idx];
        if (fromNode?.handles && handle?.type === 'none') {
          return undefined;
        }
        const total = fromNode?.handles?.[side]?.length ?? 1;
        const p = getHandlePosition(nodePos, { width, height }, side, idx, total);

        return {
          from,
          fromPosition: side,
          fromIndex: idx,
          x0: p.x,
          y0: p.y,
          x1: p.x,
          y1: p.y,
        };
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
          if (!dimension) return edgesPositions;

          const width = dimension.width ?? DEFAULT_SIZE.width;
          const height = dimension.height ?? DEFAULT_SIZE.height;
          const outputOffset =
            dimension.outputOffset ?? getDefaultOutputOffset(width, height);
          const inputOffset = dimension.inputOffset ?? getDefaultInputOffset(height);

          dimension.output = {
            x: payload.x + outputOffset.x,
            y: payload.y + outputOffset.y,
          };
          dimension.input = {
            x: payload.x + inputOffset.x,
            y: payload.y + inputOffset.y,
          };

          const updatedNodes = (data?.nodes ?? []).map(n =>
            n.id === payload.id
              ? { ...n, position: { x: payload.x, y: payload.y } }
              : n,
          );

          edges?.forEach(edge => {
            if (edge.from === payload.id || edge.to === payload.id) {
              const pos = calculateEdgePosition(edge, updatedNodes, dimensions);
              if (pos) {
                edgesPositions[edge.id] = pos;
              }
            }
          });

          return edgesPositions;
        },

        MOVE_IMMEDIATE: ({
          context: { data, edgesPositions },
          payload,
          pContext: { dimensions },
        }) => {
          const dimension = dimensions[payload.id];
          if (!dimension) return edgesPositions;

          const width = dimension.width ?? DEFAULT_SIZE.width;
          const height = dimension.height ?? DEFAULT_SIZE.height;
          const outputOffset =
            dimension.outputOffset ?? getDefaultOutputOffset(width, height);
          const inputOffset = dimension.inputOffset ?? getDefaultInputOffset(height);

          dimension.output = {
            x: payload.x + outputOffset.x,
            y: payload.y + outputOffset.y,
          };
          dimension.input = {
            x: payload.x + inputOffset.x,
            y: payload.y + inputOffset.y,
          };

          const updatedNodes = (data?.nodes ?? []).map(n =>
            n.id === payload.id
              ? { ...n, position: { x: payload.x, y: payload.y } }
              : n,
          );

          data?.edges?.forEach(edge => {
            if (edge.from === payload.id || edge.to === payload.id) {
              const pos = calculateEdgePosition(edge, updatedNodes, dimensions);
              if (pos) {
                edgesPositions[edge.id] = pos;
              }
            }
          });

          return edgesPositions;
        },

        else: ({ context: { data }, pContext: { dimensions } }) => {
          const nextEdgesPositions: Record<string, Vector> = {};

          data?.edges?.forEach(edge => {
            const pos = calculateEdgePosition(edge, data.nodes, dimensions);
            if (pos) {
              nextEdgesPositions[edge.id] = pos;
            } else {
              const output = dimensions[edge.from]?.output;
              const input = dimensions[edge.to]?.input;
              if (output && input) {
                nextEdgesPositions[edge.id] = {
                  x0: output.x,
                  y0: output.y,
                  x1: input.x,
                  y1: input.y,
                };
              }
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
        const outputOffset = getDefaultOutputOffset(width, height);
        const inputOffset = dimension.inputOffset ?? getDefaultInputOffset(height);
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
          const id = buildEdgeId(from, to, 'left', 0);
          edges.push({ id, from, to, toPosition: 'left', toIndex: 0 });
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
          const id = buildEdgeId(from, to, 'left', 0);
          edges.push({ from, to, id, toPosition: 'left', toIndex: 0 });
          return edges;
        },
      }),

      assign('selected', ({ pContext: { generatedId } }) =>
        buildNodeID(generatedId),
      ),
    ),

    linkParent: assign('data.edges', {
      ADD_PARENT: ({ context: { data }, pContext, payload }) => {
        const edges = toArray.typed(data?.edges);
        const parentId =
          typeof payload === 'string'
            ? payload
            : typeof payload === 'object' && payload
              ? payload.parentId
              : undefined;
        if (!parentId) return edges;

        const customId =
          typeof payload === 'object' && payload ? payload.id : undefined;
        const to = customId ?? buildNodeID(pContext?.generatedId);
        const from = parentId;
        const id = buildEdgeId(from, to, 'top', 0);

        if (!edges.some(e => e.id === id || (e.from === from && e.to === to))) {
          edges.push({
            id,
            from,
            to,
            fromPosition: 'bottom',
            fromIndex: 0,
            toPosition: 'top',
            toIndex: 0,
          });
        }
        return edges;
      },
    }),

    selectParent: assign('selected', {
      ADD_PARENT: ({ pContext: { generatedId }, payload }) => {
        const customId =
          typeof payload === 'object' && payload ? payload.id : undefined;
        return customId ?? buildNodeID(generatedId);
      },
      else: ({ pContext: { generatedId } }) => buildNodeID(generatedId),
    }),

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
        ADD_EDGE: ({ context, payload }) => {
          const p =
            typeof payload === 'string'
              ? { from: payload, to: '' }
              : (payload as any);
          const { from, to, toPosition, toIndex, fromPosition, fromIndex } = p;
          const edges = context.data?.edges ?? [];
          const id = buildEdgeId(from, to, toPosition, toIndex);
          const existing = edges.find(
            e =>
              e.id === id ||
              (e.from === from &&
                e.to === to &&
                (!toPosition || e.toPosition === toPosition) &&
                (toIndex === undefined || e.toIndex === toIndex)),
          );
          if (existing) return edges;

          const out = [
            ...edges,
            {
              id,
              from,
              to,
              ...(toPosition ? { toPosition } : {}),
              ...(toIndex !== undefined ? { toIndex } : {}),
              ...(fromPosition ? { fromPosition } : {}),
              ...(fromIndex !== undefined ? { fromIndex } : {}),
            },
          ];
          return out;
        },
      }),

      assign('selected', {
        ADD_EDGE: ({ context, payload }) => {
          const p =
            typeof payload === 'string'
              ? { from: payload, to: '' }
              : (payload as any);
          const { from, to, toPosition, toIndex } = p;
          const edges = context.data?.edges ?? [];
          const id = buildEdgeId(from, to, toPosition, toIndex);
          const existing = edges.find(
            e =>
              e.id === id ||
              (e.from === from &&
                e.to === to &&
                (!toPosition || e.toPosition === toPosition) &&
                (toIndex === undefined || e.toIndex === toIndex)),
          );
          return existing ? existing.id : id;
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

        pContext.dimensions[id] = pContext.calculateDimensions(
          position,
          parentDimension ?? DEFAULT_SIZE,
        );

        const defaultData = pContext.defaultData ?? DEFAULT_DATA;
        nodes?.push({ id, data: { ...defaultData }, position });
        return nodes;
      },
    }),

    placeParent: assign('data.nodes', {
      ADD_PARENT: ({ context: { data, zoom = 1, board }, pContext, payload }) => {
        const nodes = toArray.typed(data?.nodes);
        const customId =
          typeof payload === 'object' && payload ? payload.id : undefined;
        const id = customId ?? buildNodeID(pContext.generatedId);
        const parentId =
          typeof payload === 'string'
            ? payload
            : typeof payload === 'object' && payload
              ? payload.parentId
              : undefined;

        const parentNode = parentId
          ? nodes.find(node => node.id === parentId)
          : undefined;
        const parentDimension = parentId ? pContext.dimensions[parentId] : undefined;

        let width: number = DEFAULT_SIZE.width;
        let height: number = DEFAULT_SIZE.height;
        let x: number;
        let y: number;

        if (parentNode) {
          width = parentDimension?.width ?? DEFAULT_SIZE.width;
          height = parentDimension?.height ?? DEFAULT_SIZE.height;
          x = parentNode.position.x + width + 100;
          y = parentNode.position.y + height + 250;
        } else if (board) {
          const container = board.parent;
          const scrollLeft = container?.scrollLeft ?? 0;
          const scrollTop = container?.scrollTop ?? 0;
          const bWidth = container?.width ?? 0;
          const bHeight = container?.height ?? 0;
          const currentZoom = zoom;
          x = (scrollLeft + bWidth / 2) / currentZoom;
          y = (scrollTop + bHeight / 2) / currentZoom;
        } else {
          x = 0;
          y = 0;
        }

        const position =
          board && !parentNode
            ? pContext.clampPosition(board, x, y, width, height)
            : { x, y };

        pContext.dimensions[id] = pContext.calculateDimensions(
          position,
          parentDimension ?? DEFAULT_SIZE,
        );

        const defaultData = pContext.defaultData ?? DEFAULT_DATA;
        const nodeData =
          typeof payload === 'object' && payload?.data
            ? payload.data
            : { ...defaultData };

        const nodeHandles =
          typeof payload === 'object' && payload?.handles
            ? payload.handles
            : undefined;

        nodes.push({
          id,
          data: nodeData,
          position,
          ...(nodeHandles ? { handles: nodeHandles } : {}),
        });
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

        pContext.dimensions[id] = pContext.calculateDimensions(
          position,
          parentDimension ?? DEFAULT_SIZE,
        );

        const defaultData = pContext.defaultData ?? DEFAULT_DATA;
        nodes?.push({ id, data: { ...defaultData }, position });
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
