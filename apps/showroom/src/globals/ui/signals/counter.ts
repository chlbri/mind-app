import { createSignal } from 'solid-js';

/**
 * Creates a reactive numeric counter store with increment/decrement helpers.
 *
 * @param intitial - The initial counter value. Defaults to `0`.
 *
 * @returns An object containing the count accessor and mutating handlers.
 */
export const createCounter = (intitial = 0) => {
  const [count, _setCount] = createSignal(intitial);

  const setCount = (num = 0) => {
    return () => _setCount(num);
  };

  const incrementFn = (num = 1) => {
    return () => _setCount(v => v + num);
  };
  const increment = incrementFn();

  const decrementFn = (num = 1) => {
    return () => _setCount(v => v - num);
  };
  const decrement = decrementFn();

  return { count, decrement, increment, incrementFn, decrementFn, setCount };
};
