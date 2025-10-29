# Guide Tailwind CSS (pnpm + Vite + SolidJS)

Ce document explique comment installer et configurer Tailwind CSS dans ce
projet (pnpm + Vite + SolidJS). Les instructions sont adaptées à Tailwind
v4 et à l'intégration via le plugin Vite `@tailwindcss/vite`.

## 1) Installer les dépendances

Ouvre un terminal à la racine du projet et lance :

```bash
pnpm add -D tailwindcss @tailwindcss/vite postcss autoprefixer
```

Notes :

- `@tailwindcss/vite` est recommandé pour une intégration transparente avec
  Vite.
- `postcss` et `autoprefixer` sont utiles si vous utilisez une pipeline
  PostCSS ou si vous avez besoin de transformations supplémentaires.

## 2) Générer le fichier de configuration Tailwind

Génère les fichiers de configuration (tailwind.config.cjs + optionally
postcss.config.cjs) :

```bash
pnpm exec tailwindcss init
```

Si vous voulez un fichier `postcss.config.cjs` automatiquement :

```bash
pnpm exec tailwindcss init -p
```

## 3) Configurer `tailwind.config.cjs`

Exemple minimal adapté à SolidJS (vérifiez les extensions réelles utilisées
par votre code) :

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

Remarques :

- Assurez-vous d'inclure tous les chemins où des classes Tailwind peuvent
  apparaître (routes, composants partagés, etc.).
- Avec SolidJS, les fichiers `*.tsx` sont essentiels dans `src/`.

## 4) Importer Tailwind dans votre CSS

Créez (ou modifiez) un fichier CSS global, par exemple `src/style.css` ou
`src/index.css`, et ajoutez :

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Ensuite importez ce fichier dans votre point d'entrée (par ex.
`src/main.tsx` ou `src/index.tsx`) :

```ts
import './style.css';
```

## 5) Configurer Vite

Si vous utilisez le plugin Vite officiel pour Tailwind, ajoutez-le dans
`vite.config.ts` :

```ts
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [solidPlugin(), tailwindcss()],
});
```

Alternative (PostCSS) : Si vous préférez la configuration PostCSS, ne
mettez pas `@tailwindcss/vite` dans `vite.config.ts`. Assurez-vous d'avoir
`postcss.config.cjs` avec :

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## 6) Scripts utiles

Ajoutez/contrôlez ces scripts dans `package.json` :

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Lancez le serveur de dev :

```bash
pnpm run dev
```

## 7) Vérification rapide

- Dans une page ou un composant `.tsx`, ajoutez :

```tsx
<h1 class="text-3xl font-bold underline">Hello Tailwind</h1>
```

- Démarrez le dev server et vérifiez que le style est appliqué.

## 8) Debug / FAQ rapide

- Classes non générées : vérifiez les chemins `content` dans
  `tailwind.config.cjs`. Tailwind scanne ces fichiers pour générer les
  classes.
- Cache / build stale : relancez le serveur `pnpm run dev` et supprimez le
  cache si besoin.
- Plugin Vite incompatible : si vous rencontrez des erreurs liées à
  `@tailwindcss/vite`, essayez la solution PostCSS décrite ci-dessus.

## 9) Conseils pour ce dépôt

- Ce projet utilise `pnpm` et `vite` — la configuration ci‑dessus est
  compatible et testée localement.
- Si vous avez des workflows CI qui installent en mode offline, utilisez
  `pnpm install --offline` ou adaptez les étapes d'installation dans votre
  pipeline.

---
