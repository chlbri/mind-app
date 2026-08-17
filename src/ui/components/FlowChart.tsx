import type { inferT } from "@bemedev/app/typings";
import { Component, createSignal, onMount } from "solid-js";
import type { edgeJSON, nodeJSON } from "../../services/main.typings";
import { EdgesBoard } from "./EdgesBoard";
import { useFlow } from "./FlowChart.context";
import { NodesBoard } from "./NodesBoard";

export type NodeProps = inferT<typeof nodeJSON>;

export type EdgeProps = inferT<typeof edgeJSON>;

interface Props {
  config?: {
    nodes?: (NodeProps & { id: string })[];
    edges?: (EdgeProps & { id: string })[];
  };
  onNodeAdded?: (node: NodeProps) => void;
  onNodeDeleted?: (nodeId: string) => void;
  onEdgeAdded?: (edge: EdgeProps) => void;
  onEdgeDeleted?: (edgeId: string) => void;
}

// const PARENT_CHILD_GAP_WIDTH = 75;

export const FlowChart: Component<Props> = (props) => {
  const DEFAULT_NODES: (NodeProps & { id: string })[] = [
    {
      id: "node-0",
      data: {
        content: "Some text",
        label: "Root node",
      },
      input: false,
      position: {
        x: 350,
        y: 100,
      },
    },
  ];

  const primaryNodes = props.config?.nodes ?? DEFAULT_NODES;
  const primaryEdges = props.config?.edges;

  const {
    service,
    newEdge: [newEdge, setNewEdge],
    board: [board],
  } = useFlow();

  onMount(() => {
    service.send({
      type: "CONFIGURE",
      payload: {
        nodes: primaryNodes,
        edges: primaryEdges ?? [],
      },
    });
  });

  const [zoom, setZoom] = createSignal(2);

  return (
    <div
      class="relative w-full h-full"
      onMouseUp={() => {
        setNewEdge();
      }}
      onMouseMove={({ x, y }) => {
        const edge = newEdge();
        const _board = board();
        if (edge && _board)
          setNewEdge({
            ...edge,
            x1: x - _board.x,
            y1: y - _board.y,
          });
      }}
      style={{}}
    >
      <div
        class="relative h-full w-full bg-white bg-size-[30px_30px]"
        style={{
          cursor: newEdge() ? "inherit" : "crosshair",
          "background-image": "radial-gradient(circle, #b8b8b8bf 1px, rgba(0, 0, 0, 0) 1px)",
        }}
      >
        <NodesBoard />
        <EdgesBoard />
      </div>
    </div>
  );
};
