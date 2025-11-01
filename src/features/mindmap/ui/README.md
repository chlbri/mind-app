# 🗺️ Mindmap UI - Guide Complet

Interface utilisateur interactive pour la visualisation et manipulation de
cartes mentales (mindmaps) avec rendu Canvas 2D.

---

## 📋 Table des Matières

1. [Vue d'ensemble](#-vue-densemble)
2. [Démarrage Rapide](#-démarrage-rapide)
3. [Fonctionnalités](#-fonctionnalités)
4. [Guide Visuel](#-guide-visuel)
5. [Architecture](#-architecture)
6. [API](#-api)
7. [Performances](#-performances)
8. [Contrôles](#-contrôles)
9. [Débogage](#-débogage)
10. [Prochaines Étapes](#-prochaines-étapes)

---

## 🎯 Vue d'ensemble

Cette interface offre une expérience complète de mindmap avec :

- ✅ **Expand/Collapse** : Replier/déplier les branches
- ✅ **Édition inline** : Double-clic pour modifier
- ✅ **Drag & Drop** : Déplacer les nœuds librement
- ✅ **Pan du canvas** : Naviguer sur toute la carte
- ✅ **Animations fluides** : 60 FPS avec Canvas 2D
- ✅ **Effets visuels** : Glow, ripple, hover
- ✅ **Zoom & Pan** : Navigation intuitive
- ✅ **Mode Focus** : Concentration sur une partie

Inspiré de logiciels professionnels comme **MindNode**.

---

## 🚀 Démarrage Rapide

### Installation

```bash
pnpm install
```

### Utilisation

```tsx
import { Element, Link } from '~/features/mindmap/ui/components';
import { renderCanvas2D } from '~/features/mindmap/ui/components/examples';

// Créer des éléments
const element = Element({
  element: {
    id: 'node-1',
    title: 'Mon nœud',
    x: 100,
    y: 100,
    width: 120,
    height: 60,
    // ...autres props
  },
  onClick: id => console.log('Clicked:', id),
  onDoubleClick: id => console.log('Edit:', id),
});

// Rendu sur canvas
const canvas = document.querySelector('canvas');
renderCanvas2D(canvas, [element], []);
```

### Démo Live

Visitez `/mindmap-demo` pour voir la démo interactive complète.

---

## ✨ Fonctionnalités

### 1. **Expand/Collapse (Replier/Déplier)**

Gérez la complexité visuelle en repliant les branches.

**Indicateurs visuels** :

- 🟢 Cercle **vert** avec `-` = Déplié (enfants visibles)
- 🔴 Cercle **rouge** avec `+` = Replié (enfants cachés)

**Interaction** :

- **Clic sur le bouton** : Bascule l'état
- **Clic sur le nœud** : Sélection
- **Animation fluide** : Transition en 300ms

**Contrôles** :

- Bouton "Tout déplier" : Affiche tout
- Bouton "Tout replier" : Cache tous les enfants

```tsx
// Exemple d'utilisation
<button onClick={() => setCollapsedNodes(new Set())}>Tout déplier</button>
```

---

### 2. **Édition Inline**

Modifiez les titres directement dans le canvas.

**Comment** :

1. **Double-cliquez** sur un nœud
2. Un champ d'édition apparaît
3. Tapez le nouveau titre
4. **Entrée** pour valider, **Échap** pour annuler

**Fonctionnalités** :

- ✅ Input positionné au curseur
- ✅ Focus automatique
- ✅ Validation en temps réel
- ✅ Indicateur visuel pendant l'édition

---

### 3. **Effets Visuels**

#### Survol (Hover) 🎯

- Bordure pointillée bleue
- Pulsation des boutons expand/collapse
- Curseur `pointer` sur les zones interactives

#### Sélection (Glow) 💡

- Lueur animée autour du nœud
- Intensité variable (effet "respiratoire")
- Bordure bleue #3B82F6
- Affichage de l'ID sélectionné

#### Ripple au Clic 🌊

- Onde de propagation depuis le point de clic
- Durée : 600ms
- Multiples ripples simultanés
- Easing cubique pour fluidité

#### Mode Focus 🔍

- Assombrit le reste de la carte
- Idéal pour présentations
- Activation via checkbox

---

### 4. **Navigation**

#### Zoom 🔎

- **Molette souris** : Zoom in/out
- **Slider** : Contrôle précis (50% - 300%)
- Affichage du pourcentage
- Calcul correct des coordonnées de clic

#### Détection de Clic Précise

Le système corrige automatiquement :

- Le ratio canvas/display
- Le niveau de zoom
- La position de scroll

```tsx
// Calcul des coordonnées
const scaleX = canvas.width / rect.width;
const scaleY = canvas.height / rect.height;
const x = ((event.clientX - rect.left) * scaleX) / zoom();
const y = ((event.clientY - rect.top) * scaleY) / zoom();
```

---

### 5. **Types de Courbes**

Personnalisez l'apparence des liens :

- **Cubique** (défaut) : Courbes de Bézier cubiques
- **Quadratique** : Courbes de Bézier quadratiques

Application immédiate via dropdown.

---

### 6. **Drag & Drop et Pan**

#### Drag & Drop des Éléments 🎯

Déplacez librement les nœuds sur le canvas.

**Comment** :

1. **Cliquez** sur un nœud
2. **Maintenez** le bouton enfoncé
3. **Déplacez** la souris
4. **Relâchez** pour finaliser

**États réactifs** :

```typescript
const [draggedElementId, setDraggedElementId] = createSignal<
  string | null
>(null);
const [dragOffset, setDragOffset] = createSignal({ x: 0, y: 0 });
```

#### Pan du Canvas 🗺️

Naviguez sur toute la carte mentale.

**Comment** :

1. **Cliquez** sur le fond (pas sur un élément)
2. **Maintenez** et **déplacez** pour naviguer
3. **Relâchez** pour arrêter

**États réactifs** :

```typescript
const [isPanning, setIsPanning] = createSignal(false);
const [panOffset, setPanOffset] = createSignal({ x: 0, y: 0 });
const [panStart, setPanStart] = createSignal({ x: 0, y: 0 });
```

#### Système de Coordonnées

Les coordonnées passent par plusieurs transformations :

**1. Écran → Canvas** :

```typescript
const scaleX = canvas.width / rect.width;
const scaleY = canvas.height / rect.height;
const canvasX = (screenX - rect.left) * scaleX;
const canvasY = (screenY - rect.top) * scaleY;
```

**2. Canvas → Monde (avec pan et zoom)** :

```typescript
const worldX = (canvasX - panOffset.x) / zoom();
const worldY = (canvasY - panOffset.y) / zoom();
```

**Application au rendu** :

```typescript
ctx.save();
const pan = panOffset();
ctx.translate(pan.x, pan.y); // Appliquer le pan
ctx.scale(zoom(), zoom()); // Appliquer le zoom
// ... rendu des éléments et liens
ctx.restore();
```

#### Gestionnaires d'Événements

**`handleMouseDown`** : Détermine si l'utilisateur commence à déplacer un
élément ou le canvas

```typescript
const handleMouseDown = (event: MouseEvent) => {
  const x = ((event.clientX - rect.left) * scaleX - pan.x) / zoom();
  const y = ((event.clientY - rect.top) * scaleY - pan.y) / zoom();

  // Vérifier si clic sur un élément
  for (const elemComp of elemComps) {
    if (elemComp.utils.isPointInside(x, y)) {
      setDraggedElementId(elemComp.element.id);
      setDragOffset({
        x: x - elemComp.element.x,
        y: y - elemComp.element.y,
      });
      return;
    }
  }

  // Sinon, commencer le pan
  setIsPanning(true);
  setPanStart({ x: event.clientX - pan.x, y: event.clientY - pan.y });
};
```

**`handleMouseMove`** : Met à jour la position de l'élément ou du canvas

```typescript
const handleMouseMove = (event: MouseEvent) => {
  if (draggedElementId()) {
    const offset = dragOffset();
    const newX = x - offset.x;
    const newY = y - offset.y;
    setElements(prev =>
      prev.map(elem =>
        elem.id === draggedElementId()
          ? { ...elem, x: newX, y: newY }
          : elem,
      ),
    );
  } else if (isPanning()) {
    const start = panStart();
    setPanOffset({
      x: event.clientX - start.x,
      y: event.clientY - start.y,
    });
  }
};
```

**`handleMouseUp` / `handleMouseLeave`** : Terminent l'interaction

```typescript
const handleMouseUp = () => {
  setDraggedElementId(null);
  setIsPanning(false);
};
```

#### Gestion du Curseur

Le curseur change dynamiquement :

```typescript
if (draggedId || isPanning()) {
  canvasRef.style.cursor = 'grabbing'; // En cours de déplacement
} else if (hoveredElement) {
  canvasRef.style.cursor = 'grab'; // Survolant un élément
} else {
  canvasRef.style.cursor = 'grab'; // Par défaut
}
```

#### Compatibilité avec Autres Fonctionnalités

- ✅ **Collapse/Expand** : Vérifié avant le drag
- ✅ **Double-clic** : Prend en compte le pan offset
- ✅ **Détection de collision** : Optimisée (arrêt dès trouvaille)

#### Optimisations Appliquées

1. **Mise à jour réactive** : Seuls les éléments modifiés sont re-rendus
2. **Signal unique** : `setElements` avec map immutable
3. **Pas de re-render DOM** : Tout dans le canvas
4. **Détection optimisée** : Arrêt dès qu'un élément est trouvé

---

## 🎨 Guide Visuel

### États des Nœuds

```
┌─────────────────────────────────────────┐
│ NORMAL                                   │
│ ┌──────────────┐                         │
│ │  Phase 1     │                         │
│ └──────────────┘                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ SURVOLÉ (hover)                          │
│ ┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐                         │
│ ╎  Phase 1     ╎ ⟲ pulsation            │
│ └╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ SÉLECTIONNÉ                              │
│ ┏━━━━━━━━━━━━━━┓                         │
│ ┃  Phase 1     ┃ ✨ glow                │
│ ┗━━━━━━━━━━━━━━┛                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ AU CLIC                                  │
│ ┌──────────────┐   ◯                    │
│ │  Phase 1     │  ◯ ◯ ripple            │
│ └──────────────┘                         │
└─────────────────────────────────────────┘
```

### Indicateurs Expand/Collapse

```
DÉPLIÉ                    REPLIÉ
┌──────────┐  ⊖          ┌──────────┐  ⊕
│ Phase 1  │  │          │ Phase 1  │  │
└──────────┘  │          └──────────┘  │
     │        │               (2 cachés)
  ┌──┴──┐     │
  │     │     │
┌─▼─┐ ┌─▼─┐   │
│En1│ │En2│ Vert         Rouge
└───┘ └───┘   "-"        "+"
```

### Timeline des Animations

#### Ripple (600ms)

```
t=0ms    t=150ms  t=300ms  t=450ms  t=600ms
  ●         ◯        ○        ◦
100%      75%      50%      25%       0%
radius: 10px → 25px → 37px → 50px
```

#### Glow (continu)

```
Intensité
  20 ┤   ╱╲     ╱╲     ╱╲
  10 ┤  ╱  ╲   ╱  ╲   ╱  ╲
   0 ┴─┴────┴──┴────┴──┴───→ temps
      0s    0.5s   1.0s
```

### Palette de Couleurs

```
Sélection (Focus)
├─ Bordure: #3B82F6 (blue-500)
├─ Glow:    #3B82F6 avec blur variable
└─ Badge:   #DBEAFE (blue-50)

Survol (Hover)
├─ Bordure: #60A5FA (blue-400)
└─ Dash:    [5, 5]

États
├─ Replié:  #EF4444 (red-500) avec "+"
├─ Déplié:  #10B981 (green-500) avec "-"
└─ Édition: #FFF7ED (orange-50)
```

---

## 🏗️ Architecture

### Structure des Fichiers

```
src/features/mindmap/ui/
├── README.md                    # Ce fichier
├── animations.ts                # Système d'animations
├── components/
│   ├── Element/
│   │   ├── Element.ts          # Composant nœud
│   │   └── index.ts
│   ├── Link/
│   │   ├── Link.ts             # Composant lien
│   │   └── index.ts
│   ├── examples.ts             # Helpers de rendu
│   ├── index.ts
│   └── README.md
└── signals/                    # Signals réactifs (prévu)
```

### Système d'Animations

Le fichier `animations.ts` fournit :

#### Fonctions d'Easing

```ts
easeInOutCubic(t: number): number
easeOutCubic(t: number): number
bounceIn(t: number): number
```

#### Effets Visuels

```ts
getPulseScale(time, frequency): number
getGlowIntensity(time, frequency): number
drawRipple(ctx, x, y, progress): void
```

#### Gestionnaires

```ts
class CollapseAnimationManager {
  start(id, isExpanding, duration = 300);
  getScale(id): number;
  getOpacity(id): number;
  isAnimating(id): boolean;
}

class TransitionManager {
  start(id, startValue, endValue, duration, easing);
  getValue(id): number | null;
  isAnimating(id): boolean;
  cancel(id);
}
```

### Boucle de Rendu

```tsx
const animate = () => {
  // 1. Nettoyer le canvas
  ctx.fillRect(0, 0, width, height);

  // 2. Appliquer zoom/pan
  ctx.scale(zoom(), zoom());

  // 3. Rendu de base
  renderCanvas2D(canvas, elements, links);

  // 4. Effets spéciaux
  drawRipples();
  drawExpandIndicators();

  // 5. États visuels
  drawSelection();
  drawHover();

  // 6. Frame suivante
  requestAnimationFrame(animate);
};
```

### Gestion d'État (SolidJS Signals)

```tsx
const [selectedId, setSelectedId] = createSignal<string | null>(null);
const [hoveredId, setHoveredId] = createSignal<string | null>(null);
const [collapsedNodes, setCollapsedNodes] = createSignal<Set<string>>(
  new Set(),
);
const [editingId, setEditingId] = createSignal<string | null>(null);
const [clickRipples, setClickRipples] = createSignal<Ripple[]>([]);
const [focusMode, setFocusMode] = createSignal(false);
const [zoom, setZoom] = createSignal(1);
const [elements, setElements] = createSignal([...DEMO_ELEMENTS]);
```

---

## 📚 API

### Component: Element

```tsx
interface ElementProps {
  element: InferOutput<typeof ElementSchema>;
  onClick?: (id: string) => void;
  onDoubleClick?: (id: string) => void;
  class?: string;
}

const elem = Element({
  element: {
    id: 'node-1',
    title: 'Mon nœud',
    x: 100,
    y: 100,
    width: 120,
    height: 60,
    fontFamily: 'Arial',
    fontWeight: 600,
    fontSize: 12,
    backgroundColor: '#4ECDC4',
    borderColor: '#1ABC9C',
    textColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 2,
    childrenIds: ['child-1', 'child-2'],
  },
  onClick: (id) => console.log('Clicked:', id),
});

// Utilités disponibles
elem.utils.isPointInside(x, y): boolean
```

### Component: Link

```tsx
interface LinkProps {
  link: InferOutput<typeof LinkSchema>;
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
  targetX: number;
  targetY: number;
  targetWidth: number;
  targetHeight: number;
  onClick?: (id: string) => void;
  onEditLabel?: (id: string) => void;
}

const link = Link({
  link: {
    id: 'link-1',
    sourceId: 'node-1',
    targetId: 'node-2',
    type: 'parent-child',
    color: '#6B7280',
    strokeWidth: 2.5,
    curvature: 60,
  },
  sourceX: 100,
  sourceY: 100,
  // ...positions
});

// Utilités
link.utils.getPath('cubic'): PathData
link.utils.isPointNearPath(x, y, tolerance): boolean
```

### Helpers de Rendu

```tsx
// Rendu Canvas 2D
renderCanvas2D(
  canvas: HTMLCanvasElement,
  elements: ElementComponent[],
  links: LinkComponent[]
): void

// Gestion des clics
handleCanvasClick(
  event: MouseEvent,
  canvas: HTMLCanvasElement,
  elements: ElementComponent[],
  links: LinkComponent[],
  onElementSelected: (id: string) => void,
  onLinkSelected: (id: string) => void
): void

// Gestion du survol
handleCanvasMouseMove(
  event: MouseEvent,
  canvas: HTMLCanvasElement,
  elements: ElementComponent[],
  links: LinkComponent[]
): void
```

---

## ⚡ Performances

### Optimisations Implémentées

✅ **RequestAnimationFrame** : Rendu synchronisé (60 FPS)  
✅ **Calcul correct des coords** : Prise en compte du scale et zoom  
✅ **Filtrage des éléments** : Seuls les visibles sont rendus  
✅ **Filtrage des liens** : Exclusion vers nœuds cachés  
✅ **Canvas 2D** : Hardware-accelerated  
✅ **Animations optimisées** : Easing pré-calculés

### Métriques

- **60 FPS** maintenu avec 15 nœuds et 15 liens
- **Animations fluides** grâce aux fonctions cubiques
- **Détection de clic précise** même avec zoom 300%
- **Mémoire stable** par réutilisation du contexte Canvas

### Futures Optimisations

🔜 **Spatial culling** : Ne rendre que le viewport  
🔜 **OffscreenCanvas** : Rendu en background  
🔜 **Virtualisation** : Pour 1000+ nœuds  
🔜 **WebGL** : Pour effets avancés  
🔜 **Snap to grid** : Alignement précis des nœuds  
🔜 **Mini-map** : Navigation rapide sur grandes cartes

---

## 🎮 Contrôles

| Action                     | Résultat                |
| -------------------------- | ----------------------- |
| **Clic sur bouton ⊕/⊖**    | Replier/déplier enfants |
| **Clic sur nœud**          | Sélectionner            |
| **Double-clic sur nœud**   | Éditer le titre         |
| **Drag sur nœud**          | Déplacer l'élément      |
| **Drag sur fond**          | Pan/navigation          |
| **Survol nœud**            | Bordure + pulsation     |
| **Molette souris**         | Zoom in/out             |
| **Checkbox Focus**         | Mode focus              |
| **Bouton "Réinitialiser"** | Reset zoom & pan        |

### Raccourcis Clavier (Édition)

| Touche     | Action            |
| ---------- | ----------------- |
| **Entrée** | Valider l'édition |
| **Échap**  | Annuler l'édition |

---

## 🐛 Débogage

### Problèmes Courants

#### ❌ Les clics ne fonctionnent pas

**Cause** : Mauvais calcul des coordonnées avec zoom

**Solution** :

```ts
const scaleX = canvas.width / rect.width;
const scaleY = canvas.height / rect.height;
const x = ((clientX - rect.left) * scaleX) / zoom();
const y = ((clientY - rect.top) * scaleY) / zoom();
```

#### ❌ Les boutons expand/collapse ne sont pas cliquables

**Cause** : Zone de détection trop petite

**Solution** :

```ts
const distance = Math.sqrt(
  Math.pow(x - indicatorX, 2) + Math.pow(y - indicatorY, 2),
);
if (distance <= radius + 5) {
  // Marge de 5px
  // Clic sur bouton
}
```

#### ❌ L'édition ne fonctionne pas

**Cause** : Event listener mal configuré

**Solution** :

```ts
canvas.addEventListener('dblclick', handleDoubleClick);
// N'oubliez pas le cleanup!
onCleanup(() => {
  canvas.removeEventListener('dblclick', handleDoubleClick);
});
```

#### ❌ Le drag ne fonctionne pas correctement

**Cause** : Mauvais calcul de l'offset avec zoom et pan

**Solution** :

```ts
// Dans handleMouseDown
const x = ((event.clientX - rect.left) * scaleX - pan.x) / zoom();
const y = ((event.clientY - rect.top) * scaleY - pan.y) / zoom();
setDragOffset({ x: x - element.x, y: y - element.y });
```

#### ❌ Le pan interfère avec le drag

**Cause** : Priorité mal gérée dans handleMouseDown

**Solution** :

```ts
// Toujours vérifier les éléments AVANT de commencer le pan
for (const elemComp of elemComps) {
  if (elemComp.utils.isPointInside(x, y)) {
    setDraggedElementId(elemComp.element.id);
    return; // Important: sortir avant le pan
  }
}
setIsPanning(true); // Seulement si aucun élément cliqué
```

---

## 🚀 Prochaines Étapes

### Court Terme

- [x] Drag & Drop des nœuds
- [x] Pan du canvas
- [ ] Animation smooth du collapse
- [ ] Undo/Redo

### Moyen Terme

- [ ] Tags visuels colorés
- [ ] Notes extensibles
- [ ] Connexions croisées
- [ ] Raccourcis clavier
- [ ] Export PNG/SVG

### Long Terme

- [ ] Auto-layout intelligent
- [ ] Thèmes personnalisables
- [ ] Mode 3D (Three.js)
- [ ] Collaboration temps réel
- [ ] Mobile support

---

## 📖 Ressources

- [MindNode Features](https://mindnode.com/features) - Inspiration
- [Canvas API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Bézier Curves](https://en.wikipedia.org/wiki/Bézier_curve)
- [Easing Functions](https://easings.net/)
- [SolidJS](https://www.solidjs.com/) - Framework réactif

---

## 📄 Licence

Ce projet fait partie de `mind-app`. Voir LICENSE à la racine.

---

## 🤝 Contribution

1. Suivez les [instructions de commit](.github/copilot-instructions.md)
2. Utilisez `pnpm run lint` avant de commit
3. Documentez les nouvelles fonctionnalités
4. Ajoutez des tests si possible

---

**Dernière mise à jour** : 1 novembre 2025  
**Auteur** : chlbri (bri_lvi@icloud.com)
