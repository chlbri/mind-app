import { interpret } from '@bemedev/app-solid';
import { machine } from './main.machine';

export const buildService = () => {
  const service = interpret(machine, {
    context: {
      nodes: [],
      edges: [],
      updates: {},
    },
  });

  service.start();
  return service;
};
