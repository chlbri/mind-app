# Mind App Monorepo

Flow Chart UI library and interactive showroom application built with
[Solid.js](https://www.solidjs.com/).

## Monorepo Structure

This project is organized as a pnpm monorepo containing the following workspaces:

- **[`packages/mindapp`](packages/mindapp)** (`@bemedev/mind-flow`) - The Flow Chart
  UI library
  - `src/services/` - State management and business logic with `@bemedev/app`
  - `src/ui/components/` - Solid.js components (`Flow`, `NodesBoard`, `Edges`,
    interactive canvas)
  - `src/helpers/` - Utility functions, context helpers, and point calculations
  - `src/index.ts` - Public API exports
- **[`apps/showroom`](apps/showroom)** (`mind-app-showroom`) - Interactive showroom
  application demonstrating the library
  - `src/routes/` - TanStack Router application routes and interactive demos
  - `src/globals/` - Shared utilities, types, and UI components

## Development

```bash
# Install dependencies
pnpm install

# Run showroom development server
pnpm --filter mind-app-showroom dev

# Build all packages and applications
pnpm run build

# Run test suites across monorepo
pnpm run test

# Format and lint code
pnpm run lint
```

## Library Usage

Install the `@bemedev/mind-flow` package and peer dependencies:

```bash
pnpm add @bemedev/mind-flow solid-js @bemedev/app @bemedev/app-solidjs @thisbeyond/solid-dnd
```

Import `Flow` and the accompanying stylesheet:

```tsx
import { Flow } from '@bemedev/mind-flow';
import '@bemedev/mind-flow/style.css';

export const Demo = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Flow />
    </div>
  );
};
```

See [`packages/mindapp/README.md`](packages/mindapp/README.md) for full
documentation, custom configurations, and API references.
