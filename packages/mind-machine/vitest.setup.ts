/**
 * Jsdom environment stubs required by the flow chart canvas during component
 * rendering tests.
 */

class ObserverStub {
  /** Required by the `ResizeObserver` and `IntersectionObserver` interfaces. */
  observe() {}
  /** Required by the `ResizeObserver` and `IntersectionObserver` interfaces. */
  unobserve() {}
  /** Required by the `ResizeObserver` and `IntersectionObserver` interfaces. */
  disconnect() {}
  /** Required by the `IntersectionObserver` interface. */
  takeRecords() {
    return [] as never[];
  }
}

const globals = globalThis as Record<string, unknown>;

if (!('ResizeObserver' in globals)) globals.ResizeObserver = ObserverStub;
if (!('IntersectionObserver' in globals))
  globals.IntersectionObserver = ObserverStub;
