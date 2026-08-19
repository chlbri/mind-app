import { createSignal } from 'solid-js';

/**
 * Reactive signal and setter storing the identifier of the element currently
 * requested to receive focus.
 */
export const [toFocus, setFocus] = createSignal<string | undefined>(undefined);
