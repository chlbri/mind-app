# SolidJS

## Vue d'ensemble

SolidJS est une bibliothèque JavaScript réactive et performante pour
construire des interfaces utilisateur. Elle se distingue par son approche
unique de la réactivité basée sur les signaux et les effets, offrant des
performances exceptionnelles sans Virtual DOM.

## Caractéristiques principales

### Réactivité basée sur les signaux

- **Signaux** : Variables réactives qui déclenchent automatiquement les
  mises à jour des composants dépendants
- **Effets** : Fonctions qui s'exécutent automatiquement lorsque leurs
  dépendances changent
- **Mémos** : Valeurs calculées qui se mettent à jour uniquement lorsque
  leurs dépendances changent

### Performance exceptionnelle

- Pas de Virtual DOM - manipulation directe du DOM
- Mise à jour granulaire - seulement les parties qui changent sont
  re-rendues
- Bundle size minimal (~7KB gzippé)

### Syntaxe familière

- Syntaxe JSX similaire à React
- Hooks-like avec `createSignal`, `createEffect`, `createMemo`
- Composants fonctionnels

## Exemples d'utilisation

### Signaux de base

```tsx
import { createSignal } from 'solid-js';

function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <button onClick={() => setCount(count() + 1)}>Count: {count()}</button>
  );
}
```

### Effets

```tsx
import { createSignal, createEffect } from 'solid-js';

function Timer() {
  const [time, setTime] = createSignal(0);

  createEffect(() => {
    console.log('Time changed:', time());
  });

  setInterval(() => setTime(time() + 1), 1000);

  return <div>Time: {time()}</div>;
}
```

### Gestion d'état complexe

```tsx
import { createStore } from 'solid-js/store';

function TodoApp() {
  const [todos, setTodos] = createStore([]);

  const addTodo = text => {
    setTodos([...todos, { text, completed: false }]);
  };

  return <div>{/* Interface utilisateur */}</div>;
}
```

## Avantages

1. **Performance** : Plus rapide que React, Vue, et Angular dans la plupart
   des benchmarks
2. **Simplicité** : Moins de concepts à apprendre que d'autres frameworks
3. **Flexibilité** : Pas d'opinions fortes sur l'architecture
4. **TypeScript** : Support TypeScript de première classe
5. **SSR** : Support du Server-Side Rendering avec Solid Start

## Cas d'usage

- Applications web performantes
- Interfaces utilisateur complexes
- Applications en temps réel
- Jeux web
- Applications d'entreprise à grande échelle

## Écosystème

- **Solid Start** : Framework full-stack basé sur SolidJS
- **Solid Router** : Routage pour applications SolidJS
- **Solid Testing Library** : Utilitaires de test
- **Solid Primitives** : Collection d'utilitaires réutilisables

## Ressources

- [Documentation officielle](https://www.solidjs.com/docs)
- [Tutoriels](https://www.solidjs.com/tutorial)
- [Exemples](https://www.solidjs.com/examples)
- [GitHub](https://github.com/solidjs/solid)
