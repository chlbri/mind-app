# CHANGELOG

<details>
<summary>

## **[1.4.0] - 27/08/2026** => _14:08_

</summary>

- Enhance interactive edge connection UX with dynamic hover scaling on target handles
- Add active handle lifecycle tracking and cleanup on edge creation release
- Enhance JSDoc documentation across internal components and handlers
- Refactor `Panels` slot container with full-inset layout and dedicated `Panel`
  wrapper component
- Update `@bemedev/dev-utils` to `^1.3.1` and `@types/node` to `^26.4.0`
- <u>Test coverage **_100%_**</u>

</details>

<br/>

<details>
<summary>

## **[1.3.0] - 26/08/2026** => _18:53_

</summary>

- Add window-level pointer event tracking (`pointermove`, `pointerup`) during edge
  creation for smooth drawing
- Add interactive edge drop resolution directly onto target node input handles
- Prevent self-referential edge connections from a node to itself
- Prevent event propagation on input and output handle pointer events in
  `NodeComponent`
- Enhance JSDoc documentation across helper functions and components
- Update `rolldown` to `^1.2.6`
- <u>Test coverage **_100%_**</u>

</details>

<br/>

<details>
<summary>

## **[1.2.0] - 26/08/2026** => _15:35_

</summary>

- Enhance `mouseOut` directive to handle focus events (`focusin`, `focusout`),
  preventing premature callback triggers while inner inputs or elements retain focus
- Update `MouseOutCallback` signature to accept optional `MouseEvent | FocusEvent`
  parameter
- <u>Test coverage **_100%_**</u>

</details>

<br/>

<details>
<summary>

## **[1.1.0] - 26/08/2026** => _14:32_

</summary>

- Change `FlowPanels` overlay slots (`topLeft`, `topRight`, `bottomLeft`) type
  definition to accept `Component` instead of `JSX.Element | Component`
- Update `Panels` slot rendering to instantiate panel components inside the Flow
  context provider
- Update `README.md` custom configuration example to pass overlay panels as component
  functions
- <u>Test coverage **_100%_**</u>

</details>

<br/>

<details>
<summary>

## **[1.0.0] - 26/08/2026** => _14:04_

</summary>

- Add generic node data parameterization (`NodeProps<D>`, `FlowProps<D>`,
  `EditPanelProps<D>`)
- Add `EditPanel` component and `useHook` helper for editing active node data
- Add customizable `Panels` overlay slots (`topLeft`, `topRight`, `bottomLeft`)
  around the canvas
- Add automatic node dimensions observer via `resize` directive
- Add typewriter text (`TypingText`), animated indicator (`FadingDots`), and
  full-screen loading fallback (`LoadingFallback`)
- Add `mouseOut` directive with debounce delay options
- Add `clamp` boundary utility helper
- Fix real-time edge rendering during active drag moves with `MOVE_IMMEDIATE`
- Refactor state machine actions and private context to modularize boundary
  calculations
- Enhance JSDoc documentation across all components, hooks, services, directives, and
  types
- Update `README.md` with generic data typing and overlay panel examples
- <u>Test coverage **_100%_**</u>

</details>

<br/>

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
