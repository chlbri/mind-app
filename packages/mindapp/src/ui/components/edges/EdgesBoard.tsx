import { Component, For, Show, type JSX } from 'solid-js';

import type { Data } from '#services/main.machine.typings';

import { useFlow } from '../FlowChart.context';
import type { EdgeProps } from './types';

/**
 * Properties for the {@linkcode EdgesBoard} component.
 *
 * @template | {@linkcode Data} `E` - Type of the custom data associated with the
 *   edges.
 */
export type EdgesBoardProps<E extends Data = Data> = {
  /** Component used to render each edge with properties of type {@linkcode EdgeProps}. */
  Edge: Component<EdgeProps<E>>;
};

/**
 * SVG board overlay component that renders all active connecting edges and ongoing
 * edge creation previews.
 *
 * @template | {@linkcode Data} `E` - Type of the custom data associated with the
 *   edges.
 *
 * @param props - Component properties of type {@linkcode EdgesBoardProps}.
 *
 * @returns The rendered SVG JSX element.
 *
 * @see {@linkcode useFlow}
 */
export const EdgesBoard = <E extends Data = Data>(
  props: EdgesBoardProps<E>,
): JSX.Element => {
  const { hooks } = useFlow();
  const hasNewEdge = hooks.state({ selector: s => !!s.context.newEdge });

  const edgeIds = hooks.state({
    selector: ({ context: { edgesPositions, selected } }) => {
      const first = Object.keys(edgesPositions ?? {});
      const hasSelected = selected && first.some(id => id === selected);
      const second = first.filter(id => !hasSelected || id !== selected);
      if (hasSelected) second.push(selected);
      return second;
    },
  });

  return (
    <svg class='pointer-events-none h-full w-full overflow-visible'>
      <Show when={hasNewEdge()}>
        <props.Edge id='__#new-edge#__TEMP' isNew  />
      </Show>

      <For each={edgeIds()}>{id => <props.Edge id={id} />}</For>
    </svg>
  );
};
