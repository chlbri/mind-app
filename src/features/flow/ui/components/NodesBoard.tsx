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
  onNodeAddSibling?: (nodeId: string) => string | undefined;
  onNodeAddChild?: (nodeId: string) => string | undefined;
  onOutputMouseDown: (nodeIndex: number, outputIndex: number) => void;
  onInputMouseUp: (nodeIndex: number, inputIndex: number) => void;
  onMouseUp: () => void;
  onMouseMove: (x: number, y: number) => void;
  measureNodes?: (
    value: Record<
      string,
      {
        width: number;
        height: number;
      }
    >,
  ) => void;
}

const NodesBoard: Component<Props> = (props: Props) => {
  const [grabbing, setGrabbing] = createSignal<number | null>(null);
  const [selected, setSelected] = createSignal<number>();
  const [measures, setMeasures] = createSignal<
    Record<string, { width: number; height: number }>
  >({});
  const [ref, setRef] = createSignal<HTMLDivElement>();

  function handleOnMouseMoveScene(event: any) {
    const _ref = ref()!;
    const x = event.x - _ref.getBoundingClientRect()?.x;
    const y = event.y - _ref.getBoundingClientRect().y;
    if (grabbing() !== null) {
      props.onNodeMove(grabbing() || 0, x, y);
    }
    props.onMouseMove(x, y);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleOnMouseUpScene(_: any) {
    setGrabbing(null);
    props.onMouseUp();
  }

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
      onMouseMove={handleOnMouseMoveScene}
      onMouseUp={handleOnMouseUpScene}
    >
      <For each={props.nodes}>
        {(node, index) => (
          <NodeComponent
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
              
              props.measureNodes?.(measures());
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
            onMouseDownOutput={outputIndex =>
              props.onOutputMouseDown(index(), outputIndex)
            }
            onMouseUpInput={inputIndex =>
              props.onInputMouseUp(index(), inputIndex)
            }
            onClickOutside={() => {
              if (index() === selected()) setSelected();
            }}
            onClickDelete={() => {
              setSelected();
              props.onNodeDelete(node.id);
            }}
            onClickAddSibling={() => {
              const out = props.onNodeAddSibling?.(node.id);
              const index = props.nodes.findIndex(n => n.id === out);
              setSelected(index);
              return out;
            }}
            onClickAddChild={() => {
              const out = props.onNodeAddChild?.(node.id);
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
