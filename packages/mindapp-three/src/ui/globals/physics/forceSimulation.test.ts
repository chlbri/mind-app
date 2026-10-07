import { describe, expect, it } from 'vitest';

import { ForceSimulation3D, type ForceSimulationOptions } from './forceSimulation';

/** Runs the simulation for a fixed number of ticks. */
const run = (simulation: ForceSimulation3D, ticks: number): void => {
  for (let i = 0; i < ticks; i++) simulation.tick();
};

describe('#01 => ForceSimulation3D', () => {
  describe('#01 => bodies', () => {
    it('#01 => should add bodies preserving re-registration', () => {
      const simulation = new ForceSimulation3D();

      const first = simulation.addBody('a', { x: 0, y: 0, z: 0 });
      simulation.tick();

      const second = simulation.addBody('a', { x: 10, y: 0, z: 0 });
      expect(second).toBe(first);
      expect(simulation.bodies.size).toBe(1);
      expect(second.position).toEqual({ x: 10, y: 0, z: 0 });
    });

    it('#02 => should remove a body and its links', () => {
      const simulation = new ForceSimulation3D();

      simulation.addBody('a', { x: 0, y: 0, z: 0 });
      simulation.addBody('b', { x: 10, y: 0, z: 0 });
      simulation.addLink('a', 'b');
      expect(simulation.links.length).toBe(1);

      simulation.removeBody('a');
      expect(simulation.bodies.has('a')).toBe(false);
      expect(simulation.links.length).toBe(0);
    });
  });

  describe('#02 => links', () => {
    it('#01 => should deduplicate links in both directions', () => {
      const simulation = new ForceSimulation3D();

      simulation.addBody('a', { x: 0, y: 0, z: 0 });
      simulation.addBody('b', { x: 10, y: 0, z: 0 });

      simulation.addLink('a', 'b');
      simulation.addLink('b', 'a');
      expect(simulation.links.length).toBe(1);
    });

    it('#02 => should ignore links referencing unknown bodies', () => {
      const simulation = new ForceSimulation3D();

      simulation.addBody('a', { x: 0, y: 0, z: 0 });
      simulation.addLink('a', 'ghost');
      expect(simulation.links.length).toBe(0);
    });
  });

  describe('#03 => fixed bodies', () => {
    it('#01 => should keep fixed bodies immobile', () => {
      const simulation = new ForceSimulation3D();

      simulation.addBody('fixed', { x: 0, y: 0, z: 0 }, true);
      simulation.addBody('free', { x: 1, y: 0, z: 0 });

      run(simulation, 50);

      const fixed = simulation.bodies.get('fixed');
      expect(fixed?.position).toEqual({ x: 0, y: 0, z: 0 });
      expect(fixed?.velocity).toEqual({ x: 0, y: 0, z: 0 });
    });

    it('#02 => should teleport a body and zero its velocity', () => {
      const simulation = new ForceSimulation3D();

      const body = simulation.addBody('a', { x: 10, y: 0, z: 0 });
      simulation.tick();
      expect(body.velocity.x).not.toBe(0);

      simulation.teleport('a', { x: 5, y: 5, z: 5 });
      expect(body.position).toEqual({ x: 5, y: 5, z: 5 });
      expect(body.velocity).toEqual({ x: 0, y: 0, z: 0 });
    });
  });

  describe('#04 => tick', () => {
    it('#01 => should separate repulsing bodies over time', () => {
      const simulation = new ForceSimulation3D();

      simulation.addBody('a', { x: 0, y: 0, z: 0 });
      simulation.addBody('b', { x: 0.1, y: 0, z: 0 });

      run(simulation, 100);

      const a = simulation.bodies.get('a');
      const b = simulation.bodies.get('b');
      const distance = Math.abs((b?.position.x ?? 0) - (a?.position.x ?? 0));
      expect(distance).toBeGreaterThan(0.1);
    });

    it('#02 => should pull spring-linked bodies toward the rest length', () => {
      const options: Partial<ForceSimulationOptions> = {
        repulsion: 0,
        centering: 0,
        springLength: 10,
        springStrength: 0.8,
        damping: 0.5,
        alphaDecay: 0,
      };
      const simulation = new ForceSimulation3D(options);

      simulation.addBody('a', { x: 0, y: 0, z: 0 }, true);
      simulation.addBody('b', { x: 30, y: 0, z: 0 });
      simulation.addLink('a', 'b');

      run(simulation, 200);

      const b = simulation.bodies.get('b');
      expect(b?.position.x).toBeLessThan(30);
      expect(b?.position.x).toBeGreaterThan(0);
    });

    it('#03 => should cool down and settle', () => {
      const simulation = new ForceSimulation3D();

      simulation.addBody('a', { x: 0, y: 0, z: 0 });
      simulation.addBody('b', { x: 1, y: 0, z: 0 });

      run(simulation, 1000);

      expect(simulation.isSettled()).toBe(true);
    });

    it('#04 => should be a no-op once settled', () => {
      const simulation = new ForceSimulation3D({ alphaMin: 0.5 });

      simulation.addBody('a', { x: 0, y: 0, z: 0 });
      run(simulation, 100);
      expect(simulation.isSettled()).toBe(true);

      const before = simulation.positions();
      run(simulation, 10);
      expect(simulation.positions()).toEqual(before);
    });

    it('#05 => should clamp the body speed', () => {
      const simulation = new ForceSimulation3D({
        repulsion: 1e9,
        maxSpeed: 2,
        damping: 0,
        alphaDecay: 0,
      });

      simulation.addBody('a', { x: 0, y: 0, z: 0 });
      simulation.addBody('b', { x: 0.01, y: 0, z: 0 });

      simulation.tick();

      for (const body of simulation.bodies.values()) {
        const speed = Math.sqrt(
          body.velocity.x ** 2 + body.velocity.y ** 2 + body.velocity.z ** 2,
        );
        expect(speed).toBeLessThanOrEqual(2.0000001);
      }
    });
  });

  describe('#05 => reheat', () => {
    it('#01 => should restart a settled simulation', () => {
      const simulation = new ForceSimulation3D({ alphaMin: 0.5 });

      simulation.addBody('a', { x: 0, y: 0, z: 0 });
      run(simulation, 100);
      expect(simulation.isSettled()).toBe(true);

      simulation.reheat();
      expect(simulation.isSettled()).toBe(false);
    });
  });

  describe('#06 => sync', () => {
    it('#01 => should reconcile bodies and links with a graph', () => {
      const simulation = new ForceSimulation3D();

      simulation.sync(
        [
          { id: 'a', position: { x: 0, y: 0, z: 0 } },
          { id: 'b', position: { x: 10, y: 0, z: 0 } },
        ],
        [{ from: 'a', to: 'b' }],
      );

      expect(simulation.bodies.size).toBe(2);
      expect(simulation.links.length).toBe(1);

      simulation.sync([{ id: 'a', position: { x: 0, y: 0, z: 0 } }], []);
      expect(simulation.bodies.size).toBe(1);
      expect(simulation.links.length).toBe(0);
    });

    it('#02 => should preserve the fixed state of existing bodies', () => {
      const simulation = new ForceSimulation3D();

      simulation.addBody('a', { x: 0, y: 0, z: 0 }, true);
      simulation.sync([{ id: 'a', position: { x: 1, y: 1, z: 1 } }], [], false);

      expect(simulation.bodies.get('a')?.fixed).toBe(true);
    });
  });

  describe('#07 => positions', () => {
    it('#01 => should snapshot the body positions', () => {
      const simulation = new ForceSimulation3D();

      simulation.addBody('a', { x: 1, y: 2, z: 3 });
      expect(simulation.positions()).toEqual({ a: { x: 1, y: 2, z: 3 } });
    });
  });
});
