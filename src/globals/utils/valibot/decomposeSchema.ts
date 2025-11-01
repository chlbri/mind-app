import * as v from 'valibot';
import type { DecomposedOutput, ObjectS } from './types';

/**
 * Décompose un schéma d'objet Valibot en objet aplati avec clés en notation pointée.
 * Ne décompose que les schémas ObjectSchema.
 * Les autres schémas Valibot ne sont pas décomposés.
 *
 * @param schema - Le schéma d'objet Valibot à décomposer
 * @returns Un schéma strictObject avec des clés et valeurs fortement typées
 *
 * @example
 * ```typescript
 * const schema = v.object({
 *   user: v.object({
 *     name: v.string(),
 *     email: v.string(),
 *   }),
 *   settings: v.object({
 *     theme: v.string(),
 *     notifications: v.boolean(),
 *   }),
 * });
 *
 * const decomposed = decomposeSchema(schema);
 * // Type: v.StrictObjectSchema<DecomposedObjectEntries<typeof schema.entries>, undefined>
 *
 * // Avec type de sortie inféré:
 * // {
 * //   'user.name': string | undefined,
 * //   'user.email': string | undefined,
 * //   'settings.theme': string | undefined,
 * //   'settings.notifications': boolean | undefined,
 * // }
 * ```
 */
export const decomposeSchema = <const T extends ObjectS>(schema: T) => {
  const result: Record<
    string,
    v.BaseSchema<any, any, v.BaseIssue<any>>
  > = {};

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

        // Vérifier si c'est un schéma enveloppé (optional, nullable, etc.)
        if (schemaToExtract.schema) {
          return extractObjectSchema(schemaToExtract.schema);
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
