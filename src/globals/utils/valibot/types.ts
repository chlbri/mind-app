import * as v from 'valibot';

export type Options = 'typed' | 'strict' | 'low';

export type ObjectS = v.ObjectSchema<
  v.ObjectEntries,
  v.ErrorMessage<v.ObjectIssue> | undefined
>;
export type ArrayS = v.ArraySchema<any, any>;

/**
 * Extrait le schéma réel en cas d'enveloppe (optional, nullable, etc.)
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
 * Extrait la valeur typée d'un schéma Valibot
 */
export type InferSchemaOutput<T> =
  T extends v.BaseSchema<infer O, any, any> ? O : never;

/**
 * Génère les chemins pointés pour un schéma d'objet
 */
export type DotPaths<
  T extends Record<string, any>,
  Prefix extends string = '',
> = {
  [K in keyof T]: K extends string
    ? UnwrapSchema<T[K]> extends v.ObjectSchema<infer Entries, any>
      ? Entries extends Record<string, any>
        ? DotPaths<Entries, `${Prefix}${K}.`> | `${Prefix}${K}`
        : `${Prefix}${K}`
      : `${Prefix}${K}`
    : never;
}[keyof T];

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
