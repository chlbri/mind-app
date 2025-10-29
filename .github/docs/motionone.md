# Solid MotionOne

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)
[![npm](https://img.shields.io/npm/v/solid-motionone?style=for-the-badge)](https://www.npmjs.com/package/solid-motionone)
[![downloads](https://img.shields.io/npm/dw/solid-motionone?color=blue&style=for-the-badge)](https://www.npmjs.com/package/solid-motionone)

**Une bibliothèque d'animation minuscule et performante pour SolidJS.
Propulsée par [Motion One](https://motion.dev/).**

## Introduction

Motion One pour Solid est une bibliothèque d'animation de 5,8 Ko pour
SolidJS. Elle tire parti des excellentes performances de Solid et de sa
syntaxe déclarative simple. Ce package fournit des ressorts (springs), des
transformations indépendantes et des animations accélérées par le matériel.

## Installation

Motion One pour Solid peut être installé via npm :

```bash
npm install solid-motionone
# ou
pnpm add solid-motionone
# ou
yarn add solid-motionone
```

## Créer une animation

Importez le composant `Motion` et utilisez-le n'importe où dans vos
composants Solid :

```tsx
import { Motion } from 'solid-motionone';

function MyComponent() {
  return <Motion>Hello world</Motion>;
}
```

Le composant `Motion` peut être utilisé pour créer un élément HTML ou SVG
animable. Par défaut, il rendra un élément `div` :

```tsx
import { Motion } from 'solid-motionone';

function App() {
  return (
    <Motion.div
      animate={{ opacity: [0, 1] }}
      transition={{ duration: 1, easing: 'ease-in-out' }}
    />
  );
}
```

Mais n'importe quel élément HTML ou SVG peut être rendu, en le définissant
comme ceci : `<Motion.button>`

Ou comme ceci : `<Motion tag="button">`

## Options de transition

Nous pouvons changer le type d'animation utilisé en passant une prop
`transition`.

```tsx
<Motion
  animate={{ rotate: 90, backgroundColor: 'yellow' }}
  transition={{ duration: 1, easing: 'ease-in-out' }}
/>
```

Par défaut, les options de transition sont appliquées à toutes les valeurs,
mais nous pouvons également les surcharger au cas par cas :

```tsx
<Motion
  animate={{ rotate: 90, backgroundColor: 'yellow' }}
  transition={{
    duration: 1,
    rotate: { duration: 2 },
  }}
/>
```

Tirer parti de la réactivité de Solid est tout aussi facile. Il suffit de
fournir n'importe laquelle des propriétés Motion en tant que signaux pour
les faire changer de manière réactive :

```tsx
const [bg, setBg] = createSignal('red');

return (
  <Motion.button
    onClick={() => setBg('blue')}
    animate={{ backgroundColor: bg() }}
    transition={{ duration: 3 }}
  >
    Click Me
  </Motion.button>
);
```

Le résultat est un bouton qui commence en rouge et, lorsqu'il est pressé,
passe au bleu. `animate` n'accepte pas de fonction d'accès. Pour les
propriétés réactives, placez simplement les signaux dans l'objet de manière
similaire à l'utilisation de la prop style.

## Keyframes

Les valeurs peuvent également être définies sous forme de tableaux, pour
définir une série de keyframes.

```tsx
<Motion animate={{ x: [0, 100, 50] }} />
```

Par défaut, les keyframes sont espacées uniformément tout au long de
`duration`, mais cela peut être ajusté en fournissant des valeurs de
progression à `offset` :

```tsx
<Motion
  animate={{ x: [0, 100, 50] }}
  transition={{ x: { offset: [0, 0.25, 1] } }}
/>
```

## Animations d'entrée

Les éléments s'animeront automatiquement vers les valeurs définies dans
`animate` lorsqu'ils sont créés.

Cela peut être désactivé en définissant la prop `initial` sur `false`. Les
styles définis dans `animate` seront appliqués immédiatement lors de la
première création de l'élément.

```tsx
<Motion initial={false} animate={{ x: 100 }} />
```

## Animations de sortie

Lorsqu'un élément est supprimé avec `<Show>`, il peut être animé à la
sortie avec le composant `Presence` et la prop `exit` :

```tsx
import { createSignal, Show } from 'solid-js';
import { Motion, Presence } from 'solid-motionone';

function App() {
  const [isShown, setShow] = createSignal(true);

  return (
    <div>
      <Presence exitBeforeEnter>
        <Show when={isShown()}>
          <Motion
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.3 }}
          />
        </Show>
      </Presence>
      <button onClick={() => setShow(p => !p)}>Toggle</button>
    </div>
  );
}
```

`exit` peut recevoir sa propre `transition`, qui remplace la `transition`
du composant :

```tsx
<Presence>
  <Show when={isShown()}>
    <Motion
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
    />
  </Show>
</Presence>
```

## Composants et API

### Motion Component

Le composant `Motion` accepte les props suivantes :

- **`animate`** : Objet définissant les valeurs d'animation cibles
- **`initial`** : État initial de l'animation (peut être `false` pour
  désactiver l'animation d'entrée)
- **`exit`** : Animation à jouer lors de la suppression de l'élément
- **`transition`** : Options de transition pour contrôler la durée,
  l'easing, etc.
- **`tag`** : Type d'élément HTML/SVG à rendre (par défaut `"div"`)

### Presence Component

Le composant `Presence` permet de gérer les animations de sortie :

- **`exitBeforeEnter`** : Attend que l'élément sortant termine son
  animation avant de monter le suivant

## Propriétés animables

Solid MotionOne peut animer :

- **Transformations** : `x`, `y`, `scale`, `rotate`, `skew`, etc.
- **Styles CSS** : `opacity`, `backgroundColor`, `color`, etc.
- **Attributs SVG** : `strokeDashoffset`, `fill`, etc.

## Options de transition

Les options de transition disponibles incluent :

- **`duration`** : Durée de l'animation en secondes
- **`easing`** : Fonction d'easing (`"ease-in"`, `"ease-out"`,
  `"ease-in-out"`, `"linear"`, etc.)
- **`delay`** : Délai avant le début de l'animation
- **`offset`** : Pour les keyframes, définit la progression de chaque
  valeur
- **`repeat`** : Nombre de répétitions de l'animation
- **`direction`** : Direction de l'animation (`"normal"`, `"reverse"`,
  `"alternate"`)

## Ressources

- **Dépôt GitHub** :
  [solidjs-community/solid-motionone](https://github.com/solidjs-community/solid-motionone)
- **NPM** :
  [solid-motionone](https://www.npmjs.com/package/solid-motionone)
- **Motion One** : [motion.dev](https://motion.dev/)
- **Licence** : MIT
- **Version** : 1.0.0 (dernière version)

## Contributeurs

- [@thetarnav](https://github.com/thetarnav)
- [@FlatMapIO](https://github.com/FlatMapIO)
- [@davedbase](https://github.com/davedbase)
- [@ivancuric](https://github.com/ivancuric)
- [@andi23rosca](https://github.com/andi23rosca)

## Topics

- Animation
- WAAPI (Web Animations API)
- SolidJS
