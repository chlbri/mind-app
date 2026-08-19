import * as v from 'valibot';
import type { Options } from './types';

/**
 * Creates a synchronous validator function wrapping a Valibot schema.
 *
 * @template | {@linkcode v.BaseSchema} `T` - Valibot schema type.
 * @template | {@linkcode Options} `Ty` - Validation mode (`'typed'`,
 *   `'strict'`, or `'low'`).
 *
 * @param schema - The Valibot schema instance to validate against.
 * @param typed - Validation strictness mode. Defaults to `'typed'`.
 *
 * @returns A validator function returning the parsed output or safe parse
 *   result.
 */
export const create = <
  const T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  Ty extends Options = 'typed',
>(
  schema: T,
  typed?: Ty,
) => {
  const _typed = typed || 'typed';
  const out = (value => {
    const method =
      _typed === 'typed' || _typed === 'strict' ? v.parse : v.safeParse;
    return method(schema, value);
  }) as (
    value: Ty extends 'typed' ? v.InferInput<T> : unknown,
  ) => Ty extends 'typed' | 'strict'
    ? v.InferOutput<T>
    : v.SafeParseResult<T>;

  return out;
};
