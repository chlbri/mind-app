import { createEffect, onCleanup, onMount, type Accessor } from 'solid-js';
import { useWindow } from '../window';

/**
 * Crée un gestionnaire d'événements pour l'objet `window` qui peut être
 * activé/désactivé conditionnellement.
 *
 * @example
 *   ```tsx
 *   const [visible, setRef] = createIntersect();
 *
 *   createWindowHandler(
 *     'keydown',
 *     e => {
 *       if (e.key === 'Escape') handleEscape();
 *     },
 *     visible,
 *   );
 *   ```;
 *
 * @template K - Type de l'événement window (keyof WindowEventMap)
 *
 * @param type - Type d'événement à écouter (ex: 'keydown', 'resize',
 *   'scroll')
 * @param listener - Fonction callback appelée lors du déclenchement de
 *   l'événement
 * @param condition - Condition (booléenne ou accessor) qui détermine si
 *   l'événement doit être écouté
 *
 * @returns Objet contenant les méthodes `add` et `remove` pour gérer
 *   manuellement l'événement
 */
export const createWindowHandler = <K extends keyof WindowEventMap>(
  type: K,
  listener: (ev: WindowEventMap[K]) => void,
  condition: boolean | Accessor<boolean | undefined>,
) => {
  const { add, remove } = useWindow({
    add: ({ addEventListener }) => addEventListener(type, listener),
    remove: ({ removeEventListener }) =>
      removeEventListener(type, listener),
  });

  createEffect(() => {
    const _condition =
      typeof condition === 'function' ? (condition() ?? false) : condition;
    if (_condition) return add();
    return remove();
  });

  onCleanup(remove);
  return { add, remove };
};

/**
 * Crée un gestionnaire d'événements pour l'objet `window` qui s'active au
 * montage du composant. Version simplifiée de `createWindowHandler` sans
 * condition, l'événement est toujours actif après le montage.
 *
 * @example
 *   ```tsx
 *   createWindowHandler.onMount('resize', () => {
 *     console.log('Window resized');
 *   });
 *   ```;
 *
 * @template K - Type de l'événement window (keyof WindowEventMap)
 *
 * @param type - Type d'événement à écouter (ex: 'resize', 'scroll',
 *   'keydown')
 * @param listener - Fonction callback appelée lors du déclenchement de
 *   l'événement
 */
createWindowHandler.onMount = <K extends keyof WindowEventMap>(
  type: K,
  listener: (ev: WindowEventMap[K]) => void,
) => {
  onMount(() => {
    window.addEventListener(type, listener);
    return onCleanup(() => window.removeEventListener(type, listener));
  });
};
