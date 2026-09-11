import { Show, type JSX } from 'solid-js';

import type { Data, Vector } from '#services/main.machine.typings';

import { useEdge } from './hooks';
import { MiddleDelete } from './MiddleDelete';
import type { EdgeProps } from './types';

/** Configuration options for the {@linkcode FactoryEdge} builder function. */
export type FactoryProps = {
  /**
   * Function calculating the SVG path string `d` from a vector of type
   * {@linkcode Vector}.
   */
  draw: (v: Vector) => string;
};

/**
 * Factory function signature for producing generic SVG edge components.
 *
 * @param options - Configuration options of type {@linkcode FactoryProps}.
 *
 * @returns A generic Solid.js edge component function.
 */
export type FactoryEdge_F = ({
  draw,
}: FactoryProps) => <E extends Data = Data>(props: EdgeProps<E>) => JSX.Element;

/**
 * Higher-order component factory creating customizable SVG edge components with
 * standard selection, styling, and middle overlay behavior.
 *
 * @param options - Configuration options of type {@linkcode FactoryProps}.
 * @param options.draw - Function computing the SVG path `d` attribute from a
 *   {@linkcode Vector}.
 *
 * @returns An SVG edge component accepting properties of type {@linkcode EdgeProps}.
 *
 * @see {@linkcode MiddleDelete}, {@linkcode useEdge}
 */
export const FactoryEdge: FactoryEdge_F = ({ draw }) => {
  return props => {
    const Middle = props.middle ?? MiddleDelete;

    const { vector, stroke, strokeWidth, send, selected, middlePoint, edgeData } =
      useEdge(props);

    return (
      <Show when={vector()}>
        {v => (
          <g class='relative'>
            <path
              class='relative cursor-pointer fill-transparent'
              classList={{
                'z-200': props.isNew,
                'z-100': !props.isNew && selected(),
              }}
              stroke={stroke()}
              stroke-dasharray={props.strokeDasharray}
              stroke-width={strokeWidth()}
              style={{ 'pointer-events': props.isNew ? 'none' : 'all' }}
              d={draw(v())}
              onMouseDown={e => {
                e.stopPropagation();
                return send({ type: 'SELECT', payload: props.id });
              }}
            />
            <Show when={!props.isNew}>
              <g
                transform={`translate(${middlePoint().x}, ${middlePoint().y})`}
                style={{ 'pointer-events': 'all' }}
              >
                <Middle
                  vector={vector}
                  id={props.id}
                  data={edgeData()}
                  selected={selected}
                />
              </g>
            </Show>
          </g>
        )}
      </Show>
    );
  };
};
