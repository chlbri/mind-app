import { render } from 'solid-js/web';
import { describe, expect, it } from 'vitest';

import { createContext } from '../Flow';

describe('#01 => Panels', () => {
  it('#01 => should render the provided panel slots', () => {
    const [, Flow] = createContext();
    const container = document.createElement('div');

    const TopLeft = () => <span>top-left</span>;
    const TopRight = () => <span>top-right</span>;
    const BottomLeft = () => <span>bottom-left</span>;

    const dispose = render(
      () => (
        <Flow
          config={{ nodes: [], edges: [] }}
          panels={{ topLeft: TopLeft, topRight: TopRight, bottomLeft: BottomLeft }}
        />
      ),
      container,
    );

    expect(container.textContent).toContain('top-left');
    expect(container.textContent).toContain('top-right');
    expect(container.textContent).toContain('bottom-left');
    dispose();
  });

  it('#02 => should render nothing without panels', () => {
    const [, Flow] = createContext();
    const container = document.createElement('div');

    const dispose = render(
      () => <Flow config={{ nodes: [], edges: [] }} />,
      container,
    );

    expect(container.textContent).not.toContain('top-left');
    dispose();
  });
});
