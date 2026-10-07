import { createContext, Hook } from '@bemedev/mind-flow-fabric';
import { onMount, type Component } from 'solid-js';

import { StateMachineEdgeFabric } from './components/Edge.fabric';
import { AtomicFiligrane } from './components/Filigrane';
import { HistoryControls } from './components/HistoryControls';
import { StateMachineNodeFabric } from './components/Node.fabric';
import { PrincipalPanel } from './components/PrincipalPanel';
import { configFromHistory } from './config';
import type { FlowMachineProps } from './FlowMachine.types';
import { canDelete, DEFAULT_NODE_DATA, machineEdgesAllowed } from './rules';
import type { StateMachineEdgeData, StateMachineNodeData } from './types';

/**
 * Creates a machine context bound to the `@bemedev/mind-flow-fabric` engine: the
 * `useFlow` hook reading it and the `FlowMachine` component providing it.
 *
 * It provides the default state machine fabric renderers (nodes, edges, panels,
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
   * Core component orchestrating `@bemedev/app` state machine diagrams on a fabric
   * canvas.
   *
   * @param props - Component properties of type {@linkcode FlowMachineProps}.
   *
   * @returns The rendered Solid component.
   */
  const FlowMachine: Component<FlowMachineProps> = props => {
    return (
      <Flow<StateMachineNodeData, StateMachineEdgeData>
        config={configFromHistory(props.history)}
        Node={StateMachineNodeFabric}
        Edge={StateMachineEdgeFabric}
        panels={{ topRight: PrincipalPanel, bottomLeft: HistoryControls }}
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
