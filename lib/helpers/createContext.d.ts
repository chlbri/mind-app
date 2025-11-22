import { createContext as createSolidContext, ParentComponent } from 'solid-js';
type Options = Parameters<typeof createSolidContext>[1];
/**
 * Creates a context and a hook to use it.
 *
 * @template T The type of the context value
 * @param context This context must return an non nullable value
 * @param options Optional context options
 * @returns A tuple containing the Provider component and the useContext hook
 */
export declare const createContext: <const T>(context: () => NonNullable<T>, options?: Options) => readonly [ParentComponent, () => NonNullable<T>, import('solid-js').Context<NonNullable<T>>];
export {};
//# sourceMappingURL=createContext.d.ts.map