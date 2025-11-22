import { Component, createEffect, createSignal, Show } from 'solid-js';
import { clickOutside } from '~ui/directives';
import { useFlow } from './FlowChart.context';
import type { Vector } from '../../services/main.types';

export type EdgeProps = Vector & {
  id: string;
  isNew: boolean;
  onClickEdge: () => void;
  onClickDelete: () => void;
  onClickOutside: () => void;
};

const EdgeComponent: Component<EdgeProps> = props => {
  const [middlePoint, setMiddlePoint] = createSignal({
    x: props.x0 + (props.x1 - props.x0) / 2,
    y: props.y0 + (props.y1 - props.y0) / 2,
  });

  createEffect(() => {
    const middleX = props.x0 + (props.x1 - props.x0) / 2;
    const middleY = props.y0 + (props.y1 - props.y0) / 2;
    setMiddlePoint({
      x: middleX,
      y: middleY,
    });
  });

  const { service } = useFlow();

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  clickOutside;

  function calculateOffset(value: number) {
    return (value * 100) / 200;
  }

  const selected = service.context(ctx => ctx.selected === props.id);

  return (
    <>
      <path
        class='fill-transparent cursor-pointer'
        classList={{
          'stroke-[rgba(168,168,168,0.4)] stroke-3': props.isNew,
          'stroke-[rgba(168,168,168,1)] stroke-4 z-100':
            selected() && !props.isNew,
          'stroke-[rgba(168,168,168,0.8)] stroke-3':
            !selected() && !props.isNew,
        }}
        style='pointer-events: all;'
        d={`M ${props.x0} ${props.y0} C ${
          props.x0 + calculateOffset(Math.abs(props.x1 - props.x0))
        } ${props.y0}, ${
          props.x1 - calculateOffset(Math.abs(props.x1 - props.x0))
        } ${props.y1}, ${props.x1} ${props.y1}`}
        onClick={() => {
          service.send({ type: 'SELECT', payload: props.id });
        }}
        use:clickOutside={() => props.onClickOutside()}
      />
      <Show when={selected()}>
        <g
          cursor='pointer'
          transform={`translate(${middlePoint().x}, ${middlePoint().y})`}
          onClick={() => {
            props.onClickDelete();
            service.send({ type: 'DELETE', payload: props.id });
          }}
          class='pointer-events-all'
        >
          <circle cx='0' cy='0' r='12' fill='rgba(168, 168, 168, 1)' />
          <svg
            fill='currentColor'
            stroke-width='0'
            xmlns='http://www.w3.org/2000/svg'
            class='w-[100px] h-[100px] bg-white fill-white'
            width='20'
            height='20'
            viewBox='0 0 20 20'
            color='white'
            x='-10'
            y='-10'
          >
            <path d='M10.185,1.417c-4.741,0-8.583,3.842-8.583,8.583c0,4.74,3.842,8.582,8.583,8.582S18.768,14.74,18.768,10C18.768,5.259,14.926,1.417,10.185,1.417 M10.185,17.68c-4.235,0-7.679-3.445-7.679-7.68c0-4.235,3.444-7.679,7.679-7.679S17.864,5.765,17.864,10C17.864,14.234,14.42,17.68,10.185,17.68 M10.824,10l2.842-2.844c0.178-0.176,0.178-0.46,0-0.637c-0.177-0.178-0.461-0.178-0.637,0l-2.844,2.841L7.341,6.52c-0.176-0.178-0.46-0.178-0.637,0c-0.178,0.176-0.178,0.461,0,0.637L9.546,10l-2.841,2.844c-0.178,0.176-0.178,0.461,0,0.637c0.178,0.178,0.459,0.178,0.637,0l2.844-2.841l2.844,2.841c0.178,0.178,0.459,0.178,0.637,0c0.178-0.176,0.178-0.461,0-0.637L10.824,10z'></path>
          </svg>
        </g>
      </Show>
    </>
  );
};

export default EdgeComponent;
