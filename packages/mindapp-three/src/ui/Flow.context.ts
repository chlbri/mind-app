import { interpret } from '@bemedev/app';
import { createService } from '@bemedev/app-solidjs';

import { machine } from '#main-machine';
import {
  BOUNDS_CONSTRAINTS,
  DEFAULT_PHYSICS_OPTIONS,
} from '#services/main.machine.data';
import { clampPosition3d } from '#services/main.machine.helpers';
import type { Point3D } from '#services/main.machine.typings';

/**
 * Creates the 3D flowchart engine service, starts it, and builds the reactivity
 * bridges consumed by every flow component.
 *
 * The returned object is the value read by the `useFlow` hook of
 * {@linkcode createContext}.
 *
 * @returns The flow value of type {@linkcode FlowContext}, containing the state
 *   machine `service`, its reactive `hooks`, and both `send` and `sender`
 *   dispatchers.
 *
 * @see {@linkcode machine}, {@linkcode createService}
 */
export const createFlowService = () => {
  /** Shared service for 3D flowchart state management. */
  const service = interpret(machine, {
    context: {
      zoom: 1,
      physics: { enabled: true, alpha: DEFAULT_PHYSICS_OPTIONS.alpha },
    },
    pContext: {
      generatedId: null,

      /**
       * Clamps a 3D position within the world bounds.
       *
       * @param position - Candidate 3D position of type {@linkcode Point3D}.
       *
       * @returns Clamped 3D position of type {@linkcode Point3D}.
       *
       * @see {@linkcode BOUNDS_CONSTRAINTS}
       */
      clampPosition: (position: Point3D): Point3D =>
        clampPosition3d(position, BOUNDS_CONSTRAINTS),
    },
  });

  service.start();
  const hooks = createService(service);
  const send = service.send;
  const sender = service.sender;
  return { service, hooks, send, sender };
};

/**
 * Value shared by every flow component, produced by {@linkcode createFlowService} and
 * read with the `useFlow` hook.
 */
export type FlowContext = ReturnType<typeof createFlowService>;

/**
 * Property bag injected into every flow-aware component, carrying the value read
 * with the `useFlow` hook.
 */
export type WithFlow = {
  /** Flow engine value of type {@linkcode FlowContext}. */
  flow: FlowContext;
};
