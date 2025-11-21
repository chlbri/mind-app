import { dequal } from 'dequal';
import { Component, createEffect, createSignal, onMount } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { buildEdgeId } from '../services/main.machine';
import type {
  Extremities,
  NodeOffset,
  Point,
} from '../services/main.types';
import EdgesBoard from './EdgesBoard';
import { useFlowContext } from './FlowChart.context';
import NodesBoard from './NodesBoard';

interface Vector {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface NodeData {
  id: string;
  data: { label?: string; content: any };
  input: boolean;
  edgesIn: string[];
  edgesOut: string[];
}

interface EdgesNodes {
  [id: string]: Extremities;
}

interface EdgesPositions {
  [id: string]: Vector;
}

interface EdgesActive {
  [id: string]: boolean;
}

export interface NodeProps {
  id: string;
  position: Point;
  data: { label?: string; content: string };
  input: boolean;
}

export type EdgeProps = {
  id: string;
} & Extremities;

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

const getInitialEdges = (nodes: NodeProps[]) => {
  const initEdgesNodes: EdgesNodes = {};
  const initEdgesPositions: EdgesPositions = {};
  const initEdgesActives: EdgesActive = {};
  const collectedIds = new Set<string>();
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
      if (i !== j) {
        const nodeI = nodes[i];
        const nodeJ = nodes[j];

        const edgeId = buildEdgeId(nodeI.id, nodeJ.id);
        const edgeId2 = buildEdgeId(nodeJ.id, nodeI.id);
        if (collectedIds.has(edgeId2)) continue;
        if (collectedIds.has(edgeId)) continue;
        initEdgesPositions[edgeId] = { x0: 0, y0: 0, x1: 0, y1: 0 };
        initEdgesActives[edgeId] = false;
        initEdgesNodes[edgeId] = {
          from: nodeI.id,
          to: nodeJ.id,
        };
        collectedIds.add(edgeId2);
        collectedIds.add(edgeId);
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
          if (edge.to === node.id) return buildEdgeId(edge.from, edge.to);
          return 'null';
        })
        .filter((elem: string) => elem !== 'null'),
      edgesOut: edges
        .map(edge => {
          if (edge.from === node.id)
            return buildEdgeId(edge.from, edge.to);
          return 'null';
        })
        .filter((elem: string) => elem !== 'null'),
      ...node,
    };
  });

  const initNodesOffsets = nodes.map(node => {
    const out: NodeOffset = {
      output: { x: 0, y: 0 },
    };
    if (node.input) {
      out.input = { x: 0, y: 0 };
    }
    return out;
  });

  return { initNodesPositions, initNodesData, initNodesOffsets };
};

const PARENT_CHILD_GAP_WIDTH = 75;

export const FlowChart: Component<Props> = props => {
  const DEFAULT_NODES: NodeProps[] = [
    {
      id: 'node-0',
      position: { x: 350, y: 100 },
      data: {
        label: 'Root node',
        content: 'Somme text',
      },
      input: false,
    },
  ];

  const primaryNodes = props.config?.nodes ?? DEFAULT_NODES;
  const primaryEdges = props.config?.edges ?? [];

  // Internal state management
  const [measures, setMeasures] = createSignal<
    Record<string, { width: number; height: number }>
  >({});
  const [nodes, setNodes] = createSignal(primaryNodes);

  const [edges, setEdges] = createSignal(props.config?.edges ?? []);

  // EDGES
  const { initEdgesNodes, initEdgesPositions, initEdgesActives } =
    getInitialEdges(primaryNodes);
  const [edgesNodes, setEdgesNodes] = createSignal(initEdgesNodes);
  const [edgesPositions, setEdgesPositions] = createSignal(
    initEdgesPositions,
    {
      equals: false,
    },
  );
  const [edgesActives, setEdgesActives] = createSignal(initEdgesActives, {
    equals: false,
  });

  // NODES
  const { initNodesPositions, initNodesData, initNodesOffsets } =
    getInitialNodes(primaryNodes, primaryEdges);
  const [nodesPositions, setNodesPositions] = createSignal(
    initNodesPositions,
    {
      equals: false,
    },
  );
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

  const {
    dimensions: [dimensions],
    service,
    newEdge: [newEdge2, setNewEdge2],
    edgesPositions: [edgesPositions2, setEdgesPositions2],
  } = useFlowContext();

  service.send({
    type: 'CONFIGURE',
    payload: {
      nodes: {
        'node-0': {
          data: {
            content: 'Somme text',
            label: 'Root node',
          },
          input: false,
          position: {
            x: 350,
            y: 100,
          },
        },
      },
      edges: {},
    },
  });

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
      // service.send('UPDATE');
    }
  });

  createEffect(() => {
    // console.log('nodes', service.select('context.data.nodes', dequal)());
    // console.log('edges', service.select('context.data.edges', dequal)());
    console.log('positions', edgesPositions2());
    console.log('value', service.value());
  });

  onMount(() => {
    service.addOptions(({ assign, voidAction }) => ({
      actions: {
        placeChild: assign('context.data.nodes', {
          ADD_CHILD: ({
            payload,
            context: { data },
            pContext: { nodes },
          }) => {
            const out = { ...data?.nodes };
            const parentNode = out[payload];
            console.log('out', '=>', out);
            const id = `node-${nodes?.length}`;
            const width = dimensions()[payload].width;

            const x =
              parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;

            out[id] = {
              data: { content: '<Nouveau nœud>' },
              input: true,
              position: { x, y: parentNode.position.y },
            };

            return out;
          },
        }),

        placeSibling: assign('context.data.nodes', {
          ADD_SIBLING: ({
            payload,
            context: { data },
            pContext: { nodes, edges },
          }) => {
            const out = { ...data?.nodes };

            const parentID = edges!.find(
              edge => edge.to === payload,
            )!.from;

            const parentNode = out[parentID];
            const id = `node-${nodes?.length}`;
            const width = dimensions()[parentID].width;

            const x =
              parentNode.position.x + width + PARENT_CHILD_GAP_WIDTH;

            out[id] = {
              data: { content: '<Nouveau nœud>' },
              input: true,
              position: { x, y: parentNode.position.y + 100 },
            };

            return out;
          },
        }),

        buildUI: voidAction(
          ({ context: { data }, pContext: { edges } }) => {
            console.log('Building UI...');
            const nodes = { ...data?.nodes };
            setEdgesPositions2(
              produce(next => {
                edges?.forEach(({ from, id, to }) => {
                  const output = dimensions()[from].output;
                  const input = dimensions()[to].input;
                  console.log('output', output);
                  if (input)
                    next[id] = {
                      x0: nodes[from].position.x + output.x,
                      y0: nodes[from].position.y + output.y,
                      x1: nodes[to].position.x + input!.x,
                      y1: nodes[to].position.y + input!.y,
                    };
                });
              }),
            );
          },
        ),
      },
    }));
  });

  // EDGE HANDLERS

  return (
    <div
      class='relative w-full h-full overflow-hidden'
      onMouseUp={() => {
        setNewEdge2();
      }}
      onMouseMove={({ x, y }) => {
        const edge = newEdge2();
        if (edge)
          setNewEdge2({
            ...edge,
            x1: x,
            y1: y,
          });
      }}
    >
      <div class='w-full h-full overflow-scroll'>
        <div
          class='relative h-[150vh] w-[2160px] bg-white bg-size-[30px_30px]'
          style={{
            cursor: newEdge() !== null ? 'crosshair' : 'inherit',
            'background-image':
              'radial-gradient(circle, #b8b8b8bf 1px, rgba(0, 0, 0, 0) 1px)',
          }}
        >
          <NodesBoard
            nodesPositions={nodesPositions()}
            nodes={nodesData}
            onNodeMount={({ nodeIndex, input, output }) => {
              const currentData = nodesData[nodeIndex];
              setNodesOffsets(
                produce(offsets => {
                  offsets[nodeIndex].input = input;
                  offsets[nodeIndex].output = output;
                }),
              );

              setEdgesActives(
                produce(next => {
                  const array = [
                    ...currentData.edgesIn,
                    ...currentData.edgesOut,
                  ];
                  array.forEach(edgeId => {
                    next[edgeId] = true;
                  });
                }),
              );

              setEdgesPositions(
                produce(next => {
                  const _nodesPositions = nodesPositions();
                  currentData.edgesIn.map(id => {
                    next[id] = {
                      ...next[id],
                      x1: _nodesPositions[nodeIndex].x + input.x,
                      y1: _nodesPositions[nodeIndex].y + input.y,
                    };
                  });
                  currentData.edgesOut.map(id => {
                    next[id] = {
                      ...next[id],
                      x0: _nodesPositions[nodeIndex].x + output.x,
                      y0: _nodesPositions[nodeIndex].y + output.y,
                    };
                  });
                }),
              );
            }}
            onNodePress={(x, y) => {
              setClickedDelta({ x, y });
            }}
            onNodeMove={(nodeIndex, x, y) => {
              setNodesPositions(
                produce(next => {
                  const deltas = clickedDelta();
                  next[nodeIndex].x = x - deltas.x;
                  next[nodeIndex].y = y - deltas.y;
                }),
              );

              setEdgesPositions(
                produce(next => {
                  const actives = edgesActives();
                  const currentD = nodesData[nodeIndex];

                  currentD.edgesIn.forEach(edgeId => {
                    if (actives[edgeId]) {
                      const input = nodesOffsets[nodeIndex].input;
                      if (!input) return;
                      const x1 = x + input.x - clickedDelta().x;
                      const y1 = y + input.y - clickedDelta().y;
                      next[edgeId] = {
                        x0: next[edgeId]?.x0 || 0,
                        y0: next[edgeId]?.y0 || 0,
                        x1,
                        y1,
                      };
                    }
                  });

                  currentD.edgesOut.forEach(edgeId => {
                    const x0 =
                      x +
                      nodesOffsets[nodeIndex].output.x -
                      clickedDelta().x;
                    const y0 =
                      y +
                      nodesOffsets[nodeIndex].output.y -
                      clickedDelta().y;
                    if (actives[edgeId])
                      next[edgeId] = {
                        x0,
                        y0,
                        x1: next[edgeId]?.x1 || 0,
                        y1: next[edgeId]?.y1 || 0,
                      };
                  });
                }),
              );
            }}
            onNodeDelete={nodeId => {
              setEdges(curr =>
                curr.filter(
                  ({ from: sourceNode, to: targetNode }) =>
                    sourceNode !== nodeId && targetNode !== nodeId,
                ),
              );

              setNodes(curr => curr.filter(({ id }) => id !== nodeId));
              props.onNodeDeleted?.(nodeId);
            }}
            onNodeAddChild={nodeId => {
              const parentNode = nodes().find(node => node.id === nodeId);
              if (!parentNode) return;

              const newNodeId = `node-${nodes().length}`;
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
                input: true,
              };

              const newEdge: EdgeProps = {
                id: buildEdgeId(nodeId, newNodeId),
                from: nodeId,
                to: newNodeId,
              };

              setEdges(curr => [...curr, newEdge]);
              setNodes(curr => [...curr, newNode]);
              props.onNodeAdded?.(newNode);
              props.onEdgeAdded?.(newEdge);

              return newNodeId;
            }}
            onNodeAddSibling={nodeId => {
              const edgeParent = edges().find(edge => edge.to === nodeId);
              if (!edgeParent) return;

              const parentNodeId = edgeParent.from;
              const parentNode = nodes().find(
                node => node.id === parentNodeId,
              );
              if (!parentNode) return;

              const newNodeId = `node_${nodes().length}`;
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
                input: true,
              };

              const newEdge: EdgeProps = {
                id: buildEdgeId(parentNodeId, newNodeId),
                from: parentNodeId,
                to: newNodeId,
              };

              setEdges(curr => [...curr, newEdge]);
              setNodes(curr => [...curr, newNode]);
              props.onNodeAdded?.(newNode);
              props.onEdgeAdded?.(newEdge);

              return newNodeId;
            }}
            onOutputMouseDown={(nodeIndex, outputIndex) => {
              const nodePosition = nodesPositions()[nodeIndex];
              const outputOffset = nodesOffsets[nodeIndex].output;
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
            onInputMouseUp={nodeIndex => {
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

              const edgeId = buildEdgeId(sourceNodeId, targetNodeId);

              let haveEdge = false;

              if (outputEdges.includes(edgeId)) haveEdge = true;
              if (inputEdges.includes(edgeId)) haveEdge = true;

              if (!haveEdge) {
                setEdgesPositions(
                  produce(next => {
                    const input = nodesOffsets[nodeIndex].input;
                    if (!input) return;

                    next[edgeId] = {
                      x0:
                        nodesPositions()[newEdge()?.sourceNode || 0].x +
                        nodesOffsets[newEdge()?.sourceNode || 0].output.x,
                      y0:
                        nodesPositions()[newEdge()?.sourceNode || 0].y +
                        nodesOffsets[newEdge()?.sourceNode || 0].output.y,
                      x1: nodesPositions()[nodeIndex].x + input.x,
                      y1: nodesPositions()[nodeIndex].y + input.y,
                    };
                  }),
                );

                setEdgesActives(produce(next => (next[edgeId] = true)));

                setNodesData(
                  produce(data => {
                    data[newEdge()?.sourceNode || 0].edgesOut.push(edgeId);
                    data[nodeIndex].edgesIn.push(edgeId);
                  }),
                );

                const activeEdgesKeys = Object.keys(edgesActives());
                const activeEdges: EdgeProps[] = [];

                for (let i = 0; i < activeEdgesKeys.length; i++) {
                  if (edgesActives()[activeEdgesKeys[i]]) {
                    const edgeInfo = edgesNodes()[activeEdgesKeys[i]];
                    activeEdges.push({
                      id: activeEdgesKeys[i],
                      from: edgeInfo.from,
                      to: edgeInfo.to,
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
                produce(data => {
                  const nodeSourceId = nodes[edgeId].from;
                  const nodeTargetId = nodes[edgeId].to;
                  const nodeSourceIndex = data.findIndex(
                    node => node.id === nodeSourceId,
                  );
                  const nodeTargetIndex = data.findIndex(
                    node => node.id === nodeTargetId,
                  );

                  data[nodeTargetIndex].edgesIn = data[
                    nodeTargetIndex
                  ].edgesIn.filter(elem => elem !== edgeId);
                  data[nodeSourceIndex].edgesOut = data[
                    nodeSourceIndex
                  ].edgesOut.filter(elem => elem !== edgeId);
                }),
              );

              setEdgesActives(produce(next => (next[edgeId] = false)));

              const activeEdgesKeys = Object.keys(edgesActives());
              const activeEdges: EdgeProps[] = [];
              for (let i = 0; i < activeEdgesKeys.length; i++) {
                if (edgesActives()[activeEdgesKeys[i]]) {
                  const edgeInfo = nodes[activeEdgesKeys[i]];
                  activeEdges.push({
                    id: activeEdgesKeys[i],
                    from: edgeInfo.from,
                    to: edgeInfo.to,
                  });
                }
              }

              const deletedEdgeId = edges().find(
                e => !activeEdges.some(({ id }) => id === e.id),
              )?.id;

              setEdges(activeEdges);
              if (deletedEdgeId) props.onEdgeDeleted?.(deletedEdgeId);
            }}
          />
        </div>
      </div>
    </div>
  );
};
