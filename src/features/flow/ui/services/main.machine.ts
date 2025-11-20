import { createMachine, typings } from '@bemedev/app-ts';
import { SCHEMAS } from './main.machine.gen';
import {
  edgeJSON,
  extremities,
  nodeJSON,
  point,
  vector,
  type nodeOffset,
} from './main.types';
import type { inferT } from '@bemedev/app-ts/lib/utils/typings';

export const buildEdgeId = (nodeOutId: string, nodeInId: string) => {
  return `edge_${nodeOutId}_${nodeInId}`;
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
            target: '/initialization',
          },
        },
      },
      initialization: {
        initial: 'edges',
        states: {
          edges: {
            always: {
              actions: ['initEdges'],
              target: '/initialization/nodes',
            },
          },
          nodes: {
            always: {
              actions: [
                'initNodePositions',
                'initNodeDatas',
                'initOffsets',
              ],
              target: '/working',
            },
          },
        },
      },
      working: {
        on: {
          UPDATE: '/initialization',
          ADD_CHILD: {
            actions: [
              {
                name: 'addChildNode',
                description: 'Must be in the ui',
              },
              'notifyChildAdded',
              {
                name: 'notifyChildAddedUI',
                description: 'Must be in the ui',
              },
            ],
            target: '/initialization',
          },
          ADD_SIBLING: {
            actions: [
              { name: 'addSiblingNode', description: 'Must be in the ui' },
              'notifySiblingAdded',
              {
                name: 'notifySiblingAddedUI',
                description: 'Must be in the ui',
              },
            ],
          },
          DELETE_NODE: {
            actions: [
              { name: 'deleteNode', description: 'Must be in the ui' },
              'notifyNodeDeleted',
              {
                name: 'notifyNodeDeletedUI',
                description: 'Must be in the ui',
              },
            ],
          },
          DELETE_EDGE: {
            actions: [
              { name: 'deleteEdge', description: 'Must be in the ui' },
              'notifyEdgeDeleted',
              {
                name: 'notifyEdgeDeletedUI',
                description: 'Must be in the ui',
              },
            ],
          },
        },
      },
    },
  },
  typings({
    eventsMap: {
      CONFIGURE: typings.partial({
        nodes: typings.array(nodeJSON),
        edges: typings.array(edgeJSON),
      }),
      UPDATE: 'primitive',
      ADD_CHILD: 'string',
      ADD_SIBLING: 'string',
      DELETE_NODE: 'string',
      DELETE_EDGE: 'string',
    },
    context: {
      nodes: typings.array(nodeJSON),
      edges: typings.array(edgeJSON),
      updates: typings.partial({
        edges: {
          nodes: typings.record(extremities),
          positions: typings.record(vector),
          actives: typings.record('boolean'),
        },
        nodes: {
          positions: [point],
          datas: [
            typings.intersection(nodeJSON, {
              in: typings.maybe(typings.array('string')),
              out: ['string'],
            }),
          ],
          offsets: typings.array({
            input: typings.maybe(point),
            output: point,
          }),
        },
      }),
    },
  }),
).provideOptions(({ assign, batch, voidAction }) => ({
  actions: {
    configure: batch(
      assign('context.edges', {
        CONFIGURE: ({ payload: { edges } }) => edges,
      }),
      assign('context.nodes', {
        CONFIGURE: ({ payload: { nodes } }) => nodes,
      }),
    ),

    initEdges: assign(
      'context.updates.edges',
      ({ context: { nodes: current } }) => {
        const nodes: Record<string, inferT<typeof extremities>> = {};
        const positions: Record<string, inferT<typeof vector>> = {};
        const actives: Record<string, boolean> = {};
        const collectedIds = new Set<string>();

        for (let i = 0; i < current.length; i++) {
          for (let j = 0; j < current.length; j++) {
            if (i !== j) {
              const nodeI = current[i];
              const nodeJ = current[j];

              const edgeId = buildEdgeId(nodeI.id, nodeJ.id);
              const edgeId2 = buildEdgeId(nodeJ.id, nodeI.id);
              if (collectedIds.has(edgeId2)) continue;
              if (collectedIds.has(edgeId)) continue;
              positions[edgeId] = { x0: 0, y0: 0, x1: 0, y1: 0 };
              actives[edgeId] = false;
              nodes[edgeId] = {
                from: nodeI.id,
                to: nodeJ.id,
              };
              collectedIds.add(edgeId2);
              collectedIds.add(edgeId);
            }
          }
        }

        return { nodes, positions, actives };
      },
    ),

    initNodePositions: assign(
      'context.updates.nodes.positions',
      ({ context: { nodes } }) => nodes.map(({ position }) => position),
    ),

    initNodeDatas: batch(
      assign('context.updates.nodes', () => ({})),
      assign(
        'context.updates.nodes.datas',
        ({ context: { nodes, edges } }) => {
          return nodes.map(node => ({
            in: edges
              .filter(({ to }) => to === node.id)
              .map(({ from, to }) => buildEdgeId(from, to)),

            out: edges
              .filter(({ from }) => from === node.id)
              .map(({ from, to }) => buildEdgeId(from, to)),
            ...node,
          }));
        },
      ),
    ),

    initOffsets: assign(
      'context.updates.nodes.offsets',
      ({ context: { nodes } }) =>
        nodes.map(node => {
          const point = { x: 0, y: 0 };
          const out: inferT<typeof nodeOffset> = { output: point };
          if (node.input) (out as any).input = point;
          return out;
        }),
    ),

    notifyChildAdded: voidAction({
      ADD_CHILD: ({ payload }) => {
        console.log(`Node ${payload} has a new child`);
      },
    }),

    notifySiblingAdded: voidAction({
      ADD_SIBLING: ({ payload }) => {
        console.log(`Node ${payload} has a new sibling`);
      },
    }),

    notifyNodeDeleted: voidAction({
      DELETE_NODE: ({ payload }) => {
        console.log(`Node ${payload} has been deleted`);
      },
    }),

    notifyEdgeDeleted: voidAction({
      DELETE_EDGE: ({ payload }) => {
        console.log(`Edge ${payload} has been deleted`);
      },
    }),
  },
}));
