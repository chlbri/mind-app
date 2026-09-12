import { identity } from '@bemedev/app';

import type { Vector } from '#services/main.machine.typings';

/**
 * Identity helper function for creating type-safe SVG path draw functions from a
 * type {@linkcode Vector}.
 */
export const createDraw = identity<(v?: Vector) => string>;
