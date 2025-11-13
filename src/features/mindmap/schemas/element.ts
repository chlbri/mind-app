/**
 * Schémas Valibot pour Element (nœud du mindmap)
 * Toutes les propriétés aplaties dans un seul schéma principal
 */

import * as v from 'valibot';
import { create } from '~/globals/utils';
import { ColorSchema, ID_SCHEMA } from './core';

/**
 * Schéma complet et aplati pour un élément du mindmap
 * Contient toutes les propriétés métier et visuelles
 */
export const ElementSchema = v.pipe(
  v.object({
    // Identifiants et hiérarchie
    id: ID_SCHEMA,

    parentId: v.pipe(
      v.optional(v.string('Le parent ID doit être une chaîne')),
      v.description(
        "ID de l'élément parent (undefined pour l'élément racine)",
      ),
    ),

    childrenIds: v.pipe(
      v.optional(
        v.array(
          v.pipe(
            v.string('Les IDs enfants doivent être des chaînes'),
            v.minLength(1, "L'ID enfant ne peut pas être vide"),
          ),
          'Les enfants doivent être un tableau de chaînes',
        ),
        [],
      ),
      v.description('Tableau des IDs des enfants directs'),
    ),

    // Contenu textuel
    title: v.pipe(
      v.string('Le titre doit être une chaîne'),
      v.minLength(1, 'Le titre ne peut pas être vide'),
      v.maxLength(200, 'Le titre ne peut pas dépasser 200 caractères'),
      v.description("Titre principal de l'élément"),
    ),

    description: v.pipe(
      v.optional(
        v.pipe(
          v.string('La description doit être une chaîne'),
          v.maxLength(
            1000,
            'La description ne peut pas dépasser 1000 caractères',
          ),
        ),
      ),
      v.description("Description optionnelle de l'élément"),
    ),

    // Position
    x: v.pipe(
      v.number('X doit être un nombre'),
      v.description('Position horizontale en pixels'),
    ),

    y: v.pipe(
      v.number('Y doit être un nombre'),
      v.description('Position verticale en pixels'),
    ),

    // Dimensions
    width: v.pipe(
      v.optional(v.number('La largeur doit être un nombre'), 80),
      v.minValue(16, 'La largeur minimale est 16px'),
      v.description("Largeur de l'élément en pixels"),
    ),

    height: v.pipe(
      v.optional(v.number('La hauteur doit être un nombre'), 40),
      v.minValue(16, 'La hauteur minimale est 16px'),
      v.description("Hauteur de l'élément en pixels"),
    ),

    // Typographie
    fontFamily: v.pipe(
      v.string('La famille de police doit être une chaîne'),
      v.description('Font utilisée (serif, sans-serif, monospace, etc.)'),
    ),

    fontWeight: v.pipe(
      v.optional(
        v.picklist(
          [100, 200, 300, 400, 500, 600, 700, 800, 900],
          'Le poids de police doit être un des poids supportés',
        ),
        300,
      ),
      v.description('Poids de la police'),
    ),

    fontSize: v.pipe(
      v.optional(v.number('La taille de police doit être un nombre'), 10),
      v.minValue(8, 'La taille minimale est 8px'),
      v.maxValue(72, 'La taille maximale est 72px'),
      v.description('Taille de la police en pixels'),
    ),

    lineHeight: v.pipe(
      v.optional(v.number('La hauteur de ligne doit être un nombre'), 1),

      v.description('Hauteur de ligne (multiplicateur)'),
    ),

    letterSpacing: v.pipe(
      v.optional(
        v.number("L'espacement des lettres doit être un nombre"),
        0,
      ),
      v.description('Espacement entre les lettres en pixels'),
    ),

    // État visuel
    locked: v.pipe(
      v.optional(v.boolean('locked doit être un booléen'), false),
      v.description("Indique si l'élément est verrouillé (non éditable)"),
    ),

    expanded: v.pipe(
      v.optional(v.boolean('expanded doit être un booléen'), true),
      v.description("Indique si les enfants de l'élément sont visibles"),
    ),

    // Propriétés visuelles
    backgroundColor: ColorSchema,
    borderColor: ColorSchema,
    textColor: ColorSchema,

    borderRadius: v.pipe(
      v.optional(v.number('La bordure arrondie doit être un nombre'), 5),
      v.minValue(0, 'La bordure minimale est 0px'),
      v.maxValue(50, 'La bordure maximale est 50%'),

      v.description(
        'Rayon de bordure (arrondissement) de 0 à 50 (en pourcentage)',
      ),
    ),

    borderWidth: v.pipe(
      v.optional(
        v.number("L'épaisseur de bordure doit être un nombre"),
        2,
      ),

      v.minValue(1, "L'épaisseur minimale est 1px"),
      v.maxValue(20, "L'épaisseur maximale est 20px"),
      v.description('Épaisseur de la bordure en pixels'),
    ),
  }),
  v.transform(value => ({
    ...value,
    width: value.width + 5,
    height: value.height + 5,
  })),
);

export const createElement = create(ElementSchema, 'typed');
export const createElements = create(v.array(ElementSchema), 'typed');
