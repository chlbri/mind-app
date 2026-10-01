# CHANGELOG

<details>
<summary>

## **[2.0.0] - 01/10/2026** => _23:30_

</summary>

- **BREAKING**: Remove the built-in localStorage persistence — delete the `persist`
  and `storage` modules, their exports, and the `localKeys` prop
  (`FlowMachineStorageProps`); the `history` prop is now required and persistence is
  delegated to the consumer through the `register` callback
- **BREAKING**: Remove the `historyModel` and `localStorageModel` Valibot models from
  `constants`, now owned by the consumer
- **BREAKING**: Rename edge data fields `fromState` / `toState` to `from` / `to`,
  make `kind` required, narrow `delay` to `string`, and remove the actor `config`
  field and the `'service'` actor type
- **BREAKING**: Obtain `FlowMachine`, `useFlow` and every machine component from the
  `createContext()` tuple, and pass the flow value down through the `flow` prop
- Add the `valibot` namespace export with `nodeData`, `edgeData`, `machineNode`,
  `machineEdge`, `machineDiff` and `historyModel` schemas
- Add the `children` prop to `FlowMachineProps`
- Add the `useClose` hook and `PanelHooks_P` type managing panel auto-close, hover
  pause, outside click and delayed closing
- Remove the obsolete persistence, parser and rendering test suites
- Update `README.md` with the consumer-managed persistence model, the actual peer
  dependencies and the `valibot` namespace export
- Enhance comprehensive JSDoc documentation across components, hooks and types
- Add peer dependencies `@bemedev/app-valibot`, `@tailwindcss/vite`, `tailwindcss`,
  `tailwindcss-animate` and `tw-animate-css`; add the `tailwind-merge` development
  dependency; update `vite` to `^8.3.2`
- <u>Test coverage **_100%_** on logic modules (transition validator, config,
  constants, rules and helpers)</u>

</details>

<br/>

<details>
<summary>

## **[0.1.0] - 01/10/2026** => _12:45_

</summary>

- Initial release of the `@bemedev/mind-machine` package
- Add the `FlowMachine` component orchestrating state machine diagrams on top of
  `@bemedev/mind-flow`, accepting a machine instance, a machine configuration, a flow
  history, or a persisted payload through the `history` prop
- Add `localKeys` prop accepting a single localStorage key or an array of key parts
  combined into a composite key, used to restore and persist the flow history
- Add the `configFromHistory` helper resolving the initial configuration from
  machines, histories, persisted payloads, or existing graph configurations
- Add the `getStorageKey`, `readHistory`, and `writeHistory` localStorage helpers
  with Valibot validation
- Add the `createHistoryPersister` registrar skipping empty histories and redundant
  writes, so a configured diagram is never replaced by a blank canvas on reload
- Add smoke tests rendering `FlowMachine` from a machine configuration and from a
  persisted payload
- Add `machineEdgesAllowed`, `canDeleteGuard`, and `DEFAULT_NODE_DATA` machine rules
- Move the state machine parser, transition validator, signals, and UI panels from
  the showroom application into the package, exporting `parseMachineToGraph`,
  `Principal`, `StateMachineNode`, `StateMachineEdge`, `TransitionModal`,
  `PrincipalPanel`, `HistoryControlsAddons`, and their inputs
- Update the showroom machine route to use the new package
- <u>Test coverage **_100%_** on logic modules (parser, transition validator, config,
  storage, persister, rules, helpers)</u>

</details>

<br/>
