import { createContext, Hook } from '@bemedev/mind-flow-three';
import { onMount, type Component } from 'solid-js';

import { StateMachineEdge3D } from './components/Edge.3d';
import { AtomicFiligrane } from './components/Filigrane';
import { HistoryControls } from './components/HistoryControls';
import { StateMachineNode3D } from './components/Node.3d';
import { PrincipalPanel } from './components/PrincipalPanel';
import { configFromHistory } from './config';
import type { FlowMachineProps } from './FlowMachine.types';
import { canDelete, DEFAULT_NODE_DATA, machineEdgesAllowed } from './rules';
import type { StateMachineEdgeData, StateMachineNodeData } from './types';

/**
 * Creates a machine context bound to the `@bemedev/mind-flow-three` engine: the
 * `useFlow` hook reading it and the `FlowMachine` component providing it.
 *
 * It provides the default state machine 3D renderers (nodes, edges, panels, history
 * controls) and parses the required `history` source into initial nodes and edges.
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
   * Core component orchestrating `@bemedev/app` state machine 3D diagrams.
   *
   * @param props - Component properties of type {@linkcode FlowMachineProps}.
   *
   * @returns The rendered Solid component.
   */
  const FlowMachine: Component<FlowMachineProps> = props => {
    return (
      <Flow<StateMachineNodeData, StateMachineEdgeData>
        config={configFromHistory(props.history)}
        Node={StateMachineNode3D}
        Edge={StateMachineEdge3D}
        panels={{ bottomLeft: HistoryControls, topRight: PrincipalPanel }}
        defaultData={DEFAULT_NODE_DATA}
        edgesAllowed={machineEdgesAllowed}
        physics={props.physics}
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
