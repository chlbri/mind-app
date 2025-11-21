/* eslint-disable @typescript-eslint/no-namespace */
import { Component, createSignal, onMount, Show } from 'solid-js';
import { produce } from 'solid-js/store';
import type { PropsOf } from '~/globals/ui/types';
import { useFlowContext } from './FlowChart.context';
import { createDroppable, createDraggable } from '@thisbeyond/solid-dnd';

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      // use:model
      clickOutside: () => void;
      draggable: any;
    }
  }
}

type Props = PropsOf<'div', 'onMouseDown'> & {
  id: string;
  x: number;
  y: number;
  label?: string;
  content: string;
  input: boolean;
};

export const NodeComponent2: Component<Props> = props => {
  let inputRef: HTMLDivElement | undefined;
  let outputRef: HTMLDivElement | undefined;
  const [ref, setRef] = createSignal<HTMLDivElement>();
  const {
    dimensions: [, setDimensions],
    newEdge: [newEdge, setNewEdge],
    board: [board],
    service,
  } = useFlowContext();

  const selected = service.context(ctx => ctx.selected === props.id);

  onMount(() => {
    const input = inputRef
      ? {
          x: inputRef.getBoundingClientRect().x,
          y: inputRef.getBoundingClientRect().y,
        }
      : undefined;

    const output = {
      x: outputRef!.getBoundingClientRect().x,
      y: outputRef!.getBoundingClientRect().y,
    };

    const rect = ref()!.getBoundingClientRect();
    setDimensions(
      produce(data => {
        data[props.id] = {
          width: rect.width,
          height: rect.height,
          output,
          input,
        };
      }),
    );
  });

  const hasParent = service.context(ctx => {
    const edges = ctx.data?.edges;
    if (!edges) return false;
    return Object.values(edges).some(edge => edge.to === props.id);
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const draggable = createDraggable(props.id);

  return (
    <div
      use:draggable
      ref={setRef}
      class='flex flex-col absolute cursor-grab bg-white rounded-md shadow-[1px_1px_11px_-6px_rgba(0,0,0,0.75)] select-none transition-[border,box-shadow] duration-200 ease-in-out hover:shadow-[2px_2px_12px_-6px_rgba(0,0,0,0.75)] draggable'
      classList={{
        'border border-[#e38c29] z-[100]': selected(),
        'border border-[#e6d4be] z-[1]': !selected(),
      }}
      style={{
        transform: `translate(${props.x}px, ${props.y}px)`,
      }}
      onMouseDown={e => {
        e.stopPropagation();
        (props.onMouseDown as any)?.(e);
        service.send({ type: 'SELECT', payload: props.id });
      }}
      onMouseMove={({ x, y }) => {
        const _board = board();
        if (selected() && _board)
          service.send({
            type: 'MOVE',
            payload: {
              id: props.id,
              x: x - props.x - _board.x,
              y: y - props.y - _board.y,
            },
          });
      }}
    >
      <div
        class='pointer-events-none absolute flex items-center justify-end -top-[30px] right-0 transition-all duration-200 ease-in-out space-x-2'
        classList={{
          'w-full opacity-100': selected(),
          'w-0 -right-3 opacity-0 overflow-hidden': !selected(),
        }}
      >
        <svg
          class='w-6 h-6 fill-[#a11111] rounded-full cursor-pointer opacity-100 transition-all duration-200 ease-in-out'
          onClick={e => {
            e.stopPropagation();
            e.stopImmediatePropagation();
            service.send({ type: 'DELETE', payload: props.id });
          }}
          fill='currentColor'
          stroke-width={2}
          viewBox='4 4 16 16'
          style='overflow: visible; pointer-events: all;'
        >
          <path d='M12 4c-4.419 0-8 3.582-8 8s3.581 8 8 8 8-3.582 8-8-3.581-8-8-8zm3.707 10.293a.999.999 0 11-1.414 1.414L12 13.414l-2.293 2.293a.997.997 0 01-1.414 0 .999.999 0 010-1.414L10.586 12 8.293 9.707a.999.999 0 111.414-1.414L12 10.586l2.293-2.293a.999.999 0 111.414 1.414L13.414 12l2.293 2.293z' />
        </svg>
        <Show when={hasParent()}>
          <svg
            class='size-6 bg-green-500 rounded-full p-0.5 hover:bg-green-600 font-bold text-center cursor-pointer overflow-visible'
            style='pointer-events: all; fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;'
            viewBox='0 0 1024 1024'
            preserveAspectRatio='xMaxYMax'
            xmlns='http://www.w3.org/2000/svg'
            fill='white'
            onClick={() =>
              service.send({
                type: 'ADD_SIBLING',
                payload: props.id,
              })
            }
          >
            <g id='Arrière-plan'>
              <path d='M467.40667,277.66696c-0.05948,-14.53055 5.75527,-22.95613 -8.62044,-20.90487c-112.55699,16.0607 -222.1609,112.14558 -245.06161,239.85765c-46.52056,259.43466 231.33083,443.06705 449.51209,316.97506c117.31668,-67.80002 160.95215,-190.43324 151.34416,-288.29849c-5.92276,-60.32819 -27.80273,-107.95668 -53.44246,-144.25469l59.39269,-42.05363c111.72214,156.309 73.11535,351.55635 -25.06953,459.45565c-184.18877,202.4124 -470.46624,145.52064 -592.95027,-32.92123c-156.18269,-227.53604 -27.15324,-543.64371 261.18883,-582.44416c5.0579,-0.68061 3.56556,-7.04079 3.56442,-8.58985c-0.05594,-76.3354 -0.11021,-76.7687 1.10909,-77.24589c2.06886,-0.80969 151.41433,118.4561 151.92482,118.95524c4.65592,4.55233 -0.99548,7.829 -29.07828,30.50907c-120.49369,97.31245 -120.4977,98.55675 -123.0691,97.87586c-0.43639,-0.11555 -0.80698,-0.31322 -0.74442,-66.91571Z' />
              <path d='M316.61562,611.03414c0.11517,-90.16257 -0.25516,-99.92912 0.64739,-101.78856c1.56486,-3.22393 131.99102,0.91032 134.6959,-1.89763c2.21336,-2.2977 -0.59362,-129.97807 1.1376,-132.37034c0.7253,-1.00225 11.10552,-0.99175 12.07474,-0.99077c104.50336,0.10564 104.90098,-0.37811 105.967,0.85765c1.56461,1.81373 0.25596,114.18436 0.67852,129.81412c0.1322,4.88975 3.22386,3.28152 99.72028,3.4563c33.0841,0.05992 36.14259,-1.40368 36.21852,4.50462c0.11713,9.11348 1.41954,110.45369 -0.40274,113.92715c-1.81106,3.45208 -130.39967,-0.42618 -134.48289,1.62075c-2.29035,1.14816 -0.36989,101.12392 -1.11542,130.51904c-0.09548,3.76459 -2.13506,3.20617 -47.84854,3.17365c-69.30253,-0.0493 -69.31099,-0.25627 -69.65762,-0.42191c-3.77927,-1.80595 0.16287,-129.33555 -2.24266,-132.58994c-1.79931,-2.43424 -124.06108,-0.29118 -132.80252,-0.97392c-3.81102,-0.29766 -2.58229,-14.8847 -2.58758,-16.8402Z' />
            </g>
          </svg>
        </Show>
        <svg
          class='size-6 bg-blue-500 text-white p-0.5 rounded-lg hover:bg-blue-600 font-bold text-center flex items-center justify-center cursor-pointer'
          onClick={() =>
            service.send({
              type: 'ADD_CHILD',
              payload: props.id,
            })
          }
          style='pointer-events: all;'
          viewBox='0 0 24 24'
          stroke='currentColor'
          stroke-width='2'
        >
          <path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' />
        </svg>
      </div>
      <Show when={props.label} keyed>
        {label => (
          <span class='p-3 border-b border-[#f0f0f0] select-none'>
            {label}
          </span>
        )}
      </Show>
      <Show when={props.content} keyed>
        {content => <div class='p-3 select-none'>{content}</div>}
      </Show>
      <Show when={props.input}>
        <div class='pointer-events-none cursor-default -z-3 absolute top-0 -left-[18px] flex flex-col'>
          <div
            ref={inputRef}
            class='cursor-default bg-[#e38b29] w-3 h-3 rounded-full my-3 shadow-[1px_1px_11px_-6px_rgba(0,0,0,0.75)] pointer-events-all'
            onMouseDown={event => {
              event.stopPropagation();
            }}
            onMouseUp={event => {
              event.stopPropagation();
              const from = newEdge()?.from;

              if (from) {
                service.send({
                  type: 'ADD_EDGE',
                  payload: { from, to: props.id },
                });
              }

              setNewEdge();
            }}
          ></div>
        </div>
      </Show>
      <div
        id='outputs'
        class='pointer-events-none -z-3 absolute top-0 -right-[18px] flex flex-col'
      >
        <div
          ref={outputRef}
          class='cursor-crosshair bg-[#e38b29] w-3 h-3 rounded-full my-3 shadow-[1px_1px_11px_-6px_rgba(0,0,0,0.75)] pointer-events-all'
          onMouseDown={event => {
            event.stopPropagation();
            const _board = board();
            if (_board)
              setNewEdge({
                x0: event.x - _board.x,
                y0: event.y - _board.y,
                x1: event.x - _board.x,
                y1: event.y - _board.y,
                from: props.id,
              });
          }}
        ></div>
      </div>
    </div>
  );
};
