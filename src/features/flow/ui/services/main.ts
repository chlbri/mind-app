import { interpret } from '@bemedev/app-solid';
import { machine } from './main.machine';

export const service = interpret(machine, {
  context: {
    nodes: [],
    edges: [],
    edge: undefined,
  },
  pContext: {
    mount: {},
  },
});
