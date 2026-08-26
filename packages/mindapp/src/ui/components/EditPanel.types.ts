import type { Component, JSX } from 'solid-js';

import type { ClassList } from '../globals/types';
import { useHook } from './EditPanel.hooks';
import type { NodeData } from './FlowChart';

/**
 * Render properties and mutation callbacks provided to {@linkcode EditPanel} children
 * or custom component.
 *
 * @template | {@linkcode NodeData} `D` - Custom node data dictionary type extending
 *   {@linkcode NodeData}.
 */
export type EditPanelChildProps<D extends NodeData = NodeData> = ReturnType<
  typeof useHook<D>
>;

/**
 * Configuration properties for the generic {@linkcode EditPanel} component.
 *
 * @template | {@linkcode NodeData} `D` - Custom node data dictionary type extending
 *   {@linkcode NodeData}.
 */
export type EditPanelProps<D extends NodeData = NodeData> = {
  /** Optional additional CSS classes for the outer container card. */
  class?: string;
  /** Optional class map for conditional styling. */
  classList?: ClassList | ((hooks: EditPanelChildProps<D>) => ClassList);
  /** Optional inline CSS styles. */
  style?: JSX.CSSProperties | string;
  /**
   * Custom header renderer.
   *
   * @param props - Header props containing the edited node `id` and `close`
   *   callback.
   */
  header?: Component<{ id: string; close: () => void }>;
  /**
   * Custom content renderer or static children. When provided as a function,
   * receives {@linkcode EditPanelChildProps}.
   */
  children: Component<EditPanelChildProps<D>>;

  timeout?: number;
};
