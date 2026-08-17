import { type } from '@bemedev/app/bemedev';
import type { inferT } from '@bemedev/app/typings';

export const point = type({
  x: 'number',
  y: 'number',
});

export type Point = inferT<typeof point>;

export const nodeOffset = type(({ optional, use }) => ({
  input: optional(use(point)),
  output: use(point),
}));

export type Extremities = {
  from: string;
  to: string;
};

export const extremities = type({
  from: 'string',
  to: 'string',
});

export const nodeJSON = type(({ optional, use }) => ({
  position: use(point),
  data: {
    label: optional('string'),
    content: 'string',
  },
  input: 'boolean',
}));

export const edgeJSON = extremities;

export const dimensions = type(({ optional, use }) => ({
  width: 'number',
  height: 'number',
  id: 'string',
  output: use(point),
  input: optional(use(point)),
}));

export const vector = type({
  x0: 'number',
  y0: 'number',
  x1: 'number',
  y1: 'number',
});

export type Vector = inferT<typeof vector>;
