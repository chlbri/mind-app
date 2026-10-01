import type { SoA } from '@bemedev/app/bemedev';
import type { ParentComponent } from 'solid-js';

/**
 * Parent component properties accepting either `localKeys` or a `history` payload
 * with optional `localKeys`.
 */
export type O = ParentComponent<
  ({ localKeys: SoA<string> } | { history: any; localKeys?: SoA<string> }) & {}
>;
