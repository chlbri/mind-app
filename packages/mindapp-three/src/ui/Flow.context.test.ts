import { describe, expect, it } from 'vitest';

import { createFlowService } from './Flow.context';

describe('#01 => createFlowService', () => {
  it('#01 => should expose the service, hooks and dispatchers', () => {
    const flow = createFlowService();

    expect(typeof flow.send).toBe('function');
    expect(typeof flow.sender).toBe('function');
    expect(flow.service.state.context.zoom).toBe(1);
    expect(flow.service.state.context.physics.enabled).toBe(true);
  });

  it('#02 => should clamp new node positions within the world bounds', () => {
    const flow = createFlowService();
    const { send, service } = flow;

    send({ type: 'CONFIGURE', payload: { nodes: [], edges: [] } });

    send({
      type: 'ADD_NODE',
      payload: { position: { x: 10_000, y: -10_000, z: 0 } },
    });

    const node = service.state.context.data?.nodes?.at(-1);
    expect(node?.position).toEqual({ x: 500, y: -500, z: 0 });
  });
});
