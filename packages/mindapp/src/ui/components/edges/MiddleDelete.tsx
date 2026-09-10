import { cn } from 'cn';
import { Show, type Component } from 'solid-js';

import { useFlow } from '../FlowChart.context';
import type { EdgeMiddleProps } from './types';

/**
 * Default middle overlay component rendered at the center of a selected edge,
 * providing a button to delete the edge.
 *
 * @param props - Component properties of type {@linkcode EdgeMiddleProps}.
 *
 * @returns An SVG group element containing the delete button, or null when not
 *   selected.
 *
 * @see {@linkcode useFlow}
 */
export const MiddleDelete: Component<EdgeMiddleProps> = props => {
  const { service } = useFlow();

  return (
    <Show when={props.selected()}>
      <g
        cursor='pointer'
        onMouseDown={e => {
          e.stopPropagation();
          service.send({ type: 'DELETE', payload: props.id });
        }}
        style={{ 'pointer-events': 'all' }}
        class={cn(props.selected() ? 'z-101' : 'z-30')}
      >
        <circle cx='0' cy='0' r='12' fill='rgba(168, 168, 168, 1)' />
        <svg
          fill='currentColor'
          stroke-width='0'
          xmlns='http://www.w3.org/2000/svg'
          class='h-25 w-25 bg-white fill-white'
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
  );
};
