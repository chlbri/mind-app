import * as v from 'valibot';

/**
 * Recursive deep partial type for objects and arrays.
 *
 * @template T - The target type to make deeply partial.
 */
export type DeepPartial<T> = T extends (...args: any[]) => any
  ? T
  : T extends readonly (infer U)[]
    ? _DeepPartialArray<U>
    : T extends object
      ? _DeepPartialObject<T>
      : T;

/**
 * Internal recursive type helper for deep partial arrays.
 *
 * @template T - Array element type.
 */
type _DeepPartialArray<T> = DeepPartial<T>[];

/**
 * Internal recursive type helper for deep partial objects.
 *
 * @template T - Object structure type.
 */
type _DeepPartialObject<T> = { [P in keyof T]?: DeepPartial<T[P]> };

/**
 * Type definition for a deeply partial Valibot schema.
 *
 * @template | {@linkcode v.BaseSchema} `TSchema` - The input schema to convert.
 */
export type DeepPartialSchema<
  TSchema extends v.BaseSchema<any, any, v.BaseIssue<unknown>>,
> = v.BaseSchema<
  DeepPartial<v.InferInput<TSchema>>,
  DeepPartial<v.InferOutput<TSchema>>,
  v.BaseIssue<unknown>
>;

/**
 * Recursively converts a Valibot object or array schema into a deep partial schema.
 *
 * @template | {@linkcode v.BaseSchema} `TSchema` - The base schema to convert.
 *
 * @param schema - Target schema to transform.
 *
 * @returns A new deeply optional schema of type {@linkcode DeepPartialSchema}.
 */
export const deepPartial = <
  const TSchema extends v.BaseSchema<any, any, v.BaseIssue<unknown>>,
>(
  schema: TSchema,
): DeepPartialSchema<TSchema> => {
  // If it's an object, make all its keys optional and recursive
  if (schema.type === 'object') {
    const newEntries: Record<string, any> = {};
    for (const [key, value] of Object.entries((schema as any).entries)) {
      newEntries[key] = v.optional(deepPartial(value as any));
    }
    return v.object(newEntries) as any;
  }

  // If it's an array, apply deepPartial to its item schema
  if (schema.type === 'array') {
    return v.array(deepPartial((schema as any).item)) as any;
  }

  // For primitive types (string, number, etc.), return the schema as is
  return schema as any;
};

/**
 * Lazy schema evaluator function returning the schema produced by the given factory.
 *
 * @template | {@linkcode v.BaseSchema} `T` - Output schema type extending type
 *   {@linkcode v.BaseSchema}.
 *
 * @param fn - Factory function producing the schema.
 *
 * @returns The resolved schema instance of type `T`.
 */
export const byFunction = <
  const T extends v.BaseSchema<any, any, v.BaseIssue<unknown>>,
>(
  fn: () => T,
) => fn();
