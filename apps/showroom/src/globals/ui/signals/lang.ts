import { createSignal } from 'solid-js';

import { createDebounce } from './debounce';

/** LocalStorage key for persisting the selected application language. */
export const LANG_STORE_KEY = 'lang';

/** Array of supported application language code strings. */
export const LANGS = ['fr', 'en', 'es'] as const;

/** Union type representing supported application languages. */
export type Lang = (typeof LANGS)[number];

/**
 * Creates the reactive language state synchronized with localStorage and browser
 * preferences.
 *
 * @returns A tuple of `[langAccessor, debouncedSetLang]`.
 */
const createLang = () => {
  let __lang = (localStorage.getItem(LANG_STORE_KEY) ||
    navigator.language.substring(0, 2)) as Lang;

  const check = !__lang || !LANGS.includes(__lang as any);
  if (check) __lang = 'en';

  const [lang, _setLang] = createSignal(__lang);

  const setLang = (newLang: Lang) => {
    localStorage.setItem(LANG_STORE_KEY, newLang);
    _setLang(newLang);
  };

  const debounce = createDebounce(setLang, 350);

  return [lang, debounce] as const;
};

/** Global reactive language accessor and debounced language setter. */
export const [lang, setLang] = createLang();
