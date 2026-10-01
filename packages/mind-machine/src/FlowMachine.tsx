import { createContext, Hook } from '@bemedev/mind-flow';
import { onMount, type Component } from 'solid-js';

import { StateMachineEdge } from './components/Edge';
import { AtomicFiligrane } from './components/Filigrane';
import { HistoryControlsAddons } from './components/HistoryControlsAddons';
import { StateMachineNode } from './components/Node';
import { StateMachineEditPanel } from './components/Node.edit';
import { StateMachineNodeSelected } from './components/Node.selected';
import { PrincipalPanel } from './components/PrincipalPanel';
import { TransitionModal } from './components/TransitionModal';
import { configFromHistory } from './config';
import type { FlowMachineProps } from './FlowMachine.types';
import { canDelete, DEFAULT_NODE_DATA, machineEdgesAllowed } from './rules';
import type { StateMachineEdgeData, StateMachineNodeData } from './types';

/**
 * Creates a machine context bound to the `@bemedev/mind-flow` engine: the `useFlow`
 * hook reading it and the `FlowMachine` component providing it.
 *
 * It provides the default state machine rendering components (nodes, edges, panels,
 * history controls) and parses the required `history` source into initial nodes and
 * edges.
 *
 * Persistence is delegated to the consumer through the
 * {@linkcode FlowMachineProps.register} prop: read the stored history first, pass it
 * as `history`, and persist the registered context.
 *
 * Every other machine component receives the same value as a `flow` prop, while
 * custom children read it with the returned hook.
 *
 * @returns A tuple containing the accessor hook and the `FlowMachine` component of
 *   type {@linkcode Component}.
 *
 * @see {@linkcode configFromHistory}
 */
const createFlowContext = () => {
  const [useFlow, Flow] = createContext();

  /** Bridges the flow context to the watermark atom rendered as a raw child. */
  const Filigrane: Component = () => <AtomicFiligrane flow={useFlow()} />;

  /**
   * Core component orchestrating `@bemedev/app` state machine diagrams.
   *
   * @param props - Component properties of type {@linkcode FlowMachineProps}.
   *
   * @returns The rendered Solid component.
   */
  const FlowMachine: Component<FlowMachineProps> = props => {
    return (
      <Flow<StateMachineNodeData, StateMachineEdgeData>
        delay={100}
        config={configFromHistory(props.history)}
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
        register={props.register}
      >
        {props.children}
        <Filigrane />
        <Hook>
          {() => {
            const { service } = useFlow();

            onMount(() => {
              service.addOptions(() => ({ guards: { canDelete } }));
            });
          }}
        </Hook>
      </Flow>
    );
  };

  return [useFlow, FlowMachine] as const;
};

export { createFlowContext as createContext };
