# Konva.js - Documentation

## Qu'est-ce que Konva ?

Konva est un framework JavaScript HTML5 Canvas qui étend le contexte 2D en permettant l'interactivité du canvas pour les applications de bureau et mobiles.

Konva permet des animations haute performance, des transitions, l'imbrication de nœuds, la superposition de couches, le filtrage, la mise en cache, la gestion d'événements pour les applications de bureau et mobiles, et bien plus encore.

Vous pouvez dessiner des éléments sur la scène, leur ajouter des écouteurs d'événements, les déplacer, les redimensionner et les faire pivoter indépendamment des autres formes pour prendre en charge des animations haute performance, même si votre application utilise des milliers de formes.

## Installation

### Via npm

```bash
npm install konva
```

### Via CDN

```html
<script src="https://unpkg.com/konva@10/konva.min.js"></script>
```

### Import moderne (ES6+)

```typescript
import Konva from 'konva';
```

### Bundle minimal

Pour un bundle plus léger, vous pouvez importer uniquement ce dont vous avez besoin :

```typescript
import Konva from 'konva/lib/Core';
// Konva contient maintenant Stage, Layer, FastLayer, Group, Shape et quelques fonctions utilitaires

// Ajoutez uniquement les formes dont vous avez besoin
import { Rect } from 'konva/lib/shapes/Rect';
import { Circle } from 'konva/lib/shapes/Circle';

// Pour les filtres
import { Blur } from 'konva/lib/filters/Blur';
```

## Configuration TypeScript

Ajoutez les définitions DOM dans votre `tsconfig.json` :

```json
{
  "compilerOptions": {
    "lib": ["es6", "dom"]
  }
}
```

## Architecture

### Hiérarchie des nœuds

```
                   Stage
                     |
              +------+------+
              |             |
            Layer         Layer
              |             |
        +-----+-----+     Shape
        |           |
      Group       Group
        |           |
        +       +---+---+
        |       |       |
      Shape   Group    Shape
                |
              Shape
```

Tout commence avec `Konva.Stage` qui contient plusieurs couches utilisateur (`Konva.Layer`).

Chaque couche possède deux renderers `<canvas>` :
- **Scene renderer** : ce que vous voyez
- **Hit graph renderer** : un canvas caché spécial utilisé pour la détection d'événements haute performance

## Exemple minimal

```typescript
// Créer une scène
const stage = new Konva.Stage({
  container: 'container', // id du conteneur <div>
  width: 500,
  height: 500,
});

// Créer une couche
const layer = new Konva.Layer();

// Créer une forme
const circle = new Konva.Circle({
  x: stage.width() / 2,
  y: stage.height() / 2,
  radius: 70,
  fill: 'red',
  stroke: 'black',
  strokeWidth: 4,
});

// Ajouter la forme à la couche
layer.add(circle);

// Ajouter la couche à la scène
stage.add(layer);
```

## Formes de base

Konva.js supporte les formes suivantes :
- `Rect` - Rectangle
- `Circle` - Cercle
- `Ellipse` - Ellipse
- `Line` - Ligne
- `Polygon` - Polygone
- `Spline` - Spline
- `Blob` - Blob
- `Image` - Image
- `Text` - Texte
- `TextPath` - Texte sur chemin
- `Star` - Étoile
- `Label` - Label
- `Path` - Chemin SVG
- `RegularPolygon` - Polygone régulier

### Forme personnalisée

```typescript
const triangle = new Konva.Shape({
  sceneFunc: function (context, shape) {
    context.beginPath();
    context.moveTo(20, 50);
    context.lineTo(220, 80);
    context.quadraticCurveTo(150, 100, 260, 170);
    context.closePath();
    // Méthode spéciale Konva.js
    context.fillStrokeShape(shape);
  },
  fill: '#00D2FF',
  stroke: 'black',
  strokeWidth: 4,
});
```

## Styles

Chaque forme supporte les propriétés de style suivantes :

### Remplissage
- Couleur solide
- Dégradés
- Images

### Contour
- Couleur
- Largeur

### Ombre
- Couleur
- Décalage
- Opacité
- Flou

### Opacité

```typescript
const pentagon = new Konva.RegularPolygon({
  x: stage.width() / 2,
  y: stage.height() / 2,
  sides: 5,
  radius: 70,
  fill: 'red',
  stroke: 'black',
  strokeWidth: 4,
  shadowOffsetX: 20,
  shadowOffsetY: 25,
  shadowBlur: 40,
  opacity: 0.5,
});
```

## Gestion des événements

### Événements d'entrée utilisateur

Konva permet d'écouter facilement les événements d'entrée utilisateur :
- `click`, `dblclick`
- `mouseover`, `mouseout`, `mouseenter`, `mouseleave`
- `mousedown`, `mouseup`, `mousemove`
- `tap`, `dbltap`
- `touchstart`, `touchmove`, `touchend`
- `wheel`

### Événements de changement d'attributs

- `xChange`, `yChange`
- `scaleXChange`, `scaleYChange`
- `fillChange`
- etc.

### Événements de drag & drop

- `dragstart`
- `dragmove`
- `dragend`

### Exemple

```typescript
circle.on('mouseout touchend', function () {
  console.log('user input');
});

circle.on('xChange', function () {
  console.log('position change');
});

circle.on('dragend', function () {
  console.log('drag stopped');
});
```

## Drag and Drop

Konva a un support intégré pour le drag & drop.

```typescript
// Activer le drag
shape.draggable(true);

// Écouter les événements de drag
shape.on('dragstart', function () {
  console.log('Début du drag');
});

shape.on('dragmove', function () {
  console.log('En cours de drag');
});

shape.on('dragend', function () {
  console.log('Fin du drag');
});

// Limiter le mouvement
shape.dragBoundFunc(function (pos) {
  return {
    x: Math.max(0, Math.min(stage.width() - shape.width(), pos.x)),
    y: Math.max(0, Math.min(stage.height() - shape.height(), pos.y)),
  };
});
```

## Animations

### Avec Konva.Animation

```typescript
const anim = new Konva.Animation(function (frame) {
  const time = frame.time; // Temps total en ms
  const timeDiff = frame.timeDiff; // Différence depuis la dernière frame
  const frameRate = frame.frameRate; // FPS actuel

  // Mettre à jour les éléments
  circle.x(circle.x() + 1);
}, layer);

anim.start();

// Arrêter l'animation
anim.stop();
```

### Avec Konva.Tween

```typescript
const tween = new Konva.Tween({
  node: rect,
  duration: 1, // en secondes
  x: 140,
  rotation: Math.PI * 2,
  opacity: 1,
  strokeWidth: 6,
  easing: Konva.Easings.EaseInOut,
});

tween.play();

// Ou utiliser la méthode raccourcie
circle.to({
  duration: 1,
  fill: 'green',
  scaleX: 2,
  scaleY: 2,
  onFinish: () => {
    console.log('Animation terminée');
  },
});
```

### Easings disponibles

- `Linear`
- `EaseIn`, `EaseOut`, `EaseInOut`
- `BackEaseIn`, `BackEaseOut`, `BackEaseInOut`
- `ElasticEaseIn`, `ElasticEaseOut`, `ElasticEaseInOut`
- `BounceEaseIn`, `BounceEaseOut`, `BounceEaseInOut`
- `StrongEaseIn`, `StrongEaseOut`, `StrongEaseInOut`

## Sélecteurs

Konva permet de rechercher des éléments avec des sélecteurs :

```typescript
const circle = new Konva.Circle({
  radius: 10,
  fill: 'red',
  id: 'face',
  name: 'red circle',
});

layer.add(circle);

// Trouver par type
layer.find('Circle'); // Retourne un tableau de tous les cercles

// Trouver par ID
layer.findOne('#face');

// Trouver par nom (comme une classe CSS)
layer.find('.red');

// Combinaisons
stage.find('.red.circle');
```

## Filtres

Konva fournit plusieurs filtres prêts à l'emploi :
- `Blur` - Flou
- `Brighten` - Luminosité
- `Grayscale` - Niveaux de gris
- `HSL` - Teinte, Saturation, Luminosité
- `Invert` - Inverser les couleurs
- `Kaleidoscope` - Kaléidoscope
- `Noise` - Bruit
- `Pixelate` - Pixeliser
- `Posterize` - Postériser
- `RGB` - Ajustement RGB
- `RGBA` - Ajustement RGBA
- `Sepia` - Sépia
- `Threshold` - Seuil

### Exemple

```typescript
import { Blur } from 'konva/lib/filters/Blur';

image.cache();
image.filters([Blur]);
image.blurRadius(10);
layer.batchDraw();
```

## Sérialisation et Désérialisation

### Exporter en JSON

```typescript
const json = stage.toJSON();
// Sauvegarder sur le serveur ou dans le localStorage
localStorage.setItem('stage', json);
```

### Importer depuis JSON

```typescript
const json = localStorage.getItem('stage');
const stage = Konva.Node.create(json, 'container');
```

## Optimisation des performances

### 1. Mise en cache (Caching)

La mise en cache permet de dessiner un élément dans un canvas tampon, puis de dessiner cet élément depuis le canvas. Cela peut améliorer considérablement les performances pour les nœuds complexes.

```typescript
// Activer le cache
shape.cache();

// Désactiver le cache
shape.clearCache();

// Mettre à jour le cache après modification
shape.cache();
layer.batchDraw();
```

### 2. Utilisation de couches (Layering)

Séparez votre contenu en plusieurs couches. Par exemple, un arrière-plan complexe sur une couche et des formes animées sur une autre.

```typescript
const backgroundLayer = new Konva.Layer();
const animationLayer = new Konva.Layer();

// Ajouter l'arrière-plan à sa couche
backgroundLayer.add(background);

// Ajouter les éléments animés à leur couche
animationLayer.add(movingShape);

// Lors de l'animation, redessiner uniquement la couche d'animation
animationLayer.batchDraw();
```

### 3. Batch Drawing

Utilisez `batchDraw()` au lieu de `draw()` pour les mises à jour multiples.

```typescript
// Mauvais - redessine après chaque changement
shape.x(100);
layer.draw();
shape.y(100);
layer.draw();

// Bon - redessine une seule fois
shape.x(100);
shape.y(100);
layer.batchDraw();
```

### 4. FastLayer

Pour un contenu statique, utilisez `FastLayer` qui est plus rapide mais ne supporte pas les événements.

```typescript
const fastLayer = new Konva.FastLayer();
fastLayer.add(staticShape);
stage.add(fastLayer);
```

### 5. Désactiver les propriétés inutilisées

```typescript
// Désactiver le shadowForStrokeEnabled si non utilisé
shape.shadowForStrokeEnabled(false);

// Désactiver le perfectDrawEnabled pour les formes simples
shape.perfectDrawEnabled(false);
```

## Détection de collision

```typescript
function isCollision(r1, r2) {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
}

const rect1 = layer.findOne('#rect1');
const rect2 = layer.findOne('#rect2');

if (isCollision(rect1, rect2)) {
  console.log('Collision détectée !');
}
```

## Intégration avec React

Pour utiliser Konva avec React, utilisez `react-konva` :

```bash
npm install react-konva konva
```

```tsx
import { Stage, Layer, Rect, Circle } from 'react-konva';

function App() {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Rect
          x={20}
          y={20}
          width={100}
          height={100}
          fill="red"
          shadowBlur={5}
        />
        <Circle x={200} y={200} radius={50} fill="green" />
      </Layer>
    </Stage>
  );
}
```

## Intégration avec SolidJS

Pour utiliser Konva avec SolidJS, utilisez `solid-konva` :

```bash
npm install solid-konva konva
```

```tsx
import { Stage, Layer, Rect, Circle } from 'solid-konva';

function App() {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Rect
          config={{
            x: 20,
            y: 20,
            width: 100,
            height: 100,
            fill: 'red',
            shadowBlur: 5,
          }}
        />
        <Circle
          config={{
            x: 200,
            y: 200,
            radius: 50,
            fill: 'green',
          }}
        />
      </Layer>
    </Stage>
  );
}
```

## Environnement Node.js

Pour utiliser Konva dans un environnement Node.js, installez également `canvas` ou `skia-canvas` :

```bash
# Avec node-canvas
npm install konva canvas

# Ou avec skia-canvas
npm install konva skia-canvas
```

```typescript
import Konva from 'konva';
import 'konva/canvas-backend'; // ou 'konva/skia-backend'

const stage = new Konva.Stage({
  width: 500,
  height: 500,
});

// Ensuite, tout le code Konva habituel fonctionne
```

## Débogage

Pour voir les objets Konva et leurs détails dans Chrome DevTools, installez l'extension Konva DevTool :

https://github.com/konvajs/konva-devtool

## Ressources

- **Site officiel** : https://konvajs.org
- **Documentation** : https://konvajs.org/docs/
- **API Reference** : https://konvajs.org/api/
- **Demos** : https://konvajs.org/docs/sandbox.html
- **GitHub** : https://github.com/konvajs/konva
- **Discord** : https://discord.gg/8FqZwVT
- **Stack Overflow** : https://stackoverflow.com/questions/tagged/konva

## Cas d'usage

Konva est idéal pour :
- Éditeurs graphiques
- Outils de dessin
- Mindmaps interactifs
- Diagrammes et organigrammes
- Jeux 2D simples
- Visualisations de données interactives
- Applications de design
- Tableaux blancs collaboratifs
- Éditeurs d'images

## Licence

MIT

## Version actuelle

10.0.9 (au moment de la rédaction)

---

**Note** : Cette documentation est basée sur la version 10.x de Konva. Consultez toujours la documentation officielle pour les dernières mises à jour.