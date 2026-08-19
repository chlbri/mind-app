import { identity } from '@bemedev/pipe/extensions/common';
import { useRouter } from '@tanstack/solid-router';

/**
 * Filter predicate function determining if a route path should be
 * included.
 *
 * @param value - The route path string to test.
 *
 * @returns `true` if the route path should be kept; otherwise `false`.
 */
type Filter = (value: string) => boolean;

/**
 * Search parameter factory function for a route path.
 *
 * @param to - The target route path.
 *
 * @returns An accessor returning search query parameters.
 */
type SearchFn = (to: string) => () => any;

/**
 * Label formatter function for a route path.
 *
 * @param to - The target route path.
 *
 * @returns The formatted display label.
 */
type FormatFn = (to: string) => string;

/** Configuration options for generating router navigation links. */
type Args = {
  /** Optional route filter predicate of type {@linkcode Filter}. */
  filter?: Filter;
  /** Optional search query params builder of type {@linkcode SearchFn}. */
  search?: SearchFn;
  /** Optional label formatter of type {@linkcode FormatFn}. */
  formatLabel?: FormatFn;
};

/**
 * Formats a route path into a human-readable title label.
 *
 * @param to - The route path to format.
 *
 * @returns The capitalized and sanitized label string.
 */
export const formatLabel1 = (to: string) => {
  const step1 = to.charAt(1).toUpperCase() + to.slice(2);
  const out =
    step1 === '' || step1 === '/'
      ? 'Home'
      : step1.endsWith('/')
        ? step1.slice(0, -1)
        : step1;
  return out;
};

/**
 * Generates an array of sorted navigation link objects from TanStack
 * Router routes.
 *
 * @param args - Configuration arguments of type {@linkcode Args}.
 *
 * @returns An array of route link descriptors.
 */
export const createLinks = (args?: Args) => {
  const { routesByPath } = useRouter();

  // #region Destructure maybe undefined object
  const {
    filter = () => true,
    search = () => () => undefined,
    formatLabel = identity,
  } = args ?? {};
  // #endregion

  const routes = Object.keys(routesByPath);

  return routes
    .sort((a, b) => {
      if (a === '/') return -1; // Home should be first
      return a.localeCompare(b);
    })
    .filter(filter)
    .map(to => ({ to, children: formatLabel(to), search: search(to) }));
};
