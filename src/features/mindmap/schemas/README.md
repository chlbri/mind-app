# Schémas Mindmap - Documentation

## 📋 Vue d'ensemble

Ce dossier contient les **schémas Valibot** pour valider et typer les
données du mindmap. Les schémas définissent la structure des deux entités
principales :

- **Element** : Un nœud du mindmap
- **Link** : Une relation entre deux nœuds

Le mindmap est composé de deux entités principales interconnectées :

```
┌─────────────┐         ┌──────────────┐
│   Element   │◄───────►│     Link     │
│  (Nœud)     │         │ (Relation)   │
└─────────────┘         └──────────────┘
```

## 📁 Structure des fichiers

```
schemas/
├── element.ts           # Schémas pour Element (nœud)
├── link.ts              # Schémas pour Link (relation)
├── index.ts             # Exports centralisés
├── examples.ts          # Exemples d'utilisation
├── DOCUMENTATION.md     # Documentation complète
└── README.md            # Ce fichier
```

## 🎯 Principes clés

### 1. Séparation Métier / Visuel

**Les schémas contiennent UNIQUEMENT les propriétés métier**, pas les
propriétés visuelles.

```typescript
// ✅ Dans le schéma Element
{
  id: string,
  title: string,
  locked: boolean,
  expanded: boolean,
  // ...
}

// ✅ Propriétés visuelles PASSÉES AU COMPOSANT
<ElementComponent
  element={element}
  backgroundColor="#FFF"
  borderColor="#000"
  textColor="#333"
/>
```

### 2. Structure Element

```typescript
Element {
  id: string                    // Identifiant unique
  parentId?: string             // Lien hiérarchique
  childrenIds: string[]         // Enfants directs
  content: {                    // Contenu textuel
    title: string
    description: string
  }
  position: { x, y }            // Coordonnées
  dimensions: { width, height } // Taille
  typography: {                 // Typo (métier)
    fontFamily: string
    fontWeight: '400' | '600' | ...
    fontSize: number
    lineHeight: number
    letterSpacing: number
  }
  visualState: {                // État visuel
    locked: boolean
    expanded: boolean
  }
  createdAt: string             // Métadonnées
  updatedAt: string
}
```

### 3. Structure Link

```typescript
Link {
  id: string                    // Identifiant unique
  sourceId: string              // Élément source
  targetId: string              // Élément cible
  type: LinkType                // Type de relation
  label?: string                // Description
  bidirectional: boolean        // Bidirectionnelle?
  metadata?: Record<...>        // Données additionnelles
  createdAt: string             // Métadonnées
  updatedAt: string
}
```

### 4. Types de relations (LinkType)

| Type           | Description                      |
| -------------- | -------------------------------- |
| `parent-child` | Relation naturelle parent-enfant |
| `dependency`   | A dépend de B                    |
| `reference`    | A référence B                    |
| `related`      | A est lié à B                    |
| `conflicts`    | A entre en conflit avec B        |
| `supports`     | A soutient B                     |
| `causes`       | A cause B                        |
| `custom`       | Relation personnalisée           |

## 🚀 Quick Start

### Créer un élément

```typescript
import { ElementCreateSchema } from '~/features/mindmap/schemas';
import * as v from 'valibot';

const newElement = v.parse(ElementCreateSchema, {
  content: {
    title: 'Mon élément',
    description: 'Une description',
  },
  position: { x: 100, y: 100 },
  dimensions: { width: 200, height: 100 },
  typography: {
    fontFamily: 'sans-serif',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 1.5,
    letterSpacing: 0,
  },
  visuals: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
    textColor: '#333333',
    borderRadius: 8,
    borderWidth: 1,
  },
});
```

### Valider un élément

```typescript
import { ElementSchema } from '~/features/mindmap/schemas';
import * as v from 'valibot';

const result = v.safeParse(ElementSchema, data);

if (result.success) {
  console.log('Valide:', result.output);
} else {
  console.error('Erreurs:', result.issues);
}
```

### Créer une relation

```typescript
import { LinkCreateSchema } from '~/features/mindmap/schemas';
import * as v from 'valibot';

const link = v.parse(LinkCreateSchema, {
  sourceId: 'element-1',
  targetId: 'element-2',
  type: 'dependency',
  label: 'Dépend de',
  bidirectional: false,
  visuals: {
    color: '#FF5733',
    strokeWidth: 2,
    strokeStyle: 'solid',
    curvature: 30,
    showLabel: true,
    labelPosition: 'middle',
  },
});
```

## 📚 Schémas disponibles

### Element

- `ElementSchema` - Schéma complet
- `ElementWithVisualsSchema` - Avec propriétés visuelles
- `ElementCreateSchema` - Pour création
- `ElementUpdateSchema` - Pour mise à jour

### Link

- `LinkSchema` - Schéma complet
- `LinkWithVisualsSchema` - Avec propriétés visuelles
- `LinkCreateSchema` - Pour création
- `LinkUpdateSchema` - Pour mise à jour

## 🔍 Validation

### Mode simple (lance une exception)

```typescript
const element = v.parse(ElementSchema, data);
```

### Mode sécurisé (pas d'exception)

```typescript
const result = v.safeParse(ElementSchema, data);
if (result.success) {
  const element = result.output;
} else {
  const issues = result.issues;
}
```

### Type guard

```typescript
if (v.is(ElementSchema, value)) {
  // value est typé comme Element
}
```

## 💡 Bonnes pratiques

### ✅ À faire

1. **Valider tous les données externes**

   ```typescript
   const result = v.safeParse(ElementSchema, externalData);
   if (result.success) {
     useElement(result.output);
   }
   ```

2. **Utiliser les types inférés**

   ```typescript
   import type { Element, ElementCreate } from '~/features/mindmap/schemas';

   const element: Element = { ... };
   const newElement: ElementCreate = { ... };
   ```

3. **Séparer métier et visuel**
   ```typescript
   <ElementComponent
     element={element}
     backgroundColor="#FFF"
     textColor="#000"
   />
   ```

### ❌ À éviter

1. **Ne pas ignorer la validation**

   ```typescript
   // ❌ MAUVAIS
   const element = data as Element;
   ```

2. **Ne pas mélanger métier et visuel**

   ```typescript
   // ❌ MAUVAIS
   const element = {
     ...data,
     backgroundColor: '#FFF',
   };
   ```

3. **Ne pas utiliser `any`**
   ```typescript
   // ❌ MAUVAIS
   const element: any = data;
   ```

## 🔗 Ressources

- [Documentation complète](./DOCUMENTATION.md)
- [Exemples d'utilisation](./examples.ts)
- [Documentation Valibot](https://valibot.dev/)

## 📝 Notes importantes

1. **Format des couleurs** : Hexadécimal uniquement (`#RRGGBB` ou
   `#RRGGBBAA`)
2. **Dimensions minimales** : Width/height min 16px
3. **Taille de police** : 8-72px
4. **Tous les messages d'erreur sont en français**
5. **Types de dates** : Format ISO uniquement

## 🤝 Contribution

Lors de la modification des schémas :

1. Mettez à jour la documentation
2. Ajoutez des exemples d'utilisation
3. Validez avec lint et tests
4. Suivez les instructions de commit du projet

---

**Besoin d'aide?** Consultez la
[documentation complète](./DOCUMENTATION.md) ou les
[exemples](./examples.ts).
