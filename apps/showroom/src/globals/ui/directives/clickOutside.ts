import { onCleanup } from 'solid-js';

/**
 * Solid custom directive that triggers a callback when a click occurs
 * outside the bound element.
 *
 * @param el - The bound DOM element.
 * @param accessor - Accessor returning the callback function to execute.
 */
export const clickOutside = (el: any, accessor: any) => {
  const onClick = (e: any) => {
    if (!el.contains(e.target)) {
      accessor()?.();
    }
  };
  document.body.addEventListener('click', onClick);
  onCleanup(() => document.body.removeEventListener('click', onClick));
};
