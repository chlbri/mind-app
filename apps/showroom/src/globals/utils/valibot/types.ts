import * as v from 'valibot';

/** Parsing validation mode options for Valibot creators. */
export type Options = 'typed' | 'strict' | 'low';

/** Type alias for a Valibot object schema. */
export type ObjectS = v.ObjectSchema<
  v.ObjectEntries,
  v.ErrorMessage<v.ObjectIssue> | undefined
>;

/** Type alias for a Valibot array schema. */
export type ArrayS = v.ArraySchema<any, any>;

/**
 * Extracts the inner schema if wrapped by optional, nullable, or custom wrappers.
 *
 * @template T - The schema type to unwrap.
 */
export type UnwrapSchema<T> =
  T extends v.OptionalSchema<infer U, any>
    ? UnwrapSchema<U>
    : T extends v.NullableSchema<infer U, any>
      ? UnwrapSchema<U>
      : T extends { wrapped: infer U }
        ? UnwrapSchema<U>
        : T extends { schema: infer U }
          ? UnwrapSchema<U>
          : T;

/**
 * Extracts the inferred output type from a Valibot schema.
 *
 * @template T - Target Valibot schema.
 */
export type InferSchemaOutput<T> =
  T extends v.BaseSchema<infer O, any, any> ? O : never;

/**
 * Generates dot-separated nested property paths for an object schema.
 *
 * @template T - Object structure record.
 * @template Prefix - Current property path prefix.
 */
export type DotPaths<T extends Record<string, any>, Prefix extends string = ''> = {
  [K in keyof T]: K extends string
    ? UnwrapSchema<T[K]> extends v.ObjectSchema<infer Entries, any>
      ? Entries extends Record<string, any>
        ? DotPaths<Entries, `${Prefix}${K}.`> | `${Prefix}${K}`
        : `${Prefix}${K}`
      : `${Prefix}${K}`
    : never;
}[keyof T];

/**
 * Decomposes a nested object schema record into a flattened dot-notation schema
 * shape.
 *
 * @template T - Object entries map to decompose.
 */
export type DecomposedOutput<T extends Record<string, any>> = {
  [K in DotPaths<T>]: K extends `${infer PK}.${infer Rest}`
    ? PK extends keyof T
      ? T[PK] extends
          | v.ObjectSchema<infer Entries, any>
          | v.OptionalSchema<v.ObjectSchema<infer Entries, any>, any>
          | v.NullableSchema<v.ObjectSchema<infer Entries, any>, any>
        ? Rest extends DotPaths<Entries>
          ? DecomposedOutput<Entries>[Rest]
          : never
        : never
      : never
    : K extends keyof T
      ? v.OptionalSchema<T[K], undefined>
      : never;
};
