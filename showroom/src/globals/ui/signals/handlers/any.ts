import type { Handler } from './types';

export const createHandlerFuntion: Handler = (
  normal,
  conditional,
  ref,
) => {
  const out = normal(ref) as any;
  out.conditional = conditional(ref);
  return out;
};
