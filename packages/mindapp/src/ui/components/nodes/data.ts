import type { NodeHandles_T } from '#services/main.machine.typings';

/**
 * Default handle configuration applied when none is specified.
 *
 * @see -- type {@linkcode NodeHandles_T}
 */
export const DEFAULT_HANDLES: NodeHandles_T = {
  left: [{ type: 'input' }],
  right: [{ type: 'output' }],
};
