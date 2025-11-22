import { interpret } from '@bemedev/app-solid';
import { machine as _machine } from './main.machine';

export const buildService = (machine = _machine) => {
  const out = interpret(machine, {
    pContext: {
      generatedId: null,
    },
  });

  out.start();
  return out;
};
