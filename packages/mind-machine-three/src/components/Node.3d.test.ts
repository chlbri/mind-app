import { Group } from 'three';
import { describe, expect, it } from 'vitest';

import type { StateMachineNodeData } from '../types';
import { StateMachineNode3D, stateColor, STATE_COLORS } from './Node.3d';

/**
 * Builds a minimal 3D node data payload for renderer testing.
 *
 * @param extra - Optional extra node data fields.
 *
 * @returns A state machine node data payload.
 */
const data = (extra?: Partial<StateMachineNodeData>): StateMachineNodeData => ({
  id: '/cart',
  title: 'cart',
  path: '/cart',
  stateType: 'atomic',
  ...extra,
});

describe('#01 => StateMachineNode3D', () => {
  describe('#01 => stateColor', () => {
    it('#01 => should resolve the color of each state classification', () => {
      expect(stateColor(data({ stateType: 'atomic' }))).toBe(STATE_COLORS.atomic);
      expect(stateColor(data({ stateType: 'compound' }))).toBe(
        STATE_COLORS.compound,
      );
      expect(stateColor(data({ stateType: 'parallel' }))).toBe(
        STATE_COLORS.parallel,
      );
    });
  });

  describe('#02 => rendering', () => {
    it('#01 => should populate the group with the state box and label', () => {
      const group = new Group();

      StateMachineNode3D({
        id: '/cart',
        position: { x: 0, y: 0, z: 0 },
        data: data(),
        selected: false,
        group,
      });

      expect(group.getObjectByName('state-box')).toBeDefined();
      expect(group.getObjectByName('state-label')).toBeDefined();
      expect(group.getObjectByName('initial-badge')).toBeUndefined();
      expect(group.getObjectByName('actor-badge')).toBeUndefined();
    });

    it('#02 => should add an initial badge for initial states', () => {
      const group = new Group();

      StateMachineNode3D({
        id: '/cart',
        position: { x: 0, y: 0, z: 0 },
        data: data({ isInitial: true }),
        selected: false,
        group,
      });

      expect(group.getObjectByName('initial-badge')).toBeDefined();
    });

    it('#03 => should add an actor badge and count for actor states', () => {
      const group = new Group();

      StateMachineNode3D({
        id: '/cart',
        position: { x: 0, y: 0, z: 0 },
        data: data({
          actors: [
            { name: 'stream', type: 'emitter' },
            { name: 'child', type: 'child' },
          ],
        }),
        selected: false,
        group,
      });

      expect(group.getObjectByName('actor-badge')).toBeDefined();
      expect(group.getObjectByName('actor-count')).toBeDefined();
    });

    it('#04 => should render the principal node with a scaled box', () => {
      const group = new Group();

      StateMachineNode3D({
        id: '/',
        position: { x: 0, y: 0, z: 0 },
        data: data({ id: '/', title: 'Machine', path: '/' }),
        selected: false,
        group,
      });

      expect(group.getObjectByName('state-box')).toBeDefined();
    });
  });
});
