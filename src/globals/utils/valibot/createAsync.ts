import * as v from 'valibot';
import type { Options } from './types';

export const createAsync = <
  const T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  Ty extends Options = 'typed',
>(
  schema: T,
  typed?: Ty,
) => {
  const _typed = typed || 'typed';
  const out = (value => {
    const method =
      _typed === 'typed' || _typed === 'strict'
        ? v.parseAsync
        : v.safeParseAsync;
    return method(schema, value);
  }) as (
    value: Ty extends 'typed' ? v.InferInput<T> : unknown,
  ) => Promise<
    Ty extends 'typed' | 'strict' ? v.InferOutput<T> : v.SafeParseResult<T>
  >;
  return out;
};
