import { Component, createEffect, createSignal } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import EdgesBoard from './EdgesBoard';
import NodesBoard from './NodesBoard';
import { MultiText } from '~/globals/ui/molecules';

interface Vector {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface NodeData {
  id: string;
  data: { label?: string; content: any };
  inputs: number;
  outputs: number;
  edgesIn: string[];
  edgesOut: string[];
}

interface EdgesNodes {
  [id: string]: {
    outNodeId: string;
    outputIndex: number;
    inNodeId: string;
    inputIndex: number;
  };
}

interface EdgesPositions {
  [id: string]: Vector;
}

interface EdgesActive {
  [id: string]: boolean;
}

export interface NodeProps {
  id: string;
  position: { x: number; y: number };
  data: { label?: string; content: any };
  inputs: number;
  outputs: number;
}

export interface EdgeProps {
  id: string;
  sourceNode: string;
  targetNode: string;
  sourceOutput: number;
  targetInput: number;
}

interface Props {
  config?: {
    nodes?: NodeProps[];
    edges?: EdgeProps[];
  };
  onNodeAdded?: (node: NodeProps) => void;
  onNodeDeleted?: (nodeId: string) => void;
  onEdgeAdded?: (edge: EdgeProps) => void;
  onEdgeDeleted?: (edgeId: string) => void;
}

const getEdgeId = (
  nodeOutId: string,
  outputIndex: number,
  nodeInId: string,
  inputIndex: number,
) => {
  return `edge_${nodeOutId}:${outputIndex}_${nodeInId}:${inputIndex}`;
};

const getInitialEdges = (nodes: NodeProps[]) => {
  const initEdgesNodes: EdgesNodes = {};
  const initEdgesPositions: EdgesPositions = {};
  const initEdgesActives: EdgesActive = {};
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
      if (i !== j) {
        const nodeI = nodes[i];
        const nodeJ = nodes[j];

        for (let x = 0; x < nodeI.outputs; x++) {
          for (let y = 0; y < nodeJ.inputs; y++) {
            const edgeId = getEdgeId(nodeI.id, x, nodeJ.id, y);
            initEdgesPositions[edgeId] = { x0: 0, y0: 0, x1: 0, y1: 0 };
            initEdgesActives[edgeId] = false;
            initEdgesNodes[edgeId] = {
              outNodeId: nodeI.id,
              outputIndex: x,
              inNodeId: nodeJ.id,
              inputIndex: y,
            };
          }
        }
      }
    }
  }
  return { initEdgesNodes, initEdgesPositions, initEdgesActives };
};

const getInitialNodes = (nodes: NodeProps[], edges: EdgeProps[]) => {
  const initNodesPositions = nodes.map(node => node.position);

  const initNodesData = nodes.map(node => {
    return {
      edgesIn: edges
        .map(edge => {
          if (edge.targetNode === node.id)
            return getEdgeId(
              edge.sourceNode,
              edge.sourceOutput,
              edge.targetNode,
              edge.targetInput,
            );
          return 'null';
        })
        .filter((elem: string) => elem !== 'null'),
      edgesOut: edges
        .map(edge => {
          if (edge.sourceNode === node.id)
            return getEdgeId(
              edge.sourceNode,
              edge.sourceOutput,
              edge.targetNode,
              edge.targetInput,
            );
          return 'null';
        })
        .filter((elem: string) => elem !== 'null'),
      ...node,
    };
  });

  const initNodesOffsets = nodes.map(node => {
    return {
      inputs: [...Array(node.inputs)].map(() => {
        return { offset: { x: 0, y: 0 } };
      }),
      outputs: [...Array(node.outputs)].map(() => {
        return { offset: { x: 0, y: 0 } };
      }),
    };
  });

  return { initNodesPositions, initNodesData, initNodesOffsets };
};

const PARENT_CHILD_GAP_WIDTH = 75;

export const FlowChart: Component<Props> = props => {
  const DEFAULT_NODES: NodeProps[] = [
    {
      id: 'node-1',
      position: { x: 350, y: 100 },
      data: {
        label: 'Root node',
        content: (
          <MultiText
            texts={['This is a ', 'red node', ' with a label']}
            props={{
              1: {
                class: 'text-red-400 font-semibold text-lg',
              },
            }}
          />
        ),
      },
      inputs: 0,
      outputs: 1,
    },
  ];

  // Internal state management
  const [measures, setMeasures] = createSignal<
    Record<string, { width: number; height: number }>
  >({});
  const [nodes, setNodes] = createSignal(
    props.config?.nodes ?? DEFAULT_NODES,
  );

  const [edges, setEdges] = createSignal(props.config?.edges ?? []);

  // EDGES
  const { initEdgesNodes, initEdgesPositions, initEdgesActives } =
    getInitialEdges(nodes());
  const [edgesNodes, setEdgesNodes] = createSignal(initEdgesNodes);
  const [edgesPositions, setEdgesPositions] =
    createSignal(initEdgesPositions);
  const [edgesActives, setEdgesActives] = createSignal(initEdgesActives);

  // NODES
  const { initNodesPositions, initNodesData, initNodesOffsets } =
    getInitialNodes(nodes(), edges());
  const [nodesPositions, setNodesPositions] =
    createSignal(initNodesPositions);
  const [nodesData, setNodesData] = createStore<NodeData[]>(initNodesData);
  const [nodesOffsets, setNodesOffsets] = createStore(initNodesOffsets);

  const [clickedDelta, setClickedDelta] = createSignal({
    x: 0,
    y: 0,
  });
  const [newEdge, setNewEdge] = createSignal<{
    position: Vector;
    sourceNode: number;
    sourceOutput: number;
  }>();

  createEffect(() => {
    const nextNodesLength = nodes().length;
    const prevNodesLength = nodesData.length;

    if (nextNodesLength !== prevNodesLength) {
      const { initEdgesNodes, initEdgesPositions, initEdgesActives } =
        getInitialEdges(nodes());
      setEdgesNodes(initEdgesNodes);
      setEdgesPositions(initEdgesPositions);
      setEdgesActives(initEdgesActives);
      const { initNodesPositions, initNodesData, initNodesOffsets } =
        getInitialNodes(nodes(), edges());
      setNodesPositions(initNodesPositions);
      setNodesData(initNodesData);
      setNodesOffsets(initNodesOffsets);
    }
  });

  // EDGE HANDLERS

  return (
    <div class='relative w-full h-full overflow-hidden'>
      <div class='w-full h-full overflow-scroll'>
        <div
          class='relative h-[150vh] w-[2160px] bg-white bg-[length:30px_30px]'
          style={{
            cursor: newEdge() !== null ? 'crosshair' : 'inherit',
            'background-image':
              'radial-gradient(circle, #b8b8b8bf 1px, rgba(0, 0, 0, 0) 1px)',
          }}
        >
          <NodesBoard
            nodesPositions={nodesPositions()}
            nodes={nodesData}
            onNodeMount={values => {
              setNodesOffsets(
                produce(offsets => {
                  offsets[values.nodeIndex].inputs = values.inputs;
                  offsets[values.nodeIndex].outputs = values.outputs;
                }),
              );

              setEdgesActives(prev => {
                const next = { ...prev };
                nodesData[values.nodeIndex].edgesIn.map(
                  (edgeId: string) => {
                    next[edgeId] = true;
                  },
                );
                nodesData[values.nodeIndex].edgesOut.map(
                  (edgeId: string) => {
                    next[edgeId] = true;
                  },
                );
                return next;
              });

              setEdgesPositions(prev => {
                const next = { ...prev };
                nodesData[values.nodeIndex].edgesIn.map(edgeId => {
                  next[edgeId] = {
                    x0: prev[edgeId]?.x0 || 0,
                    y0: prev[edgeId]?.y0 || 0,
                    x1:
                      nodesPositions()[values.nodeIndex].x +
                      values.inputs[edgesNodes()[edgeId].inputIndex].offset
                        .x,
                    y1:
                      nodesPositions()[values.nodeIndex].y +
                      values.inputs[edgesNodes()[edgeId].inputIndex].offset
                        .y,
                  };
                });
                nodesData[values.nodeIndex].edgesOut.map(edgeId => {
                  next[edgeId] = {
                    x0:
                      nodesPositions()[values.nodeIndex].x +
                      values.outputs[edgesNodes()[edgeId].outputIndex]
                        .offset.x,
                    y0:
                      nodesPositions()[values.nodeIndex].y +
                      values.outputs[edgesNodes()[edgeId].outputIndex]
                        .offset.y,
                    x1: prev[edgeId]?.x1 || 0,
                    y1: prev[edgeId]?.y1 || 0,
                  };
                });
                return next;
              });
            }}
            onNodePress={(x, y) => {
              setClickedDelta({ x, y });
            }}
            onNodeMove={(nodeIndex, x, y) => {
              setNodesPositions(prev => {
                const deltas = clickedDelta();
                const next = [...prev];
                next[nodeIndex].x = x - deltas.x;
                next[nodeIndex].y = y - deltas.y;
                return next;
              });

              setEdgesPositions(prev => {
                const next = { ...prev };
                const actives = edgesActives();
                const edges = edgesNodes();
                nodesData[nodeIndex].edgesIn.map(edgeId => {
                  if (actives[edgeId])
                    next[edgeId] = {
                      x0: prev[edgeId]?.x0 || 0,
                      y0: prev[edgeId]?.y0 || 0,
                      x1:
                        x +
                        nodesOffsets[nodeIndex].inputs[
                          edges[edgeId].inputIndex
                        ].offset.x -
                        clickedDelta().x,
                      y1:
                        y +
                        nodesOffsets[nodeIndex].inputs[
                          edges[edgeId].inputIndex
                        ].offset.y -
                        clickedDelta().y,
                    };
                });
                nodesData[nodeIndex].edgesOut.map(edgeId => {
                  if (actives[edgeId])
                    next[edgeId] = {
                      x0:
                        x +
                        nodesOffsets[nodeIndex].outputs[
                          edges[edgeId].outputIndex
                        ].offset.x -
                        clickedDelta().x,
                      y0:
                        y +
                        nodesOffsets[nodeIndex].outputs[
                          edges[edgeId].outputIndex
                        ].offset.y -
                        clickedDelta().y,
                      x1: prev[edgeId]?.x1 || 0,
                      y1: prev[edgeId]?.y1 || 0,
                    };
                });
                return next;
              });
            }}
            onNodeDelete={nodeId => {
              setEdges(curr =>
                curr.filter(
                  ({ sourceNode, targetNode }) =>
                    sourceNode !== nodeId && targetNode !== nodeId,
                ),
              );

              setNodes(curr => curr.filter(({ id }) => id !== nodeId));
              props.onNodeDeleted?.(nodeId);
            }}
            onNodeAddChild={nodeId => {
              const parentNode = nodes().find(node => node.id === nodeId);
              if (!parentNode) return;

              const newNodeId = `node_${Date.now()}`;
              const rightOffset =
                parentNode.position.x +
                measures()[nodeId].width +
                PARENT_CHILD_GAP_WIDTH;
              const newNode: NodeProps = {
                id: newNodeId,
                position: {
                  x: rightOffset,
                  y: parentNode.position.y,
                },
                data: {
                  content: '<Nouveau nœud>',
                },
                inputs: 1,
                outputs: 1,
              };

              const newEdge: EdgeProps = {
                id: getEdgeId(nodeId, 0, newNodeId, 0),
                sourceNode: nodeId,
                targetNode: newNodeId,
                sourceOutput: 0,
                targetInput: 0,
              };

              setEdges(curr => [...curr, newEdge]);
              setNodes(curr => [...curr, newNode]);
              props.onNodeAdded?.(newNode);
              props.onEdgeAdded?.(newEdge);

              return newNodeId;
            }}
            onNodeAddSibling={nodeId => {
              const edgeParent = edges().find(
                edge => edge.targetNode === nodeId,
              );
              if (!edgeParent) return;

              const parentNodeId = edgeParent.sourceNode;
              const parentNode = nodes().find(
                node => node.id === parentNodeId,
              );
              if (!parentNode) return;

              const newNodeId = `node_${Date.now()}`;
              const rightOffset =
                parentNode.position.x +
                measures()[parentNodeId].width +
                PARENT_CHILD_GAP_WIDTH;
              const newNode: NodeProps = {
                id: newNodeId,
                position: {
                  x: rightOffset,
                  y: parentNode.position.y + 100,
                },
                data: {
                  content: '<Nouveau nœud>',
                },
                inputs: 1,
                outputs: 1,
              };

              const newEdge: EdgeProps = {
                id: getEdgeId(parentNodeId, 0, newNodeId, 0),
                sourceNode: parentNodeId,
                targetNode: newNodeId,
                sourceOutput: 0,
                targetInput: 0,
              };

              setEdges(curr => [...curr, newEdge]);
              setNodes(curr => [...curr, newNode]);
              props.onNodeAdded?.(newNode);
              props.onEdgeAdded?.(newEdge);

              return newNodeId;
            }}
            onOutputMouseDown={(nodeIndex, outputIndex) => {
              const nodePosition = nodesPositions()[nodeIndex];
              const outputOffset =
                nodesOffsets[nodeIndex].outputs[outputIndex].offset;
              setNewEdge({
                position: {
                  x0: nodePosition.x + outputOffset.x,
                  y0: nodePosition.y + outputOffset.y,
                  x1: nodePosition.x + outputOffset.x,
                  y1: nodePosition.y + outputOffset.y,
                },
                sourceNode: nodeIndex,
                sourceOutput: outputIndex,
              });
            }}
            onInputMouseUp={(nodeIndex: number, inputIndex: number) => {
              if (newEdge()?.sourceNode === nodeIndex) {
                setNewEdge();
                return;
              }

              const outputEdges: string[] = JSON.parse(
                JSON.stringify(
                  nodesData[newEdge()?.sourceNode || 0].edgesOut,
                ),
              );
              const inputEdges: string[] = JSON.parse(
                JSON.stringify(nodesData[nodeIndex].edgesIn),
              );

              if (!newEdge()) return;
              const sourceNodeId =
                nodesData[newEdge()?.sourceNode || 0].id;
              const targetNodeId = nodesData[nodeIndex].id;

              const edgeId = getEdgeId(
                sourceNodeId,
                newEdge()?.sourceOutput || 0,
                targetNodeId,
                inputIndex,
              );

              let haveEdge = false;

              if (outputEdges.includes(edgeId)) haveEdge = true;
              if (inputEdges.includes(edgeId)) haveEdge = true;

              if (!haveEdge) {
                setEdgesPositions((prev: EdgesPositions) => {
                  const next = { ...prev };
                  next[edgeId] = {
                    x0:
                      nodesPositions()[newEdge()?.sourceNode || 0].x +
                      nodesOffsets[newEdge()?.sourceNode || 0].outputs[
                        newEdge()?.sourceOutput || 0
                      ].offset.x,
                    y0:
                      nodesPositions()[newEdge()?.sourceNode || 0].y +
                      nodesOffsets[newEdge()?.sourceNode || 0].outputs[
                        newEdge()?.sourceOutput || 0
                      ].offset.y,
                    x1:
                      nodesPositions()[nodeIndex].x +
                      nodesOffsets[nodeIndex].inputs[inputIndex].offset.x,
                    y1:
                      nodesPositions()[nodeIndex].y +
                      nodesOffsets[nodeIndex].inputs[inputIndex].offset.y,
                  };
                  return next;
                });

                setEdgesActives((prev: EdgesActive) => {
                  const next = { ...prev };
                  next[edgeId] = true;
                  return next;
                });

                setNodesData(
                  produce((nodesData: NodeData[]) => {
                    nodesData[newEdge()?.sourceNode || 0].edgesOut.push(
                      edgeId,
                    );
                    nodesData[nodeIndex].edgesIn.push(edgeId);
                  }),
                );

                const activeEdgesKeys = Object.keys(edgesActives());
                const activeEdges: EdgeProps[] = [];

                for (let i = 0; i < activeEdgesKeys.length; i++) {
                  if (edgesActives()[activeEdgesKeys[i]]) {
                    const edgeInfo = edgesNodes()[activeEdgesKeys[i]];
                    activeEdges.push({
                      id: activeEdgesKeys[i],
                      sourceNode: edgeInfo.outNodeId,
                      sourceOutput: edgeInfo.outputIndex,
                      targetNode: edgeInfo.inNodeId,
                      targetInput: edgeInfo.inputIndex,
                    });
                  }
                }

                setEdges(activeEdges);

                if (
                  props.onEdgeAdded &&
                  activeEdges.length > edges().length
                ) {
                  const newEdge = activeEdges[activeEdges.length - 1];
                  props.onEdgeAdded(newEdge);
                }
              }

              setNewEdge();
            }}
            onMouseUp={() => {
              setNewEdge();
            }}
            onMouseMove={(x, y) => {
              const edge = newEdge();
              if (edge)
                setNewEdge({
                  position: {
                    x0: edge.position?.x0 || 0,
                    y0: edge.position?.y0 || 0,
                    x1: x,
                    y1: y,
                  },
                  sourceNode: edge.sourceNode || 0,
                  sourceOutput: edge.sourceOutput || 0,
                });
            }}
            measureNodes={setMeasures}
          />

          <EdgesBoard
            newEdge={newEdge()}
            edgesActives={edgesActives()}
            edgesPositions={edgesPositions()}
            onDeleteEdge={edgeId => {
              const nodes = edgesNodes();
              setNodesData(
                produce(nodesData => {
                  const nodeSourceId = nodes[edgeId].outNodeId;
                  const nodeTargetId = nodes[edgeId].inNodeId;
                  const nodeSourceIndex = nodesData.findIndex(
                    (node: NodeData) => node.id === nodeSourceId,
                  );
                  const nodeTargetIndex = nodesData.findIndex(
                    (node: NodeData) => node.id === nodeTargetId,
                  );

                  nodesData[nodeTargetIndex].edgesIn = nodesData[
                    nodeTargetIndex
                  ].edgesIn.filter((elem: string) => elem !== edgeId);
                  nodesData[nodeSourceIndex].edgesOut = nodesData[
                    nodeSourceIndex
                  ].edgesOut.filter((elem: string) => elem !== edgeId);
                }),
              );
              setEdgesActives((prev: EdgesActive) => {
                const next = { ...prev };
                next[edgeId] = false;
                return next;
              });

              const activeEdgesKeys = Object.keys(edgesActives());
              const activeEdges: EdgeProps[] = [];
              for (let i = 0; i < activeEdgesKeys.length; i++) {
                if (edgesActives()[activeEdgesKeys[i]]) {
                  const edgeInfo = nodes[activeEdgesKeys[i]];
                  activeEdges.push({
                    id: activeEdgesKeys[i],
                    sourceNode: edgeInfo.outNodeId,
                    sourceOutput: edgeInfo.outputIndex,
                    targetNode: edgeInfo.inNodeId,
                    targetInput: edgeInfo.inputIndex,
                  });
                }
              }
              setEdges(activeEdges);
              if (
                props.onEdgeDeleted &&
                activeEdges.length < edges().length
              ) {
                const deletedEdgeId = edges().find(
                  e => !activeEdges.some(ae => ae.id === e.id),
                )?.id;
                if (deletedEdgeId) props.onEdgeDeleted(deletedEdgeId);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
