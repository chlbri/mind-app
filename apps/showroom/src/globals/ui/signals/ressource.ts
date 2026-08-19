import {
  createContext,
  createSignal,
  useContext,
  type Accessor,
} from 'solid-js';

/**
 * Lifecycle states for an asynchronously fetched or loaded resource.
 *
 * - `idle`: Initial state before request has started.
 * - `loading`: Resource is currently downloading/fetching.
 * - `loaded`: Resource downloaded and cached successfully.
 * - `errored`: An error occurred during download/fetch.
 */
export type ResourceState = 'idle' | 'loading' | 'loaded' | 'errored';

/**
 * Status descriptor for a specific tracked resource.
 *
 * @template T - Type of the underlying resource payload.
 */
export interface ResourceStatus<T = unknown> {
  /** Current lifecycle state of type {@linkcode ResourceState}. */
  state: ResourceState;
  /** Optional resource payload data. */
  data?: T;
  /** Optional error encountered during fetch of type {@linkcode Error}. */
  error?: Error;
}

/**
 * Async downloader function returning the fetched resource data.
 *
 * @template T - Type of the underlying resource payload.
 */
export type ResourceDownloader<T = unknown> = () => Promise<T>;

/**
 * Subscriber callback invoked on resource state transitions.
 *
 * @template T - Type of the underlying resource payload.
 *
 * @param status - Current status of type {@linkcode ResourceStatus}.
 */
export type ResourceSubscriber<T = unknown> = (
  status: ResourceStatus<T>,
) => void;

/**
 * Represents a cached file resource entry.
 *
 * @template T - Type of the cached resource data.
 */
export interface FileResource<T = unknown> {
  /** Unique identifier for the resource. */
  key: string;
  /** The resource content payload. */
  data: T;
  /** Timestamp in milliseconds when the resource was cached. */
  timestamp: number;
}

/**
 * Context value interface for managing global resource caching and
 * subscriptions.
 */
export interface ResourceContextValue {
  /** Internal Map storing all resources by key. */
  resources: Map<string, unknown>;

  subscribe: (
    key: string,
    downloader: ResourceDownloader,
    subscriber: ResourceSubscriber,
  ) => () => void;

  /**
   * Get the current state of a resource
   *
   * @example
   *   ```tsx
   *   const { getState } = useResource();
   *   const state = getState('image-logo'); // 'loaded'
   *   ```;
   *
   * @param key - Resource identifier
   *
   * @returns Current state: 'idle' | 'loading' | 'loaded' | 'errored'
   */
  state: (key: string) => ResourceState;
}

/**
 * Creates the resource context for managing file resources globally
 *
 * @internal Use `useResource()` hook instead of consuming this context directly
 */
export const ResourceContext = createContext<
  ResourceContextValue | undefined
>();

/**
 * Creates a resource context provider that stores file resources in a Map
 *
 * This function initializes the context with all necessary methods to
 * manage file resources throughout the application.
 *
 * @example
 *   ```tsx
 *   import { createResourceContext } from '~/globals/ui/signals/ressource';
 *
 *   // In your root component
 *   export const App = () => {
 *     return (
 *       <ResourceProvider>
 *         <YourApp />
 *       </ResourceProvider>
 *     );
 *   };
 *   ```;
 *
 * @returns An object containing:
 *
 *   - `ResourceProvider` : Solid component to wrap your app
 *   - `createResourceContext` : Function to manually create resource
 *     contexts
 */
export const createResourceContext = () => {
  // Map pour stocker l'état de chaque ressource
  const resourceStates = new Map<
    string,
    [signal: () => ResourceState, setter: (state: ResourceState) => void]
  >();

  // Signal pour stocker les souscripteurs par ressource
  const [subscribersData, setSubscribersData] = createSignal(
    new Map<string, Set<ResourceSubscriber>>(),
  );

  // Signal pour stocker les promesses de téléchargement en cours
  const [downloadPromisesData, setDownloadPromisesData] = createSignal(
    new Map<string, Promise<unknown>>(),
  );

  /** Crée ou récupère le signal d'état pour une ressource */
  const getOrCreateState = (
    key: string,
  ): [Accessor<ResourceState>, (state: ResourceState) => void] => {
    if (!resourceStates.has(key)) {
      const signal = createSignal<ResourceState>('idle');
      resourceStates.set(key, signal);
    }
    return resourceStates.get(key)!;
  };

  /** Notifie tous les souscripteurs d'un changement d'état */
  const notifySubscribers = (key: string, status: ResourceStatus) => {
    const subs = subscribersData().get(key);
    if (subs) {
      subs.forEach(sub => sub(status));
    }
  };

  const contextValue: ResourceContextValue = {
    resources: new Map<string, unknown>(),

    /** Subscribe à une ressource avec gestion automatique du téléchargement */
    subscribe(
      key: string,
      downloader: ResourceDownloader,
      subscriber: ResourceSubscriber,
    ) {
      // Ajouter le souscripteur
      const [getState, setState] = getOrCreateState(key);
      notifySubscribers(key, { state: getState() });

      setSubscribersData(subs1 => {
        if (!subs1.has(key)) {
          subs1.set(key, new Set());
        }
        const s = subs1.get(key)!;
        s.add(subscriber);
        return subs1;
      });

      // Obtenir ou créer le signal d'état

      // Si un téléchargement est déjà en cours, attendre et notifier
      const downloadPromises = downloadPromisesData();
      if (downloadPromises.has(key)) {
        // Rien à faire, le téléchargement est en cours
      } else if (getState() === 'loaded') {
        // Ressource déjà chargée
        const data = this.resources.get(key);

        subscriber({ state: 'loaded', data });
      } else {
        // Lancer le téléchargement
        setState('loading');
        notifySubscribers(key, { state: getState() });

        const downloadPromise = downloader()
          .then(data => {
            this.resources.set(key, data);
            setState('loaded');
            notifySubscribers(key, { state: 'loaded', data });

            setDownloadPromisesData(dp => {
              dp.delete(key);
              return dp;
            });
          })
          .catch((error: Error) => {
            setState('errored');
            notifySubscribers(key, { state: 'errored', error });
            setDownloadPromisesData(dp => {
              dp.delete(key);
              return dp;
            });
          });

        downloadPromises.set(key, downloadPromise);
        setDownloadPromisesData(downloadPromises);
      }

      // Retourner fonction pour se désabonner
      return () => {
        setSubscribersData(map => {
          const subs = map.get(key);
          if (subs) {
            subs.delete(subscriber);
            if (subs.size === 0) {
              map.delete(key);
            }
          }
          return map;
        });
      };
    },

    /** Récupère l'état actuel d'une ressource */
    state(key: string): ResourceState {
      const [state] = getOrCreateState(key);
      return state();
    },
  };

  return contextValue;
};

/**
 * Hook to use the resource context
 *
 * Must be called within a component wrapped by `ResourceProvider`
 *
 * @example
 *   ```tsx
 *             import { useResource } from '~/globals/ui/signals/ressource';
 *             import { createEffect } from 'solid-js';
 *
 *             const MyComponent = () => {
 *               const { set, get, has, size } = useResource();
 *
 *               createEffect(() => {
 *                 console.log(`Total resources: ${size()}`);
 *               });
 *
 *               const handleCache = () => {
 *                 set('my-resource', { id: 1, name: 'Test' });
 *               };
 *
 *               const handleRetrieve = () => {
 *                 const data = get('my-resource');
 *                 console.log(data);
 *               };
 *
 *               return (
 *                 <div>
 *                   <button onClick={handleCache}>Cache Resource</button>
 *                   <button onClick={handleRetrieve}>Get Resource</button>
 *                   <p>Cached items: {size()}</p>
 *                 </div>
 *               );
 *             };
 *             ```
 *
 * @returns The resource context value with all methods and accessors
 *
 * @throws Error if used outside of ResourceProvider
 */
export const useRessource = <T>(key: string) => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error(
      'useResource must be called within a ResourceProvider. ' +
        'Make sure your component is wrapped with <ResourceProvider>',
    );
  }

  const state = () => context.state(key);

  const subscribe = (
    downloader: ResourceDownloader<T>,
    subscriber: ResourceSubscriber<T>,
  ) => context.subscribe(key, downloader, subscriber as any);

  return [state, subscribe] as const;
};
