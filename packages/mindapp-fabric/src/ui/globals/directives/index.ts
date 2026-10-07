/** Re-exports the Solid custom directives and augments the JSX directives registry. */
import type { MouseOutParam } from './mouseOut';

export * from './clickOutside';
export * from './mouseOut';

declare module 'solid-js' {
  // oxlint-disable-next-line typescript/no-namespace
  namespace JSX {
    interface Directives {
      clickOutside: () => void;
      mouseOut: MouseOutParam;
    }
  }
}
