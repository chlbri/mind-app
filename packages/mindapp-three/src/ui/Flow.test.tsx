import { createEffect, createRoot } from 'solid-js';
import { render } from 'solid-js/web';
import { describe, expect, it } from 'vitest';

import { createContext } from './Flow';

describe('#01 => createcontext', () => {
  it('#01 => should return the useFlow hook and the Flow component', () => {
    const [useFlow, Flow] = createContext();

    expect(typeof useFlow).toBe('function');
    expect(typeof Flow).toBe('function');
  });

  it('#02 => should throw when the hook is used outside a Flow', () => {
    const [useFlow] = createContext();

    createRoot(dispose => {
      expect(() => useFlow()).toThrow(
        'useFlow must be used within a Flow component',
      );

      dispose();
    });
  });

  it('#03 => should provide the flow value to children', () => {
    const [useFlow, Flow] = createContext();
    const container = document.createElement('div');

    /** Test component reading the flow context value. */
    const Probe = () => <span>{typeof useFlow().send}</span>;

    const dispose = render(
      () => (
        <Flow config={{ nodes: [], edges: [] }}>
          <Probe />
        </Flow>
      ),
      container,
    );

    expect(container.textContent).toContain('function');
    dispose();
  });

  it('#04 => should configure the machine with the provided graph', () => {
    const [useFlow, Flow] = createContext();
    const container = document.createElement('div');

    /** Latest graph data captured from the reactive machine state. */
    let captured: unknown;

    /** Test component capturing the configured graph data. */
    const Probe = () => {
      const { hooks } = useFlow();
      const data = hooks.state({ selector: s => s.context.data });

      createEffect(() => {
        captured = data();
      });

      return <span>probe</span>;
    };

    const dispose = render(
      () => (
        <Flow
          config={{
            nodes: [
              {
                id: 'node-0',
                data: { content: 'Root' },
                position: { x: 0, y: 0, z: 0 },
              },
            ],
            edges: [],
          }}
        >
          <Probe />
        </Flow>
      ),
      container,
    );

    expect((captured as any)?.nodes?.length).toBe(1);
    dispose();
  });
});
