import type { EdgeKind, StateMachineEdgeData, TransitionItem } from './types';

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
  /** Guard expression string or array of guard names. */
  guard?: string | string[];
  /** Structured array of guard expression names. */
  guards?: string[];
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
  /** Guard condition expression string or array. */
  guard?: string | string[];
  /** Structured array of guard expression names. */
  guards?: string[];
};

/**
 * Normalizes one or more guard representations (comma-separated string, string
 * array, or both) into a sorted, deduplicated array of non-empty guard names.
 *
 * @param guard - Guard expression string or array of guard expressions.
 * @param guards - Optional supplementary array of guard names.
 *
 * @returns Sorted, unique array of trimmed guard names.
 */
export const normalizeGuards = (
  guard?: string | string[],
  guards?: string[],
): string[] => {
  const tokens: string[] = [];

  if (typeof guard === 'string') {
    tokens.push(...guard.split(','));
  } else if (Array.isArray(guard)) {
    tokens.push(
      ...guard.flatMap(item => (typeof item === 'string' ? item.split(',') : [])),
    );
  }

  if (Array.isArray(guards)) {
    tokens.push(
      ...guards.flatMap(item => (typeof item === 'string' ? item.split(',') : [])),
    );
  }

  const cleaned = Array.from(
    new Set(tokens.map(token => token.trim()).filter(Boolean)),
  );

  return cleaned.sort();
};

/**
 * Checks whether two normalized guard arrays represent the exact same guard
 * conditions.
 *
 * Two empty guard arrays are considered identical (both have no guards).
 *
 * @param g1 - First sorted guard array.
 * @param g2 - Second sorted guard array.
 *
 * @returns `true` if both sets of guards are equal, otherwise `false`.
 */
export const areGuardsEqual = (g1: string[], g2: string[]): boolean => {
  if (g1.length === 0 && g2.length === 0) return true;
  if (g1.length !== g2.length) return false;
  return g1.every((item, index) => item === g2[index]);
};

/**
 * Validates a candidate transition against all existing transitions originating from
 * the same source state (`from`), preventing duplicate/conflicting transitions.
 *
 * Rules strictly followed:
 *
 * 1. **`on` transitions**: If `from` is the same state, candidate conflicts if another
 *    transition has the same `eventName` and identical `guards` (even array of
 *    guards). When no guards are specified, conflicts if `eventName` is repeated
 *    without guards.
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

  const candidateGuards = normalizeGuards(candidate.guard, candidate.guards);

  for (const existing of existingTransitions) {
    // Exclude the transition itself being edited
    if (candidate.id && existing.id === candidate.id) continue;

    // Must originate from the same state
    if (candidate.from !== existing.from) continue;

    // Must be the same transition category
    if (candidate.kind !== existing.kind) continue;

    const existingGuards = normalizeGuards(existing.guard, existing.guards);
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
          reason: `A transition for event '${ev1}' with guard [${candidateGuards.join(', ')}] already exists from state '${candidate.from}'.`,
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
          reason: `A transition for delay '${del1}' with guard [${candidateGuards.join(', ')}] already exists from state '${candidate.from}'.`,
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
          reason: `An 'always' transition with guard [${candidateGuards.join(', ')}] already exists from state '${candidate.from}'.`,
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
