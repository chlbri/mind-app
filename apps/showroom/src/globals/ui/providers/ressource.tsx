import type { ParentComponent } from 'solid-js';

import { createResourceContext, ResourceContext } from '../signals';

/**
 * Provider component for the global resource context.
 *
 * Wrap your application with this component to provide resource management
 * capabilities to all child components.
 *
 * @example
 *   ```tsx
 *   import { RessourcesProvider } from '~/globals/ui/providers';
 *
 *   export default function Root() {
 *     return (
 *       <RessourcesProvider>
 *         <Router />
 *       </RessourcesProvider>
 *     );
 *   }
 *   ```;
 */
export const RessourcesProvider: ParentComponent = props => {
  const value = createResourceContext();

  return (
    <ResourceContext.Provider value={value}>
      {props.children}
    </ResourceContext.Provider>
  );
};
