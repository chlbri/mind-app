# Mind App

A flow chart UI library with a showroom application.

## Project Structure

This project is organized as a UI library with a showroom:

- **`src/`** - The Flow Chart UI library (self-contained, reusable)
  - `services/` - State management and business logic
  - `ui/components/` - Solid.js components for flow charts
  - `helpers/` - Utility functions
  - `index.ts` - Public API exports

- **`showroom/`** - The showroom application demonstrating the library
  - `routes/` - Application routes demonstrating the library
  - `globals/` - Shared utilities, types, and UI components
  - `features/` - Other application features (e.g., mindmap)

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Build
pnpm run build

# Run tests
pnpm run test

# Lint
pnpm run lint
```

## Library Usage

The Flow Chart library can be imported from `~/`:

```tsx
import { FlowChart, Provider } from '~/';

export const Demo = () => {
  return (
    <Provider>
      <FlowChart />
    </Provider>
  );
};
```

See `src/README.md` for more details on the library API.
