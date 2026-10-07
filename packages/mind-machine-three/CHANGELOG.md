# CHANGELOG

<details>
<summary>

## **[0.1.0] - 06/10/2026** => _00:00_

</summary>

- Initial release of the 3D state machine engine, replicating `@bemedev/mind-machine`
  with three.js rendering on top of the new `@bemedev/mind-flow-three` package
- Add the `createContext()` factory returning the `[useFlow, FlowMachine]` tuple
  bound to an isolated Solid context, mirroring the `@bemedev/mind-machine` API
- Add `StateMachineNode3D`: 3D state box colored by classification with title label,
  initial badge and actor count badge, principal node rendered oversized and glowing
- Add `StateMachineEdge3D`: tube recoloring per transition category with midpoint
  transition label and translucent hierarchy styling
- Add `parseMachineToGraph`: flattens nested, compound and parallel states into 3D
  nodes and the 4 edge categories (`on`, `after`, `always`, `child_parent`), laid out
  on rank columns, rows and hierarchy layers
- Add `configFromHistory` accepting machine instances, machine configurations, scene
  histories, persisted payloads and scene configurations
- Add `PrincipalPanel` and `HistoryControls` HTML overlay panels with undo, redo and
  physics toggle actions
- Add `AtomicFiligrane` watermark for atomic machines
- Add `machineEdgesAllowed` and `canDelete` rules protecting hierarchy integrity and
  the principal node
- Port the transition validator with guard normalization and conflict detection
- Add valibot schemas for nodes, edges, actors, activities and persisted payloads
- Add unit tests covering constants, helpers, rules, config parsing, 3D renderers,
  the transition validator and the `createContext` API
- <u>Test coverage: parser, rules and 3D renderers covered; the WebGL scene is
  validated manually in a browser</u>

</details>

<br/>
