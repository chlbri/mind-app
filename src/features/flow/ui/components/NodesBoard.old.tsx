import { Component, createSignal, For, onMount } from 'solid-js';
import { produce } from 'solid-js/store';
import type { Point } from '../services/main.types';
import { useFlowContext } from './FlowChart.context';
import NodeComponent from './NodeComponent.old';

interface NodeProps {
  id: string;
  data: { label?: string; content: any };
  input: boolean;
}

interface Props {
  nodesPositions: { x: number; y: number }[];
  nodes: NodeProps[];
  onNodeMount: (values: {
    nodeIndex: number;
    input: Point;
    output: Point;
  }) => void;
  onNodePress: (x: number, y: number) => void;
  onNodeMove: (nodeIndex: number, x: number, y: number) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeAddSibling: (nodeId: string) => string | undefined;
  onNodeAddChild: (nodeId: string) => string | undefined;
  onOutputMouseDown: (nodeIndex: number, outputIndex: number) => void;
  onInputMouseUp: (nodeIndex: number, inputIndex: number) => void;
  onMouseUp: () => void;
  onMouseMove: (x: number, y: number) => void;
  measureNodes: (
    value: Record<
      string,
      {
        width: number;
        height: number;
      }
    >,
  ) => void;
}

const NodesBoard: Component<Props> = props => {
  const [grabbing, setGrabbing] = createSignal<number>();
  const [selected, setSelected] = createSignal<number>();
  const [measures, setMeasures] = createSignal<
    Record<string, { width: number; height: number }>
  >({});
  const [ref, setRef] = createSignal<HTMLDivElement>();

  function handleOnMouseDownNode(index: number, x: number, y: number) {
    const _ref = ref()!;
    setGrabbing(index);
    setSelected(index);
    props.onNodePress(
      x - _ref.getBoundingClientRect().x - props.nodesPositions[index].x,
      y - _ref.getBoundingClientRect().y - props.nodesPositions[index].y,
    );
  }
  const {
    dimensions: [, setDimensions],
    // service,
  } = useFlowContext();

  onMount(() => {
    const rect = ref()!.getBoundingClientRect();

    setDimensions(
      produce(data => {
        for (const key in data) {
          const dimension = data[key];
          const index = props.nodes.findIndex(n => n.id === key);
          if (index === -1) continue;

          data[key] = {
            ...dimension,
            output: {
              x:
                dimension.output.x -
                rect.x -
                props.nodesPositions[index].x +
                6,
              y:
                dimension.output.y -
                rect.y -
                props.nodesPositions[index].y +
                6,
            },
            input: dimension.input
              ? {
                  x:
                    dimension.input.x -
                    rect.x -
                    props.nodesPositions[index].x +
                    6,
                  y:
                    dimension.input.y -
                    rect.y -
                    props.nodesPositions[index].y +
                    6,
                }
              : undefined,
          };
        }
      }),
    );
  });

  return (
    <div
      ref={setRef}
      class='w-full h-full relative'
      onMouseMove={event => {
        const rect = ref()!.getBoundingClientRect();
        const x = event.x - rect.x;
        const y = event.y - rect.y;
        const _grabbing = grabbing();
        if (_grabbing !== undefined) {
          props.onNodeMove(_grabbing, x, y);
        }
        props.onMouseMove(x, y);
        // service.send('DESELECT');
      }}
      onMouseUp={() => {
        setGrabbing();
        props.onMouseUp();
      }}
    >
      <For each={props.nodes}>
        {(node, index) => (
          <NodeComponent
            id={node.id}
            x={props.nodesPositions[index()].x}
            y={props.nodesPositions[index()].y}
            selected={selected() === index()}
            label={node.data.label}
            content={node.data.content}
            input={node.input}
            onMeasure={(width, height) => {
              setMeasures(prev => ({
                ...prev,
                [node.id]: { width, height },
              }));

              props.measureNodes(measures());
            }}
            onMouseDown={event =>
              handleOnMouseDownNode(index(), event.x, event.y)
            }
            onNodeMount={(input, output) => {
              const _ref = ref()!;
              return props.onNodeMount({
                nodeIndex: index(),
                input: {
                  x:
                    input.x -
                    _ref.getBoundingClientRect().x -
                    props.nodesPositions[index()].x +
                    6,
                  y:
                    input.y -
                    _ref.getBoundingClientRect().y -
                    props.nodesPositions[index()].y +
                    6,
                },
                output: {
                  x:
                    output.x -
                    _ref.getBoundingClientRect().x -
                    props.nodesPositions[index()].x +
                    6,
                  y:
                    output.y -
                    _ref.getBoundingClientRect().y -
                    props.nodesPositions[index()].y +
                    6,
                },
              });
            }}
            onMouseDownO={() => props.onOutputMouseDown(index(), 0)}
            onMouseUpI={() => props.onInputMouseUp(index(), 0)}
            onClickOutside={() => {
              if (index() === selected()) setSelected();
            }}
            onDelete={() => {
              setSelected();
              props.onNodeDelete(node.id);
            }}
            onAddSibling={() => {
              const out = props.onNodeAddSibling(node.id);
              const index = props.nodes.findIndex(n => n.id === out);
              setSelected(index);
              return out;
            }}
            onAddChild={() => {
              const out = props.onNodeAddChild(node.id);
              const index = props.nodes.findIndex(n => n.id === out);
              setSelected(index);
              return out;
            }}
          />
        )}
      </For>
    </div>
  );
};

export default NodesBoard;
