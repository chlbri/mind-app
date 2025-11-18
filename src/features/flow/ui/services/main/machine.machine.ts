import { createMachine, typings } from '@bemedev/app-ts';
import { SCHEMAS } from './machine.machine.gen';

export const machine = createMachine(
  {
    __tsSchema: SCHEMAS.machine.__tsSchema,
    initial: 'idle',
    states: {
      idle: {
        on: {
          CONFIGURE: {
            actions: ['addNodes', 'addEdges'],
            target: '/initialization',
          },
        },
      },
      initialization: {
        initial: 'edges',
        states: {
          edges: {
            always: {
              actions: ['initializeEdges'],
              target: '/initialization/nodes',
            },
          },
          nodes: {
            always: {
              actions: ['initializeNodes'],
              target: '/initialization/next',
            },
          },
          next: {
            on: {
              MOUNT: '/mounting',
            },
          },
        },
      },

      mounting: {
        initial: 'nodes',
        states: {
          nodes: {
            initial: 'offsets',
            states: {
              offsets: {
                always: {
                  actions: ['setNodeOffsets'],
                  target: '/mounting/edges',
                },
              },
            },
          },
          edges: {
            initial: 'actives',
            states: {
              actives: {
                always: {
                  actions: ['setActiveEdges'],
                  target: '/mounting/edges/positions',
                },
              },
              positions: {
                always: {
                  actions: ['setEdgePositions'],
                  target: '/measure',
                },
              },
            },
          },
        },
      },
      measure: {
        always: {
          actions: ['measure'],
          target: '/working',
        },
      },
      working: {
        type: 'parallel',
        states: {
          nodes: {
            on: {
              MOUNT: '/mounting',
              ADD_CHILD: {
                actions: 'addChild',
              },
              ADD_SIBLING: {
                actions: 'addSibling',
              },
            },
          },
          edges: {},
        },
      },
    },
  },
  typings({
    eventsMap: {
      MOUNT: 'primitive',
      ADD_CHILD: {
        parent: 'string',
      },
      ADD_SIBLING: {
        sibling: 'string',
      },
      CONFIGURE: {},
    },
  }),
);
