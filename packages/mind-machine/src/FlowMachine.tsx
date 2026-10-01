import { Flow, Hook, reconstructState, useFlow } from '@bemedev/mind-flow';
import { onMount, type Component } from 'solid-js';

import { StateMachineEdge } from './components/Edge';
import { AtomicFiligrane } from './components/Filigrane';
import { HistoryControlsAddons } from './components/HistoryControlsAddons';
import { StateMachineNode } from './components/Node';
import { StateMachineEditPanel } from './components/Node.edit';
import { StateMachineNodeSelected } from './components/Node.selected';
import { PrincipalPanel } from './components/PrincipalPanel';
import { TransitionModal } from './components/TransitionModal';
import { configFromHistory, type MachineConfigFrom } from './config';
import type {
  FlowMachineProps,
  FlowMachineProps,
  FlowMachineStorageProps,
} from './FlowMachine.types';
import { createHistoryPersister } from './persist';
import { canDeleteGuard, DEFAULT_NODE_DATA, machineEdgesAllowed } from './rules';
import { getStorageKey, readHistory } from './storage';
import type { StateMachineEdgeData, StateMachineNodeData } from './types';

/**
 * Core component orchestrating `@bemedev/app` state machine diagrams on top of the
 * `@bemedev/mind-flow` flowchart engine.
 *
 * It provides the default state machine rendering components (nodes, edges, panels,
 * history controls), parses a machine configuration or history source into default
 * nodes and edges, and persists the flow history into localStorage when `localKeys`
 * is provided.
 *
 * @param props - Component properties of type {@linkcode FlowMachineProps}. Either a
 *   `localKeys` only configuration (restore mode) or a `history` source with
 *   optional `localKeys` (persistence mode).
 *
 * @returns The rendered Solid component.
 *
 * @see {@linkcode Flow}
 * @see {@linkcode configFromHistory}
 * @see {@linkcode getStorageKey}
 */
export const FlowMachine: Component<FlowMachineProps> = props => {
  const localKeys = (props as FlowMachineStorageProps).localKeys;
  const history = (props as FlowMachineProps).history;

  const storageKey = getStorageKey(localKeys);
  const persisted = readHistory(storageKey);
  /* An empty history means nothing was committed yet: keep the `history` source. */
  const stored = persisted?.history.length ? persisted : undefined;

  /** Resolves the restored payload first, then the `history` source. */
  const initialConfig = (): MachineConfigFrom =>
    stored
      ? (reconstructState(stored.history, stored.historyIndex) as MachineConfigFrom)
      : configFromHistory(history);

  /** Persists the flow history whenever a new commit is registered. */
  const register = createHistoryPersister(storageKey);

  return (
    <Flow<StateMachineNodeData, StateMachineEdgeData>
      delay={100}
      config={initialConfig()}
      Node={StateMachineNode}
      NodeSelected={StateMachineNodeSelected}
      Edge={StateMachineEdge}
      panels={{
        bottomLeft: TransitionModal,
        topLeft: StateMachineEditPanel,
        topRight: PrincipalPanel,
      }}
      controlsAddons={HistoryControlsAddons}
      defaultData={DEFAULT_NODE_DATA}
      edgesAllowed={machineEdgesAllowed}
      register={register}
    >
      {props.children}
      <AtomicFiligrane />
      <Hook>
        {() => {
          const { send, service } = useFlow();

          onMount(() => {
            service.addOptions(() => ({ guards: { canDelete: canDeleteGuard } }));

            if (stored) {
              send({ type: 'BUILD_HISTORY', payload: stored });
            }
          });
        }}
      </Hook>
    </Flow>
  );
};
