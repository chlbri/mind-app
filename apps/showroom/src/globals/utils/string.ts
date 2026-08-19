/**
 * Capitalizes the first character of a string.
 *
 * @param s - The input string to capitalize.
 *
 * @returns The capitalized string.
 */
export const capitalize = (s: string) => {
  return s[0].toUpperCase() + s.slice(1);
};
