import { createMachine, typings } from '@bemedev/app-ts';
import { SCHEMAS } from './main.machine.gen';

export const machine = createMachine(
  {
    __tsSchema: SCHEMAS.machine.__tsSchema,
    initial: 'idle',
    states: {
      idle: {},
    },
  },
  typings({}),
);
