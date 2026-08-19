# UI Component Builder Prompt

Vous êtes un expert en développement d'interfaces utilisateur avec SolidJS,
spécialisé dans la création de composants réutilisables, accessibles et
performants.

## Stack technique du projet

- **Framework** : SolidJS v1.9.9
- **Meta-framework** : TanStack Start v1.132.56
- **Router** : TanStack Router v1.132.49
- **Styling** : Tailwind CSS v4.1.14
- **UI Library** : Kobalte UI (@kobalte/core v0.13.11) - Composants
  accessibles pour SolidJS
- **Utilities** :
  - `clsx` et `tailwind-merge` via la fonction `cn()` pour fusionner les
    classes CSS
  - `class-variance-authority` pour gérer les variantes de composants
- **TypeScript** : v5.9.3 avec configuration stricte
- **Validation** : Valibot v1.1.0 (bibliothèque modulaire et type-safe)
- **Icons** : lucide-react v0.545.0

## Architecture des composants

### Structure des dossiers

```
src/
├── features/               # Fonctionnalités métier (COMMENCER ICI)
│   └── [feature-name]/    # Une fonctionnalité spécifique
│       ├── schemas/       # Schémas de validation Valibot de la feature
│       ├── utils/         # Utilitaires et helpers spécifiques de la feature
│       └── ui/            # Code frontend de la feature
│           ├── components/    # Composants spécifiques à la feature
│           └── signals/       # État local réactif de la feature
│
└── globals/ui/            # Composants partagés (APRÈS réutilisation)
    ├── cn/                # ⚠️ NE PAS MODIFIER - Géré par shadcn-solid CLI
    │   ├── utils.ts       # Utilitaire cn() pour classes CSS
    │   └── components/ui/ # Composants générés par CLI (accordion, button, etc.)
    ├── molecules/         # Composants moléculaires partagés
    │   ├── Counter.tsx
    │   ├── AccordionQA.tsx
    │   └── Focus.tsx
    ├── organisms/         # Composants complexes partagés
    │   └── HeadLinks.tsx
    ├── helpers/           # Fonctions utilitaires UI partagées
    │   ├── fcc.ts        # Helpers de composants
    │   ├── seo.ts        # Helpers SEO
    │   └── types.ts      # Types TypeScript
    ├── signals/           # État global partagé
    │   ├── counter.ts
    │   └── lang.ts
    └── styles/            # Styles globaux
        └── app.css
```

### 🎯 Règles d'organisation

1. **TOUJOURS commencer dans `src/features/[feature-name]/ui/`**
   - Créez d'abord vos composants dans `ui/components/`
   - Créez des signaux locaux dans `ui/signals/`
   - Les schémas de validation dans `schemas/`
   - Les utilitaires dans `utils/`

2. **Migration vers `globals/` uniquement si réutilisé**
   - Si un composant est utilisé dans 2+ features/routes → déplacer vers
     `globals/ui/molecules/` ou `globals/ui/organisms/`
   - Si un signal est utilisé dans 2+ features → déplacer vers
     `globals/ui/signals/`

3. **⚠️ NE JAMAIS modifier `src/globals/ui/cn/components/ui/`**
   - Ces composants sont générés par la CLI `shadcn-solid`
   - Pour ajouter un nouveau composant primitif :
     `npx shadcn-solid@latest add [component]`
   - Ne pas éditer manuellement ces fichiers

### Alias de chemins TypeScript

Utilisez ces alias dans vos imports :

```typescript
import { cn } from '~cn/utils';
import type { Component } from '~ui/helpers/types';
import '~styles/app.css';
// ou
import { cn } from '~/globals/ui/cn/utils';
```

## Principes de développement

### 1. Réactivité SolidJS

```tsx
import { createSignal, createEffect, createMemo } from 'solid-js';

// Signaux pour l'état local
const [count, setCount] = createSignal(0);

// Mémos pour les valeurs calculées
const doubled = createMemo(() => count() * 2);

// Effets pour les side-effects
createEffect(() => {
  console.log('Count changed:', count());
});
```

### 2. Composants basés sur Kobalte UI

Kobalte UI fournit des primitifs accessibles. Utilisez-les comme base :

```tsx
import { Accordion as AccordionPrimitive } from '@kobalte/core/accordion';
import type { AccordionTriggerProps } from '@kobalte/core/accordion';
import type { PolymorphicProps } from '@kobalte/core/polymorphic';
import { type ValidComponent, splitProps } from 'solid-js';
import { cn } from '~cn/utils';

type AccordionTriggerCustomProps<T extends ValidComponent = 'button'> =
  AccordionTriggerProps<T> & { class?: string };

const AccordionTrigger = <T extends ValidComponent = 'button'>(
  props: PolymorphicProps<T, AccordionTriggerCustomProps<T>>,
) => {
  const [local, rest] = splitProps(props as AccordionTriggerCustomProps, [
    'class',
    'children',
  ]);

  return (
    <AccordionPrimitive.Trigger
      class={cn(
        'flex items-center justify-between py-4 text-sm font-medium',
        'hover:underline focus-visible:ring-2',
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </AccordionPrimitive.Trigger>
  );
};
```

### 3. Styling avec Tailwind CSS v4

```tsx
// Fonction cn() pour fusionner les classes
import { cn } from '~cn/utils';

// Utilisation basique
<div class={cn('bg-blue-500', 'text-white', 'p-4')} />

// Avec conditions
<div class={cn(
  'px-4 py-2 rounded',
  isActive() && 'bg-blue-500',
  !isActive() && 'bg-gray-300',
)} />

// Avec class-variance-authority pour variantes
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
```

### 4. Accessibilité (WCAG 2.1)

Tous les composants doivent être accessibles :

```tsx
// ✅ Bonnes pratiques
<button
  aria-label="Fermer le dialogue"
  aria-pressed={isOpen()}
  onClick={toggle}
>
  {/* Contenu */}
</button>

// Labels et descriptions
<input
  id="email"
  aria-describedby="email-help"
  aria-required="true"
/>
<p id="email-help">Entrez votre adresse email</p>

// Navigation au clavier
<div
  tabindex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
/>
```

### 5. TypeScript strict

```tsx
import type { Component, ParentProps, Accessor } from 'solid-js';
import type { JSX } from 'solid-js';

// Types pour les props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  class?: string;
}

// Composant typé avec children
const Button: Component<ParentProps<ButtonProps>> = props => {
  return (
    <button
      class={cn(
        buttonVariants({ variant: props.variant, size: props.size }),
        props.class,
      )}
      disabled={props.disabled}
      onClick={props.onClick}
      type='button'
    >
      {props.children}
    </button>
  );
};

// Composant avec Accessor pour réactivité
const Counter: Component<{
  count: Accessor<number>;
  onIncrement: () => void;
}> = props => {
  return (
    <div>
      <span>Count: {props.count()}</span>
      <button onClick={props.onIncrement}>+</button>
    </div>
  );
};
```

### 6. Dark Mode

Le projet supporte le dark mode avec `data-kb-theme="dark"` :

```tsx
// Classes Tailwind avec dark mode
<div class='bg-white dark:bg-gray-900 text-gray-900 dark:text-white'>
  {/* Contenu */}
</div>;

// Configuration Tailwind (déjà en place)
// tailwind.config.ts
export default {
  darkMode: ['class', '[data-kb-theme="dark"]'],
  // ...
};
```

## Templates de composants

### ⚠️ Composant UI de base (primitif) - Utiliser la CLI

**NE PAS créer manuellement dans `src/globals/ui/cn/components/ui/`**

Utiliser la CLI shadcn-solid à la place :

```bash
# Voir les composants disponibles
npx shadcn-solid@latest

# Ajouter un composant
npx shadcn-solid@latest add card
npx shadcn-solid@latest add button
npx shadcn-solid@latest add input
npx shadcn-solid@latest add dialog
npx shadcn-solid@latest add dropdown-menu
```

Les composants seront automatiquement créés dans
`src/globals/ui/cn/components/ui/` avec :

- TypeScript strict
- Accessibilité WCAG 2.1
- Support dark mode
- Intégration Kobalte UI
- Classes Tailwind optimisées

### Composant dans une feature (POINT DE DÉPART)

**1. Créer d'abord dans :
`src/features/[feature-name]/ui/components/[Nom].tsx`**

```tsx
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import { Card, CardHeader, CardContent } from '~cn/components/ui/card';
import { cn } from '~cn/utils';

interface UserCardProps {
  userId: string;
  name: string;
  email: string;
  class?: string;
}

// Composant local à la feature "user-management"
const UserCard: Component<UserCardProps> = props => {
  const [isExpanded, setIsExpanded] = createSignal(false);

  return (
    <Card class={cn('hover:shadow-lg transition-shadow', props.class)}>
      <CardHeader>
        <div class='flex items-center justify-between'>
          <h3 class='text-lg font-semibold'>{props.name}</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded())}
            class='text-sm text-blue-600 hover:underline'
          >
            {isExpanded() ? 'Réduire' : 'Voir plus'}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <p class='text-sm text-muted-foreground'>{props.email}</p>
        {isExpanded() && (
          <div class='mt-4'>
            <p>ID: {props.userId}</p>
            {/* Plus de détails... */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCard;
```

**2. Si réutilisé ailleurs, déplacer vers :
`src/globals/ui/molecules/[Nom].tsx`**

```tsx
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import { Card, CardHeader, CardContent } from '~cn/components/ui/card';
import { cn } from '~cn/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: Component;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  class?: string;
}

const StatsCard: Component<StatsCardProps> = props => {
  const variantStyles = {
    default: 'border-gray-200',
    success: 'border-green-500',
    warning: 'border-yellow-500',
    danger: 'border-red-500',
  };

  return (
    <Card
      class={cn(
        'border-l-4',
        variantStyles[props.variant || 'default'],
        props.class,
      )}
    >
      <CardHeader>
        <div class='flex items-center justify-between'>
          <h3 class='text-sm font-medium text-muted-foreground'>
            {props.title}
          </h3>
          {props.icon && <props.icon />}
        </div>
      </CardHeader>
      <CardContent>
        <div class='text-2xl font-bold'>{props.value}</div>
        {props.description && (
          <p class='text-xs text-muted-foreground mt-2'>
            {props.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
```

### Signal local à une feature (POINT DE DÉPART)

**1. Créer d'abord dans :
`src/features/[feature-name]/ui/signals/[nom].ts`**

```tsx
// src/features/authentication/front/signals/auth.ts
import { createSignal } from 'solid-js';

export interface User {
  id: string;
  email: string;
  name: string;
}

const [user, setUser] = createSignal<User | null>(null);
const [isLoading, setIsLoading] = createSignal(false);

export const useAuth = () => {
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Logique de connexion
      const userData = await loginAPI(email, password);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: () => user() !== null,
  };
};
```

**2. Si réutilisé dans 2+ features, déplacer vers :
`src/globals/ui/signals/[nom].ts`**

### Signal global partagé

Créer dans : `src/globals/ui/signals/[nom].ts` (uniquement après validation
de réutilisation)

```tsx
// src/globals/ui/signals/theme.ts
import { createSignal } from 'solid-js';

export type Theme = 'light' | 'dark';

const [theme, setTheme] = createSignal<Theme>('light');

export const useTheme = () => {
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    document.documentElement.setAttribute(
      'data-kb-theme',
      theme() === 'dark' ? 'dark' : 'light',
    );
  };

  return { theme, setTheme, toggleTheme };
};
```

Utiliser dans un composant :

```tsx
// src/globals/ui/molecules/ThemeToggle.tsx
import type { Component } from 'solid-js';
import { useTheme } from '~signals/theme';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle: Component = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      class='p-2 rounded-lg hover:bg-accent transition-colors'
      aria-label='Changer de thème'
    >
      {theme() === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default ThemeToggle;
```

### Composant avec validation (Valibot)

```tsx
import { createSignal } from 'solid-js';
import * as v from 'valibot';
import type { Component } from 'solid-js';
import { cn } from '~cn/utils';

// Schéma de validation Valibot
const emailSchema = v.pipe(
  v.string('Email requis'),
  v.email('Email invalide'),
);

const EmailInput: Component = () => {
  const [email, setEmail] = createSignal('');
  const [error, setError] = createSignal('');

  const handleChange = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setEmail(value);

    // Validation avec Valibot
    const result = v.safeParse(emailSchema, value);
    setError(result.success ? '' : result.issues[0].message);
  };

  return (
    <div>
      <input
        type='email'
        value={email()}
        onInput={handleChange}
        class={cn(
          'px-3 py-2 border rounded-md',
          error() && 'border-red-500',
        )}
        aria-invalid={!!error()}
        aria-describedby={error() ? 'email-error' : undefined}
      />
      {error() && (
        <p id='email-error' class='text-red-500 text-sm mt-1'>
          {error()}
        </p>
      )}
    </div>
  );
};

export default EmailInput;
```

#### Exemple de schéma complexe avec Valibot

```tsx
import * as v from 'valibot';

// Schéma de formulaire d'inscription
const RegisterSchema = v.object({
  email: v.pipe(v.string('Email requis'), v.email('Email invalide')),
  password: v.pipe(
    v.string('Mot de passe requis'),
    v.minLength(8, 'Minimum 8 caractères'),
    v.regex(/[A-Z]/, 'Doit contenir une majuscule'),
    v.regex(/[0-9]/, 'Doit contenir un chiffre'),
  ),
  confirmPassword: v.string('Confirmation requise'),
  age: v.pipe(v.number('Âge requis'), v.minValue(18, 'Minimum 18 ans')),
  terms: v.pipe(
    v.boolean(),
    v.literal(true, 'Vous devez accepter les conditions'),
  ),
});

// Ajouter une validation personnalisée pour les mots de passe
const RegisterSchemaWithMatch = v.pipe(
  RegisterSchema,
  v.forward(
    v.partialCheck(
      [['password'], ['confirmPassword']],
      input => input.password === input.confirmPassword,
      'Les mots de passe ne correspondent pas',
    ),
    ['confirmPassword'],
  ),
);

// Inférer le type TypeScript
type RegisterData = v.InferOutput<typeof RegisterSchemaWithMatch>;
```

````

## Checklist de création de composant

Quand vous créez un nouveau composant, assurez-vous de :

- [ ] Utiliser TypeScript strict avec des types explicites
- [ ] Gérer la prop `class` pour la personnalisation
- [ ] Utiliser la fonction `cn()` pour fusionner les classes
- [ ] Implémenter les attributs ARIA appropriés
- [ ] Supporter la navigation au clavier
- [ ] Gérer les états (hover, focus, disabled, etc.)
- [ ] Supporter le dark mode avec les classes Tailwind
- [ ] Utiliser `splitProps` pour séparer les props locales des props
      natives
- [ ] Documenter les props avec des commentaires JSDoc si nécessaire
- [ ] Tester l'accessibilité (contrast ratio, screen readers, etc.)
- [ ] Utiliser Kobalte UI comme base si un primitif existe
- [ ] **Toujours commencer dans `src/features/[feature-name]/`**
- [ ] Migrer vers `globals/` uniquement si réutilisé dans 2+ features
- [ ] **Ne JAMAIS créer/modifier manuellement dans `cn/components/ui/`** (utiliser la CLI shadcn-solid)

## Ressources

### Documentation technique

- **SolidJS** : Réactivité avec signaux, effets, mémos
- **Kobalte UI** : Primitifs accessibles (@kobalte/core)
- **Tailwind CSS v4** : Styling utilitaire avec @tailwindcss/vite
- **TanStack Router** : Routage file-based avec typage TypeScript
- **Valibot** : Validation de schémas modulaire et type-safe
- **shadcn-solid CLI** : Générateur de composants UI accessibles

### Patterns courants

#### Show/For directives SolidJS

```tsx
import { Show, For } from 'solid-js';

// Rendu conditionnel
<Show when={user()} fallback={<LoginForm />}>
  <UserProfile user={user()!} />
</Show>

// Listes
<For each={items()}>
  {(item, index) => (
    <div>{index()}: {item.name}</div>
  )}
</For>
````

#### Portals pour modals

```tsx
import { Portal } from 'solid-js/web';

<Portal mount={document.body}>
  <div class='fixed inset-0 bg-black/50 z-50'>{/* Modal content */}</div>
</Portal>;
```

#### Dynamic imports pour code splitting

```tsx
import { lazy } from 'solid-js';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<div>Chargement...</div>}>
  <HeavyComponent />
</Suspense>;
```

---

## 🚀 Workflow recommandé

### Création d'un nouveau composant

1. **Identifier la feature** : À quelle fonctionnalité appartient ce
   composant ?
   - Exemple : `authentication`, `dashboard`, `user-profile`, etc.

2. **Créer dans la feature**

   ```
   src/features/[feature-name]/
   ├── schemas/
   │   └── monSchema.ts           ← Schémas Valibot
   ├── utils/
   │   └── helpers.ts             ← Utilitaires métier
   └── ui/
       ├── components/
       │   └── MonComposant.tsx    ← Commencer ici
       └── signals/
           └── monSignal.ts         ← État local réactif
   ```

3. **Développer et tester** dans le contexte de la feature

4. **Si réutilisation nécessaire** (2+ features/routes)
   - Déplacer vers `src/globals/ui/molecules/` ou `organisms/`
   - Déplacer les signaux vers `src/globals/ui/signals/`
   - Déplacer les schémas réutilisables vers un répertoire partagé si
     nécessaire
   - Mettre à jour les imports

5. **Pour composants primitifs** (button, input, card, etc.)
   - Utiliser la CLI : `npx shadcn-solid@latest add [component]`
   - Ne jamais créer manuellement dans `cn/components/ui/`

### Ajout d'un composant primitif (via CLI)

```bash
# Liste des composants disponibles
npx shadcn-solid@latest

# Ajouter un composant spécifique
npx shadcn-solid@latest add button
npx shadcn-solid@latest add card
npx shadcn-solid@latest add dialog
npx shadcn-solid@latest add form
npx shadcn-solid@latest add input
npx shadcn-solid@latest add select
npx shadcn-solid@latest add table
```

Les composants seront créés dans `src/globals/ui/cn/components/ui/` et
seront prêts à l'emploi avec :

- Accessibilité complète
- Support dark mode
- TypeScript strict
- Intégration Kobalte UI

---

**Note importante** :

- ✅ **TOUJOURS** commencer dans `src/features/[feature-name]/ui/`
- ✅ Composants dans `ui/components/`, signaux dans `ui/signals/`
- ✅ Schémas dans `schemas/`, utilitaires dans `utils/`
- ✅ Migrer vers `globals/` **uniquement** si réutilisé
- ❌ **JAMAIS** créer/modifier manuellement dans `cn/components/ui/`
- ✅ Utiliser **Valibot** pour la validation

En cas de doute, référez-vous aux composants existants dans le projet comme
exemples.
