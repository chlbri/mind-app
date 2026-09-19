import type { GuardConfig } from "@bemedev/app";
import type { StateType } from "@bemedev/app/states";
import type { EdgesFrom, NodeHandles_T, NodesFrom } from "@bemedev/mind-flow";

import { createHandles } from "./helpers";
import { formatGuards, normalizeGuards } from "./helpers";
import type {
  EdgeKind,
  MachineConfig,
  Position,
  StateActivityData,
  StateActorData,
  StateMachineEdgeData,
  StateMachineNodeData,
  StateNodeKeys,
  StateNodePositions,
  TransitionItem,
} from "./types";

export type { MachineConfig, Position, StateNodeKeys, StateNodePositions };

/** Standard spacing parameters for node layout positioning. */
const HORIZONTAL_SPACING = 360;
const VERTICAL_SPACING = 170;
const INITIAL_X = 80;
const INITIAL_Y = 100;

class Principal {
  ___root = "@bemedev/mind-flow/uniquePrincipal##";

  private constructor() {}
  static get unique() {
    return new Principal();
  }
}

/** Normalizes a raw transition target or candidate into structured properties. */
type NormalizedTarget = {
  target: string;
  guards?: GuardConfig[];
  actions?: string[];
};

const normalizeTarget = (raw: any): NormalizedTarget[] => {
  if (!raw) return [];
  if (typeof raw === "string") return [{ target: raw }];
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => normalizeTarget(item));
  }
  if (typeof raw === "object") {
    const target = raw.target ?? raw.state;
    if (typeof target === "string") {
      const rawGuards = raw.guards ?? raw.guard;
      const normalized = normalizeGuards(rawGuards);
      const guards = normalized.length > 0 ? normalized : undefined;
      const actions = Array.isArray(raw.actions)
        ? raw.actions
        : raw.actions
          ? [raw.actions]
          : undefined;
      return [{ target, guards, actions }];
    }
  }
  return [];
};

/** Helper to extract action string name whether given as string or describer object. */
const toActionName = (action: any): string => {
  if (typeof action === "string") return action;
  if (action && typeof action === "object" && typeof action.name === "string") {
    return action.name;
  }
  return String(action ?? "");
};

/**
 * Normalizes raw activities configured on a state into structured
 * {@linkcode StateActivityData} entries matching `@bemedev/app`'s `ActivityConfig`.
 */
const extractActivities = (rawActivities?: any): StateActivityData[] => {
  if (!rawActivities) return [];

  // If already an array of structured StateActivityData objects
  if (
    Array.isArray(rawActivities) &&
    rawActivities.every((item) => typeof item === "object" && "delay" in item)
  ) {
    return rawActivities.map((item, i) => ({
      ...item,
      id: item.id ?? item.delay ?? String(i),
    }));
  }

  // If legacy array of string keys (e.g. ['pollStatus', 'heartbeat'])
  if (
    Array.isArray(rawActivities) &&
    rawActivities.every((item) => typeof item === "string")
  ) {
    return rawActivities.map((delay) => ({
      id: delay,
      delay,
      actions: [delay],
      description: `Periodic activity executed on '${delay}' interval`,
    }));
  }

  // If ActivityConfig record: Record<string, ActivityArray>
  if (typeof rawActivities === "object") {
    return Object.entries(rawActivities).flatMap(([delay, config]) => {
      const configs = Array.isArray(config) ? config : [config];
      return configs.map((item, i) => {
        if (typeof item === "string") {
          return {
            id: delay,
            delay,
            actions: [item],
            description: `Runs '${item}' action every ${delay}`,
          };
        }
        if (item && typeof item === "object") {
          const rawActions = item.actions ?? item.name;
          const actionsList = Array.isArray(rawActions)
            ? rawActions.map(toActionName)
            : rawActions
              ? [toActionName(rawActions)]
              : [delay];

          const rawGuards = item.guards ?? item.guard;
          const guardsList = normalizeGuards(rawGuards);

          return {
            id: item.id ?? `${delay}_${i}`,
            delay,
            actions: actionsList,
            guards: guardsList.length > 0 ? guardsList : undefined,
            description: item.description,
          };
        }
        return { id: `${delay}_${i}`, delay, actions: [delay] };
      });
    });
  }

  return [];
};

/** Normalizes raw actors defined on a state into {@linkcode StateActorData} entries. */
const extractActors = (rawActors?: Record<string, any>): StateActorData[] => {
  if (!rawActors || typeof rawActors !== "object") return [];

  return Object.entries(rawActors).map(([name, config]) => {
    const isEmitter =
      config &&
      (Boolean(config.next) ||
        Boolean(config.error) ||
        Boolean(config.complete));
    const isChild =
      config &&
      (Boolean(config.on) || Boolean(config.contexts) || Boolean(config.src));

    const type: StateActorData["type"] = isEmitter
      ? "emitter"
      : isChild
        ? "child"
        : "service";

    const emissions: StateActorData["emissions"] = {};
    const nextActions = Array.isArray(config?.next?.actions)
      ? config.next.actions
      : config?.next?.actions
        ? [config.next.actions]
        : typeof config?.next === "string"
          ? [config.next]
          : config?.next
            ? ["handleNext"]
            : undefined;

    const errorActions = Array.isArray(config?.error?.actions)
      ? config.error.actions
      : config?.error?.actions
        ? [config.error.actions]
        : typeof config?.error === "string"
          ? [config.error]
          : undefined;

    const completeActions = Array.isArray(config?.complete?.actions)
      ? config.complete.actions
      : config?.complete?.actions
        ? [config.complete.actions]
        : typeof config?.complete === "string"
          ? [config.complete]
          : undefined;

    if (nextActions) emissions.next = nextActions;
    if (errorActions) emissions.error = errorActions;
    if (completeActions) emissions.complete = completeActions;

    const events: StateActorData["events"] = {};
    const childOnHandlers: Record<string, any> = {};

    if (config?.on && typeof config.on === "object") {
      Object.entries(config.on).forEach(([ev, handler]: [string, any]) => {
        const handlerActions = Array.isArray(handler?.actions)
          ? handler.actions
          : handler?.actions
            ? [handler.actions]
            : typeof handler === "string"
              ? [handler]
              : [];

        events[ev] = handlerActions;
        childOnHandlers[ev] = {
          actions: handlerActions,
          target:
            typeof handler?.target === "string" ? handler.target : undefined,
          guards: handler?.guards ? normalizeGuards(handler.guards) : undefined,
        };
      });
    }

    const description =
      config?.description ??
      (type === "emitter"
        ? `Reactive stream emitter subscribed on state entry, emits values to actions, stops on state exit.`
        : type === "child"
          ? `Bi-directional child actor machine handling event delegation and parent context synchronization.`
          : `Background service executed during the lifecycle of this state.`);

    return {
      id: config?.id ?? name,
      name,
      type,
      description,
      emitter:
        type === "emitter"
          ? {
              next: {
                actions: nextActions ?? ["handleNext"],
                target: config?.next?.target,
                guards: config?.next?.guards
                  ? normalizeGuards(config.next.guards)
                  : undefined,
              },
              error: config?.error
                ? {
                    actions: errorActions,
                    target: config.error.target,
                    guards: config.error.guards
                      ? normalizeGuards(config.error.guards)
                      : undefined,
                  }
                : undefined,
              complete: config?.complete
                ? {
                    actions: completeActions,
                    guards: config.complete.guards
                      ? normalizeGuards(config.complete.guards)
                      : undefined,
                    description: config.complete.description,
                  }
                : undefined,
            }
          : undefined,
      child:
        type === "child"
          ? { on: childOnHandlers, contexts: config?.contexts }
          : undefined,
      emissions,
      events,
      contexts: config?.contexts,
      config,
    };
  });
};

/**
 * Parses a `@bemedev/app` state machine configuration into a flattened set of
 * flowchart nodes and 4 distinct edge categories.
 *
 * Rules strictly followed:
 *
 * 1. No inside children nodes - all states, including children of compound states, are
 *    rendered as standalone canvas nodes.
 * 2. Child to parent relation will have a specific edge of type `child_parent`.
 * 3. `after` transitions map to edges of type `after`.
 * 4. `always` transitions map to edges of type `always`.
 * 5. `on` transitions map to edges of type `on`.
 * 6. State actors are attached to node metadata for rendering the top-right bubble
 *    badge.
 * 7. All StateNodes will have handles: `{ left: ['input'], right: ['output'] }`.
 * 8. For compound states with children, `bottom: ['output', 'input', 'output']` handles
 *    are added.
 * 9. For child states, `top: ['input', 'input', 'input']` handles are added.
 *
 * @template | {@linkcode MachineConfig} `T` - Machine configuration or machine
 *   instance type.
 *
 * @param machineConfig - The state machine configuration object or machine instance.
 * @param positions - Optional dictionary mapping inferred state node path keys to
 *   canvas positions.
 *
 * @returns An object containing the generated nodes and edges.
 *
 * @see -- type {@linkcode MachineConfig}
 * @see -- type {@linkcode Position}
 * @see -- type {@linkcode StateNodeKeys}
 */
export const parseMachineToGraph = <
  const T extends MachineConfig = MachineConfig,
>(
  machineConfig: T,
  positions: Record<StateNodeKeys<T>, Position>,
): {
  nodes: NodesFrom<StateMachineNodeData>;
  edges: EdgesFrom<StateMachineEdgeData>;
} => {
  const rawConfig = machineConfig;
  const { states: rootStates = {}, initial: rootInitial, ...main } = rawConfig;
  const rootKeys = Object.keys(rootStates);
  const effectiveRootInitial =
    rootInitial ?? (rootKeys.length === 1 ? rootKeys[0] : undefined);

  const rawNodes: Array<{
    id: string;
    name: string;
    path: string;
    parentPath?: string;
    isInitial: boolean;
    hasChildren: boolean;
    isChild: boolean;
    stateType: StateType;
    tags?: string[];
    entry?: string[];
    exit?: string[];
    activities?: StateActivityData[];
    actors: StateActorData[];
    content?: string;
    rawState: any;
    depth: number;
    parentIndex: number;
  }> = [];

  const rawEdges: Array<{
    id: string;
    from: string;
    to: string;
    kind: EdgeKind;
    label: string;
    event?: string;
    delay?: string | number;
    guards?: GuardConfig[];
    actions?: string[];
  }> = [];

  // Recursive state walker
  const walkState = (
    stateName: string,
    stateObj: any,
    parentPath = "",
    depth = 0,
    parentIdx = 0,
  ) => {
    const currentPath = parentPath
      ? `${parentPath}/${stateName}`
      : `/${stateName}`;
    const id = currentPath;
    const hasChildren = Boolean(
      stateObj?.states && Object.keys(stateObj.states).length > 0,
    );
    const isChild = Boolean(parentPath);
    const isParentParallel = stateObj?.parentType === "parallel";
    const isInitial =
      !isParentParallel &&
      ((parentPath === "" && stateName === effectiveRootInitial) ||
        (Boolean(parentPath) && stateObj?.parentInitial === stateName));

    const isParallel = stateObj?.type === "parallel";
    const stateType: StateType = isParallel
      ? "parallel"
      : hasChildren
        ? "compound"
        : "atomic";

    const actors = extractActors(stateObj?.actors);
    const entry = Array.isArray(stateObj?.entry)
      ? stateObj.entry
      : stateObj?.entry
        ? [stateObj.entry]
        : undefined;
    const exit = Array.isArray(stateObj?.exit)
      ? stateObj.exit
      : stateObj?.exit
        ? [stateObj.exit]
        : undefined;
    const activities = extractActivities(stateObj?.activities);

    const nodeIndex = rawNodes.length;
    rawNodes.push({
      id,
      name: stateName,
      path: currentPath,
      parentPath: parentPath || undefined,
      isInitial,
      hasChildren,
      isChild,
      stateType,
      tags: stateObj?.tags ? [].concat(stateObj.tags) : undefined,
      entry,
      exit,
      activities: activities.length > 0 ? activities : undefined,
      actors,
      content: stateObj?.description,
      rawState: stateObj,
      depth,
      parentIndex: parentIdx,
    });

    // 1. Edge for relation between child and parent:
    // "child to parent, will have a specific edge"
    if (parentPath) {
      const edgeId = `edge:hierarchy:${id}=>${parentPath}`;
      rawEdges.push({
        id: edgeId,
        from: id,
        to: parentPath,
        kind: "child_parent",
        label: `child of : /${parentPath.split("/").pop()}`,
      });
    }

    // Recursively walk substates if compound or parallel
    if (hasChildren) {
      const childKeys = Object.keys(stateObj.states);
      const isParallel = stateObj?.type === "parallel";
      const childInitial =
        !isParallel && childKeys.length === 1
          ? (stateObj.initial ?? childKeys[0])
          : stateObj.initial;

      Object.entries(stateObj.states).forEach(
        ([childName, childObj]: [string, any]) => {
          const enrichedChild = {
            ...childObj,
            parentInitial: childInitial,
            parentType: stateObj?.type,
          };
          walkState(
            childName,
            enrichedChild,
            currentPath,
            depth + 1,
            nodeIndex,
          );
        },
      );
    }
  };

  // Walk all root states
  Object.entries(rootStates).forEach(([name, obj]) => {
    walkState(name, obj, "", 0, 0);
  });

  // Resolve transition targets (on, after, always)
  const resolveTargetId = (target: string, currentPath: string): string => {
    if (target.startsWith("/")) {
      // Absolute path: find exact or prefix match
      const exact = rawNodes.find((n) => n.path === target);
      if (exact) return exact.id;
      // Partial match
      const partial = rawNodes.find((n) => n.id.endsWith(target));
      if (partial) return partial.id;
      return target;
    }
    // Relative path from current parent
    const parentPart = currentPath.substring(0, currentPath.lastIndexOf("/"));
    const candidatePath = parentPart ? `${parentPart}/${target}` : `/${target}`;
    const found = rawNodes.find((n) => n.path === candidatePath);
    if (found) return found.id;
    return `/${target}`;
  };

  rawNodes.forEach((node) => {
    const s = node.rawState;
    if (!s) return;

    // 2. Edge for 'after' transition
    if (s.after && typeof s.after === "object") {
      Object.entries(s.after).forEach(([delay, targetRaw]) => {
        const targets = normalizeTarget(targetRaw);
        targets.forEach(({ target, guards, actions }, idx) => {
          const toId = resolveTargetId(target, node.path);
          const edgeId = `edge:after:${node.id}=>${toId}:${delay}:${idx}`;
          const guardLabel =
            guards && guards.length > 0 ? ` [${formatGuards(guards)}]` : "";
          rawEdges.push({
            id: edgeId,
            from: node.id,
            to: toId,
            kind: "after",
            label: `after: ${delay}${guardLabel}`,
            delay,
            guards,
            actions,
          });
        });
      });
    }

    // 3. Edge for 'always' transition
    if (s.always) {
      const targets = normalizeTarget(s.always);
      targets.forEach(({ target, guards, actions }, idx) => {
        const toId = resolveTargetId(target, node.path);
        const edgeId = `edge:always:${node.id}=>${toId}:${idx}`;
        const guardLabel =
          guards && guards.length > 0 ? ` [${formatGuards(guards)}]` : "";
        rawEdges.push({
          id: edgeId,
          from: node.id,
          to: toId,
          kind: "always",
          label: `always${guardLabel}`,
          guards,
          actions,
        });
      });
    }

    // 4. Edge for 'on' transition
    if (s.on && typeof s.on === "object") {
      Object.entries(s.on).forEach(([event, targetRaw]) => {
        const targets = normalizeTarget(targetRaw);
        targets.forEach(({ target, guards, actions }, idx) => {
          const toId = resolveTargetId(target, node.path);
          const edgeId = `edge:on:${node.id}=>${toId}:${event}:${idx}`;
          const guardLabel =
            guards && guards.length > 0 ? ` [${formatGuards(guards)}]` : "";
          rawEdges.push({
            id: edgeId,
            from: node.id,
            to: toId,
            kind: "on",
            label: `on: ${event}${guardLabel}`,
            event,
            guards,
            actions,
          });
        });
      });
    }
  });

  // Layout calculation: organize nodes into rank columns and spaced rows
  // Group nodes by root chain / hierarchy
  const columnPositions: Record<number, number> = {};

  const nodes: NodesFrom<StateMachineNodeData> = rawNodes.map((node, index) => {
    // Estimate column by node index and depth
    const col = node.depth === 0 ? Math.floor(index * 0.9) : node.depth + 1;
    const currentYCount = columnPositions[col] ?? 0;
    columnPositions[col] = currentYCount + 1;
    const defaultX = INITIAL_X + col * HORIZONTAL_SPACING;
    const defaultY = INITIAL_Y + currentYCount * VERTICAL_SPACING;
    const pos = positions?.[node.id as keyof typeof positions];
    const position = pos
      ? { x: pos.x, y: pos.y }
      : { x: defaultX, y: defaultY };
    const handles: NodeHandles_T = createHandles();

    return {
      id: node.id,
      position,
      handles,
      data: {
        id: node.id,
        title: node.name,
        path: node.path,
        parentPath: node.parentPath,
        stateType: node.stateType,
        isInitial: node.isInitial,
        tags: node.tags,
        entry: node.entry,
        exit: node.exit,
        activities: node.activities,
        actors: node.actors,
        content: node.content,
      },
    };
  });

  // Group transitions by source, target, and kind so that edges
  // strictly represent handle-specific connections (child_parent, after, always, on).
  const edgeGroups = new Map<
    string,
    {
      id: string;
      from: string;
      to: string;
      kind: EdgeKind;
      transitions: TransitionItem[];
    }
  >();

  rawEdges.forEach((e) => {
    const key = `${e.kind}:${e.from}=>${e.to}`;
    const transitionItem: TransitionItem = {
      id: e.id,
      kind: e.kind,
      label: e.label,
      event: e.event,
      delay: e.delay,
      guards: e.guards,
      actions: e.actions,
    };

    const existing = edgeGroups.get(key);
    if (existing) {
      existing.transitions.push(transitionItem);
    } else {
      const edgeId =
        e.kind === "child_parent"
          ? `edge:hierarchy:${e.from}=>${e.to}`
          : `edge:${e.kind}:${e.from}=>${e.to}`;

      edgeGroups.set(key, {
        id: edgeId,
        from: e.from,
        to: e.to,
        kind: e.kind,
        transitions: [transitionItem],
      });
    }
  });

  const edges: EdgesFrom<StateMachineEdgeData> = Array.from(
    edgeGroups.values(),
  ).map((g) => {
    const primary = g.transitions[0];
    const isMulti = g.transitions.length > 1;

    let fromPosition: "top" | "right" | "bottom" | "left" = "right";
    let toPosition: "top" | "right" | "bottom" | "left" = "left";
    let fromIndex: number | undefined = undefined;
    let toIndex: number | undefined = undefined;

    if (g.kind === "child_parent") {
      fromPosition = "top";
      toPosition = "bottom";
      fromIndex = 0;
      toIndex = 0;
    } else if (g.kind === "after") {
      fromPosition = "right";
      toPosition = "left";
      fromIndex = 0;
      toIndex = 0;
    } else if (g.kind === "always") {
      fromPosition = "right";
      toPosition = "left";
      fromIndex = 1;
      toIndex = 1;
    } else {
      // 'on'
      fromPosition = "right";
      toPosition = "left";
      fromIndex = 2;
      toIndex = 2;
    }

    return {
      id: g.id,
      from: g.from,
      to: g.to,
      fromPosition,
      toPosition,
      fromIndex,
      toIndex,
      data: {
        kind: g.kind,
        label: isMulti ? `${g.transitions.length} transitions` : primary.label,
        event: primary.event,
        delay: primary.delay,
        guards: primary.guards,
        actions: primary.actions,
        fromState: g.from,
        toState: g.to,
        transitions: g.transitions,
      },
    };
  });

  return { nodes, edges };
};
