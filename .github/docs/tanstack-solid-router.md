# TanStack Router pour SolidJS

## Vue d'ensemble

TanStack Router est une bibliothèque de routage puissante et flexible
utilisée dans ce projet avec SolidJS. Version actuelle : **v1.132.49**.
Elle offre un système de routage basé sur les fichiers avec un typage
TypeScript complet et des performances optimisées.

## Caractéristiques principales

### Routage basé sur les fichiers

- Structure de routage définie par la structure des fichiers
- Routes automatiques découvertes
- Support des routes dynamiques et imbriquées

### TypeScript de première classe

- Typage complet des paramètres de route
- Auto-complétion intelligente
- Sécurité de type pour la navigation

### Fonctionnalités avancées

- **Loaders** : Fonctions asynchrones pour charger des données
- **Actions** : Gestion des mutations côté serveur
- **Search params** : Gestion des paramètres de requête typés
- **Route préchargement** : Préchargement intelligent des routes

## Configuration dans le projet

### Configuration du router

```tsx
// src/router.tsx
import { createRouter as createTanStackRouter } from '@tanstack/solid-router';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultErrorComponent: err => <p>{err.error.stack}</p>,
    defaultNotFoundComponent: () => <p>not found</p>,
    scrollRestoration: true,
  });

  return router;
}
```

### Route racine

```tsx
// src/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/solid-router';

export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: 'stylesheet', href: appCss }],
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
  }),
  component: () => (
    <>
      <Outlet />
      {/* Dev tools en développement */}
      <TanStackRouterDevtools />
    </>
  ),
});
```

### DevTools

Le projet utilise **@tanstack/solid-router-devtools v1.132.51** pour le
débogage en développement.

### Définition des routes

```
src/
  routes/
    index.tsx          # Route racine /
    about.tsx          # Route /about
    users/
      index.tsx        # Route /users
      $userId.tsx      # Route /users/:userId (dynamique)
      settings.tsx     # Route /users/settings
```

### Route simple

```tsx
// routes/index.tsx
export default function Home() {
  return (
    <div>
      <h1>Accueil</h1>
      <p>Bienvenue sur notre application</p>
    </div>
  );
}
```

### Route avec paramètres

```tsx
// routes/users/$userId.tsx
import { createFileRoute } from '@tanstack/solid-router';

export const Route = createFileRoute('/users/$userId')({
  loader: async ({ params }) => {
    // Charger les données utilisateur
    return fetchUser(params.userId);
  },
  component: UserProfile,
});

function UserProfile() {
  const user = Route.useLoaderData();

  return (
    <div>
      <h1>{user().name}</h1>
      <p>Email: {user().email}</p>
    </div>
  );
}
```

## Navigation programmatique

```tsx
import { useNavigate } from '@tanstack/solid-router';

function NavigationComponent() {
  const navigate = useNavigate();

  const goToUser = (userId: string) => {
    navigate({
      to: '/users/$userId',
      params: { userId },
    });
  };

  return (
    <button onClick={() => goToUser('123')}>Voir l'utilisateur 123</button>
  );
}
```

## Loaders et Actions

### Loaders pour les données

```tsx
export const Route = createFileRoute('/posts')({
  loader: async () => {
    const response = await fetch('/api/posts');
    return response.json();
  },
  component: PostsPage,
});
```

### Actions pour les mutations

```tsx
export const Route = createFileRoute('/posts')({
  action: async (formData: FormData) => {
    const response = await fetch('/api/posts', {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },
});
```

## Gestion des erreurs

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    try {
      return await fetchPost(params.postId);
    } catch (error) {
      throw new Error('Post not found');
    }
  },
  errorComponent: PostError,
});

function PostError() {
  const error = Route.useRouteError();

  return (
    <div>
      <h1>Erreur</h1>
      <p>{error().message}</p>
    </div>
  );
}
```

## Avantages

1. **TypeScript complet** : Sécurité de type pour tous les aspects du
   routage
2. **Performance** : Routage optimisé avec préchargement intelligent
3. **DX exceptionnelle** : Auto-complétion et validation à la compilation
4. **Flexibilité** : Support de tous les patterns de routage courants
5. **Intégration SolidJS** : Optimisé pour SolidJS et sa réactivité

## Fonctionnalités avancées

### Routes protégées

```tsx
export const Route = createFileRoute('/admin')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: '/admin' },
      });
    }
  },
});
```

### Search params typés

```tsx
export const Route = createFileRoute('/search')({
  validateSearch: search => ({
    query: search.query || '',
    page: Number(search.page) || 1,
  }),
});
```

### Route splitting

```tsx
const Route = createFileRoute('/expensive')({
  component: lazy(() => import('./ExpensiveComponent')),
});
```

## Écosystème

- **TanStack Router** : v1.132.49 - Routeur framework-agnostic
- **TanStack Router Devtools** : v1.132.51 - Outils de développement
- **TanStack Start** : v1.132.56 - Framework full-stack intégré

## Ressources

- [Documentation officielle](https://tanstack.com/router/latest/docs/solid/overview)
- [Guide de migration](https://tanstack.com/router/latest/docs/solid/migration)
- [Exemples](https://tanstack.com/router/latest/docs/solid/examples)
- [GitHub](https://github.com/TanStack/router)
