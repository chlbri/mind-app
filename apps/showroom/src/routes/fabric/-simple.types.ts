/** Serialized node data dictionary type used in the fabric showroom demo. */
export type ShowroomData = {
  /** Node title. */
  title: string;
  /** Detailed content / notes for the node. */
  content: string;
  /** Priority level from 1 (lowest) to 5 (highest). */
  priority: 1 | 2 | 3 | 4 | 5;
};

/** Serialized edge data dictionary type used in the fabric showroom demo. */
export type ShowroomEdgeData = {
  /** Short label rendered at the middle of the canvas edge. */
  label?: string;
};
