import { deepEqual } from '@bemedev/app';
import { createState } from '@bemedev/app-solidjs';
import { isDefined } from '@bemedev/app/bemedev';
import { createSignal, type Accessor } from 'solid-js';

import type { Data } from './FlowChart';
import { useFlow } from './FlowChart.context';

/**
 * Hook providing reactive state and mutation helpers for editing flowchart node and
 * edge data.
 *
 * @template | {@linkcode Data} `D` - Custom node data dictionary type extending
 *   {@linkcode Data}.
 * @template | {@linkcode Data} `E` - Custom edge data dictionary type extending
 *   {@linkcode Data}.
 *
 * @param timeout - Transition delay in milliseconds before closing the panel.
 *   Defaults to `270`.
 *
 * @returns An object containing reactive accessors and mutation callbacks for the
 *   active node and edge.
 *
 * @see {@linkcode useFlow}
 */
export const useHook = <D extends Data = Data, E extends Data = Data>(
  timeout = 270,
) => {
  const { service } = useFlow();
  const directClose = () => service.send('STOP_EDIT');
  const [closing, setClosing] = createSignal(false);
  const senderNodeData = service.sender('SET_NODE_DATA');
  const senderEdgeData = service.sender('SEND_EDGE_DATA');

  const _editingNode = createState(service, {
    selector: ({ context }) => {
      const editingId = context.editing;
      if (!isDefined(editingId)) return;

      const item = context.data?.nodes?.find(n => n.id === editingId);
      if (!isDefined(item)) return;

      return { id: item.id, data: item.data as D };
    },

    equals: deepEqual<any>,
  });

  const _editingEdge = createState(service, {
    selector: ({ context }) => {
      const editingId = context.editing;
      if (!isDefined(editingId)) return;

      const item = context.data?.edges?.find(e => e.id === editingId);
      if (!isDefined(item)) return;

      return { id: item.id, data: (item.data ?? {}) as E };
    },

    equals: deepEqual<any>,
  });

  const close = () => {
    setClosing(true);

    setTimeout(() => {
      directClose();
      setClosing(false);
    }, timeout);
  };

  const updateNodeData = (data: Partial<D>) => {
    const current = _editingNode();
    if (!current) return;

    return senderNodeData({ ...current, data: { ...current.data, ...data } });
  };

  const updateNodeField = <K extends keyof D>(field: K, value: D[K]) => {
    const current = _editingNode();
    if (!current) return;

    return senderNodeData({ ...current, data: { ...current.data, [field]: value } });
  };

  const updateEdgeData = (data: Partial<E>) => {
    const current = _editingEdge();
    if (!current) return;

    return senderEdgeData({ ...current, data: { ...current.data, ...data } });
  };

  const updateEdgeField = <K extends keyof E>(field: K, value: E[K]) => {
    const current = _editingEdge();
    if (!current) return;

    return senderEdgeData({ ...current, data: { ...current.data, [field]: value } });
  };

  const editingNode = _editingNode as Accessor<{ id: string; data: D }>;
  const editingEdge = _editingEdge as Accessor<{ id: string; data: E }>;

  return {
    editingNode,
    editingEdge,
    updateNodeField,
    updateNodeData,
    updateEdgeField,
    updateEdgeData,
    updateField: updateNodeField,
    updateData: updateNodeData,
    close,
    closing,
    directClose,
  };
};
