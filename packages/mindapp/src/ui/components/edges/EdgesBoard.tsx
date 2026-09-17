import { identify } from '@bemedev/app';
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
    selector: ({ context: { edgesPositions, selected, data } }) => {
      const consolidated = identify(edgesPositions).map(pos => {
        const from = data?.edges.find(({ from }) => pos.__id === from)?.id;
        const to = data?.edges.find(({ to }) => pos.__id === to)?.id;

        return { ...pos, from, to };
      });

      const hasSelected =
        selected &&
        consolidated.some(
          ({ __id, from, to }) =>
            __id === selected || from === selected || to === selected,
        );

      const second = consolidated.filter(
        ({ __id, from, to }) =>
          !hasSelected ||
          (__id !== selected && from !== selected && to !== selected),
      );

      const excludes = consolidated.filter(
        ({ __id, from, to }) =>
          selected && (__id === selected || from === selected || to === selected),
      );

      if (hasSelected) second.push(...excludes);
      return second.map(({ __id }) => __id);
    },
  });

  return (
    <svg class='pointer-events-none h-full w-full overflow-visible'>
      <Show when={hasNewEdge()}>
        <props.Edge id='__#new-edge#__TEMP' isNew />
      </Show>

      <For each={edgeIds()}>{id => <props.Edge id={id} />}</For>
    </svg>
  );
};
