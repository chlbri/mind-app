import type { NodeProps } from "./FlowChart";

export const PARENT_CHILD_GAP_WIDTH = 100;

export  const DEFAULT_NODES: (NodeProps & { id: string })[] = [
    {
      id: 'node-0',
      data: {
        content: 'Some text',
        label: 'Root node',
      },
      input: false,
      position: {
        x: 350,
        y: 100,
      },
    },
  ];