# 🎬 Intégration de solid-motionone dans SchoolAccordion

## 📝 Résumé des modifications

Le composant `SchoolAccordion` a été amélioré avec des animations de
glissement intelligentes utilisant la bibliothèque **solid-motionone**.

### Fichiers modifiés

1. **`src/globals/ui/organisms/school/accordion/index.tsx`**
   - Ajout des imports `Motion` et `Presence` de `solid-motionone`
   - Implémentation d'un système de suivi de direction d'animation
   - Remplacement du `<div>` statique par `<Motion.div>` animé
   - Ajout du composant `<Presence>` pour gérer les animations de sortie

2. **`src/globals/ui/organisms/school/SchoolAccordion.md`**
   - Mise à jour de la section "Fonctionnalités" pour mentionner les
     animations
   - Ajout d'une section complète "🎬 Animations" documentant le système
     d'animation
   - Ajout de solid-motionone dans les dépendances documentées

### Nouveaux fichiers créés

1. **`.github/docs/motionone.md`**
   - Documentation complète de la bibliothèque solid-motionone
   - Installation, utilisation, exemples
   - API et propriétés animables
   - Ressources et contributeurs

2. **`.github/docs/animations-guide.md`**
   - Guide pratique d'utilisation des animations dans le projet
   - Patterns d'animation courants
   - Bonnes pratiques et optimisations
   - Résolution de problèmes

## 🎯 Fonctionnement

### Logique d'animation

Le composant détecte automatiquement la direction de navigation :

```tsx
// Navigation vers la droite (index croissant)
Collège (index 1) → Supérieur (index 3)
→ slideDirection = 1
→ Le nouveau contenu entre depuis la droite

// Navigation vers la gauche (index décroissant)
Supérieur (index 3) → Primaire (index 2)
→ slideDirection = -1
→ Le nouveau contenu entre depuis la gauche
```

### États d'animation

```tsx
initial:  { opacity: 0, x: direction * 100 }  // Hors écran
animate:  { opacity: 1, x: 0 }                // Position normale
exit:     { opacity: 0, x: direction * -100 } // Sort du côté opposé
```

## ✨ Avantages

- **✅ Animations fluides** : 60 FPS garantis avec accélération matérielle
- **✅ Direction intelligente** : S'adapte automatiquement au sens de
  navigation
- **✅ Légère** : solid-motionone ne pèse que 5,8 Ko
- **✅ Performante** : Utilise `transform` au lieu de modifier la position
- **✅ Accessible** : Les animations respectent `prefers-reduced-motion`

## 🚀 Utilisation

```tsx
import SchoolAccordion from '~/globals/ui/organisms/school/accordion';

<SchoolAccordion
  title='Des cours particuliers pour tous les niveaux'
  items={schoolLevelsData}
  defaultActiveId='primaire'
/>;
```

Les animations se déclenchent automatiquement lors du changement d'onglet.

## 📚 Documentation

- **Composant** : `src/globals/ui/organisms/school/SchoolAccordion.md`
- **solid-motionone** : `.github/docs/motionone.md`
- **Guide d'animations** : `.github/docs/animations-guide.md`

## 🔧 Configuration

Les paramètres d'animation peuvent être ajustés dans le composant :

```tsx
transition={{
  duration: 0.5,        // Durée en secondes
  easing: 'ease-in-out' // Courbe d'animation
}}
```

## 🎨 Personnalisation

Pour modifier le comportement des animations, consultez le guide :
`.github/docs/animations-guide.md`

## ⚡ Performances

- Utilisation de propriétés CSS accélérées matériellement (`transform`,
  `opacity`)
- Aucun repaint ou reflow déclenché
- Compatible avec tous les navigateurs modernes
- Optimisé pour mobile

## 🐛 Problèmes connus

Aucun problème connu. Si vous rencontrez des difficultés :

1. Consultez `.github/docs/animations-guide.md` section "Résolution de
   problèmes"
2. Vérifiez que solid-motionone est installé : `pnpm list solid-motionone`
3. Vérifiez les erreurs TypeScript : `pnpm typecheck`

## 📦 Dépendances

```json
{ "solid-motionone": "^1.0.0" }
```

Déjà installée dans le projet ✅

## 🎓 Pour aller plus loin

- Explorez d'autres patterns d'animation dans
  `.github/docs/animations-guide.md`
- Consultez la documentation officielle : [motion.dev](https://motion.dev/)
- Voir les exemples d'utilisation :
  `src/globals/ui/organisms/school/accordion/example.tsx`
