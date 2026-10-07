import { describe, expect, it } from 'vitest';

import type { StateMachineNodeData } from '../types';
import { StateMachineNodeFabric, statePalette, STATE_FILLS } from './Node.fabric';

/**
 * Builds a minimal node data payload for renderer testing.
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

/**
 * Builds the fabric node props of a renderer invocation.
 *
 * @param extra - Optional extra node data fields.
 *
 * @returns The renderer properties.
 */
const props = (extra?: Partial<StateMachineNodeData>) =>
  ({
    id: '/cart',
    position: { x: 0, y: 0 },
    data: data(extra),
    selected: false,
    rect: { width: 192, height: 50, set: () => {} } as any,
    label: { set: () => {} } as any,
  }) as any;

describe('#01 => StateMachineNodeFabric', () => {
  describe('#01 => statePalette', () => {
    it('#01 => should resolve the palette of each state classification', () => {
      expect(statePalette(data({ stateType: 'atomic' })).fill).toBe(
        STATE_FILLS.atomic,
      );
      expect(statePalette(data({ stateType: 'compound' })).fill).toBe(
        STATE_FILLS.compound,
      );
      expect(statePalette(data({ stateType: 'parallel' })).fill).toBe(
        STATE_FILLS.parallel,
      );
    });
  });

  describe('#02 => rendering', () => {
    it('#01 => should return the state type badge', () => {
      const extras = StateMachineNodeFabric(props());
      expect(extras?.length).toBe(2);
    });

    it('#02 => should add an initial dot for initial states', () => {
      const extras = StateMachineNodeFabric(props({ isInitial: true }));
      expect(extras?.length).toBe(3);
    });

    it('#03 => should add an actor bubble for actor states', () => {
      const extras = StateMachineNodeFabric(
        props({
          actors: [
            { name: 'stream', type: 'emitter' },
            { name: 'child', type: 'child' },
          ],
        }),
      );

      expect(extras?.length).toBe(4);
    });
  });
});
