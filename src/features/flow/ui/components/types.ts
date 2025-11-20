export type Point = {
  x: number;
  y: number;
};

export type NodeOffset = {
  input?: { x: number; y: number };
  output: { x: number; y: number };
};

export type Extremities = {
  from: string;
  to: string;
};

export type NodeJSON = {
  id: string;
  position: Point;
  data: { label?: string; content: any };
  input: boolean;
};

export type EdgeJSON = {
  id: string;
} & Extremities;
