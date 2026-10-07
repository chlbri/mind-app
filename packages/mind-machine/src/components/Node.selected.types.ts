import type { WithFlow } from "@bemedev/mind-flow";

/** Properties for the {@linkcode StateMachineNodeSelected} component. */
export type StateMachineNodeSelectedProps = {
  /** Unique identifier of the selected state node. */
  id: string;
} & WithFlow;