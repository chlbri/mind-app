import { Component, createSignal, For } from 'solid-js';
import NodeComponent from './NodeComponent';

interface NodeProps {
  id: string;
  data: { label?: string; content: any };
  inputs: number;
  outputs: number;
}

interface Props {
  nodesPositions: { x: number; y: number }[];
  nodes: NodeProps[];
  onNodeMount: (values: {
    nodeIndex: number;
    inputs: { offset: { x: number; y: number } }[];
    outputs: { offset: { x: number; y: number } }[];
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
            inputs={node.inputs}
            outputs={node.outputs}
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
            onNodeMount={(inputs, outputs) => {
              const _ref = ref()!;
              return props.onNodeMount({
                nodeIndex: index(),
                inputs: inputs.map(values => {
                  return {
                    offset: {
                      x:
                        values.offset.x -
                        _ref.getBoundingClientRect().x -
                        props.nodesPositions[index()].x +
                        6,
                      y:
                        values.offset.y -
                        _ref.getBoundingClientRect().y -
                        props.nodesPositions[index()].y +
                        6,
                    },
                  };
                }),
                outputs: outputs.map(values => {
                  return {
                    offset: {
                      x:
                        values.offset.x -
                        _ref.getBoundingClientRect().x -
                        props.nodesPositions[index()].x +
                        6,
                      y:
                        values.offset.y -
                        _ref.getBoundingClientRect().y -
                        props.nodesPositions[index()].y +
                        6,
                    },
                  };
                }),
              });
            }}
            onMouseDownO={outputIndex =>
              props.onOutputMouseDown(index(), outputIndex)
            }
            onMouseUpI={inputIndex =>
              props.onInputMouseUp(index(), inputIndex)
            }
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
