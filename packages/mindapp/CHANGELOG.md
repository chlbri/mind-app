# CHANGELOG

<details>
<summary>

## **[0.3.2] - 25/08/2026** => _18:36_

</summary>

- Fix input and output handle container element IDs in `NodeComponent`
- Refactor state machine actions (`placeChild`, `placeParent`, `placeSibling`,
  `moveNewEdge`) to be registered directly in machine definition via `provideOptions`
- Refactor `FlowChart.context` to delegate action definitions directly to the state
  machine
- Refactor `NodesBoard` drag-and-drop movement and overlay display to simplify direct
  node dragging
- Refactor `FlowChart` cursor tracking to emit edge movement events conditionally
  when drawing a new edge
- <u>Test coverage **_100%_**</u>

</details>

<br/>

<details>
<summary>

## **[0.3.1] - 24/08/2026** => _21:57_

</summary>

- Refactor `EdgeComponent` to simplify vector signal selection and remove redundant
  conditional rendering wrapper
- Refactor `NodeComponent` to streamline reactive signal property access and non-null
  item lookup
- <u>Test coverage **_100%_**</u>

</details>

<br/>

<details>
<summary>

## **[0.3.0] - 24/08/2026** => _19:24_

</summary>

- Add board layout geometry tracking and container scroll synchronization in state
  machine
- Add board and parent dimension syncing with `SET_BOARD` action on mount and
  viewport scroll
- Add dynamic boundary clamping and unscaled coordinate transforms via state machine
  private context
- Refactor `useFlow` context hook to directly return the state machine service
- Refactor node and edge selection to reactively track selection state directly from
  the service
- Refactor `DragBounds` to utilize board layout state from machine context
- Refactor main machine actions and remove deprecated deletion logic
- Enhance JSDoc documentation across UI components, machine services, and context
  helpers
- <u>Test coverage **_100%_**</u>

</details>

<br/>

<details>
<summary>

## **[0.2.0] - 22/08/2026** => _21:41_

</summary>

- Add zoom controls and viewport toggle actions in flowchart state machine
- Add interactive edge connection preview and lifecycle actions in state machine
- Add automated node dimension calculation utilities for handles and bounds
- Split state machine definitions and types into modular services structure
- Optimize node canvas rendering with solid index iteration and auto overflow
- Update `README.md` configuration examples and type exports
- Update `@bemedev/app` and `@bemedev/app-solidjs` to `^2.0.0`
- Update `@bemedev/dev-utils` to `^1.2.0`
- Update `nanoid` to `^6.0.1`
- <u>Test coverage **_100%_**</u>

</details>

<br/>

<details>
<summary>

## **[0.1.1] - 19/08/2026** => _21:05_

</summary>

- Enhance JSDoc documentation across helper functions, components, data types, and
  context utilities
- Update devDependencies to consolidate `@bemedev/dev-utils`
- <u>Test coverage **_100%_**</u>

</details>

<br/>

<details>
<summary>

## **[0.1.0] - 19/08/2026** => _20:44_

</summary>

- Add `@bemedev/mind-flow` flowchart UI library for Solid.js applications
- Add `Flow` root component with context management and board canvas
- Add interactive nodes and edges canvas with drag-and-drop, zoom controls, and
  dynamic edge creation
- Add state machine service managing flowchart node and edge operations
- Add Tailwind CSS safelist utilities (`CLASSES`) and styled UI output
- <u>Test coverage **_100%_**</u>

</details>

<br/>
