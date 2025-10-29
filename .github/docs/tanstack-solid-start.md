# TanStack Start avec SolidJS

## Vue d'ensemble

TanStack Start est un framework full-stack moderne construit sur SolidJS
(v1.9.9), offrant une expérience de développement exceptionnelle avec un
routage basé sur les fichiers, un rendu côté serveur optimisé, et une
architecture prête pour la production.

**Version actuelle dans le projet : v1.132.56**

## Caractéristiques principales

### Framework full-stack

- **Frontend** : SolidJS v1.9.9 pour l'interface utilisateur réactive
- **Backend** : Server Functions + Nitro v2 via
  @tanstack/nitro-v2-vite-plugin
- **Serveur** : Vinxi v0.5.8 (serveur fullstack pour SolidJS)
- **Build** : Rolldown Vite v7.1.16 (bundler ultra-rapide compatible Vite)
- **Base de données** : Support des bases de données populaires (à
  configurer)
- **Déploiement** : Optimisé pour Vercel, Netlify, et autres plateformes

### Routage basé sur les fichiers

- Structure de routes définie par les fichiers
- Routes API automatiques
- Support des routes dynamiques et imbriquées

### Rendu optimisé

- **SSR/SSG** : Server-Side Rendering et Static Site Generation
- **Streaming** : Rendu progressif pour de meilleures performances
- **Islands Architecture** : Hydratation sélective des composants

## Structure de projet actuelle

```
ivoire-cours-web1/
├── src/
│   ├── routes/                # Routes de l'application
│   │   ├── __root.tsx         # Layout racine
│   │   ├── index.tsx          # Page d'accueil
│   │   ├── counting.tsx       # Page de compteur (exemple)
│   │   └── [futures routes API et pages]
│   ├── globals/               # Composants et utilitaires globaux
│   │   ├── ui/                # Interface utilisateur
│   │   │   ├── cn/            # Composants UI de base (Kobalte)
│   │   │   │   ├── utils.ts   # Utilitaires CSS (clsx, tailwind-merge)
│   │   │   │   └── components/ui/
│   │   │   │       └── accordion.tsx
│   │   │   ├── helpers/       # Fonctions utilitaires UI
│   │   │   │   ├── fcc.ts     # Helpers de composants
│   │   │   │   ├── seo.ts     # Helpers SEO
│   │   │   │   └── types.ts   # Types TypeScript
│   │   │   ├── molecules/     # Composants moléculaires
│   │   │   │   ├── AccordionQA.tsx
│   │   │   │   ├── Counter.tsx
│   │   │   │   ├── Focus.tsx
│   │   │   │   └── reducer.ts
│   │   │   ├── organisms/     # Composants complexes
│   │   │   │   └── HeadLinks.tsx
│   │   │   ├── signals/       # État global (signaux SolidJS)
│   │   │   │   ├── counter.ts
│   │   │   │   ├── debounce.ts
│   │   │   │   ├── focus.ts
│   │   │   │   ├── lang.ts
│   │   │   │   └── links.ts
│   │   │   └── styles/        # Styles globaux
│   │   │       └── app.css
│   │   └── utils/             # Utilitaires généraux
│   │       ├── array.ts
│   │       ├── string.ts
│   │       └── types.ts
│   ├── features/              # Fonctionnalités métier (à développer)
│   ├── router.tsx             # Configuration du router
│   └── routeTree.gen.ts       # Arbre de routes généré
├── public/                    # Ressources statiques
│   ├── favicon.ico
│   └── img/
├── vite.config.ts             # Configuration Vite
├── vitest.config.ts           # Configuration des tests
├── tailwind.config.ts         # Configuration Tailwind CSS
├── tsconfig.json              # Configuration TypeScript
├── eslint.config.mjs          # Configuration ESLint
├── components.json            # Configuration Kobalte UI
├── pnpm-workspace.yaml        # Configuration workspace pnpm
└── package.json
```

## Création d'un projet

### Projet existant

Le projet actuel utilise :

```bash
# Package manager
pnpm

# Scripts disponibles
pnpm dev              # Lancer le serveur de développement (port 3000)
pnpm dev:host         # Lancer avec accès réseau
pnpm build            # Build pour la production
pnpm preview          # Preview du build de production
pnpm test             # Lancer les tests
pnpm test:coverage    # Tests avec couverture
pnpm lint             # Linter et formatter le code
pnpm ci               # Pipeline CI (lint + test)
```

### Nouveau projet similaire

```bash
# Créer un nouveau projet
pnpm create solid my-app

# Sélectionner "solid-start" comme template
# Puis installer les dépendances additionnelles :
pnpm add @kobalte/core clsx tailwind-merge class-variance-authority
pnpm add -D @tailwindcss/vite vite-tsconfig-paths
```

## Pages et routes

### Page simple

```tsx
// src/routes/index.tsx
export default function Home() {
  return (
    <main>
      <h1>Bienvenue sur Solid Start</h1>
      <p>Framework full-stack moderne</p>
    </main>
  );
}
```

### Page avec données

```tsx
// src/routes/users/[id].tsx
import { createAsync } from '@solidjs/router';

export default function UserProfile() {
  const user = createAsync(async () => {
    const response = await fetch(`/api/users/${params.id}`);
    return response.json();
  });

  return (
    <div>
      <h1>{user()?.name}</h1>
      <p>{user()?.email}</p>
    </div>
  );
}
```

## Routes API

### Route API simple

```typescript
// src/routes/api/users.ts
import { json } from 'solid-start/server';

export async function GET() {
  const users = await db.users.findMany();
  return json(users);
}

export async function POST({ request }) {
  const data = await request.json();
  const user = await db.users.create({ data });
  return json(user);
}
```

### Route API avec paramètres

```typescript
// src/routes/api/users/[id].ts
import { json } from 'solid-start/server';

export async function GET({ params }) {
  const user = await db.users.findUnique({
    where: { id: params.id },
  });
  return json(user);
}

export async function PUT({ params, request }) {
  const data = await request.json();
  const user = await db.users.update({
    where: { id: params.id },
    data,
  });
  return json(user);
}
```

## Gestion d'état

### Signaux locaux

```tsx
import { createSignal } from 'solid-js';

function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <button onClick={() => setCount(count() + 1)}>Count: {count()}</button>
  );
}
```

### État global avec stores

```tsx
// src/lib/store.ts
import { createStore } from 'solid-js/store';

export const [appState, setAppState] = createStore({
  user: null,
  theme: 'light',
});
```

## Base de données

### Configuration Prisma

```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
```

### Utilisation dans les routes

```typescript
// src/routes/api/users.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const users = await prisma.user.findMany();
  return json(users);
}
```

## Authentification

### Middleware d'authentification

```typescript
// src/middleware.ts
import { createMiddleware } from 'solid-start/middleware';

export default createMiddleware({
  onRequest: async event => {
    const session = await getSession(event.request);
    event.locals.session = session;
  },
});
```

### Protection des routes

```tsx
// src/routes/dashboard.tsx
import { redirect } from 'solid-start/server';

export async function routeData() {
  const session = await getSession(request);

  if (!session) {
    throw redirect('/login');
  }

  return { user: session.user };
}
```

## Configuration Vite actuelle

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/solid-start/plugin/vite';
import { defineConfig } from 'vite';
import viteSolid from 'vite-plugin-solid';
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart({}),
    nitroV2Plugin({}),
    viteSolid({ ssr: true }),
    tailwindcss(),
  ],
});
```

### Plugins utilisés

- **vite-tsconfig-paths** : Support des alias de chemins TypeScript
- **@tanstack/solid-start/plugin/vite** : Plugin TanStack Start
- **@tanstack/nitro-v2-vite-plugin** : Serveur Nitro v2
- **vite-plugin-solid** : Support SolidJS avec SSR
- **@tailwindcss/vite** : Tailwind CSS v4

## Fonctionnalités avancées

### Streaming SSR

```tsx
// Permet le rendu progressif
export default function StreamingPage() {
  const data = createAsync(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { message: 'Données chargées' };
  });

  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <div>{data()?.message}</div>
    </Suspense>
  );
}
```

### Islands Architecture

```tsx
// Composants hydratés sélectivement
import { island } from 'solid-start/island';

const InteractiveComponent = island(() => {
  const [count, setCount] = createSignal(0);

  return <button onClick={() => setCount(count() + 1)}>{count()}</button>;
});
```

## Avantages

1. **Performance** : SSR optimisé et hydratation intelligente
2. **DX exceptionnelle** : Hot reload et TypeScript complet
3. **Full-stack** : Frontend et backend dans un seul projet
4. **Évolutif** : Architecture prête pour la production
5. **Moderne** : Technologies et patterns à jour

## Écosystème du projet

- **SolidJS** v1.9.9 : Bibliothèque de base réactive
- **TanStack Router** v1.132.49 : Routage avancé
- **TanStack Start** v1.132.56 : Framework fullstack
- **Vinxi** v0.5.8 : Serveur fullstack
- **Kobalte UI** v0.13.11 : Composants UI accessibles
- **Tailwind CSS** v4.1.14 : Framework CSS
- **Zod** v4.1.12 : Validation de schémas
- **Vitest** v3.2.4 : Framework de test
- **Rolldown Vite** v7.1.16 : Build tool ultra-rapide

## Ressources

- [Documentation officielle](https://start.solidjs.com/)
- [Guide de démarrage](https://docs.solidjs.com/solid-start)
- [Exemples](https://github.com/solidjs/solid-start/tree/main/examples)
- [GitHub](https://github.com/solidjs/solid-start)
