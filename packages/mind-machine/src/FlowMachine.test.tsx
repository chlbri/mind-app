import { render } from 'solid-js/web';
import { describe, expect, it } from 'vitest';

import { FlowMachine } from './FlowMachine';
import { getStorageKey } from './storage';

const machineConfig = {
  id: 'orderProcess',
  initial: 'cart',
  states: {
    cart: { on: { CHECKOUT: '/payment' } },
    payment: { after: { '3000ms': '/cart' } },
  },
};

/**
 * Renders the component into a fresh container and returns the cleanup handle.
 *
 * @param props - Rendered properties, or `undefined` for the storage only mode.
 *
 * @returns The container element and the Solid dispose function.
 */
const mount = (props?: any) => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const dispose = render(
    () => (props ? <FlowMachine {...props} /> : <FlowMachine localKeys='smoke' />),
    container,
  );

  return { container, dispose };
};

describe('#01 => FlowMachine', () => {
  it('#01 => should render the parsed machine states', () => {
    const { container, dispose } = mount({ history: machineConfig });

    const text = container.textContent ?? '';
    expect(text).toContain('cart');
    expect(text).toContain('payment');
    expect(text).toContain('/cart');
    expect(text).toContain('/payment');

    dispose();
  });

  it('#02 => should restore a persisted history payload', () => {
    const key = getStorageKey('restore');
    localStorage.setItem(
      key!,
      JSON.stringify({
        history: [
          {
            data: {
              nodes: [
                {
                  id: '/stored',
                  position: { x: 0, y: 0 },
                  data: {
                    id: '/stored',
                    title: 'stored',
                    path: '/stored',
                    stateType: 'atomic',
                  },
                },
              ],
              edges: [],
            },
            date: 1,
          },
        ],
        historyIndex: 0,
      }),
    );

    const { container, dispose } = mount({ localKeys: 'restore' });

    expect(container.textContent).toContain('stored');

    dispose();
    localStorage.clear();
  });

  it('#03 => should not persist an empty history', () => {
    const { dispose } = mount({ history: machineConfig, localKeys: 'persist' });

    expect(localStorage.getItem('persist')).toBeNull();

    dispose();
    localStorage.clear();
  });

  it('#04 => should ignore a persisted empty history', () => {
    localStorage.setItem('empty', JSON.stringify({ history: [], historyIndex: -1 }));

    const { container, dispose } = mount({
      history: machineConfig,
      localKeys: 'empty',
    });

    const text = container.textContent ?? '';
    expect(text).toContain('cart');
    expect(text).toContain('payment');

    dispose();
    localStorage.clear();
  });
});
