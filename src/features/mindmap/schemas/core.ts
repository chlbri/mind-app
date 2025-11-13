import * as v from 'valibot';

export const ID_SCHEMA = v.pipe(
  v.optional(v.string("L'ID doit être une chaîne"), crypto.randomUUID()),
  v.nanoid("L'ID doit être un nanoid valide"),
  v.description("Identifiant unique de l'élément"),
);

export const ColorSchema = v.pipe(
  v.optional(v.string('La couleur doit être une chaîne'), '#000000'),
  v.regex(
    /^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$/,
    'Format de couleur invalide (hex requis)',
  ),

  v.description('Couleur de la ligne en format hexadécimal'),
);
