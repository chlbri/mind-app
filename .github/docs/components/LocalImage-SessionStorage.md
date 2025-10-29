# LocalImage Component - Version avec Cache SessionStorage

## Description

`LocalImage` est un composant SolidJS type-safe pour afficher des images
d'assets locaux (dossier `public`) avec un système de cache intelligent
utilisant sessionStorage et base64.

## Fonctionnalités

- ✅ **Type-safe** : Accepte uniquement les chemins `AssetPath` valides
- ✅ **Cache sessionStorage** : Stocke les images en base64 pour éviter les
  rechargements
- ✅ **Conversion automatique** : Convertit les images en base64 lors du
  premier chargement
- ✅ **Gestion des états** : Affiche des fallbacks pendant le chargement et
  en cas d'erreur
- ✅ **Optimisation mémoire** : Gère les erreurs de quota exceeded de
  sessionStorage
- ✅ **Props natives** : Supporte tous les attributs HTML de `<img>`
- ✅ **Accessibilité** : Gère les attributs ARIA appropriés
- ✅ **TypeScript strict** : Entièrement typé

## Comment ça marche ?

```
1. Montage du composant
   ↓
2. Vérifier sessionStorage (clé: `img-cache:${src}`)
   ↓
   ├─ Image trouvée → Afficher immédiatement (cached)
   │
   └─ Image non trouvée
      ↓
      3. Charger l'image depuis le serveur
      ↓
      4. Convertir en base64 via Canvas API
      ↓
      5. Stocker dans sessionStorage
      ↓
      6. Afficher l'image
```

## API

### Props

| Prop            | Type                    | Requis | Description                                         |
| --------------- | ----------------------- | ------ | --------------------------------------------------- |
| `src`           | `AssetPath`             | ✅     | Chemin de l'asset (type-safe)                       |
| `alt`           | `string`                | ✅     | Texte alternatif (accessibilité)                    |
| `disableCache`  | `boolean`               | ❌     | Désactive le cache sessionStorage (défaut: `false`) |
| `fallback`      | `Component`             | ❌     | Composant affiché pendant le chargement             |
| `errorFallback` | `Component`             | ❌     | Composant affiché en cas d'erreur                   |
| `class`         | `string`                | ❌     | Classes CSS pour l'élément `<img>`                  |
| `...imgProps`   | `JSX.ImgHTMLAttributes` | ❌     | Tous les autres props natifs de `<img>`             |

## Exemples d'utilisation

### Utilisation basique

```tsx
import { LocalImage } from '~ui/atoms';
import { ASSETS } from '~types';

function Logo() {
  return (
    <LocalImage
      src={ASSETS.img.logo}
      alt="Logo de l'école"
      class='w-32 h-32'
    />
  );
}
```

### Avec fallbacks personnalisés

```tsx
import { LocalImage } from '~ui/atoms';
import { ASSETS } from '~types';

function HeroImage() {
  return (
    <LocalImage
      src={ASSETS.img.building}
      alt="Bâtiment de l'école"
      class='w-full h-96 object-cover rounded-lg'
      fallback={() => (
        <div class='w-full h-96 animate-pulse bg-gradient-to-r from-blue-200 to-blue-300 rounded-lg' />
      )}
      errorFallback={() => (
        <div class='w-full h-96 bg-red-50 flex items-center justify-center rounded-lg'>
          <span class='text-red-500 text-sm font-medium'>
            Impossible de charger l'image
          </span>
        </div>
      )}
    />
  );
}
```

### Désactiver le cache

```tsx
import { LocalImage } from '~ui/atoms';
import { ASSETS } from '~types';

function DynamicImage() {
  return (
    <LocalImage
      src={ASSETS.img.blueprint}
      alt='Plan architectural'
      class='w-full h-auto'
      disableCache={true} // Ne stocke pas dans sessionStorage
    />
  );
}
```

### Galerie d'images

```tsx
import { For } from 'solid-js';
import { LocalImage } from '~ui/atoms';
import { ASSETS } from '~types';

function ImageGallery() {
  const images = [
    {
      src: ASSETS.img['Accordion horizontal']['Onglet 1'],
      alt: 'Onglet 1',
    },
    {
      src: ASSETS.img['Accordion horizontal']['Onglet 2'],
      alt: 'Onglet 2',
    },
    {
      src: ASSETS.img['Accordion horizontal']['Onglet 3'],
      alt: 'Onglet 3',
    },
    {
      src: ASSETS.img['Accordion horizontal']['Onglet 4'],
      alt: 'Onglet 4',
    },
    {
      src: ASSETS.img['Accordion horizontal']['Onglet 5'],
      alt: 'Onglet 5',
    },
  ];

  return (
    <div class='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
      <For each={images}>
        {image => (
          <LocalImage
            src={image.src}
            alt={image.alt}
            class='w-full h-48 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer'
            fallback={() => (
              <div class='w-full h-48 bg-gray-200 rounded-lg animate-pulse' />
            )}
          />
        )}
      </For>
    </div>
  );
}
```

### Image responsive avec lazy loading

```tsx
import { LocalImage } from '~ui/atoms';
import { ASSETS } from '~types';

function ResponsiveHero() {
  return (
    <div class='relative w-full'>
      <LocalImage
        src={ASSETS.img['logo-texte.png']}
        alt='Logo avec texte'
        class='w-full h-auto max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto'
        loading='lazy'
        decoding='async'
      />
    </div>
  );
}
```

### Avec gestion d'événements

```tsx
import { createSignal } from 'solid-js';
import { LocalImage } from '~ui/atoms';
import { ASSETS } from '~types';

function InteractiveImage() {
  const [isZoomed, setIsZoomed] = createSignal(false);

  return (
    <div class='relative'>
      <LocalImage
        src={ASSETS.img.building}
        alt='Bâtiment'
        class={cn(
          'w-full h-auto transition-transform duration-300 cursor-pointer',
          isZoomed() && 'scale-150',
        )}
        onClick={() => setIsZoomed(!isZoomed())}
      />
    </div>
  );
}
```

## Avantages du cache sessionStorage

### Performance

```
Premier chargement:
1. Requête HTTP → Serveur
2. Téléchargement image (ex: 500KB)
3. Conversion base64
4. Stockage sessionStorage
5. Affichage
⏱️ Temps total: ~500ms

Chargements suivants (même session):
1. Lecture sessionStorage (instantané)
2. Affichage
⏱️ Temps total: ~10ms

Gain de performance: 98% 🚀
```

### Économie de bande passante

- Une fois l'image chargée, elle reste en cache pour toute la session
- Pas de requêtes HTTP répétées
- Économie de bande passante importante pour les utilisateurs

### Durée de vie du cache

- ✅ **Persistance** : Tant que l'onglet/fenêtre est ouvert
- ❌ **Suppression** : Fermeture de l'onglet/fenêtre ou rechargement hard
- ℹ️ **Taille limite** : ~5-10MB selon le navigateur

## Gestion des erreurs

### Quota Exceeded

Si sessionStorage est plein :

```tsx
// Le composant continue de fonctionner sans cache
console.warn('sessionStorage quota exceeded, cache désactivé');
// L'image est affichée normalement mais ne sera pas mise en cache
```

### Erreur de chargement

```tsx
<LocalImage
  src={ASSETS.img.invalid} // Chemin invalide
  alt='Image'
  errorFallback={() => (
    <div class='bg-red-50 p-4 rounded'>
      <p class='text-red-500'>Impossible de charger l'image</p>
    </div>
  )}
/>
```

### CORS

Si l'image provient d'un autre domaine, ajoutez `crossorigin="anonymous"` :

```tsx
// Note: Le composant gère automatiquement crossOrigin
img.crossOrigin = 'anonymous';
```

## Bonnes pratiques

### 1. Utiliser le cache par défaut

```tsx
// ✅ BON - Cache activé
<LocalImage src={ASSETS.img.logo} alt="Logo" />

// ⚠️ OK mais moins performant
<LocalImage src={ASSETS.img.logo} alt="Logo" disableCache />
```

### 2. Fournir des fallbacks adaptés

```tsx
// ✅ BON - Fallback avec les mêmes dimensions
<LocalImage
  src={ASSETS.img.building}
  alt='Bâtiment'
  class='w-full h-64'
  fallback={() => <div class='w-full h-64 bg-gray-200 animate-pulse' />}
/>
```

### 3. Textes alt descriptifs

```tsx
// ✅ BON
<LocalImage
  src={ASSETS.img.building}
  alt="Vue extérieure du bâtiment principal de l'école Ivoire Cours"
/>

// ❌ MAUVAIS
<LocalImage src={ASSETS.img.building} alt="Image" />
```

### 4. Lazy loading pour images hors viewport

```tsx
<LocalImage
  src={ASSETS.img.blueprint}
  alt='Plan'
  loading='lazy'
  decoding='async'
/>
```

### 5. Nettoyer le cache si nécessaire

```tsx
// Nettoyer toutes les images en cache
function clearImageCache() {
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('img-cache:')) {
      sessionStorage.removeItem(key);
    }
  });
}

// Nettoyer une image spécifique
function clearSpecificImage(src: AssetPath) {
  sessionStorage.removeItem(`img-cache:${src}`);
}
```

## Comparaison avec d'autres solutions

| Fonctionnalité          | LocalImage (sessionStorage) | CachedImage (solid-cache) | `<img>` natif  |
| ----------------------- | --------------------------- | ------------------------- | -------------- |
| Type-safe paths         | ✅                          | ❌                        | ❌             |
| Cache                   | sessionStorage (base64)     | Mémoire (solid-cache)     | Navigateur     |
| Persistance             | Session (onglet)            | Composant monté           | Navigateur     |
| CacheBoundary requis    | ❌                          | ✅                        | ❌             |
| Gestion du loading      | ✅                          | ✅                        | ❌             |
| Gestion des erreurs     | ✅                          | ✅                        | ❌             |
| Fallbacks personnalisés | ✅                          | ✅                        | ❌             |
| Occupation mémoire      | sessionStorage (~5-10MB)    | RAM                       | Cache nav      |
| Rechargement de page    | ❌ (perte du cache)         | ❌ (perte du cache)       | ✅ (cache nav) |

## Quand utiliser `disableCache`

Désactivez le cache dans ces cas :

1. **Images très grandes** (> 1MB) qui pourraient saturer sessionStorage
2. **Images dynamiques** qui changent fréquemment
3. **Tests** pour éviter les effets de bord
4. **Mode développement** pour voir les changements immédiatement

```tsx
const isDev = import.meta.env.DEV;

<LocalImage
  src={ASSETS.img.logo}
  alt='Logo'
  disableCache={isDev} // Cache désactivé en développement
/>;
```

## Débogage

### Vérifier le cache

```tsx
// Dans la console du navigateur
Object.keys(sessionStorage)
  .filter(key => key.startsWith('img-cache:'))
  .forEach(key => {
    const value = sessionStorage.getItem(key);
    console.log({
      key,
      size: value ? (value.length / 1024).toFixed(2) + ' KB' : 'null',
      preview: value?.substring(0, 50) + '...',
    });
  });
```

### Taille totale du cache

```tsx
function getImageCacheSize() {
  let totalSize = 0;
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('img-cache:')) {
      const value = sessionStorage.getItem(key);
      totalSize += value ? value.length : 0;
    }
  });
  return (totalSize / (1024 * 1024)).toFixed(2) + ' MB';
}

console.log('Taille du cache:', getImageCacheSize());
```

## Limitations

- ⚠️ Cache limité à la session (onglet/fenêtre)
- ⚠️ Quota sessionStorage ~5-10MB selon le navigateur
- ⚠️ Conversion base64 ajoute ~33% à la taille de l'image
- ⚠️ Pas de partage de cache entre onglets

## Migration

### Depuis l'ancien LocalImage

```tsx
// Avant (sans cache)
<img src={ASSETS.img.logo} alt="Logo" class="w-32 h-32" />

// Après (avec cache sessionStorage)
<LocalImage
  src={ASSETS.img.logo}
  alt="Logo"
  class="w-32 h-32"
/>
```

### Depuis CachedImage

```tsx
// Avant (avec solid-cache)
<CacheBoundary>
  <CachedImage
    src="https://example.com/image.jpg"
    alt="Image"
    fallback={<div>Loading...</div>}
  />
</CacheBoundary>

// Après (LocalImage pour assets locaux uniquement)
<LocalImage
  src={ASSETS.img.logo}
  alt="Image"
  fallback={() => <div>Loading...</div>}
/>
// Note: LocalImage est pour assets locaux, utilisez CachedImage pour URLs externes
```

## Support navigateurs

- Chrome/Edge ≥ 90 (Canvas API, sessionStorage)
- Firefox ≥ 88
- Safari ≥ 14.1

## Voir aussi

- [CachedImage.md](./CachedImage.md) - Pour images externes avec
  solid-cache
- [AssetPath types](../../../src/globals/types/assets.ts) - Types d'assets
- [convertToBase64](../../../src/globals/ui/helpers/base64.ts) - Helper de
  conversion

## License

MIT
