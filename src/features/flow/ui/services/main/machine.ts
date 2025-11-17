import { createMachine, typings } from '@bemedev/app-ts';

export const machine = createMachine(
  {
    initial: 'idle',
    states: {
      idle: {},
      working: {
        type: 'parallel',
        states: {
          nodes: {
            on: {
              MEASURE: {
                actions: 'measure',
              },
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
      MEASURE: {
        id: 'string',
        width: 'number',
        height: 'number',
      },
      ADD_CHILD: {
        parent: 'string',
      },
      ADD_SIBLING: {
        sibling: 'string',
      },
    },
  }),
);
