import { interpret } from '@bemedev/app';
import { machine as _machine } from './main.machine';

export const buildService = (machine = _machine) => {
  const out = interpret(machine, {
    pContext: {
      generatedId: null,
    },
  } as any);

  out.start();
  return out;
};
