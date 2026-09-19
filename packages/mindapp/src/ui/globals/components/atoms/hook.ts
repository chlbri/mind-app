import type { Component } from 'solid-js';

export const Hook: Component<{ children?: () => void }> = p => void p.children?.();
