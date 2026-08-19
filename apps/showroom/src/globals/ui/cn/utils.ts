import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges conditional CSS class names using `clsx` and resolves Tailwind
 * CSS class conflicts with `twMerge`.
 *
 * @param inputs - Variable list of class values, objects, or arrays.
 *
 * @returns The resolved single class name string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
