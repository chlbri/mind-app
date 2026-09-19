import type { Component } from 'solid-js';

/**
 * Headless lifecycle component that invokes a provided children callback upon
 * rendering.
 *
 * @param props - Component properties containing the callback.
 * @param props.children - Optional callback function to execute.
 *
 * @returns Nothing (`void`).
 */
export const Hook: Component<{ children?: () => void }> = p => void p.children?.();
