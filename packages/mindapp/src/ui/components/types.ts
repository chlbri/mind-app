import type { JSX } from 'solid-js';

export type HighComponent<T extends object> = <D extends T>(props: D) => JSX.Element;
