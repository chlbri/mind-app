# Tailwind CSS Vite Plugin

## Vue d'ensemble

Le plugin `@tailwindcss/vite` est l'intégration officielle de Tailwind CSS
pour Vite, offrant une configuration simplifiée et des performances
optimisées pour les projets utilisant Tailwind CSS avec Vite comme bundler.

## Caractéristiques principales

### Configuration simplifiée

- Configuration automatique de Tailwind CSS
- Intégration transparente avec Vite
- Support des directives Tailwind (@tailwind, @apply, @layer, etc.)

### Performance optimisée

- **Purge automatique** : Suppression du CSS inutilisé en production
- **Compilation JIT** : Génération à la demande des classes CSS
- **Hot reload** : Rechargement instantané des changements de style

### Support moderne

- Support CSS moderne (CSS-in-JS, PostCSS)
- Compatibilité avec les frameworks modernes (React, Vue, SolidJS, etc.)
- Intégration TypeScript

## Installation et configuration

### Installation

```bash
npm install -D tailwindcss @tailwindcss/vite
# ou
pnpm add -D tailwindcss @tailwindcss/vite
```

### Configuration Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    // autres plugins...
  ],
});
```

### Configuration Tailwind

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

## Utilisation de base

### Directives CSS

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Classes utilitaires

```tsx
function Button() {
  return (
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Cliquez-moi
    </button>
  );
}
```

### Directives @apply

```css
/* src/components/Button.css */
.btn-primary {
  @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
}
```

## Fonctionnalités avancées

### Configuration personnalisée

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        brand: '#ff6b6b',
      },
      spacing: {
        18: '4.5rem',
      },
    },
  },
  plugins: [
    // Plugins personnalisés
  ],
};
```

### Variants responsives

```tsx
<div className="text-center md:text-left lg:text-right">
  Texte responsive
</div>
```

### Variants d'état

```tsx
<button className="bg-gray-200 hover:bg-gray-300 focus:bg-blue-500 active:bg-blue-600">
  Bouton interactif
</button>
```

### Classes dynamiques

```tsx
function DynamicButton({ variant }) {
  const baseClasses = 'px-4 py-2 rounded font-medium';
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      Bouton dynamique
    </button>
  );
}
```

## Optimisations de performance

### Purge CSS

```javascript
// tailwind.config.js
export default {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}', './public/index.html'],
};
```

### Compilation JIT

```javascript
// tailwind.config.js
export default {
  mode: 'jit',
  // Configuration JIT activée par défaut dans v3+
};
```

## Intégration avec frameworks

### SolidJS

```tsx
// Compatible directement avec SolidJS
function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-800">
        Hello SolidJS + Tailwind
      </h1>
    </div>
  );
}
```

### Avec des bibliothèques de composants

```tsx
// Exemple avec clsx ou class-variance-authority
import { clsx } from 'clsx';
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 text-white hover:bg-blue-600',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6',
      },
    },
  },
);

function Button({ variant, size, className, ...props }) {
  return (
    <button
      className={clsx(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

## Avantages

1. **Performance** : CSS optimisé et purgé automatiquement
2. **Développement rapide** : Classes utilitaires prêtes à l'emploi
3. **Maintenance** : Réduction significative du CSS personnalisé
4. **Responsive** : Support responsive intégré
5. **Personnalisable** : Configuration flexible et extensible

## Écosystème

- **Tailwind CSS** : Bibliothèque principale
- **@tailwindcss/typography** : Styles de typographie
- **@tailwindcss/forms** : Styles de formulaires
- **@tailwindcss/aspect-ratio** : Utilitaires de ratio d'aspect
- **@tailwindcss/line-clamp** : Utilitaires de troncature

## Ressources

- [Documentation officielle](https://tailwindcss.com/docs/installation)
- [Guide Vite](https://tailwindcss.com/docs/guides/vite)
- [Playground](https://play.tailwindcss.com/)
- [GitHub](https://github.com/tailwindlabs/tailwindcss)
