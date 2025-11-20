import { typings } from '@bemedev/app-ts';

export type Point = {
  x: number;
  y: number;
};

export const point = typings.any({
  x: 'number',
  y: 'number',
});

export type NodeOffset = {
  input?: Point;
  output: Point;
};

export const nodeOffset = typings.any({
  input: typings.maybe(point),
  output: point,
});

export type Extremities = {
  from: string;
  to: string;
};

export const extremities = typings.any({
  from: 'string',
  to: 'string',
});

export type NodeJSON = {
  id: string;
  position: Point;
  data: { label?: string; content: any };
  input: boolean;
};

export const nodeJSON = typings.any({
  id: 'string',
  position: point,
  data: typings.any({
    label: typings.maybe('string'),
    content: 'string',
  }),
  input: 'boolean',
});

export type EdgeJSON = Extremities;

export const edgeJSON = typings.intersection(extremities, {
  id: 'string',
});

export const dimensions = typings.any({
  width: 'number',
  height: 'number',
  id: 'string',
  output: point,
  input: typings.maybe(point),
});

export const vector = typings.any({
  x0: 'number',
  y0: 'number',
  x1: 'number',
  y1: 'number',
});
