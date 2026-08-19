import { createEffect, onCleanup, type Accessor } from 'solid-js';

import { buildBoolean } from '../helpers';

/** Options for setting up reactive interval execution. */
type Options = {
  /** Delay duration between execution ticks in milliseconds. */
  delay?: number;
  /** Active condition boolean or Solid accessor. */
  start?: Accessor<boolean | undefined> | boolean;
};

/**
 * Creates an interval timer controller with manual `start` and `stop` methods.
 *
 * @param callback - The recurring function to execute on each interval.
 * @param delay - Interval delay in milliseconds. Defaults to 3000.
 *
 * @returns Object with `start` and `stop` trigger methods.
 */
export const createInterval = (callback: () => void, delay = 3000) => {
  let interval: NodeJS.Timeout;

  const start = (condition?: Options['start']) => {
    const _condition = buildBoolean(condition);
    if (!_condition) return stop();
    interval = setInterval(() => {
      callback();
    }, delay);
  };

  const stop = (condition?: Options['start']) => {
    const _condition = buildBoolean(condition);
    if (!_condition) return;
    if (interval) clearInterval(interval);
  };

  onCleanup(stop);
  return { start, stop };
};

/**
 * Automatically creates and manages a reactive interval driven by condition signals.
 *
 * @param callback - The recurring function to execute.
 * @param options - Configuration options of type {@linkcode Options}.
 */
createInterval.auto = (callback: () => void, options: Options = {}) => {
  const { start } = createInterval(callback, options.delay);
  createEffect(() => start(options.start));
};
