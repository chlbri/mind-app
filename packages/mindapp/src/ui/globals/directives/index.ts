import type { MouseOutParam } from './mouseOut';

export * from './clickOutside';
export * from './mouseOut';
export * from './resize';

declare module 'solid-js' {
  // oxlint-disable-next-line typescript/no-namespace
  namespace JSX {
    interface Directives {
      clickOutside: () => void;
      mouseOut: MouseOutParam;
      draggable: { skipTransform?: boolean };
    }
  }
}
