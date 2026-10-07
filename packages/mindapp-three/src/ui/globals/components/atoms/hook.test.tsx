import { render } from 'solid-js/web';
import { describe, expect, it } from 'vitest';

import { Hook } from './hook';

describe('#01 => Hook', () => {
  it('#01 => should invoke the children callback on render', () => {
    const container = document.createElement('div');
    let count = 0;

    const dispose = render(() => <Hook>{() => void count++}</Hook>, container);

    expect(count).toBe(1);
    dispose();
  });

  it('#02 => should render nothing without children', () => {
    const container = document.createElement('div');

    const dispose = render(() => <Hook />, container);

    expect(container.textContent).toBe('');
    dispose();
  });
});
