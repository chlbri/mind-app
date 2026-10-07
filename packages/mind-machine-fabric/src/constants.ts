/** SVG stroke dash pattern applied to dashed edges. */
export const DASH_ARRAY = '6 4';

/** Color palette indexed by -- type {@linkcode EdgeKind} for each edge category. */
export const EDGES_COLORS = {
  after: '#f97316',
  always: '#22c55e',
  on: '#3b82f6',
  child_parent: '#8b5cf6',
} as const;

/** Path key reserved for the unique principal node of a machine diagram. */
export const PRINCIPAL_NODE_KEY = '/';

/**
 * Determines whether a given state path is a direct child of the principal node
 * (i.e. has exactly one '/' separator, e.g. '/cart', '/payment').
 *
 * @param path - State path to test, of type `string | undefined`.
 *
 * @returns `true` when the path is a direct child of the principal node, `false`
 *   otherwise.
 */
export const isDirectChildOfPrincipal = (path?: string): boolean => {
  if (!path || path === PRINCIPAL_NODE_KEY) return false;
  return path.startsWith('/') && !path.slice(1).includes('/');
};
