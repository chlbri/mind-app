import { deepEqual } from '@bemedev/app';
import { createState } from '@bemedev/app-solidjs';
import { isDefined } from '@bemedev/app/bemedev';
import { createSignal, type Accessor } from 'solid-js';

import type { NodeData } from './FlowChart';
import { useFlow } from './FlowChart.context';

/**
 * Hook providing reactive state and mutation helpers for editing flowchart node
 * data.
 *
 * @template | {@linkcode NodeData} `D` - Custom node data dictionary type extending
 *   {@linkcode NodeData}.
 *
 * @param timeout - Transition delay in milliseconds before closing the panel.
 *   Defaults to `270`.
 *
 * @returns An object containing reactive accessors and mutation callbacks for the
 *   active node.
 *
 * @see {@linkcode useFlow}
 */
export const useHook = <D extends NodeData = NodeData>(timeout = 270) => {
  const service = useFlow();
  const directClose = () => service.send('STOP_EDIT');
  const [closing, setClosing] = createSignal(false);
  const senderData = service.sender('SET_NODE_DATA');

  const _editing = createState(service, {
    selector: ({ context }) => {
      const editingId = context.editing;
      if (!isDefined(editingId)) return;

      const item = context.data?.nodes?.find(n => n.id === editingId);
      if (!isDefined(item)) return;

      return { id: item.id, data: item.data as D };
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

  const updateField = <K extends keyof D>(field: K, value: D[K]) => {
    const current = _editing();
    if (!current) return;

    return senderData({ ...current, data: { ...current.data, [field]: value } });
  };

  const updateData = (data: Partial<D>) => {
    const current = _editing();
    if (!current) return;

    return senderData({ ...current, data: { ...current.data, ...data } });
  };

  const editing = _editing as Accessor<{ id: string; data: D }>;
  return { editing, updateField, updateData, close, closing, directClose };
};
