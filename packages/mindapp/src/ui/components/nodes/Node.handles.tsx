import { For, Show, type Accessor, type Component } from 'solid-js';

import { HANDLE_CONTAINER_OFFSET_X, HANDLE_SIZE } from '#services/main.machine.data';
import { getHandleOffsetPercent } from '#services/main.machine.helpers';
import type {
  HandlePosition,
  HandleType,
  NodeHandles_T,
} from '#services/main.machine.typings';

/** Properties for the internal {@linkcode HandleItem} component. */
export type HandleItemProps = {
  /** Handle category as input, output, or none of type {@linkcode HandleType}. */
  type: HandleType;
  /** Optional custom background color for the handle. */
  color?: string;
  /** Node identifier this handle belongs to. */
  nodeId: string;
  /** Node side where this handle is positioned of type {@linkcode HandlePosition}. */
  side: HandlePosition;
  /** Zero-based index of the handle along that side. */
  index: number;
  /** Callback triggered when completing an edge connection to this handle. */
  onAddEdge: (side: HandlePosition, index: number) => void;
  /** Callback triggered when starting a new edge drag from this handle. */
  onStartEdge: (side: HandlePosition, index: number) => void;
};

/**
 * Visual handle bubble element supporting mouse connection drag interactions.
 *
 * @param props - Component properties of type {@linkcode HandleItemProps}.
 *
 * @returns The rendered handle element.
 *
 * @see {@linkcode HANDLE_SIZE}
 */
export const HandleItem: Component<HandleItemProps> = props => {
  const isInput = props.type === 'input';
  const isNone = props.type === 'none';

  return (
    <div
      data-handle-type={props.type}
      data-node-id={props.nodeId}
      data-handle-position={props.side}
      data-handle-index={props.index}

      classList={{
        'rounded-full shadow-md transition-transform duration-150 ease-in-out': true,
        'bg-[#e38b29]': !props.color,
        'pointer-events-none': isNone,
        'hover:scale-150 pointer-events-all': !isNone,
        'cursor-default': isInput,
        'cursor-crosshair': !isInput && !isNone,
      }}

      style={{
        width: `${HANDLE_SIZE}px`,
        height: `${HANDLE_SIZE}px`,
        ...(props.color ? { 'background-color': props.color } : {}),
      }}

      onPointerDown={e => {
        if (!isNone) e.stopPropagation();
      }}

      onMouseDown={e => {
        if (isNone) return;
        e.stopPropagation();
        if (props.type === 'output') {
          props.onStartEdge(props.side, props.index);
        }
      }}

      onMouseUp={e => {
        if (isNone) return;
        e.stopPropagation();
        if (isInput) {
          props.onAddEdge(props.side, props.index);
        }
      }}
    />
  );
};

/** Properties for the {@linkcode NodeHandles} component. */
export type NodeHandlesProps = {
  /**
   * Accessor providing the resolved node handles configuration of type
   * {@linkcode NodeHandles_T}.
   */
  resolvedHandles: Accessor<NodeHandles_T>;
  /** Unique identifier of the node. */
  id: string;
  /** Callback triggered when completing an edge connection to this handle. */
  onAddEdge: (side: HandlePosition, index: number) => void;
  /** Callback triggered when starting a new edge drag from this handle. */
  onStartEdge: (side: HandlePosition, index: number) => void;
};

/**
 * Container rendering all dynamic connection handles positioned along each border of
 * a node.
 *
 * @param props - Component properties of type {@linkcode NodeHandlesProps}.
 *
 * @returns The rendered node handles element.
 *
 * @see {@linkcode HandleItem}, -- type {@linkcode NodeHandles_T}
 */
export const NodeHandles: Component<NodeHandlesProps> = props => (
  <>
    {/* Dynamic multi-side centered handles */}

    {/* Top handles */}
    <Show when={(props.resolvedHandles().top?.length ?? 0) > 0}>
      <div
        id='handles-top'
        class='pointer-events-none absolute inset-x-0 top-0 z-10'
        style={{
          top: `-${HANDLE_CONTAINER_OFFSET_X}px`,
          height: `${HANDLE_SIZE}px`,
        }}
      >
        <For each={props.resolvedHandles().top}>
          {(handle, index) => (
            <div
              class='pointer-events-none absolute'
              style={{
                left: `${getHandleOffsetPercent(index(), props.resolvedHandles().top!.length)}%`,
                top: '0px',
                transform: 'translateX(-50%)',
                width: `${HANDLE_SIZE}px`,
                height: `${HANDLE_SIZE}px`,
              }}
            >
              <HandleItem
                type={handle.type}
                color={handle.color}
                nodeId={props.id}
                side='top'
                index={index()}
                onAddEdge={props.onAddEdge}
                onStartEdge={props.onStartEdge}
              />
            </div>
          )}
        </For>
      </div>
    </Show>

    {/* Bottom handles */}
    <Show when={(props.resolvedHandles().bottom?.length ?? 0) > 0}>
      <div
        id='handles-bottom'
        class='pointer-events-none absolute inset-x-0 bottom-0 z-10'
        style={{
          bottom: `-${HANDLE_CONTAINER_OFFSET_X}px`,
          height: `${HANDLE_SIZE}px`,
        }}
      >
        <For each={props.resolvedHandles().bottom}>
          {(handle, index) => (
            <div
              class='pointer-events-none absolute'
              style={{
                left: `${getHandleOffsetPercent(index(), props.resolvedHandles().bottom!.length)}%`,
                bottom: '0px',
                transform: 'translateX(-50%)',
                width: `${HANDLE_SIZE}px`,
                height: `${HANDLE_SIZE}px`,
              }}
            >
              <HandleItem
                type={handle.type}
                color={handle.color}
                nodeId={props.id}
                side='bottom'
                index={index()}
                onAddEdge={props.onAddEdge}
                onStartEdge={props.onStartEdge}
              />
            </div>
          )}
        </For>
      </div>
    </Show>

    {/* Left handles */}
    <Show when={(props.resolvedHandles().left?.length ?? 0) > 0}>
      <div
        id='handles-left'
        class='pointer-events-none absolute inset-y-0 left-0 z-10'
        style={{
          left: `-${HANDLE_CONTAINER_OFFSET_X}px`,
          width: `${HANDLE_SIZE}px`,
        }}
      >
        <For each={props.resolvedHandles().left}>
          {(handle, index) => (
            <div
              class='pointer-events-none absolute'
              style={{
                top: `${getHandleOffsetPercent(index(), props.resolvedHandles().left!.length)}%`,
                left: '0px',
                transform: 'translateY(-50%)',
                width: `${HANDLE_SIZE}px`,
                height: `${HANDLE_SIZE}px`,
              }}
            >
              <HandleItem
                type={handle.type}
                color={handle.color}
                nodeId={props.id}
                side='left'
                index={index()}
                onAddEdge={props.onAddEdge}
                onStartEdge={props.onStartEdge}
              />
            </div>
          )}
        </For>
      </div>
    </Show>

    {/* Right handles */}
    <Show when={(props.resolvedHandles().right?.length ?? 0) > 0}>
      <div
        id='handles-right'
        class='pointer-events-none absolute inset-y-0 right-0 z-10'
        style={{
          right: `-${HANDLE_CONTAINER_OFFSET_X}px`,
          width: `${HANDLE_SIZE}px`,
        }}
      >
        <For each={props.resolvedHandles().right}>
          {(handle, index) => (
            <div
              class='pointer-events-none absolute'
              style={{
                top: `${getHandleOffsetPercent(index(), props.resolvedHandles().right!.length)}%`,
                right: '0px',
                transform: 'translateY(-50%)',
                width: `${HANDLE_SIZE}px`,
                height: `${HANDLE_SIZE}px`,
              }}
            >
              <HandleItem
                type={handle.type}
                color={handle.color}
                nodeId={props.id}
                side='right'
                index={index()}
                onAddEdge={props.onAddEdge}
                onStartEdge={props.onStartEdge}
              />
            </div>
          )}
        </For>
      </div>
    </Show>
  </>
);
