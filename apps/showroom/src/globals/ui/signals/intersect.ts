import {
  createDeferred,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';

/**
 * Creates an intersection observer signal that detects when a DOM element
 * enters the viewport.
 *
 * @example
 *   ```tsx
 *   const [visible, setRef] = createIntersect({ threshold: 0.5 });
 *
 *   return (
 *     <div ref={setRef}>
 *       {visible() ? 'Element is visible!' : 'Element is hidden'}
 *     </div>
 *   );
 *   ```;
 *
 * @param options - Configuration options for the `IntersectionObserver`.
 *   Defaults to `{ threshold: 0.1 }`.
 *
 * @returns A tuple containing the deferred boolean visibility signal and
 *   the ref setter callback.
 */
export const createIntersect = (
  options: IntersectionObserverInit = { threshold: 0.1 },
) => {
  let observer: IntersectionObserver | undefined;
  const [isIntersecting, setIsIntersecting] = createSignal(false);
  let ref: HTMLElement | null = null;

  onMount(() => {
    observer = new IntersectionObserver(entries => {
      const first = entries[0];
      setIsIntersecting(first.isIntersecting);
    }, options);

    if (ref) observer?.observe(ref);
  });
  // Ne rien faire côté serveur

  const intersecting = createDeferred(isIntersecting, { timeoutMs: 15 });
  const setRef = (el: HTMLElement) => (ref = el);
  onCleanup(() => observer?.disconnect());

  return [intersecting, setRef] as const; // Return signal and ref setter
};
