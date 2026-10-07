# CHANGELOG

<details>
<summary>

## **[0.1.0] - 06/10/2026** => _00:00_

</summary>

- Initial release of the 3D flow chart engine, replicating `@bemedev/mind-flow` with
  three.js rendering and a force-directed physics simulation
- Add the `createContext()` factory returning the `[useFlow, Flow]` tuple bound to an
  isolated Solid context, mirroring the `@bemedev/mind-flow` API
- Add the `Scene` component: WebGL renderer, perspective camera with orbit controls,
  grid, lights, raycasted node selection and dragging, and a requestAnimationFrame
  render loop
- Add the `ForceSimulation3D` engine: pairwise repulsion, edge springs, centering,
  damping, speed clamping and heat decay with automatic settling
- Add the three.js factories: label sprites, node groups with selection state, and
  Bézier tube edges with in-place geometry updates
- Add the 3D flow state machine built with `@bemedev/app`: configure, move, add and
  remove nodes and edges, selection, edition, zoom, physics toggle, node pinning,
  batch position application, and git-like history with undo, redo and checkout
- Add `Panels` overlay slots and `controlsAddons` rendering above the WebGL canvas
- Add custom `Node` and `Edge` 3D renderers receiving the three.js group and mesh
- Add unit tests covering the valibot helpers, the 3D machine helpers, the 3D machine
  actions, the history diff engine, the physics simulation, the three.js factories,
  the overlay panels and the `createContext` API
- <u>Test coverage: engine and simulations fully covered; the WebGL render loop is
  validated manually in a browser</u>

</details>

<br/>
