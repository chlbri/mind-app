import * as v from 'valibot';

import type { DecomposedOutput, ObjectS } from './types';

/**
 * Decomposes a Valibot object schema into a flattened object schema with
 * dot-notation keys. Only decomposes {@linkcode ObjectS} schemas; other schema types
 * are preserved as values.
 *
 * @example
 *   ```typescript
 *   const schema = v.object({
 *     user: v.object({ name: v.string(), email: v.string() }),
 *     settings: v.object({
 *       theme: v.string(),
 *       notifications: v.boolean(),
 *     }),
 *   });
 *
 *   const decomposed = decomposeSchema(schema);
 *   // Type: v.StrictObjectSchema<DecomposedObjectEntries<typeof schema.entries>, undefined>
 *   ```;
 *
 * @template | {@linkcode ObjectS} `T` - Valibot object schema type to decompose.
 *
 * @param schema - The Valibot object schema to flatten.
 *
 * @returns A strict object schema with strongly typed dot-notation keys and optional
 *   values.
 */
export const decomposeSchema = <const T extends ObjectS>(schema: T) => {
  const result: Record<string, v.BaseSchema<any, any, v.BaseIssue<any>>> = {};

  // Vérifier si c'est un ObjectSchema
  if ('entries' in schema && typeof schema.entries === 'object') {
    const entries = schema.entries;

    // Parcourir les entrées du schéma d'objet
    Object.entries(entries).forEach(([key, fieldSchema]) => {
      // Fonction pour extraire le schéma réel en cas d'enveloppe (optional, nullable, etc.)
      const extractObjectSchema = (
        schemaToExtract: any,
      ): { isObject: boolean; objectSchema: any } => {
        if (schemaToExtract.type === 'object') {
          return { isObject: true, objectSchema: schemaToExtract };
        }

        // Vérifier pour wrapped (autre forme d'enveloppe)
        if (schemaToExtract.wrapped) {
          return extractObjectSchema(schemaToExtract.wrapped);
        }

        return { isObject: false, objectSchema: null };
      };

      const { isObject, objectSchema } = extractObjectSchema(fieldSchema);
      result[key] = v.optional(fieldSchema);

      // Vérifier si c'est un schéma d'objet imbriqué
      if (isObject && objectSchema) {
        // Décomposer récursivement les schémas d'objet imbriqués
        const nestedDecomposed = decomposeSchema(objectSchema);
        Object.entries(nestedDecomposed.entries).forEach(
          ([nestedKey, nestedValue]) => {
            result[`${key}.${nestedKey}`] = v.optional(nestedValue);
          },
        );
      }
    });
  }

  return v.strictObject(result as DecomposedOutput<T['entries']>);
};
