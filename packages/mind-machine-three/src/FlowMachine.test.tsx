import { createRoot } from 'solid-js';
import { render } from 'solid-js/web';
import { describe, expect, it } from 'vitest';

import { createContext } from './FlowMachine';

/** Minimal machine configuration parsed by the flow machine. */
const machineConfig = {
  id: 'orderProcess',
  initial: 'cart',
  states: {
    cart: { on: { CHECKOUT: '/payment' } },
    payment: { after: { TIMEOUT: '/cart' } },
  },
};

describe('#01 => createContext', () => {
  it('#01 => should return the useFlow hook and the FlowMachine component', () => {
    const [useFlow, FlowMachine] = createContext();

    expect(typeof useFlow).toBe('function');
    expect(typeof FlowMachine).toBe('function');
  });

  it('#02 => should throw when the hook is used outside a FlowMachine', () => {
    const [useFlow] = createContext();

    createRoot(dispose => {
      expect(() => useFlow()).toThrow(
        'useFlow must be used within a Flow component',
      );

      dispose();
    });
  });

  it('#03 => should render the machine 3D scene and provide the flow value', () => {
    const [useFlow, FlowMachine] = createContext();
    const container = document.createElement('div');

    /** Test component reading the flow context value. */
    const Probe = () => <span>{typeof useFlow().send}</span>;

    const dispose = render(
      () => (
        <FlowMachine history={machineConfig}>
          <Probe />
        </FlowMachine>
      ),
      container,
    );

    expect(container.textContent).toContain('function');
    dispose();
  });
});
