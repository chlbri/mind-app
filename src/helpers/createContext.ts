import {
  createContext as createSolidContext,
  useContext,
  type ParentComponent,
} from 'solid-js';

type Options = Parameters<typeof createSolidContext>[1];

/**
 * Creates a context and a hook to use it.
 *
 * @template T The type of the context value
 * @param context This context must return an non nullable value
 * @param options Optional context options
 * @returns A tuple containing the Provider component and the useContext hook
 */
export const createContext = <const T>(
  context: () => NonNullable<T>,
  options?: Options,
) => {
  const _context = createSolidContext(context(), options);

  const Provider: ParentComponent = ({ children }) =>
    _context.Provider({ value: _context.defaultValue, children });

  const _useContext = () => useContext(_context);

  return [Provider, _useContext, _context] as const;
};
