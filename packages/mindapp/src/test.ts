import type { SoA } from '@bemedev/app/bemedev';
import type { ParentComponent } from 'solid-js';

export type O = ParentComponent<
  ({ localKeys: SoA<string> } | { history: any; localKeys?: SoA<string> }) & {}
>;
