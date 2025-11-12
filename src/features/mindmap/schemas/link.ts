/**
 * Schémas Valibot pour Link (relations entre éléments)
 * Une Link est une association entre deux éléments du mindmap
 * Toutes les propriétés aplaties dans un seul schéma principal
 */

import * as v from 'valibot';
import { create } from '~/globals/utils';

/**
 * Schéma complet et aplati pour une Link
 * Contient les métadonnées métier et visuelles de la relation
 */
export const LinkSchema = v.object({
  // Identifiants
  id: v.pipe(
    v.string("L'ID doit être une chaîne"),
    v.nanoid("L'ID ne peut pas être vide"),
    v.description('Identifiant unique de la relation'),
  ),

  sourceId: v.pipe(
    v.string("L'ID source doit être une chaîne"),
    v.nanoid("L'ID source ne peut pas être vide"),
    v.description("ID de l'élément source (point de départ)"),
  ),

  targetId: v.pipe(
    v.string("L'ID cible doit être une chaîne"),
    v.nanoid("L'ID cible ne peut pas être vide"),
    v.description("ID de l'élément cible (point d'arrivée)"),
  ),

  // Type et label
  type: v.pipe(
    v.picklist(
      [
        'parent-child',
        'dependency',
        'reference',
        'related',
        'conflicts',
        'supports',
        'causes',
        'custom',
      ],
      'Le type de relation doit être un des types supportés',
    ),
    v.description('Type de relation entre les deux éléments'),
  ),

  label: v.pipe(
    v.optional(
      v.pipe(
        v.string('Le label doit être une chaîne'),
        v.maxLength(100, 'Le label ne peut pas dépasser 100 caractères'),
      ),
    ),
    v.description('Label descriptif optionnel pour la relation'),
  ),

  bidirectional: v.pipe(
    v.optional(v.boolean('bidirectional doit être un booléen'), false),
    v.description('Indique si la relation est bidirectionnelle'),
  ),

  // Propriétés visuelles - Couleur et style du trait
  color: v.pipe(
    v.optional(v.string('La couleur doit être une chaîne'), '#000000'),
    v.regex(
      /^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$/,
      'Format de couleur invalide (hex requis)',
    ),

    v.description('Couleur de la ligne en format hexadécimal'),
  ),

  strokeWidth: v.pipe(
    v.optional(v.number("L'épaisseur du trait doit être un nombre"), 2),
    v.minValue(1, "L'épaisseur minimale est 1px"),
    v.maxValue(10, "L'épaisseur maximale est 10px"),
    v.description('Épaisseur du trait de la ligne en pixels'),
  ),

  strokeStyle: v.pipe(
    v.optional(
      v.picklist(
        ['solid', 'dashed', 'dotted'],
        'Le style de trait doit être un des styles supportés',
      ),
      'solid',
    ),

    v.description('Style du trait (solid, dashed, dotted)'),
  ),

  curvature: v.pipe(
    v.optional(v.number('La courbure doit être un nombre'), 50),
    v.minValue(0, 'La courbure minimale est 0'),
    v.maxValue(100, 'La courbure maximale est 100'),

    v.description(
      'Niveau de courbure de la ligne (0 = ligne droite, 100 = très courbée)',
    ),
  ),

  showLabel: v.pipe(
    v.optional(v.boolean('showLabel doit être un booléen'), true),
    v.description('Indique si le label de la relation est visible'),
  ),

  labelPosition: v.pipe(
    v.optional(
      v.picklist(
        ['start', 'middle', 'end'],
        'La position du label doit être start, middle ou end',
      ),
      'middle',
    ),

    v.description('Position du label sur la ligne (start, middle, end)'),
  ),
});

export const createLink = create(LinkSchema, 'typed');

export const createLinks = create(v.array(LinkSchema), 'typed');
