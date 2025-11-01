# @bemedev/decompose

Une bibliothèque utilitaire pour décomposer et recomposer des objets en
JavaScript/TypeScript.

## Vue d'ensemble

`@bemedev/decompose` est une petite bibliothèque légère qui fournit deux
fonctions principales :

- **`decompose`** : Convertit un objet imbriqué en un objet aplati avec des
  clés en notation pointée
- **`recompose`** : Reconstruit l'objet original à partir de sa forme
  décomposée

## Installation

```bash
npm install @bemedev/decompose
```

ou avec pnpm :

```bash
pnpm add @bemedev/decompose
```

ou avec yarn :

```bash
yarn add @bemedev/decompose
```

## Utilisation

### Décomposer un objet

```typescript
import { decompose } from '@bemedev/decompose';

const obj = {
  data: {
    name: {
      firstName: 'John',
      lastName: 'Doe',
    },
  },
};

const decomposed = decompose(obj);
// Résultat: { 'data.name.firstName': 'John', 'data.name.lastName': 'Doe' }
```

### Recomposer un objet

```typescript
import { decompose, recompose } from '@bemedev/decompose';

const obj = {
  data: {
    name: {
      firstName: 'John',
      lastName: 'Doe',
    },
  },
};

const decomposed = decompose(obj);
// { 'data.name.firstName': 'John', 'data.name.lastName': 'Doe' }

const recomposed = recompose(decomposed);
// Retourne la structure d'objet original
```

## Cas d'usage

### 1. Aplatir les configurations imbriquées

Utile pour convertir des fichiers de configuration complexes en paires
clé-valeur simples.

```typescript
const config = {
  server: {
    host: 'localhost',
    port: 3000,
    ssl: {
      enabled: true,
      cert: '/path/to/cert',
    },
  },
};

const flat = decompose(config);
// {
//   'server.host': 'localhost',
//   'server.port': 3000,
//   'server.ssl.enabled': true,
//   'server.ssl.cert': '/path/to/cert',
// }
```

### 2. Sérialisation et stockage

Facilite le stockage et la transmission d'objets complexes.

```typescript
const userData = {
  profile: {
    personal: {
      firstName: 'Alice',
      age: 28,
    },
    contact: {
      email: 'alice@example.com',
    },
  },
};

const flattened = decompose(userData);
// Peut être facilement stocké dans une base de données clé-valeur
// ou envoyé via des APIs limitées aux structures plates
```

### 3. Gestion des formulaires complexes

Convertir les données de formulaires imbriquées en structure plate pour la
validation.

```typescript
const formData = {
  user: {
    address: {
      street: '123 Main St',
      city: 'New York',
      country: 'USA',
    },
  },
};

const flat = decompose(formData);
// Facilite la validation de chaque champ
```

## Caractéristiques

- **Léger** : Dépendances minimales
- **TypeScript** : Support complet des types
- **Bidirectionnel** : Les fonctions `decompose` et `recompose` sont
  l'inverse l'une de l'autre
- **Imbrication profonde** : Gère les objets avec des niveaux d'imbrication
  arbitraires
- **Notation pointée** : Utilise la notation pointée standard pour les clés

## API

### `decompose(obj: object): Record<string, any>`

Convertit un objet imbriqué en objet avec des clés aplaties.

**Paramètres:**

- `obj` (object) : L'objet à décomposer

**Retour:**

- Un objet avec des clés en notation pointée

### `recompose(obj: Record<string, any>): object`

Reconstruit un objet imbriqué à partir de clés aplaties.

**Paramètres:**

- `obj` (Record<string, any>) : L'objet avec des clés aplaties à recomposer

**Retour:**

- L'objet reconstruit avec sa structure imbriquée originale

## Exemples avancés

### Objets imbriqués profonds

```typescript
import { decompose, recompose } from '@bemedev/decompose';

const deepObj = {
  a: {
    b: {
      c: {
        d: {
          e: 'value',
        },
      },
    },
  },
};

const flattened = decompose(deepObj);
// { 'a.b.c.d.e': 'value' }

const restored = recompose(flattened);
// Retourne la structure originale
```

### Tableaux et objets mixtes

```typescript
const mixed = {
  config: {
    settings: [
      { key: 'setting1', value: 'value1' },
      { key: 'setting2', value: 'value2' },
    ],
  },
};

const decomposed = decompose(mixed);
```

## License

MIT

## Auteur

chlbri ([bri_lvi@icloud.com](mailto:bri_lvi@icloud.com))

## Liens

- [Repository GitHub](https://github.com/chlbri/decompose)
- [CHANGELOG](https://github.com/chlbri/decompose/blob/main/CHANGELOG.md)
- [GitHub Profile](https://github.com/chlbri?tab=repositories)
