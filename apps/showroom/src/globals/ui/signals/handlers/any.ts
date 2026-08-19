import type { Handler } from './types';

/**
 * Creates an event handler wrapper combining a direct handler with a
 * conditional event attachment method.
 */
export const createHandlerFuntion: Handler = (
  normal,
  conditional,
  ref,
) => {
  const out = normal(ref) as any;
  out.conditional = conditional(ref);
  return out;
};
