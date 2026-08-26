/** Serialized node data dictionary type used in the showroom demo. */
export type ShowroomData = {
  /** Node title. */
  title: string;
  /** Detailed content / notes for the node. */
  content: string;
  /** Priority level from 1 (lowest) to 5 (highest). */
  priority: 1 | 2 | 3 | 4 | 5;
};
