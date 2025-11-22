# Mind App

A flow chart UI library with a showroom application.

## Project Structure

This project is organized as a UI library with a showroom:

- **`src/lib/`** - The Flow Chart UI library (self-contained, reusable)
  - Services for state management
  - UI components for flow charts
  - Helper utilities

- **`src/`** (rest) - The showroom application
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

The Flow Chart library can be imported from `~/lib`:

```tsx
import { FlowChart, Provider } from '~/lib';

export const Demo = () => {
  return (
    <Provider>
      <FlowChart />
    </Provider>
  );
};
```

See `src/lib/README.md` for more details on the library API.
