import {
  createSignal,
  Match,
  onMount,
  splitProps,
  Switch,
  type Component,
} from 'solid-js';
import { cn } from '~/globals/ui/cn/utils';
import { useRessource } from '../signals';
import type { OmitPropsOf } from '../types';

/**
 * Props for the type-safe {@linkcode LocalImage} component.
 *
 * @template | `string` `T` - Valid image asset source URL string type.
 */
type ImageProps<T extends string = string> = OmitPropsOf<
  'img',
  'src' | 'alt' | 'onload' | 'on:load' | 'onLoad'
> & {
  /** Source URL of the image asset. */
  src: T;

  /** Alternative text description required for accessibility compliance. */
  alt: string;

  /** Custom fallback component rendered while the image is loading. */
  fallback?: Component;

  /** Custom fallback component rendered if image loading fails. */
  errorFallback?: Component;

  /**
   * Disables in-memory base64 caching when set to `true`.
   *
   * @default false
   */
  disableCache?: boolean;
};

/** Internal cached image rendering component. */
const _LocalImage: Component<Omit<ImageProps, 'disableCache'>> = props => {
  const [local, rest] = splitProps(props, [
    'src',
    'alt',
    'class',
    'fallback',
    'errorFallback',
  ]);

  const [cachedImg, setCachedImg] = createSignal<string>();

  const [state, subscribe] = useRessource<string>(local.src);

  onMount(() =>
    subscribe(
      async () => {
        const response = await fetch(local.src);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const blob = await response.blob();

        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            const base64 = reader.result;

            const check =
              typeof base64 === 'string' &&
              base64.startsWith('data:image/');

            if (check) return resolve(base64);
            reject(new Error(`Invalid image data: ${base64}`));
          };

          reader.onerror = () => {
            const error = new Error(
              `Erreur de lecture du blob: ${local.src}`,
            );

            return reject(error);
          };

          reader.readAsDataURL(blob);
        });
      },
      ({ data, state }) => {
        if (state === 'loaded' && data) setCachedImg(data);
      },
    ),
  );

  // Génère une clé de cache unique basée sur le chemin de l'image

  return (
    <Switch>
      <Match when={state() === 'errored'}>
        {local.errorFallback ? (
          <local.errorFallback />
        ) : (
          <div
            class={cn(
              'flex items-center justify-center bg-gray-100 dark:bg-gray-800',
              local.class,
            )}
            role='img'
            aria-label={`Erreur de chargement: ${local.alt}`}
          >
            <span class='text-sm text-gray-500 dark:text-gray-400'>
              ⚠️ Erreur
            </span>
          </div>
        )}
      </Match>

      <Match when={state() === 'loaded' && cachedImg()}>
        <img
          {...rest}
          src={cachedImg()}
          alt={local.alt}
          class={cn('transition-opacity duration-300', local.class)}
          loading='lazy'
          decoding='async'
        />
      </Match>

      <Match when={state() === 'loading' || state() === 'idle'}>
        {local.fallback ? (
          <local.fallback />
        ) : (
          <div
            class={cn(
              'animate-pulse bg-gray-200 dark:bg-gray-700',
              local.class,
            )}
            role='img'
            aria-label={`Chargement: ${local.alt}`}
            aria-busy='true'
          />
        )}
      </Match>
    </Switch>
  );
};

/**
 * Composant Image type-safe avec cache en mémoire
 *
 * - Met en cache les images en base64 dans une Map globale
 * - Évite les rechargements répétés pendant la session
 * - Convertit automatiquement les images en base64
 * - Gère les états de chargement et d'erreur
 *
 * @example
 *   ```tsx
 *   import { LocalImage } from '~ui/atoms';
 *   import { ASSETS } from '~types';
 *
 *   <LocalImage
 *     src={ASSETS.img.logo}
 *     alt="Logo de l'école"
 *     class="w-32 h-32"
 *   />
 *
 *   // Avec fallback personnalisé
 *   <LocalImage
 *     src={ASSETS.img.building}
 *     alt="Bâtiment"
 *     class="w-full h-96"
 *     fallback={() => <div class="animate-pulse bg-gray-200 w-full h-96" />}
 *     errorFallback={() => <div class="text-red-500">Erreur de chargement</div>}
 *   />
 *   ```;
 */
export function LocalImage<T extends string = string>(
  props: ImageProps<T>,
) {
  if (props.disableCache) {
    const [, rest] = splitProps(props, [
      'fallback',
      'errorFallback',
      'disableCache',
    ]);

    return <img {...rest} />;
  }

  return <_LocalImage {...props} />;
}
