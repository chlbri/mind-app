import Color from 'color';

/**
 * Computes an accessible foreground color ('white' or 'black') contrasting against a
 * given background color.
 *
 * @param color - The background color string (hex, rgb, named).
 *
 * @returns `'white'` or `'black'` depending on contrast ratio.
 */
const fcc = (color: string) => {
  const white = Color('white');
  const _color = Color(color).contrast(white);
  return _color > 2 ? 'white' : 'black';
};

export default fcc;
