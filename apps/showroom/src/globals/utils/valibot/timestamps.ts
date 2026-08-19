import * as v from 'valibot';
import type { ObjectS } from './types';
import { decomposeSchema } from './decomposeSchema';

/**
 * Extends a Valibot object schema with automated timestamp audit fields
 * (`createdAt`, `updatedsAt`, `deletedsAt`, `restoredsAt`) and validation
 * checks.
 *
 * @template | {@linkcode ObjectS} `T` - Base Valibot object schema type.
 *
 * @param schema - The source object schema to augment with timestamps.
 *
 * @returns An intersected Valibot schema including validated timestamp
 *   audit metadata.
 */
export const timestamps = <const T extends ObjectS>(schema: T) => {
  const decomposed = decomposeSchema(schema);
  const out = v.pipe(
    v.intersect([
      schema,
      v.object({
        __timestamps: v.optional(
          v.pipe(
            v.object({
              createdAt: v.pipe(
                v.optional(
                  v.date('createdAt doit être une date valide'),
                  new Date(),
                ),

                v.description("Date de création de l'entité"),
              ),

              updatedsAt: v.pipe(
                v.optional(
                  v.array(
                    v.map(
                      v.date(
                        'Chaque date de mise à jour doit être une date valide',
                      ),
                      v.custom<v.InferInput<typeof decomposed>>(
                        value => v.is(decomposed, value),
                        `Chaque mise à jour doit correspondre au "flatten-schema" de l'entité`,
                      ),
                    ),

                    'Les mises à jour doivent être un tableau de dates',
                  ),
                  [],
                ),

                v.description("Dates des mises à jour de l'entité"),
              ),

              deletedsAt: v.pipe(
                v.optional(
                  v.array(
                    v.date(
                      'Chaque date de suppression doit être une date valide',
                    ),
                    'Les suppressions doivent être un tableau de dates',
                  ),
                  [],
                ),
                v.description("Dates des suppressions de l'entité"),
              ),

              restoredsAt: v.pipe(
                v.optional(
                  v.array(
                    v.date(
                      'Chaque date de restauration doit être une date valide',
                    ),
                    'Les restaurations doivent être un tableau de dates',
                  ),
                  [],
                ),

                v.description("Dates des restaurations de l'entité"),
              ),
            }),

            v.forward(
              v.partialCheck(
                [['createdAt'], ['updatedsAt']],

                ({ createdAt, updatedsAt }) => {
                  if (updatedsAt.length === 0) return true;
                  const allUpdatedDates = Array.from(
                    updatedsAt,
                    ([[date]]) => date.getTime(),
                  );
                  // get the minimum date from updatedsAt
                  const minUpdatedAt = allUpdatedDates.reduce(
                    (min, date) => (date < min ? date : min),
                  );

                  return minUpdatedAt > createdAt.getTime();
                },

                'Toutes les dates de mise à jour doivent être postérieures à la date de création',
              ),

              ['updatedsAt'],
            ),

            v.forward(
              v.partialCheck(
                [['createdAt'], ['deletedsAt']],

                ({ createdAt, deletedsAt }) => {
                  if (deletedsAt.length === 0) return true;
                  const allDeletedDates = deletedsAt.map(date =>
                    date.getTime(),
                  );
                  // get the minimum date from deletedsAt
                  const minDeletedAt = allDeletedDates.reduce(
                    (min, date) => (date < min ? date : min),
                  );

                  return minDeletedAt > createdAt.getTime();
                },

                'Toutes les dates de suppression doivent être postérieures à la date de création',
              ),

              ['deletedsAt'],
            ),

            v.forward(
              v.partialCheck(
                [['createdAt'], ['restoredsAt']],

                ({ createdAt, restoredsAt }) => {
                  if (restoredsAt.length === 0) return true;
                  const allRestoredDates = restoredsAt.map(date =>
                    date.getTime(),
                  );
                  // get the minimum date from restoredsAt
                  const minRestoredAt = allRestoredDates.reduce(
                    (min, date) => (date < min ? date : min),
                  );

                  return minRestoredAt > createdAt.getTime();
                },

                'Toutes les dates de restauration doivent être postérieures à la date de création',
              ),

              ['restoredsAt'],
            ),

            v.forward(
              v.partialCheck(
                [['deletedsAt'], ['restoredsAt']],

                ({ deletedsAt, restoredsAt }) => {
                  if (restoredsAt.length === 0 || deletedsAt.length === 0)
                    return true;
                  const allRestoredDates = restoredsAt.map(date =>
                    date.getTime(),
                  );
                  // get the minimum date from restoredsAt
                  const minRestoredAt = allRestoredDates.reduce(
                    (min, date) => (date < min ? date : min),
                  );

                  const allDeletedDates = deletedsAt.map(date =>
                    date.getTime(),
                  );
                  // get the minimum date from deletedsAt
                  const minDeletedAt = allDeletedDates.reduce(
                    (min, date) => (date < min ? date : min),
                  );

                  return minRestoredAt > minDeletedAt;
                },

                'Toutes les dates de restauration doivent être postérieures aux dates de suppression',
              ),

              ['restoredsAt'],
            ),
          ),
          { createdAt: new Date() },
        ),
      }),
    ]),
  );

  return out;
};
