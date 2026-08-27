import { toArray } from '@bemedev/app';
import { createState } from '@bemedev/app-solidjs';
import { createDraggable } from '@thisbeyond/solid-dnd';
import { dequal } from 'dequal';
import { type Component, For, type JSX, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import {
  HANDLE_CONTAINER_OFFSET_X,
  HANDLE_MARGIN_TOP,
  HANDLE_SIZE,
} from '#services/main.machine.data';
import type { NodeData } from '#services/main.machine.typings';

import { resize } from '../globals/directives';
import { useFlow } from './FlowChart.context';

/** Properties for rendering an individual flowchart node component. */
export type NodeComponentProps<D extends NodeData = NodeData> = {
  /** Unique identifier of the node. */
  id: string;
  /** Custom node component to render inside the node container. */
  children?: Component<D>;
};

/**
 * Interactive flowchart node component supporting dragging, selection, handle
 * connections, and child/sibling creation.
 *
 * @template | {@linkcode NodeData} `D` - Custom node data dictionary type extending
 *   {@linkcode NodeData}.
 *
 * @param props - Node rendering properties of type {@linkcode NodeComponentProps}.
 *
 * @returns The rendered Solid component.
 *
 * @see {@linkcode useFlow}, {@linkcode HANDLE_CONTAINER_OFFSET_X}, {@linkcode HANDLE_MARGIN_TOP}, {@linkcode HANDLE_SIZE}
 */
export const NodeComponent = <D extends NodeData = NodeData>(
  props: NodeComponentProps<D>,
): JSX.Element => {
  const service = useFlow();
  const newEdge = createState(service, { selector: s => s.context.newEdge });
  const draggable = createDraggable(props.id);
  void draggable;

  const node = createState(service, {
    selector: ({ context }) => {
      const list = toArray.typed(context.data?.nodes);
      const item = list.find(n => n.id === props.id);
      return {
        x: item?.position.x ?? 0,
        y: item?.position.y ?? 0,
        data: (item?.data ?? {}) as D,
      };
    },
    equals: dequal,
  });

  const selected = createState(service, {
    selector: ({ context }) => context.selected === props.id,
  });

  const hasParent = createState(service, {
    selector: ({ context: { data } }) => {
      const edges = data?.edges;
      if (!edges) return false;
      return edges.some(({ to }) => to === props.id);
    },
  });

  return (
    <div
      classList={{
        'flex flex-col absolute cursor-grab bg-white rounded-md shadow-md select-none transition-[border,box-shadow] duration-200 ease-in-out hover:shadow-lg draggable': true,
        'border border-[#e38c29] z-100': selected(),
        'border border-[#e6d4be] z-1': !selected(),
      }}

      style={{ top: `${node().y}px`, left: `${node().x}px` }}
      class='group min-w-48'
      use:draggable={{ skipTransform: true }}
      id={props.id}

      onMouseDown={e => {
        e.stopPropagation();
        service.send({ type: 'SELECT', payload: props.id });
      }}
      onDblClick={e => {
        e.stopPropagation();
        service.send({ type: 'EDIT', payload: props.id });
      }}
    >
      <div
        classList={{
          'pointer-events-none absolute flex items-center justify-end -top-7.5 right-0 transition-all duration-200 ease-in-out space-x-2': true,
          'w-full opacity-100': selected(),
          'w-0 -right-3 opacity-0 overflow-hidden': !selected(),
        }}
      >
        <svg
          class='cursor-pointer rounded-full fill-[#a11111] opacity-100 transition-all duration-200 ease-in-out'
          fill='currentColor'
          stroke-width='2'
          viewBox='4 4 16 16'

          onClick={e => {
            e.stopPropagation();
            service.send({ type: 'DELETE', payload: props.id });
          }}

          style={{
            overflow: 'visible',
            'pointer-events': 'all',
            width: `${HANDLE_SIZE * 2}px`,
            height: `${HANDLE_SIZE * 2}px`,
          }}
        >
          <path d='M12 4c-4.419 0-8 3.582-8 8s3.581 8 8 8 8-3.582 8-8-3.581-8-8-8zm3.707 10.293a.999.999 0 11-1.414 1.414L12 13.414l-2.293 2.293a.997.997 0 01-1.414 0 .999.999 0 010-1.414L10.586 12 8.293 9.707a.999.999 0 111.414-1.414L12 10.586l2.293-2.293a.999.999 0 111.414 1.414L13.414 12l2.293 2.293z' />
        </svg>

        <Show when={hasParent()}>
          <svg
            class='cursor-pointer overflow-visible rounded-full bg-green-500 p-0.5 text-center font-bold hover:bg-green-600'

            style={{
              'pointer-events': 'all',
              'fill-rule': 'evenodd',
              'clip-rule': 'evenodd',
              'stroke-linejoin': 'round',
              'stroke-miterlimit': '2',
              width: `${HANDLE_SIZE * 2}px`,
              height: `${HANDLE_SIZE * 2}px`,
            }}

            viewBox='0 0 1024 1024'
            preserveAspectRatio='xMaxYMax'
            xmlns='http://www.w3.org/2000/svg'
            fill='white'
            onClick={() => service.send({ type: 'ADD_SIBLING', payload: props.id })}
          >
            <g id='background'>
              <path d='M467.40667,277.66696c-0.05948,-14.53055 5.75527,-22.95613 -8.62044,-20.90487c-112.55699,16.0607 -222.1609,112.14558 -245.06161,239.85765c-46.52056,259.43466 231.33083,443.06705 449.51209,316.97506c117.31668,-67.80002 160.95215,-190.43324 151.34416,-288.29849c-5.92276,-60.32819 -27.80273,-107.95668 -53.44246,-144.25469l59.39269,-42.05363c111.72214,156.309 73.11535,351.55635 -25.06953,459.45565c-184.18877,202.4124 -470.46624,145.52064 -592.95027,-32.92123c-156.18269,-227.53604 -27.15324,-543.64371 261.18883,-582.44416c5.0579,-0.68061 3.56556,-7.04079 3.56442,-8.58985c-0.05594,-76.3354 -0.11021,-76.7687 1.10909,-77.24589c2.06886,-0.80969 151.41433,118.4561 151.92482,118.95524c4.65592,4.55233 -0.99548,7.829 -29.07828,30.50907c-120.49369,97.31245 -120.4977,98.55675 -123.0691,97.87586c-0.43639,-0.11555 -0.80698,-0.31322 -0.74442,-66.91571Z' />

              <path d='M316.61562,611.03414c0.11517,-90.16257 -0.25516,-99.92912 0.64739,-101.78856c1.56486,-3.22393 131.99102,0.91032 134.6959,-1.89763c2.21336,-2.2977 -0.59362,-129.97807 1.1376,-132.37034c0.7253,-1.00225 11.10552,-0.99175 12.07474,-0.99077c104.50336,0.10564 104.90098,-0.37811 105.967,0.85765c1.56461,1.81373 0.25596,114.18436 0.67852,129.81412c0.1322,4.88975 3.22386,3.28152 99.72028,3.4563c33.0841,0.05992 36.14259,-1.40368 36.21852,4.50462c0.11713,9.11348 1.41954,110.45369 -0.40274,113.92715c-1.81106,3.45208 -130.39967,-0.42618 -134.48289,1.62075c-2.29035,1.14816 -0.36989,101.12392 -1.11542,130.51904c-0.09548,3.76459 -2.13506,3.20617 -47.84854,3.17365c-69.30253,-0.0493 -69.31099,-0.25627 -69.65762,-0.42191c-3.77927,-1.80595 0.16287,-129.33555 -2.24266,-132.58994c-1.79931,-2.43424 -124.06108,-0.29118 -132.80252,-0.97392c-3.81102,-0.29766 -2.58229,-14.8847 -2.58758,-16.8402Z' />
            </g>
          </svg>
        </Show>

        <svg
          class='flex cursor-pointer items-center justify-center rounded-lg bg-blue-500 p-0.5 text-center font-bold text-white hover:bg-blue-600'
          onClick={() => service.send({ type: 'ADD_CHILD', payload: props.id })}
          viewBox='0 0 24 24'
          stroke='currentColor'
          stroke-width='2'

          style={{
            'pointer-events': 'all',
            width: `${HANDLE_SIZE * 2}px`,
            height: `${HANDLE_SIZE * 2}px`,
          }}
        >
          <path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' />
        </svg>
      </div>

      <div ref={resize(props.id)}>
        <Show
          when={props.children}
          fallback={
            <div class='p-3 select-none'>
              <Show when={node().data.label} keyed>
                {label => (
                  <span class='mb-2 block min-w-max border-b border-[#f0f0f0] pb-2 font-semibold whitespace-nowrap text-red-600 select-none'>
                    {String(label)}
                  </span>
                )}
              </Show>

              <Show when={node().data.content} keyed>
                {content => <div class='select-none'>{String(content)}</div>}
              </Show>

              <Show when={!node().data.label && !node().data.content}>
                <For each={Object.entries(node().data)}>
                  {([key, val]) => (
                    <div>
                      <span class='font-semibold'>{key}: </span>
                      <span>{String(val)}</span>
                    </div>
                  )}
                </For>
              </Show>
            </div>
          }
        >
          <Dynamic component={props.children} {...node().data} />
        </Show>
      </div>

      <div
        id='inputs'
        class='pointer-events-none absolute top-0 z-10 flex cursor-default flex-col'
        style={{ left: `-${HANDLE_CONTAINER_OFFSET_X}px` }}
      >
        <div
          data-handle-type='input'
          data-node-id={props.id}
          onMouseDown={event => event.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}

          class='cursor-default rounded-full bg-[#e38b29] shadow-md transition-transform duration-150 ease-in-out hover:scale-150'

          style={{
            width: `${HANDLE_SIZE}px`,
            height: `${HANDLE_SIZE}px`,
            'margin-top': `${HANDLE_MARGIN_TOP}px`,
            'pointer-events': 'all',
          }}

          onMouseUp={event => {
            event.stopPropagation();
            const from = newEdge()?.from;

            if (from && from !== props.id) {
              service.send({ type: 'ADD_EDGE', payload: { from, to: props.id } });
            }
            service.send('CLEAR_NEW_EDGE');
          }}
        ></div>
      </div>
      <div
        id='outputs'

        style={{ right: `-${HANDLE_CONTAINER_OFFSET_X}px` }}

        class='pointer-events-none absolute top-0 z-10 flex flex-col'
      >
        <div
          data-handle-type='output'
          data-node-id={props.id}
          class='cursor-crosshair rounded-full bg-[#e38b29] shadow-md transition-transform duration-150 ease-in-out hover:scale-150'
          style={{
            width: `${HANDLE_SIZE}px`,
            height: `${HANDLE_SIZE}px`,
            'margin-top': `${HANDLE_MARGIN_TOP}px`,
            'pointer-events': 'all',
          }}
          onMouseDown={event => {
            event.stopPropagation();
            service.send('DESELECT');
            service.send({ type: 'START_NEW_EDGE', payload: props.id });
          }}
          onPointerDown={event => {
            event.stopPropagation();
          }}
        ></div>
      </div>
    </div>
  );
};
