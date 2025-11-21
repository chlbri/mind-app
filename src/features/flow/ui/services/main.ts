import { interpret } from '@bemedev/app-solid';
import { machine } from './main.machine';

export const buildService = () => {
  const out = interpret(machine);
  out.start();
  return out;
};
