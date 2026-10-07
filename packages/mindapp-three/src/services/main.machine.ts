import { createMachine } from '@bemedev/app';
import { toArray } from '@bemedev/app/bemedev';
import { nanoid } from 'nanoid';
import * as v from 'valibot';

import { clamp } from '..';
import {
  DEFAULT_DATA,
  DEFAULT_PHYSICS_OPTIONS,
  MAX_ZOOM,
  MIN_ZOOM,
} from './main.machine.data';
import { buildEdgeId, buildNodeID } from './main.machine.helpers';
import {
  calculateDiff,
  MAX_HISTORY_SIZE,
  reconstructState,
  squashOldestCommit,
} from './main.machine.history';
import {
  commitPayload,
  data,
  extremities,
  flowchartData,
  flowchartEdge,
  flowchartNode,
  history,
  physicsSettings,
  point3d,
  positionsBatch,
  type CommitPayload,
  type FlowchartData,
  type FlowchartDiff,
  type HistoryEntry,
  type PhysicsSettings,
  type Point3D,
} from './main.machine.typings';

/**
 * Type aliases for flowchart history, delta diffs, and commit payloads.
 *
 * @see -- type {@linkcode CommitPayload}, -- type {@linkcode FlowchartData}, -- type {@linkcode FlowchartDiff}, -- type {@linkcode HistoryEntry}
 */
export type { CommitPayload, FlowchartData, FlowchartDiff, HistoryEntry };

/**
 * State machine managing 3D flowchart state transitions, nodes, edges, selection,
 * physics settings, and layout actions.
 *
 * @see {@linkcode buildEdgeId}, {@linkcode buildNodeID}, {@linkcode clampPosition3d}, {@linkcode DEFAULT_PHYSICS_OPTIONS}
 */
export const machine = createMachine(
  {
    initial: 'idle',
    on: { BUILD_HISTORY: { actions: ['buildHistory'] } },

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
          MOVE: { actions: ['moveNode', 'buildUI'], target: '/construction' },
          ADD_NODE: { actions: ['generateID', 'addNode'], target: '/construction' },
          REMOVE_NODE: {
            actions: ['removeNode'],
            target: '/construction',
            guards: 'canDelete',
          },
          ADD_EDGE: {
            actions: ['addEdge'],
            target: '/construction',
            guards: 'edgesAllowed',
          },
          REMOVE_EDGE: { actions: ['removeEdge'], target: '/construction' },
          SELECT: { actions: ['select'], target: '/register' },
          DESELECT: { actions: ['deselect'], target: '/register' },
          EDIT: { actions: ['edit'], target: '/register' },
          STOP_EDIT: { actions: ['stopEdit'], target: '/register' },
          SET_NODE_DATA: { actions: ['setNodeData'], target: '/register' },
          SET_EDGE_DATA: { actions: ['setEdgeData'], target: '/register' },
          ZOOM: { actions: ['zoom'], target: '/register' },
          TOGGLE_ZOOM: { actions: ['toggleZoom'], target: '/register' },
          TOGGLE_PHYSICS: { actions: ['togglePhysics'], target: '/register' },
          PIN_NODE: { actions: ['pinNode'], target: '/register' },
          APPLY_PHYSICS: { actions: ['applyPhysics'], target: '/register' },
          COMMIT: { actions: ['recordHistory'], target: '/construction' },
          RESET_HISTORY: { actions: ['resetHistory'], target: '/register' },
          CONFIGURE: { actions: ['configure'], target: '/construction' },
          UNDO: { actions: ['undo'], target: '/construction', guards: 'canUndo' },
          REDO: { actions: ['redo'], target: '/construction', guards: 'canRedo' },
          CHECKOUT: {
            actions: ['checkout'],
            target: '/construction',
            guards: 'canCheckout',
          },
        },
      },
    },
  },
  {
    eventsMap: v.object({
      SET_BOARD: v.never(),
      CONFIGURE_EMPTY: v.never(),
      MOVE: v.object({ id: v.string(), ...point3d.entries }),
      ADD_NODE: v.object({
        id: v.optional(v.string()),
        data: v.optional(data),
        position: v.optional(point3d),
      }),
      REMOVE_NODE: v.string(),
      SELECT: v.string(),
      DESELECT: v.never(),
      EDIT: v.string(),
      STOP_EDIT: v.never(),
      ADD_EDGE: extremities,
      REMOVE_EDGE: v.string(),
      ZOOM: v.number(),
      TOGGLE_ZOOM: v.never(),
      TOGGLE_PHYSICS: v.never(),
      PIN_NODE: v.object({ id: v.string(), fixed: v.boolean() }),
      APPLY_PHYSICS: positionsBatch,
      SET_NODE_DATA: v.object({ id: v.string(), data }),
      SET_EDGE_DATA: v.object({ id: v.string(), data }),
      UNDO: v.never(),
      REDO: v.never(),
      CHECKOUT: v.number(),
      COMMIT: v.optional(commitPayload),
      RESET_HISTORY: v.never(),
      BUILD_HISTORY: v.object({ history, historyIndex: v.number() }),
      CONFIGURE: v.object({
        nodes: v.array(flowchartNode),
        edges: v.array(flowchartEdge),
        defaultData: v.optional(data),
      }),
    }),

    sync: true,

    pContext: v.object({
      generatedId: v.nullable(v.string()),
      previousZoom: v.optional(v.number()),
      defaultData: v.optional(data),

      clampPosition: v.custom<(position: Point3D) => Point3D>(() => true),
    }),

    context: v.object({
      data: v.optional(flowchartData),
      history: v.optional(history),
      historyIndex: v.optional(v.number()),
      selected: v.optional(v.string()),
      editing: v.optional(v.string()),
      updatingUI: v.optional(v.boolean()),
      zoom: v.number(),
      physics: physicsSettings,
    }),
  },
).provideOptions(({ assign, batch, erase, filter, action }) => {
  return {
    guards: {
      /**
       * Tells whether an older commit is available.
       *
       * @param args - Machine guard arguments.
       *
       * @returns `true` when an undo target exists.
       */
      canUndo: ({ context: { historyIndex } }) => {
        return (historyIndex ?? -1) > 0;
      },

      /**
       * Tells whether a newer commit is available.
       *
       * @param args - Machine guard arguments.
       *
       * @returns `true` when a redo target exists.
       */
      canRedo: ({ context: { history, historyIndex } }) => {
        if (!history || historyIndex === undefined) return false;
        return historyIndex >= 0 && historyIndex < history.length - 1;
      },

      /**
       * Tells whether a history source exists for checkout.
       *
       * @param args - Machine guard arguments.
       *
       * @returns `true` when history is initialized.
       */
      canCheckout: ({ context: { history } }) => !!history,

      /**
       * Tells whether the targeted node can be deleted, protecting the principal
       * node.
       *
       * @param args - Machine guard arguments.
       *
       * @returns `true` when the node is deletable.
       */
      canDelete: ({ context: { data }, event }) => {
        const id = event.payload;
        if (id === '/') return false;
        const node = data?.nodes?.find(n => n.id === id);
        if ((node?.data as any)?.principal) return false;
        return true;
      },

      /**
       * Tells whether an edge connection between two existing nodes is permitted.
       *
       * @param args - Machine guard arguments.
       *
       * @returns `true` when both extremity nodes exist.
       */
      edgesAllowed: ({ context: { data }, event }) => {
        const { from, to } = event.payload as { from: string; to: string };
        const nodes = data?.nodes ?? [];
        return nodes.some(n => n.id === from) && nodes.some(n => n.id === to);
      },
    },

    actions: {
      /** Loads an externally provided history and its index into the context. */
      buildHistory: assign(['history', 'historyIndex'], {
        BUILD_HISTORY: ({ payload: { history, historyIndex } }) => [
          history,
          historyIndex,
        ],
      }),

      /** Records a commit as a delta diff, creating the base snapshot when empty. */
      recordHistory: assign(
        ['history', 'historyIndex'],
        ({ context: { data, history = [], historyIndex = -1 }, ...rest }: any) => {
          if (!data) return [history, historyIndex];

          let commitName: string | undefined;
          if (rest?.event?.type === 'COMMIT') {
            const p: CommitPayload | undefined = rest?.event?.payload;
            if (typeof p === 'string') {
              commitName = p.trim() || undefined;
            }
          }

          // Base entry
          if (history.length === 0) {
            const hasContent =
              (data.nodes?.length ?? 0) > 0 || (data.edges?.length ?? 0) > 0;
            if (!hasContent) return [history, historyIndex];

            const entry: HistoryEntry = {
              data: structuredClone(data),
              date: Date.now(),
              ...(commitName ? { name: commitName } : {}),
            };
            return [[entry], 0];
          }

          // Calculate diff from the last registered commit to the current one
          const previousIndex = history.length - 1;
          const previousData = reconstructState(history, previousIndex);
          const diff = calculateDiff(previousData, data);

          // No changes observed => skip commit (no empty commit)
          if (!diff) {
            return [history, historyIndex];
          }

          // Add the current commit at the end without rebuilding or pruning history
          const newEntry: HistoryEntry = {
            diff,
            date: Date.now(),
            ...(commitName ? { name: commitName } : {}),
          };
          const nextHistory = [...history, newEntry];

          // Cap at MAX_HISTORY_SIZE (100)
          while (nextHistory.length > MAX_HISTORY_SIZE) {
            squashOldestCommit(nextHistory);
          }

          return [nextHistory, nextHistory.length - 1];
        },
      ),

      /** Reconstructs the previous commit data and decrements the history index. */
      undo: batch(
        assign('data', ({ context: { history = [], historyIndex = 0 } }) => {
          if (historyIndex <= 0) return history[0]?.data;
          return reconstructState(history, historyIndex - 1);
        }),

        assign('historyIndex', ({ context: { historyIndex = 0 } }) => {
          return Math.max(0, historyIndex - 1);
        }),
      ),

      /** Reconstructs the next commit data and increments the history index. */
      redo: batch(
        assign('data', ({ context: { history = [], historyIndex = 0 } }) => {
          if (historyIndex >= history.length - 1) {
            return reconstructState(history, history.length - 1);
          }
          return reconstructState(history, historyIndex + 1);
        }),

        assign('historyIndex', ({ context: { history = [], historyIndex = 0 } }) => {
          return Math.min(history.length - 1, historyIndex + 1);
        }),
      ),

      /** Reconstructs the flowchart data at the checked out commit index. */
      checkout: batch(
        assign('data', {
          CHECKOUT: ({ context: { history = [] }, payload }) => {
            return reconstructState(history, payload);
          },
        }),

        assign('historyIndex', { CHECKOUT: ({ payload }) => payload }),
      ),

      /** Resets the history to a single base snapshot of the current data. */
      resetHistory: batch(
        assign('history', ({ context: { data } }) => {
          const cloned = data ? structuredClone(data) : undefined;
          if (!cloned) return [];
          return [{ data: cloned, date: Date.now() }];
        }),

        assign('historyIndex', () => 0),
      ),

      /** Replaces the graph data with the configured nodes, edges and default data. */
      configure: batch(
        assign('data', {
          CONFIGURE: ({ payload: { nodes, edges } }) => ({ nodes, edges }),
        }),

        assign('updatingUI', () => false),

        action(({ pContext }) => {
          pContext.generatedId = null;
        }),
        action({
          CONFIGURE: ({ payload: { defaultData }, pContext }) => {
            pContext.defaultData = defaultData;
          },
        }),
      ),

      /** Merges partial data into the node matching the event payload id. */
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

      /** Merges partial data into the edge matching the event payload id. */
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

      /** Generates the id of the next created node, honoring a provided custom id. */
      generateID: action({
        ADD_NODE: ({ pContext, payload }) => {
          pContext.generatedId = payload.id ?? nanoid();
        },
        else: ({ pContext }) => {
          pContext.generatedId = nanoid();
        },
      }),

      /** Adds a new node at the provided or seeded position and selects it. */
      addNode: batch(
        assign('data.nodes', {
          ADD_NODE: ({ context: { data }, pContext, payload }) => {
            const nodes = toArray.typed(data?.nodes);
            const id = buildNodeID(pContext.generatedId);
            const defaultData = pContext.defaultData ?? DEFAULT_DATA;
            const position = pContext.clampPosition(
              payload.position ?? { x: 0, y: 0, z: 0 },
            );

            nodes.push({
              id,
              data: { ...defaultData, ...(payload.data ?? {}) },
              position,
            });
            return nodes;
          },
        }),

        assign('selected', ({ pContext: { generatedId } }) =>
          buildNodeID(generatedId),
        ),
      ),

      /**
       * Deletes the targeted node and every linked edge, protecting the principal
       * node.
       */
      removeNode: batch(
        filter('data.edges', {
          REMOVE_NODE: ({ from, to }, _, { payload }) => {
            return from !== payload && to !== payload;
          },
        }),

        filter('data.nodes', {
          REMOVE_NODE: ({ id }, _, { payload }) => {
            return id !== payload;
          },
        }),

        erase('editing'),
      ),

      /** Adds a deduplicated edge and selects it. */
      addEdge: batch(
        assign('data.edges', {
          ADD_EDGE: ({ context, payload }) => {
            const { from, to } = payload;
            const edges = context.data?.edges ?? [];
            const id = buildEdgeId(from, to);
            if (edges.some(e => e.id === id || (e.from === from && e.to === to))) {
              return edges;
            }
            return [...edges, { id, from, to }];
          },
        }),

        assign('selected', {
          ADD_EDGE: ({ context, payload }) => {
            const { from, to } = payload;
            const edges = context.data?.edges ?? [];
            const id = buildEdgeId(from, to);
            const existing = edges.find(
              e => e.id === id || (e.from === from && e.to === to),
            );
            return existing ? existing.id : id;
          },
        }),
      ),

      /** Removes the targeted edge from the graph data. */
      removeEdge: filter('data.edges', {
        REMOVE_EDGE: ({ id }, _, { payload }) => {
          return id !== payload;
        },
      }),

      /** Stores the identifier of the selected node or edge. */
      select: assign('selected', { SELECT: ({ payload }) => payload }),

      /** Clears both the selected and editing identifiers. */
      deselect: batch(erase('selected'), erase('editing')),

      /** Stops node edition, keeping the current selection. */
      stopEdit: erase('editing'),

      /** Selects and starts editing the targeted node. */
      edit: batch(
        assign('editing', { EDIT: ({ payload }) => payload }),
        assign('selected', { EDIT: ({ payload }) => payload }),
      ),

      /** Moves the targeted node to the requested 3D coordinates. */
      moveNode: assign('data.nodes', {
        MOVE: ({ context: { data }, payload: { id, x, y, z } }) => {
          return data?.nodes?.map(node => {
            if (node.id === id) return { ...node, position: { x, y, z } };
            return node;
          });
        },
      }),

      /** Applies a batch of simulated positions to the graph nodes. */
      applyPhysics: assign('data.nodes', {
        APPLY_PHYSICS: ({ context: { data }, payload }) => {
          return data?.nodes?.map(node => {
            const position = payload[node.id];
            return position ? { ...node, position } : node;
          });
        },
      }),

      /** Pins or releases the targeted node in the physics simulation. */
      pinNode: assign('data.nodes', {
        PIN_NODE: ({ context: { data }, payload: { id, fixed } }) => {
          return data?.nodes?.map(node => {
            if (node.id === id) return { ...node, fixed };
            return node;
          });
        },
      }),

      /** Applies a clamped zoom delta to the camera distance factor. */
      zoom: assign('zoom', {
        ZOOM: ({ context: { zoom }, payload, pContext }) => {
          const next = zoom + payload;
          const clamped = clamp(next, MIN_ZOOM, MAX_ZOOM);
          pContext.previousZoom = undefined;
          return clamped;
        },
      }),

      /** Toggles between the previous zoom level and the default zoom of `1`. */
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

      /** Enables or disables the force-directed physics simulation. */
      togglePhysics: assign('physics', {
        TOGGLE_PHYSICS: ({ context: { physics } }) => {
          const next: PhysicsSettings = {
            ...physics,
            enabled: !physics.enabled,
            alpha: physics.enabled ? physics.alpha : DEFAULT_PHYSICS_OPTIONS.alpha,
          };
          return next;
        },
      }),

      /** Flags the UI as dirty so the 3D scene rebuilds its object graph. */
      buildUI: assign('updatingUI', () => true),

      /** No-op registration hook overridden by consumers through `addOptions`. */
      register: action(() => {}),
    },
  };
});
