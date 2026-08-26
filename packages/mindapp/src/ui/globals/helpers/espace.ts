import { NON_BREAKABLE_SPACE, VISIBLE_ESPACE } from '../constants';

/**
 * Returns a zero-width space if string is empty, preserving layout flow.
 *
 * @param newText - The input text string.
 *
 * @returns The input text or zero-width visible space placeholder.
 */
export const espace = (newText: string) => {
  if (newText === '') {
    return VISIBLE_ESPACE;
  }
  return newText;
};

/**
 * Generates a repeated sequence of non-breakable space characters.
 *
 * @param count - The number of non-breakable spaces to repeat. Defaults to 1.
 *
 * @returns The non-breakable space string sequence.
 */
export const repeatSpace = (count = 1) => {
  return NON_BREAKABLE_SPACE.repeat(count);
};
