# CHANGELOG

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
