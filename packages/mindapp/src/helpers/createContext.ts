import {
  createContext as createSolidContext,
  useContext,
  type ParentComponent,
} from 'solid-js';

/**
 * Type alias for context options extracted from Solid's
 * {@linkcode createSolidContext}.
 */
type Options = Parameters<typeof createSolidContext>[1];

/**
 * Creates a Solid context provider component and a custom hook to consume it.
 *
 * @template `T` - The type of the context value.
 *
 * @param context - Factory function returning a non-nullable context value of type
 *   `NonNullable<T>`.
 * @param options - Optional context configuration of type {@linkcode Options}.
 *
 * @returns A tuple containing the Provider component of type
 *   {@linkcode ParentComponent}, the accessor hook, and the Solid context object.
 *
 * @see {@linkcode createSolidContext}, {@linkcode useContext}
 */
export const createContext = <const T>(
  context: () => NonNullable<T>,
  options?: Options,
) => {
  const _context = createSolidContext(context(), options);

  const Provider: ParentComponent = ({ children }) => {
    return _context.Provider({ value: _context.defaultValue, children });
  };

  const _useContext = () => useContext(_context);

  return [Provider, _useContext, _context] as const;
};
