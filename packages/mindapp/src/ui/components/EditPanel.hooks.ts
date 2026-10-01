import { deepEqual } from '@bemedev/app';
import { isDefined } from '@bemedev/app/bemedev';
import { type Accessor } from 'solid-js';

import type { FlowContext } from '../Flow.context';
import { useClose } from '../globals/hooks/useClose';
import type { Data } from './FlowChart';

/**
 * Hook providing reactive state and mutation helpers for editing flowchart node and
 * edge data.
 *
 * @template | {@linkcode Data} `D` - Custom node data dictionary type extending type
 *   {@linkcode Data}.
 * @template | {@linkcode Data} `E` - Custom edge data dictionary type extending type
 *   {@linkcode Data}.
 *
 * @param flow - Flow engine value of type {@linkcode FlowContext}.
 * @param timeout - Transition delay in milliseconds before closing the panel.
 *   Defaults to `270`.
 *
 * @returns An object containing reactive accessors and mutation callbacks for the
 *   active node and edge.
 */
export const useHook = <D extends Data = Data, E extends Data = Data>(
  flow: FlowContext,
  timeout = 270,
) => {
  const { hooks, sender, send } = flow;

  /** Sender bound to the `SET_NODE_DATA` event of the flow service. */
  const senderNodeData = sender('SET_NODE_DATA');

  /** Sender bound to the `SET_EDGE_DATA` event of the flow service. */
  const senderEdgeData = sender('SET_EDGE_DATA');

  /** Reactive accessor telling whether a node or edge is being edited. */
  const initial = hooks.state({ selector: ({ context: { editing } }) => !!editing });

  const {
    closing,
    hasEntered,
    handleClickOutside,
    handleMouseEnter,
    close,
    directClose,
  } = useClose({
    close: () => send('STOP_EDIT'),
    timers: { all: timeout },
    initial,
  });

  /** Reactive node currently being edited, with its typed data. */
  const _editingNode = hooks.state({
    selector: ({ context }) => {
      const editingId = context.editing;
      if (!isDefined(editingId)) return;

      const item = context.data?.nodes?.find(n => n.id === editingId);
      if (!isDefined(item)) return;

      return { id: item.id, data: item.data as D };
    },

    equals: deepEqual<any>,
  });

  /** Reactive edge currently being edited, with its typed data. */
  const _editingEdge = hooks.state({
    selector: ({ context }) => {
      const editingId = context.editing;
      if (!isDefined(editingId)) return;

      const item = context.data?.edges?.find(e => e.id === editingId);
      if (!isDefined(item)) return;

      return { id: item.id, data: (item.data ?? {}) as E };
    },

    equals: deepEqual<any>,
  });

  /**
   * Merges partial data into the node currently being edited.
   *
   * @param data - Partial node data to merge.
   */
  const updateNodeData = (data: Partial<D>) => {
    const current = _editingNode();
    if (!current) return;

    return senderNodeData({ ...current, data: { ...current.data, ...data } });
  };

  /**
   * Updates a single field of the node currently being edited.
   *
   * @template K - Key of the node data type to update.
   *
   * @param field - Field name to update.
   * @param value - New value assigned to the field.
   */
  const updateNodeField = <K extends keyof D>(field: K, value: D[K]) => {
    return updateNodeData({ [field]: value } as any);
  };

  /**
   * Merges partial data into the edge currently being edited.
   *
   * @param data - Partial edge data to merge.
   */
  const updateEdgeData = (data: Partial<E>) => {
    const current = _editingEdge();
    if (!current) return;

    return senderEdgeData({ ...current, data: { ...current.data, ...data } });
  };

  /**
   * Updates a single field of the edge currently being edited.
   *
   * @template K - Key of the edge data type to update.
   *
   * @param field - Field name to update.
   * @param value - New value assigned to the field.
   */
  const updateEdgeField = <K extends keyof E>(field: K, value: E[K]) => {
    return updateEdgeData({ [field]: value } as any);
  };

  /** Public accessor for the currently edited node. */
  const editingNode = _editingNode as Accessor<{ id: string; data: D }>;

  /** Public accessor for the currently edited edge. */
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
    hasEntered,
    handleClickOutside,
    handleMouseEnter,
  };
};
