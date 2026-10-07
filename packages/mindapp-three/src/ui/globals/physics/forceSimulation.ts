import type { Point3D } from '#services/main.machine.typings';

/** Options driving the force-directed 3D simulation. */
export type ForceSimulationOptions = {
  /** Strength of the pairwise repulsion force. */
  repulsion: number;
  /** Rest length of edge springs in world units. */
  springLength: number;
  /** Strength of edge springs. */
  springStrength: number;
  /** Strength of the pull toward the scene origin. */
  centering: number;
  /** Velocity damping factor applied on each tick. */
  damping: number;
  /** Maximum node speed in world units per tick. */
  maxSpeed: number;
  /** Initial simulation heat. */
  alpha: number;
  /** Heat threshold below which the simulation sleeps. */
  alphaMin: number;
  /** Multiplicative heat decay applied on each tick. */
  alphaDecay: number;
  /**
   * Layout dimensions: `3` for full 3D space, `2` to lock every body to the `z = 0`
   * plane (planar mindmap layout). Defaults to `3`.
   */
  dimensions: 2 | 3;
};

/** A single simulated body carrying position, velocity and pin state. */
export type PhysicsBody = {
  /** Body identifier, matching its flowchart node id. */
  id: string;
  /** Current 3D position of type {@linkcode Point3D}. */
  position: Point3D;
  /** Current 3D velocity of type {@linkcode Point3D}. */
  velocity: Point3D;
  /** Body mass, heavier bodies move slower under equal forces. */
  mass: number;
  /** Whether the body is pinned and ignores forces. */
  fixed: boolean;
};

/** A single spring link between two bodies. */
export type PhysicsLink = {
  /** Source body id. */
  from: string;
  /** Target body id. */
  to: string;
};

/** Softening epsilon preventing division by zero on overlapping bodies. */
const EPSILON = 0.01;

/**
 * Force-directed 3D physics simulation laying out flowchart nodes in space.
 *
 * Bodies repel each other with an inverse-square law, edge links act as springs
 * pulling their extremities toward a rest length, and a weak centering force keeps
 * the graph around the scene origin. Heat (`alpha`) scales every force and decays
 * each tick until the simulation settles and sleeps.
 *
 * @see {@linkcode PhysicsBody}, {@linkcode PhysicsLink}
 */
export class ForceSimulation3D {
  /** Simulated bodies indexed by id. */
  readonly bodies = new Map<string, PhysicsBody>();

  /** Spring links between bodies. */
  readonly links: PhysicsLink[] = [];

  /** Current simulation heat, scaling every applied force. */
  alpha: number;

  /** Active simulation options of type {@linkcode ForceSimulationOptions}. */
  options: ForceSimulationOptions;

  /**
   * Creates a simulation with default or custom options.
   *
   * @param options - Partial options merged over the defaults.
   */
  constructor(options: Partial<ForceSimulationOptions> = {}) {
    this.options = {
      repulsion: 120,
      springLength: 12,
      springStrength: 0.6,
      centering: 0.02,
      damping: 0.35,
      maxSpeed: 8,
      alpha: 1,
      alphaMin: 0.001,
      alphaDecay: 0.022,
      dimensions: 3,
      ...options,
    };
    this.alpha = this.options.alpha;
  }

  /**
   * Projects a position onto the simulation layout plane.
   *
   * In `2` dimensions, the `z` coordinate is locked to `0`; in `3` dimensions the
   * position is returned unchanged.
   *
   * @param position - Candidate 3D position of type {@linkcode Point3D}.
   *
   * @returns The projected 3D position of type {@linkcode Point3D}.
   */
  private project(position: Point3D): Point3D {
    if (this.options.dimensions === 3) return position;
    return { x: position.x, y: position.y, z: 0 };
  }

  /**
   * Adds or updates a body, preserving its velocity when it already exists.
   *
   * @param id - Body identifier.
   * @param position - Initial 3D position of type {@linkcode Point3D}.
   * @param fixed - Whether the body is pinned, defaults to `false`.
   *
   * @returns The registered body of type {@linkcode PhysicsBody}.
   */
  addBody(id: string, position: Point3D, fixed = false): PhysicsBody {
    const projected = this.project(position);
    const existing = this.bodies.get(id);
    if (existing) {
      existing.position = { ...projected };
      existing.fixed = fixed;
      return existing;
    }

    const body: PhysicsBody = {
      id,
      position: { ...projected },
      velocity: { x: 0, y: 0, z: 0 },
      mass: 1,
      fixed,
    };
    this.bodies.set(id, body);
    return body;
  }

  /**
   * Removes a body and every link referencing it.
   *
   * @param id - Body identifier.
   */
  removeBody(id: string): void {
    this.bodies.delete(id);
    this.removeLinksOf(id);
  }

  /**
   * Removes every link referencing the given body id.
   *
   * @param id - Body identifier.
   */
  removeLinksOf(id: string): void {
    for (let i = this.links.length - 1; i >= 0; i--) {
      const link = this.links[i];
      if (link.from === id || link.to === id) {
        this.links.splice(i, 1);
      }
    }
  }

  /**
   * Adds a deduplicated spring link between two existing bodies.
   *
   * @param from - Source body id.
   * @param to - Target body id.
   */
  addLink(from: string, to: string): void {
    if (!this.bodies.has(from) || !this.bodies.has(to)) return;
    const exists = this.links.some(
      link =>
        (link.from === from && link.to === to) ||
        (link.from === to && link.to === from),
    );
    if (!exists) this.links.push({ from, to });
  }

  /**
   * Replaces the link set with the provided extremities.
   *
   * @param links - Spring links of type {@linkcode PhysicsLink}.
   */
  setLinks(links: PhysicsLink[]): void {
    this.links.length = 0;
    for (const link of links) {
      this.addLink(link.from, link.to);
    }
  }

  /**
   * Pins or releases a body without touching its position.
   *
   * @param id - Body identifier.
   * @param fixed - Whether the body is pinned.
   */
  setFixed(id: string, fixed: boolean): void {
    const body = this.bodies.get(id);
    if (!body) return;
    body.fixed = fixed;
    if (fixed) body.velocity = { x: 0, y: 0, z: 0 };
  }

  /**
   * Teleports a body to a position, zeroing its velocity.
   *
   * @param id - Body identifier.
   * @param position - Target 3D position of type {@linkcode Point3D}.
   */
  teleport(id: string, position: Point3D): void {
    const body = this.bodies.get(id);
    if (!body) return;
    body.position = { ...this.project(position) };
    body.velocity = { x: 0, y: 0, z: 0 };
  }

  /**
   * Reheats the simulation, restarting the layout animation.
   *
   * @param alpha - Optional heat to restore, defaults to the initial option.
   */
  reheat(alpha: number = this.options.alpha): void {
    this.alpha = alpha;
  }

  /**
   * Tells whether the simulation has settled below its heat threshold.
   *
   * @returns `true` when `alpha` dropped below `alphaMin`.
   */
  isSettled(): boolean {
    return this.alpha < this.options.alphaMin;
  }

  /**
   * Runs one integration step: repulsion, springs, centering, damping and cooling.
   *
   * Fixed bodies keep their position and accumulate no velocity. The step is a no-op
   * once the simulation has settled.
   */
  tick(): void {
    if (this.isSettled()) return;

    const {
      repulsion,
      springLength,
      springStrength,
      centering,
      damping,
      maxSpeed,
      alphaDecay,
    } = this.options;

    const heat = this.alpha;
    const bodies = [...this.bodies.values()];

    // Pairwise repulsion: inverse-square force pushing bodies apart.
    for (let i = 0; i < bodies.length; i++) {
      const a = bodies[i];
      for (let j = i + 1; j < bodies.length; j++) {
        const b = bodies[j];
        const dx = b.position.x - a.position.x;
        const dy = b.position.y - a.position.y;
        const dz = b.position.z - a.position.z;
        const squared = dx * dx + dy * dy + dz * dz + EPSILON;
        const distance = Math.sqrt(squared);
        const force = (repulsion * heat) / squared;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        const fz = (dz / distance) * force;

        if (!a.fixed) {
          a.velocity.x -= fx / a.mass;
          a.velocity.y -= fy / a.mass;
          a.velocity.z -= fz / a.mass;
        }
        if (!b.fixed) {
          b.velocity.x += fx / b.mass;
          b.velocity.y += fy / b.mass;
          b.velocity.z += fz / b.mass;
        }
      }
    }

    // Edge springs: linear force pulling linked bodies toward the rest length.
    for (const link of this.links) {
      const a = this.bodies.get(link.from);
      const b = this.bodies.get(link.to);
      if (!a || !b) continue;

      const dx = b.position.x - a.position.x;
      const dy = b.position.y - a.position.y;
      const dz = b.position.z - a.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || EPSILON;
      const force = (springStrength * heat * (distance - springLength)) / distance;
      const fx = dx * force;
      const fy = dy * force;
      const fz = dz * force;

      if (!a.fixed) {
        a.velocity.x += fx / a.mass;
        a.velocity.y += fy / a.mass;
        a.velocity.z += fz / a.mass;
      }
      if (!b.fixed) {
        b.velocity.x -= fx / b.mass;
        b.velocity.y -= fy / b.mass;
        b.velocity.z -= fz / b.mass;
      }
    }

    // Centering, damping, speed clamping and integration.
    for (const body of bodies) {
      if (body.fixed) {
        body.velocity = { x: 0, y: 0, z: 0 };
        continue;
      }

      body.velocity.x -= body.position.x * centering * heat;
      body.velocity.y -= body.position.y * centering * heat;
      body.velocity.z -= body.position.z * centering * heat;

      body.velocity.x *= 1 - damping;
      body.velocity.y *= 1 - damping;
      body.velocity.z *= 1 - damping;

      const speed = Math.sqrt(
        body.velocity.x ** 2 + body.velocity.y ** 2 + body.velocity.z ** 2,
      );
      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        body.velocity.x *= scale;
        body.velocity.y *= scale;
        body.velocity.z *= scale;
      }

      body.position.x += body.velocity.x;
      body.position.y += body.velocity.y;
      body.position.z += body.velocity.z;

      if (this.options.dimensions === 2) {
        body.position.z = 0;
        body.velocity.z = 0;
      }
    }

    this.alpha *= 1 - alphaDecay;
  }

  /**
   * Snapshots the current body positions.
   *
   * @returns A record mapping each body id to its 3D position.
   */
  positions(): Record<string, Point3D> {
    const out: Record<string, Point3D> = {};
    for (const body of this.bodies.values()) {
      out[body.id] = { ...body.position };
    }
    return out;
  }

  /**
   * Reconciles the simulation with a flowchart graph, preserving bodies that already
   * exist and reheating the layout.
   *
   * @param nodes - Graph nodes carrying an id, a position and a pin state.
   * @param edges - Graph edges carrying `from` and `to` extremities.
   * @param reheat - Whether to reheat the simulation, defaults to `true`.
   */
  sync(
    nodes: { id: string; position: Point3D; fixed?: boolean }[],
    edges: { from: string; to: string }[],
    reheat = true,
  ): void {
    const ids = new Set(nodes.map(node => node.id));

    for (const id of [...this.bodies.keys()]) {
      if (!ids.has(id)) this.removeBody(id);
    }

    for (const node of nodes) {
      const existing = this.bodies.get(node.id);
      this.addBody(node.id, node.position, node.fixed ?? existing?.fixed ?? false);
    }

    this.setLinks(edges);

    if (reheat) this.reheat();
  }
}
