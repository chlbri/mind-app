import type { GuardConfig } from '@bemedev/app';
import { deepEqual } from '@bemedev/app/utils';

import type { EdgeKind, StateMachineEdgeData, TransitionItem } from './types';

/**
 * Guard expression input type supporting single expressions, arrays, or string
 * names.
 */
export type GuardInput = GuardConfig | GuardConfig[] | string | string[] | undefined;

/** Candidate transition being added or edited to test for uniqueness conflicts. */
export type TransitionCheckCandidate = {
  /** Identifier of the transition when in edit mode (ignored during conflict search). */
  id?: string;
  /** Source state node identifier or path (e.g. `'/payment'`). */
  from: string;
  /** Transition category matching edge handle type. */
  kind: EdgeKind;
  /** Event name for `on` transitions (defaults to `'NEXT'`). */
  event?: string;
  /** Delay duration or identifier for `after` transitions (defaults to `'3000ms'`). */
  delay?: string | number;
  /** Structured guard expression or array of guard conditions. */
  guards?: GuardInput;
};

/** Existing transition attached to the state machine diagram. */
export type TransitionCheckItem = {
  /** Unique transition identifier. */
  id: string;
  /** Source state node identifier or path. */
  from: string;
  /** Target state node identifier or path. */
  to?: string;
  /** Transition category. */
  kind: EdgeKind;
  /** Event name for `on` transitions. */
  event?: string;
  /** Delay duration or identifier for `after` transitions. */
  delay?: string | number;
  /** Structured guard expression or array of guard conditions. */
  guards?: GuardInput;
};

/**
 * Computes a deterministic canonical string key used to sort guard definitions for
 * commutative comparison (such as and/or logic arrays).
 *
 * @param guard - The guard configuration.
 *
 * @returns Deterministic string identifier.
 */
export const getGuardSortKey = (guard: GuardConfig): string => {
  if (typeof guard === 'string') return `str:${guard}`;
  if (guard && typeof guard === 'object') {
    if ('name' in guard && typeof (guard as any).name === 'string') {
      const desc = (guard as any).description
        ? `:${(guard as any).description}`
        : '';
      return `desc:${(guard as any).name}${desc}`;
    }
    if ('and' in guard && Array.isArray((guard as any).and)) {
      const children = (guard as any).and.map(getGuardSortKey).sort();
      return `and:[${children.join(',')}]`;
    }
    if ('or' in guard && Array.isArray((guard as any).or)) {
      const children = (guard as any).or.map(getGuardSortKey).sort();
      return `or:[${children.join(',')}]`;
    }
    return JSON.stringify(guard);
  }
  return String(guard);
};

/**
 * Formats a single guard condition into a clean human-readable representation
 * suitable for labels and conflict messages.
 *
 * @param guard - Single guard configuration.
 *
 * @returns Human-readable string representation.
 */
export const formatGuard = (guard: GuardConfig): string => {
  if (typeof guard === 'string') return guard;
  if (guard && typeof guard === 'object') {
    if ('name' in guard && typeof (guard as any).name === 'string') {
      return (guard as any).name;
    }
    if ('and' in guard && Array.isArray((guard as any).and)) {
      return `and(${(guard as any).and.map(formatGuard).join(', ')})`;
    }
    if ('or' in guard && Array.isArray((guard as any).or)) {
      return `or(${(guard as any).or.map(formatGuard).join(', ')})`;
    }
    return JSON.stringify(guard);
  }
  return String(guard);
};

/**
 * Formats an array of guard conditions into a comma-separated display string.
 *
 * @param guards - Array of guard configurations.
 *
 * @returns Formatted string of guards.
 */
export const formatGuards = (guards: GuardConfig[]): string => {
  return guards.map(formatGuard).join(', ');
};

/**
 * Normalizes a single raw guard item into a structured {@linkcode GuardConfig} or
 * array of configurations.
 *
 * @param item - Raw guard item to normalize.
 *
 * @returns Normalized type {@linkcode GuardConfig}, array of configurations, or
 *   `undefined`.
 */
const normalizeGuardItem = (
  item: unknown,
): GuardConfig | GuardConfig[] | undefined => {
  if (item === undefined || item === null) return undefined;

  if (typeof item === 'string') {
    const trimmed = item.trim();
    if (!trimmed) return undefined;

    // Check if it is a JSON string representing a guard object or array
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        return normalizeGuardItem(parsed);
      } catch {
        // Fall through to plain string handling
      }
    }

    if (trimmed.includes(',')) {
      return trimmed
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
    }

    return trimmed;
  }

  if (Array.isArray(item)) {
    const flattened = item.flatMap(sub => {
      const res = normalizeGuardItem(sub);
      return res === undefined ? [] : Array.isArray(res) ? res : [res];
    });
    return flattened;
  }

  if (typeof item === 'object') {
    const obj = item as Record<string, any>;

    if ('and' in obj && Array.isArray(obj.and)) {
      const subItems: GuardConfig[] = obj.and.flatMap((sub: unknown) => {
        const res = normalizeGuardItem(sub);
        return res === undefined ? [] : Array.isArray(res) ? res : [res];
      });

      const seen = new Set<string>();
      const deduped: GuardConfig[] = [];
      for (const sub of subItems) {
        const key = getGuardSortKey(sub);
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(sub);
        }
      }

      deduped.sort((a, b) => getGuardSortKey(a).localeCompare(getGuardSortKey(b)));
      return { and: deduped } as GuardConfig;
    }

    if ('or' in obj && Array.isArray(obj.or)) {
      const subItems: GuardConfig[] = obj.or.flatMap((sub: unknown) => {
        const res = normalizeGuardItem(sub);
        return res === undefined ? [] : Array.isArray(res) ? res : [res];
      });

      const seen = new Set<string>();
      const deduped: GuardConfig[] = [];
      for (const sub of subItems) {
        const key = getGuardSortKey(sub);
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(sub);
        }
      }

      deduped.sort((a, b) => getGuardSortKey(a).localeCompare(getGuardSortKey(b)));
      return { or: deduped } as GuardConfig;
    }

    if ('name' in obj && typeof obj.name === 'string') {
      const name = obj.name.trim();
      if (obj.description !== undefined && obj.description !== null) {
        return { name, description: String(obj.description).trim() } as GuardConfig;
      }
      return name;
    }

    return undefined;
  }

  return undefined;
};

/**
 * Normalizes one or more guard representations (comma-separated string, string
 * array, logical and/or objects, or json string) into a sorted, deduplicated array
 * of {@linkcode GuardConfig} structures.
 *
 * @param guards - Guard expression, array of guards, or combinations.
 *
 * @returns Sorted, deduplicated array of canonical guard configurations.
 */
export const normalizeGuards = (guards?: GuardInput): GuardConfig[] => {
  if (guards === undefined) return [];

  const rawItems: unknown[] = Array.isArray(guards) ? guards : [guards];

  const flattened: GuardConfig[] = rawItems.flatMap(item => {
    const res = normalizeGuardItem(item);
    return res === undefined ? [] : Array.isArray(res) ? res : [res];
  });

  const seen = new Set<string>();
  const deduplicated: GuardConfig[] = [];

  for (const g of flattened) {
    const key = getGuardSortKey(g);
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(g);
    }
  }

  return deduplicated.sort((a, b) =>
    getGuardSortKey(a).localeCompare(getGuardSortKey(b)),
  );
};

/**
 * Checks whether two guard definitions represent the exact same guard conditions
 * using deep equality comparison from `@bemedev/app/utils`.
 *
 * Two empty guard arrays are considered identical (both have no guards).
 *
 * @param g1 - First guard condition or array of conditions.
 * @param g2 - Second guard condition or array of conditions.
 *
 * @returns `true` if both guard representations are deeply equal, otherwise `false`.
 */
export const areGuardsEqual = (g1?: GuardInput, g2?: GuardInput): boolean => {
  const norm1 = normalizeGuards(g1);
  const norm2 = normalizeGuards(g2);

  if (norm1.length === 0 && norm2.length === 0) return true;
  if (norm1.length !== norm2.length) return false;

  return deepEqual(norm1, norm2);
};

/**
 * Validates a candidate transition against all existing transitions originating from
 * the same source state (`from`), preventing duplicate/conflicting transitions.
 *
 * Rules strictly followed:
 *
 * 1. **`on` transitions**: If `from` is the same state, candidate conflicts if another
 *    transition has the same `eventName` and identical `guards` (even combination of
 *    and/or guards). When no guards are specified, conflicts if `eventName` is
 *    repeated without guards.
 * 2. **`after` transitions**: If `from` is the same state, candidate conflicts if
 *    another transition has the same `delay` and identical `guards`. When no guards
 *    are specified, conflicts if `delay` is repeated without guards.
 * 3. **`always` transitions**: If `from` is the same state, candidate conflicts if
 *    another transition has identical `guards`. When no guards are specified,
 *    conflicts if an unguarded `always` transition exists anywhere else from this
 *    state.
 * 4. Transitions being edited (matching `candidate.id`) are excluded from comparison.
 *
 * @param candidate - Candidate transition definition to check.
 * @param existingTransitions - List of all existing transitions in the diagram.
 *
 * @returns Object indicating whether a conflict was found along with an explanation.
 */
export const checkTransitionConflict = (
  candidate: TransitionCheckCandidate,
  existingTransitions: TransitionCheckItem[],
): { hasConflict: boolean; reason?: string } => {
  if (candidate.kind === 'child_parent') {
    return { hasConflict: false };
  }

  const candidateGuards = normalizeGuards(candidate.guards);

  for (const existing of existingTransitions) {
    // Exclude the transition itself being edited
    if (candidate.id && existing.id === candidate.id) continue;

    // Must originate from the same state
    if (candidate.from !== existing.from) continue;

    // Must be the same transition category
    if (candidate.kind !== existing.kind) continue;

    const existingGuards = normalizeGuards(existing.guards);
    const guardsMatch = areGuardsEqual(candidateGuards, existingGuards);

    if (candidate.kind === 'on') {
      const ev1 = (candidate.event ?? 'NEXT').trim();
      const ev2 = (existing.event ?? 'NEXT').trim();

      if (ev1 === ev2 && guardsMatch) {
        if (candidateGuards.length === 0) {
          return {
            hasConflict: true,
            reason: `An unguarded transition for event '${ev1}' already exists from state '${candidate.from}'.`,
          };
        }
        return {
          hasConflict: true,
          reason: `A transition for event '${ev1}' with guard [${formatGuards(candidateGuards)}] already exists from state '${candidate.from}'.`,
        };
      }
    } else if (candidate.kind === 'after') {
      const del1 = String(candidate.delay ?? '3000ms').trim();
      const del2 = String(existing.delay ?? '3000ms').trim();

      if (del1 === del2 && guardsMatch) {
        if (candidateGuards.length === 0) {
          return {
            hasConflict: true,
            reason: `An unguarded transition for delay '${del1}' already exists from state '${candidate.from}'.`,
          };
        }
        return {
          hasConflict: true,
          reason: `A transition for delay '${del1}' with guard [${formatGuards(candidateGuards)}] already exists from state '${candidate.from}'.`,
        };
      }
    } else if (candidate.kind === 'always') {
      if (guardsMatch) {
        if (candidateGuards.length === 0) {
          return {
            hasConflict: true,
            reason: `An unguarded 'always' transition already exists from state '${candidate.from}'.`,
          };
        }
        return {
          hasConflict: true,
          reason: `An 'always' transition with guard [${formatGuards(candidateGuards)}] already exists from state '${candidate.from}'.`,
        };
      }
    }
  }

  return { hasConflict: false };
};

/**
 * Extracts all transitions originating from a specific source state (`fromState`)
 * across all diagram edges.
 *
 * @param edges - All edges in the flow diagram.
 * @param fromState - Source state path to filter transitions by.
 *
 * @returns Array of transitions originating from `fromState`.
 */
export const getTransitionsFromState = (
  edges: Array<{ id: string; from: string; to: string; data?: any }>,
  fromState: string,
): TransitionCheckItem[] => {
  const result: TransitionCheckItem[] = [];

  for (const edge of edges) {
    const data = (edge.data ?? {}) as StateMachineEdgeData;
    const edgeFrom = data.fromState ?? edge.from;
    if (edgeFrom !== fromState) continue;

    const transitions: TransitionItem[] =
      data.transitions && data.transitions.length > 0
        ? data.transitions
        : data.kind
          ? [
              {
                id: edge.id,
                kind: data.kind,
                label: data.label ?? data.kind,
                event: data.event,
                delay: data.delay,
                guards: data.guards,
                actions: data.actions,
              },
            ]
          : [];

    for (const item of transitions) {
      result.push({
        id: item.id,
        from: edgeFrom,
        to: data.toState ?? edge.to,
        kind: item.kind,
        event: item.event,
        delay: item.delay,
        guards: item.guards,
      });
    }
  }

  return result;
};
