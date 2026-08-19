# Guide d'animation avec solid-motionone

Ce document explique comment utiliser solid-motionone dans le projet pour
créer des animations fluides et performantes.

## 📚 Documentation de référence

Voir le fichier [motionone.md](.github/docs/motionone.md) pour la
documentation complète de solid-motionone.

## 🎯 Cas d'usage : SchoolAccordion

Le composant `SchoolAccordion` utilise solid-motionone pour animer les
transitions entre les onglets avec un système de glissement intelligent.

### Implémentation

#### 1. Import des composants

```tsx
import { Motion, Presence } from 'solid-motionone';
```

#### 2. Logique de direction

```tsx
const [previousIndex, setPreviousIndex] = createSignal(0);

const activeIndex = () =>
  props.items.findIndex(item => item.id === activeTab());

// Calcule la direction du glissement
const slideDirection = createMemo(() => {
  const current = activeIndex();
  const previous = previousIndex();
  return current > previous ? 1 : -1; // 1 = droite, -1 = gauche
});

const handleTabChange = (itemId: string) => {
  setPreviousIndex(activeIndex()); // Sauvegarde l'index avant le changement
  setActiveTab(itemId);
};
```

#### 3. Animation du contenu

```tsx
<Presence exitBeforeEnter>
  <Show when={activeItem()}>
    {item => (
      <Motion.div
        initial={{
          opacity: 0,
          x: slideDirection() * 100, // Entre depuis la direction appropriée
        }}
        animate={{
          opacity: 1,
          x: 0, // Position finale
        }}
        exit={{
          opacity: 0,
          x: slideDirection() * -100, // Sort dans la direction opposée
        }}
        transition={{ duration: 0.5, easing: 'ease-in-out' }}
      >
        {/* Contenu de l'onglet */}
      </Motion.div>
    )}
  </Show>
</Presence>
```

### Résultat

- **Navigation vers la droite** (ex: Collège → Supérieur)
  - Le nouveau contenu entre depuis la droite (`x: 100 → 0`)
  - L'ancien contenu sort vers la gauche (`x: 0 → -100`)

- **Navigation vers la gauche** (ex: Supérieur → Primaire)
  - Le nouveau contenu entre depuis la gauche (`x: -100 → 0`)
  - L'ancien contenu sort vers la droite (`x: 0 → 100`)

## 🎨 Patterns d'animation courants

### 1. Fade in/out simple

```tsx
<Motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  Contenu
</Motion.div>
```

### 2. Slide from bottom

```tsx
<Motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, easing: 'ease-out' }}
>
  Contenu
</Motion.div>
```

### 3. Scale in

```tsx
<Motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.3 }}
>
  Contenu
</Motion.div>
```

### 4. Animations séquencées (stagger)

```tsx
<For each={items()}>
  {(item, index) => (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index() * 0.1, // Délai croissant
      }}
    >
      {item.title}
    </Motion.div>
  )}
</For>
```

### 5. Animation avec réactivité SolidJS

```tsx
const [isExpanded, setIsExpanded] = createSignal(false);

<Motion.div
  animate={{
    height: isExpanded() ? 'auto' : 0,
    opacity: isExpanded() ? 1 : 0,
  }}
  transition={{ duration: 0.3 }}
>
  Contenu extensible
</Motion.div>;
```

## 🔧 Bonnes pratiques

### 1. Utiliser Presence pour les animations de sortie

```tsx
// ✅ Bon
<Presence>
  <Show when={isVisible()}>
    <Motion.div exit={{ opacity: 0 }}>Contenu</Motion.div>
  </Show>
</Presence>

// ❌ Mauvais (l'animation de sortie ne fonctionnera pas)
<Show when={isVisible()}>
  <Motion.div exit={{ opacity: 0 }}>Contenu</Motion.div>
</Show>
```

### 2. Utiliser exitBeforeEnter pour les transitions propres

```tsx
<Presence exitBeforeEnter>
  {/* Attend la fin de l'animation de sortie avant d'animer l'entrée */}
</Presence>
```

### 3. Privilégier les propriétés accélérées matériellement

```tsx
// ✅ Performant (utilise transform)
<Motion.div animate={{ x: 100, y: 50, scale: 1.2 }} />

// ⚠️ Moins performant (déclenche des reflows)
<Motion.div animate={{ width: '100px', height: '50px' }} />
```

### 4. Utiliser des mémos pour les calculs complexes

```tsx
const animationDirection = createMemo(() => {
  // Calcul complexe de la direction
  return calculateDirection();
});

<Motion.div
  initial={{ x: animationDirection() * 100 }}
  animate={{ x: 0 }}
/>;
```

## 📊 Performances

### Propriétés optimisées

Ces propriétés utilisent l'accélération matérielle :

- `x`, `y`, `z` (translateX, translateY, translateZ)
- `scale`, `scaleX`, `scaleY`
- `rotate`, `rotateX`, `rotateY`, `rotateZ`
- `opacity`

### Propriétés à éviter en animation

Ces propriétés peuvent causer des problèmes de performance :

- `width`, `height` (préférer `scale`)
- `top`, `left`, `right`, `bottom` (préférer `x`, `y`)
- `margin`, `padding`

## 🎓 Ressources

- **Documentation solid-motionone** :
  [motionone.md](.github/docs/motionone.md)
- **Motion One officiel** : [motion.dev](https://motion.dev/)
- **Exemples dans le projet** :
  `src/globals/ui/organisms/school/accordion/`

## 🐛 Résolution de problèmes

### L'animation de sortie ne fonctionne pas

**Solution** : Envelopper dans un composant `Presence`

```tsx
<Presence>
  <Show when={condition()}>
    <Motion.div exit={{ opacity: 0 }}>...</Motion.div>
  </Show>
</Presence>
```

### L'animation est saccadée

**Solution** : Utiliser des propriétés accélérées matériellement

```tsx
// ❌ Saccadé
<Motion.div animate={{ left: '100px' }} />

// ✅ Fluide
<Motion.div animate={{ x: 100 }} />
```

### Les animations ne se déclenchent pas

**Solution** : Vérifier que les valeurs initiales sont différentes des
valeurs finales

```tsx
// ❌ Pas d'animation (même valeur)
<Motion.div initial={{ opacity: 1 }} animate={{ opacity: 1 }} />

// ✅ Animation visible
<Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
```
