# Flow Chart UI Library

This is a self-contained UI library for creating interactive flow charts in
Solid.js applications.

## Structure

- `services/` - State management and business logic
- `ui/components/` - Solid.js components for the flow chart
- `helpers/` - Utility functions
- `index.ts` - Public API exports

## Usage

Import the library components from `~/`:

```tsx
import { FlowChart, Provider } from '~/';

export const MyComponent = () => {
  return (
    <Provider>
      <FlowChart />
    </Provider>
  );
};
```

## Exports

- `FlowChart` - Main flow chart component
- `Provider` - Context provider for flow chart state
- `useFlow` - Hook to access flow chart context
- `NodeProps` - Type definition for node properties
- `EdgeProps` - Type definition for edge properties
- `Edge` - Type definition for edge data
