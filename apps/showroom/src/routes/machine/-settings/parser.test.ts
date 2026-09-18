import { describe, expect, it } from 'vitest';

import { parseMachineToGraph } from './parser';

describe('#01 => parseMachineToGraph', () => {
  describe('#01 => Transition separation by handle kind', () => {
    it('#01 => should separate on, always, and after transitions into distinct edges', () => {
      const graph = parseMachineToGraph(
        {
          initial: 'idle',
          states: {
            idle: {
              on: { START: '/active' },
              always: [{ target: '/active', guards: 'isReady' }],
              after: { '1000ms': '/active' },
            },
            active: {},
          },
        },
        { '/idle': { x: 0, y: 0 }, '/active': { x: 300, y: 0 } },
      );

      expect(graph.edges).toHaveLength(3);

      const afterEdge = graph.edges.find(e => e.data?.kind === 'after');
      const alwaysEdge = graph.edges.find(e => e.data?.kind === 'always');
      const onEdge = graph.edges.find(e => e.data?.kind === 'on');

      expect(afterEdge).toBeDefined();
      expect(afterEdge?.id).toBe('edge:after:/idle=>/active');
      expect(afterEdge?.fromPosition).toBe('right');
      expect(afterEdge?.toPosition).toBe('left');
      expect(afterEdge?.fromIndex).toBe(0);
      expect(afterEdge?.toIndex).toBe(0);
      expect(afterEdge?.data?.transitions).toHaveLength(1);
      expect(afterEdge?.data?.transitions?.[0].kind).toBe('after');

      expect(alwaysEdge).toBeDefined();
      expect(alwaysEdge?.id).toBe('edge:always:/idle=>/active');
      expect(alwaysEdge?.fromPosition).toBe('right');
      expect(alwaysEdge?.toPosition).toBe('left');
      expect(alwaysEdge?.fromIndex).toBe(1);
      expect(alwaysEdge?.toIndex).toBe(1);
      expect(alwaysEdge?.data?.transitions).toHaveLength(1);
      expect(alwaysEdge?.data?.transitions?.[0].kind).toBe('always');

      expect(onEdge).toBeDefined();
      expect(onEdge?.id).toBe('edge:on:/idle=>/active');
      expect(onEdge?.fromPosition).toBe('right');
      expect(onEdge?.toPosition).toBe('left');
      expect(onEdge?.fromIndex).toBe(2);
      expect(onEdge?.toIndex).toBe(2);
      expect(onEdge?.data?.transitions).toHaveLength(1);
      expect(onEdge?.data?.transitions?.[0].kind).toBe('on');
    });
  });

  describe('#02 => Grouping transitions of identical kind', () => {
    it('#02 => should group multiple always transitions onto the same always edge', () => {
      const graph = parseMachineToGraph(
        {
          initial: 'check',
          states: {
            check: {
              always: [
                { guards: 'isValid', target: '/success' },
                { target: '/success' },
              ],
            },
            success: {},
          },
        },
        { '/check': { x: 0, y: 0 }, '/success': { x: 300, y: 0 } },
      );

      expect(graph.edges).toHaveLength(1);
      const alwaysEdge = graph.edges[0];

      expect(alwaysEdge.id).toBe('edge:always:/check=>/success');
      expect(alwaysEdge.data?.kind).toBe('always');
      expect(alwaysEdge.fromIndex).toBe(1);
      expect(alwaysEdge.toIndex).toBe(1);
      expect(alwaysEdge.data?.transitions).toHaveLength(2);
      expect(alwaysEdge.data?.transitions?.every(t => t.kind === 'always')).toBe(
        true,
      );
      expect(alwaysEdge.data?.label).toBe('2 transitions');
    });
  });

  describe('#03 => Hierarchy edges', () => {
    it('#03 => should create child_parent edge attached to top and bottom handles', () => {
      const graph = parseMachineToGraph(
        {
          initial: 'parent',
          states: { parent: { initial: 'child', states: { child: {} } } },
        },
        { '/parent': { x: 0, y: 0 }, '/parent/child': { x: 0, y: 200 } },
      );

      const hierarchyEdge = graph.edges.find(e => e.data?.kind === 'child_parent');
      expect(hierarchyEdge).toBeDefined();
      expect(hierarchyEdge?.id).toBe('edge:hierarchy:/parent/child=>/parent');
      expect(hierarchyEdge?.fromPosition).toBe('top');
      expect(hierarchyEdge?.toPosition).toBe('bottom');
      expect(hierarchyEdge?.fromIndex).toBe(0);
      expect(hierarchyEdge?.toIndex).toBe(0);
    });
  });

  describe('#04 => Showroom Machine Graph Validation', () => {
    it('#04 => should separate validation to fulfillment into always and on edges', () => {
      const graph = parseMachineToGraph(
        {
          initial: 'validation',
          states: {
            validation: {
              always: [
                { guards: 'isApproved', target: '/fulfillment' },
                { target: '/rejected' },
              ],
              on: { MANUAL_OVERRIDE: '/fulfillment' },
            },
            fulfillment: {},
            rejected: {},
          },
        },
        {
          '/validation': { x: 0, y: 0 },
          '/fulfillment': { x: 300, y: 0 },
          '/rejected': { x: 0, y: 300 },
        },
      );

      const validationToFulfillmentEdges = graph.edges.filter(
        e => e.from === '/validation' && e.to === '/fulfillment',
      );

      expect(validationToFulfillmentEdges).toHaveLength(2);

      const alwaysEdge = validationToFulfillmentEdges.find(
        e => e.data?.kind === 'always',
      );
      const onEdge = validationToFulfillmentEdges.find(e => e.data?.kind === 'on');

      expect(alwaysEdge).toBeDefined();
      expect(alwaysEdge?.fromIndex).toBe(1);
      expect(alwaysEdge?.toIndex).toBe(1);
      expect(alwaysEdge?.data?.transitions).toHaveLength(1);
      expect(alwaysEdge?.data?.transitions?.[0].kind).toBe('always');

      expect(onEdge).toBeDefined();
      expect(onEdge?.fromIndex).toBe(2);
      expect(onEdge?.toIndex).toBe(2);
      expect(onEdge?.data?.transitions).toHaveLength(1);
      expect(onEdge?.data?.transitions?.[0].kind).toBe('on');
    });
  });

  describe('#05 => Activity extraction from ActivityConfig', () => {
    it('#05 => should extract activities with delay, actions, and guards', () => {
      const graph = parseMachineToGraph(
        {
          initial: 'active',
          states: {
            active: {
              activities: {
                POLL: {
                  actions: ['refresh', 'logHeartbeat'],
                  guards: 'isOnline',
                  description: 'Periodic poll interval',
                },
              },
            },
          },
        },
        { '/active': { x: 0, y: 0 } },
      );

      const node = graph.nodes.find(n => n.id === '/active');
      expect(node).toBeDefined();
      expect(node?.data?.activities).toHaveLength(1);
      const activity = node?.data?.activities?.[0];
      expect(activity?.delay).toBe('POLL');
      expect(activity?.actions).toEqual(['refresh', 'logHeartbeat']);
      expect(activity?.guards).toEqual(['isOnline']);
      expect(activity?.description).toBe('Periodic poll interval');
    });
  });

  describe('#06 => Actor extraction from ActorConfig', () => {
    it('#06 => should extract emitter and child actors correctly', () => {
      const graph = parseMachineToGraph(
        {
          initial: 'active',
          states: {
            active: {
              actors: {
                stream: {
                  next: { actions: ['onData'], target: '/active' },
                  error: { actions: ['onError'] },
                  complete: { actions: ['onDone'] },
                },
                worker: {
                  on: { FINISHED: { actions: ['onFinished'] } },
                  contexts: { '.': 'workerContext' },
                },
              },
            },
          },
        },
        { '/active': { x: 0, y: 0 } },
      );

      const node = graph.nodes.find(n => n.id === '/active');
      expect(node).toBeDefined();
      expect(node?.data?.actors).toHaveLength(2);

      const emitter = node?.data?.actors?.find(a => a.name === 'stream');
      expect(emitter).toBeDefined();
      expect(emitter?.type).toBe('emitter');
      expect(emitter?.emitter?.next.actions).toEqual(['onData']);
      expect(emitter?.emitter?.next.target).toBe('/active');
      expect(emitter?.emitter?.error?.actions).toEqual(['onError']);
      expect(emitter?.emitter?.complete?.actions).toEqual(['onDone']);

      const child = node?.data?.actors?.find(a => a.name === 'worker');
      expect(child).toBeDefined();
      expect(child?.type).toBe('child');
      expect(child?.child?.on?.FINISHED?.actions).toEqual(['onFinished']);
      expect(child?.child?.contexts).toEqual({ '.': 'workerContext' });
    });
  });

  describe('#07 => State classification (stateType) and isInitial rules', () => {
    it('#07 => should classify stateType properly and enforce isInitial rules', () => {
      const graph = parseMachineToGraph(
        {
          initial: 'idle',
          states: {
            idle: { on: { WORK: '/processing' } },
            processing: { type: 'compound', states: { step1: {} } },
            parallelWorkflow: {
              type: 'parallel',
              states: { branchA: {}, branchB: {} },
            },
            completed: { type: 'final' },
          },
        },
        {},
      );

      // 1. Root idle state (atomic, initial)
      const idleNode = graph.nodes.find(n => n.id === '/idle');
      expect(idleNode).toBeDefined();
      expect(idleNode?.data?.stateType).toBe('atomic');
      expect(idleNode?.data?.isInitial).toBe(true);

      // 2. Processing parent state (compound, not initial)
      const processingNode = graph.nodes.find(n => n.id === '/processing');
      expect(processingNode).toBeDefined();
      expect(processingNode?.data?.stateType).toBe('compound');
      expect(processingNode?.data?.isInitial).toBe(false);

      // 3. Single child of compound parent: step1 must be initial by default!
      const step1Node = graph.nodes.find(n => n.id === '/processing/step1');
      expect(step1Node).toBeDefined();
      expect(step1Node?.data?.stateType).toBe('atomic');
      expect(step1Node?.data?.isInitial).toBe(true);

      // 4. Parallel parent state
      const parallelNode = graph.nodes.find(n => n.id === '/parallelWorkflow');
      expect(parallelNode).toBeDefined();
      expect(parallelNode?.data?.stateType).toBe('parallel');
      expect(parallelNode?.data?.isInitial).toBe(false);

      // 5. Children of parallel parent must NOT be initial
      const branchANode = graph.nodes.find(
        n => n.id === '/parallelWorkflow/branchA',
      );
      const branchBNode = graph.nodes.find(
        n => n.id === '/parallelWorkflow/branchB',
      );
      expect(branchANode).toBeDefined();
      expect(branchANode?.data?.stateType).toBe('atomic');
      expect(branchANode?.data?.isInitial).toBe(false);
      expect(branchBNode).toBeDefined();
      expect(branchBNode?.data?.stateType).toBe('atomic');
      expect(branchBNode?.data?.isInitial).toBe(false);

      // 6. Final state
      const completedNode = graph.nodes.find(n => n.id === '/completed');
      expect(completedNode).toBeDefined();
      expect(completedNode?.data?.stateType).toBe('final');
      expect(completedNode?.data?.isInitial).toBe(false);
    });
  });
});
