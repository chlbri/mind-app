import { deepEqual } from '@bemedev/app/utils';
import { Canvas, type FabricObject } from 'fabric';
import { createEffect, onCleanup, onMount, untrack, type JSX } from 'solid-js';

import { DEFAULT_NODES, DEFAULT_SIZE } from '#services/main.machine.data';
import { getHandlePosition } from '#services/main.machine.helpers';
import type {
  Data,
  Edge,
  HandlePosition,
  HandleType,
  Node,
  Point,
  Vector,
} from '#services/main.machine.typings';

import {
  createEdgePath,
  createHandleCircle,
  createNodeLabel,
  createNodeRect,
  createPreviewPath,
  disposeFabricObject,
  labelOf,
  setEdgeSelected,
  setNodeSelected,
} from '../globals/fabric/factories';
import { edgePathData } from '../globals/fabric/paths';
import type { FabricCanvasProps } from './Canvas.types';
import { Panels } from './Panels';

/** Node record tracked by the canvas reconciliation. */
type NodeRecord = {
  /** Node body rectangle of type `Rect`. */
  rect: ReturnType<typeof createNodeRect>;
  /** Node label textbox of type `Textbox`. */
  label: ReturnType<typeof createNodeLabel>;
  /** Extra fabric objects returned by the custom renderer. */
  extras: FabricObject[];
  /** Last rendered label text, used to skip redundant updates. */
  text: string;
  /** Last measured node width in pixels. */
  width: number;
  /** Last measured node height in pixels. */
  height: number;
  /** Last data reference rendered by the custom renderer. */
  lastData: unknown;
  /** Last selection state rendered by the custom renderer. */
  lastSelected: boolean | undefined;
  /** Last position applied to the custom renderer extras. */
  lastPosition: Point;
};

/** Edge record tracked by the canvas reconciliation. */
type EdgeRecord = {
  /** Edge path of type `Path`. */
  path: ReturnType<typeof createEdgePath>;
  /** Extra fabric objects returned by the custom renderer. */
  extras: FabricObject[];
  /** Last data reference rendered by the custom renderer. */
  lastData: unknown;
  /** Last selection state rendered by the custom renderer. */
  lastSelected: boolean | undefined;
  /** Last midpoint applied to the custom renderer extras. */
  lastMidpoint: Point;
};

/** Resolved handle specification of a node. */
type HandleSpec = {
  /** Handle side of type {@linkcode HandlePosition}. */
  side: HandlePosition;
  /** Zero-based index along the side. */
  index: number;
  /** Total number of handles on the side. */
  total: number;
  /** Handle classification of type {@linkcode HandleType}. */
  type: HandleType;
  /** Optional custom color. */
  color?: string;
};

/**
 * Canvas flowchart renderer powered by fabric.js.
 *
 * Renders every flowchart node as a draggable rounded rectangle with a centered
 * label and connection handles, every edge as a curved path, and the ongoing
 * connection preview as a dashed path. Node dragging, selection, edition
 * (double-click), panning and zooming are wired to the flow state machine.
 *
 * @template | {@linkcode Data} `N` - Custom node data dictionary type extending type
 *   {@linkcode Data}.
 * @template | {@linkcode Data} `E` - Custom edge data dictionary type extending type
 *   {@linkcode Data}.
 *
 * @param props - Canvas configuration, event handlers, and flow value of type
 *   {@linkcode FabricCanvasProps}.
 *
 * @returns The rendered Solid component.
 *
 * @see {@linkcode createNodeRect}, {@linkcode createEdgePath}
 */
export const FabricCanvas = <N extends Data = Data, E extends Data = Data>(
  props: FabricCanvasProps<N, E>,
): JSX.Element => {
  const { service, hooks, send } = props.flow;

  /** Reactive graph data of the machine context. */
  const data = hooks.state({
    selector: s => s.context.data,
    equals: deepEqual<any>,
  });
  /** Reactive selected identifier of the machine context. */
  const selected = hooks.state({ selector: s => s.context.selected });
  /** Reactive zoom factor of the machine context. */
  const zoom = hooks.state({ selector: s => s.context.zoom });
  /** Reactive edge vectors indexed by edge id. */
  const edgesPositions = hooks.state({
    selector: s => s.context.edgesPositions,
    equals: deepEqual<any>,
  });
  /** Reactive ongoing connection preview of the machine context. */
  const newEdge = hooks.state({
    selector: s => s.context.newEdge,
    equals: deepEqual<any>,
  });

  /** Container element receiving the fabric canvas. */
  let container: HTMLDivElement | undefined;
  /** HTML canvas element bound to fabric. */
  let canvasEl: HTMLCanvasElement | undefined;
  /** Fabric canvas instance, undefined before mount and without a 2D context. */
  let canvas: Canvas | undefined;
  /** Observer resizing the canvas with its container. */
  let resizeObserver: ResizeObserver | undefined;
  /** Timeout identifier of the delayed mount. */
  let mountTimeout: ReturnType<typeof setTimeout> | undefined;

  /** Canvas width in CSS pixels. */
  let width = 0;
  /** Canvas height in CSS pixels. */
  let height = 0;
  /** Horizontal pan offset in CSS pixels. */
  let panX = 0;
  /** Vertical pan offset in CSS pixels. */
  let panY = 0;
  /** Last zoom applied to the viewport transform. */
  let appliedZoom = 1;
  /** Anchor point of the last wheel zoom, in canvas-local pixels. */
  let zoomAnchor: Point | undefined;
  /** Ongoing pan gesture state, undefined when idle. */
  let panning: { x: number; y: number; panX: number; panY: number } | undefined;
  /** Ongoing connection gesture state, undefined when idle. */
  let edgeDrag:
    | { from: string; fromPosition: HandlePosition; fromIndex: number }
    | undefined;
  /** Guards the zoom effect against viewport feedback loops. */
  let applyingViewport = false;

  /** Node records indexed by node id. */
  const nodeRecords = new Map<string, NodeRecord>();
  /** Edge records indexed by edge id. */
  const edgeRecords = new Map<string, EdgeRecord>();
  /** Handle circles indexed by node id. */
  const handleRecords = new Map<
    string,
    { circles: FabricObject[]; signature: string }
  >();
  /** Dashed preview path of the ongoing connection. */
  let preview: FabricObject | undefined;

  onCleanup(service.pause);

  /**
   * Resolves the canvas bounding rectangle in client coordinates.
   *
   * @returns The bounding rectangle, or `undefined` before mount.
   */
  const canvasRect = (): DOMRect | undefined => {
    return canvas?.getElement()?.getBoundingClientRect();
  };

  /**
   * Builds the board layout payload consumed by the flow engine coordinate helpers.
   *
   * The canvas pan offset is folded into `self.left`/`self.top` and the mirrored
   * scroll fields, so the shared 2D machine math applies unchanged.
   *
   * @returns The board payload.
   */
  const boardPayload = () => {
    const rect = canvasRect();
    const left = (rect?.left ?? 0) + panX;
    const top = (rect?.top ?? 0) + panY;

    return {
      self: { left, top, width, height },
      parent: { scrollLeft: -panX, scrollTop: -panY, width, height },
    };
  };

  /** Publishes the current canvas viewport to the flow engine board state. */
  const syncBoard = (): void => {
    send({ type: 'SET_BOARD', payload: boardPayload() });
  };

  /** Applies the current zoom and pan to the fabric viewport transform. */
  const applyViewport = (): void => {
    if (!canvas) return;
    applyingViewport = true;
    canvas.setViewportTransform([appliedZoom, 0, 0, appliedZoom, panX, panY]);
    applyingViewport = false;
  };

  /**
   * Resolves the handle specifications of a node.
   *
   * Nodes without an explicit `handles` configuration receive the default single
   * input on the left and single output on the right, matching the edge resolution
   * of the flow engine.
   *
   * @param node - Node entity of type {@linkcode Node}.
   *
   * @returns The resolved handle specifications of type {@linkcode HandleSpec}.
   */
  const handleSpecs = (node: Node): HandleSpec[] => {
    if (!node.handles) {
      return [
        { side: 'left', index: 0, total: 1, type: 'input' },
        { side: 'right', index: 0, total: 1, type: 'output' },
      ];
    }

    const sides: HandlePosition[] = ['top', 'right', 'bottom', 'left'];
    const specs: HandleSpec[] = [];

    for (const side of sides) {
      const list = node.handles[side] ?? [];
      list.forEach((handle, index) => {
        specs.push({
          side,
          index,
          total: list.length,
          type: handle.type,
          color: handle.color,
        });
      });
    }

    return specs;
  };

  /**
   * Resolves the size used by the flow engine for a node.
   *
   * @param record - Node record of type {@linkcode NodeRecord}.
   *
   * @returns The node size in pixels.
   */
  const sizeOf = (record: NodeRecord) => ({
    width: record.rect.width ?? DEFAULT_SIZE.width,
    height: record.rect.height ?? DEFAULT_SIZE.height,
  });

  /** Restores the canvas paint order: edges, preview, nodes, handles. */
  const restack = (): void => {
    if (!canvas) return;

    const order: FabricObject[] = [];
    for (const record of edgeRecords.values()) {
      order.push(record.path, ...record.extras);
    }
    if (preview) order.push(preview);
    for (const record of nodeRecords.values()) {
      order.push(record.rect, record.label, ...record.extras);
    }
    for (const record of handleRecords.values()) {
      order.push(...record.circles);
    }

    const target = canvas as unknown as {
      moveObjectTo?: (object: FabricObject, index: number) => void;
    };

    order.forEach((object, index) => target.moveObjectTo?.(object, index));
  };

  /**
   * Reconciles the node objects with the machine graph data.
   *
   * @param nodes - Graph nodes of type {@linkcode Node}.
   * @param selectedId - Currently selected identifier.
   */
  const reconcileNodes = (nodes: Node[], selectedId: string | undefined): void => {
    if (!canvas) return;

    const ids = new Set(nodes.map(node => node.id));
    for (const [id, record] of nodeRecords) {
      if (ids.has(id)) continue;
      canvas.remove(record.rect, record.label, ...record.extras);
      disposeFabricObject(record.rect);
      disposeFabricObject(record.label);
      record.extras.forEach(disposeFabricObject);
      nodeRecords.delete(id);
    }

    for (const [id, record] of handleRecords) {
      if (ids.has(id)) continue;
      canvas.remove(...record.circles);
      record.circles.forEach(disposeFabricObject);
      handleRecords.delete(id);
    }

    for (const node of nodes) {
      const position = node.position;
      const isSelected = selectedId === node.id;
      const text = labelOf(node.data, node.id);
      let record = nodeRecords.get(node.id);

      if (!record) {
        const rect = createNodeRect({
          id: node.id,
          left: position.x,
          top: position.y,
        });
        const label = createNodeLabel({
          id: node.id,
          text,
          left: position.x + DEFAULT_SIZE.width / 2,
          top: position.y + DEFAULT_SIZE.height / 2,
          width: DEFAULT_SIZE.width - 24,
        });

        record = {
          rect,
          label,
          extras: [],
          text,
          width: DEFAULT_SIZE.width,
          height: DEFAULT_SIZE.height,
          lastData: undefined,
          lastSelected: undefined,
          lastPosition: { ...position },
        };
        nodeRecords.set(node.id, record);
        canvas.add(rect, label);
      }

      const size = sizeOf(record);
      record.rect.set({ left: position.x, top: position.y });
      record.rect.setCoords();

      if ((globalThis as any).__MIND_DEBUG) {
        console.log(
          '[mind-fabric] ' +
            JSON.stringify({
              id: node.id,
              position,
              rect: {
                left: record.rect.left,
                top: record.rect.top,
                width: size.width,
              },
              label: { left: record.label.left, top: record.label.top },
              container: { width, height },
              vpt: canvas.viewportTransform,
              element: {
                width: canvas.getElement()?.clientWidth,
                height: canvas.getElement()?.clientHeight,
              },
            }),
        );
      }
      record.label.set({
        left: position.x + size.width / 2,
        top: position.y + size.height / 2,
        width: Math.max(40, size.width - 24),
      });

      if (record.text !== text) {
        record.text = text;
        record.label.set({ text });
      }

      setNodeSelected(record.rect, record.label, isSelected);

      const dataChanged = record.lastData !== node.data;
      const selectionChanged = record.lastSelected !== isSelected;

      if (props.Node && (dataChanged || selectionChanged)) {
        record.lastData = node.data;
        record.lastSelected = isSelected;

        const extras = props.Node({
          ...(node as Node<N>),
          selected: isSelected,
          rect: record.rect,
          label: record.label,
        });

        record.extras.forEach(extra => {
          canvas!.remove(extra);
          disposeFabricObject(extra);
        });

        record.extras = extras ?? [];

        for (const extra of record.extras) {
          extra.set({
            left: position.x + (extra.left ?? 0),
            top: position.y + (extra.top ?? 0),
          });
          canvas.add(extra);
        }

        record.lastPosition = { ...position };
      } else if (record.extras.length > 0) {
        const dx = position.x - record.lastPosition.x;
        const dy = position.y - record.lastPosition.y;

        if (dx !== 0 || dy !== 0) {
          for (const extra of record.extras) {
            extra.set({ left: (extra.left ?? 0) + dx, top: (extra.top ?? 0) + dy });
          }
          record.lastPosition = { ...position };
        }
      }

      const signature = JSON.stringify(handleSpecs(node));
      const existing = handleRecords.get(node.id);

      if (!existing || existing.signature !== signature) {
        if (existing) {
          canvas.remove(...existing.circles);
          existing.circles.forEach(disposeFabricObject);
        }

        const circles: FabricObject[] = [];

        if (props.handles !== false) {
          for (const spec of handleSpecs(node)) {
            const point = getHandlePosition(
              position,
              size,
              spec.side,
              spec.index,
              spec.total,
            );

            const circle = createHandleCircle({
              id: node.id,
              side: spec.side,
              index: spec.index,
              type: spec.type,
              left: point.x,
              top: point.y,
              color: spec.color,
            });

            if (spec.type === 'none') circle.set({ opacity: 0 });
            circles.push(circle);
            canvas.add(circle);
          }
        }

        handleRecords.set(node.id, { circles, signature });
      } else {
        const specs = handleSpecs(node);
        existing.circles.forEach((circle, index) => {
          const spec = specs[index];
          if (!spec) return;
          const point = getHandlePosition(
            position,
            size,
            spec.side,
            spec.index,
            spec.total,
          );
          circle.set({ left: point.x, top: point.y });
        });
      }

      const measuredWidth = size.width;
      const measuredHeight = size.height;
      if (record.width !== measuredWidth || record.height !== measuredHeight) {
        record.width = measuredWidth;
        record.height = measuredHeight;
      }
    }
  };

  /**
   * Reconciles the edge objects with the machine graph data and vectors.
   *
   * @param edges - Graph edges of type {@linkcode Edge}.
   * @param positions - Edge vectors indexed by edge id of type {@linkcode Vector}.
   * @param selectedId - Currently selected identifier.
   */
  const reconcileEdges = (
    edges: (Edge & { id: string })[],
    positions: Record<string, Vector>,
    selectedId: string | undefined,
  ): void => {
    if (!canvas) return;

    const ids = new Set(edges.map(edge => edge.id));
    for (const [id, record] of edgeRecords) {
      if (ids.has(id)) continue;
      canvas.remove(record.path, ...record.extras);
      disposeFabricObject(record.path);
      record.extras.forEach(disposeFabricObject);
      edgeRecords.delete(id);
    }

    for (const edge of edges) {
      const vector = positions[edge.id];
      let record = edgeRecords.get(edge.id);

      if (!record) {
        record = {
          path: createEdgePath({ id: edge.id, data: '' }),
          extras: [],
          lastData: undefined,
          lastSelected: undefined,
          lastMidpoint: { x: 0, y: 0 },
        };
        edgeRecords.set(edge.id, record);
        canvas.add(record.path);
      }

      const isSelected = selectedId === edge.id;

      if (vector) {
        const data = edgePathData(vector);
        record.path.set({ path: data });
        record.path.setCoords();
      }

      setEdgeSelected(record.path, isSelected);

      const dataChanged = record.lastData !== edge.data;
      const selectionChanged = record.lastSelected !== isSelected;

      if (props.Edge && (dataChanged || selectionChanged)) {
        record.lastData = edge.data;
        record.lastSelected = isSelected;

        const extras = props.Edge({
          ...(edge as Edge<E> & { id: string }),
          selected: isSelected,
          path: record.path,
        });

        record.extras.forEach(extra => {
          canvas!.remove(extra);
          disposeFabricObject(extra);
        });

        record.extras = extras ?? [];

        for (const extra of record.extras) {
          canvas.add(extra);
        }

        if (vector) {
          record.lastMidpoint = {
            x: (vector.x0 + vector.x1) / 2,
            y: (vector.y0 + vector.y1) / 2,
          };
        }
      } else if (record.extras.length > 0 && vector) {
        const midpoint = {
          x: (vector.x0 + vector.x1) / 2,
          y: (vector.y0 + vector.y1) / 2,
        };
        const dx = midpoint.x - record.lastMidpoint.x;
        const dy = midpoint.y - record.lastMidpoint.y;

        if (dx !== 0 || dy !== 0) {
          for (const extra of record.extras) {
            extra.set({ left: (extra.left ?? 0) + dx, top: (extra.top ?? 0) + dy });
          }
          record.lastMidpoint = midpoint;
        }
      }
    }
  };

  /**
   * Reconciles the dashed preview path of the ongoing connection.
   *
   * @param edge - Ongoing connection preview of the machine context.
   */
  const reconcilePreview = (
    edge: { x0: number; y0: number; x1: number; y1: number } | undefined,
  ): void => {
    if (!canvas) return;

    if (!edge) {
      if (preview) {
        canvas.remove(preview);
        disposeFabricObject(preview);
        preview = undefined;
      }
      return;
    }

    const vector: Vector = { x0: edge.x0, y0: edge.y0, x1: edge.x1, y1: edge.y1 };
    const path = edgePathData(vector, { curvature: 20 });

    if (!preview) {
      preview = createPreviewPath(path);
      canvas.add(preview);
    } else {
      preview.set({ path });
      preview.setCoords();
    }
  };

  /**
   * Resolves the handle metadata of a fabric target object.
   *
   * @param target - Fabric object of type `FabricObject` or `undefined`.
   *
   * @returns The handle metadata, or `undefined` when the target is not a handle.
   */
  const handleMetaOf = (
    target: FabricObject | undefined,
  ):
    | { id: string; side: HandlePosition; index: number; type: HandleType }
    | undefined => {
    if (!target) return undefined;
    const candidate = target as unknown as {
      nodeId?: string;
      handleSide?: HandlePosition;
      handleIndex?: number;
      handleType?: HandleType;
    };

    if (!candidate.nodeId || !candidate.handleSide) return undefined;

    return {
      id: candidate.nodeId,
      side: candidate.handleSide,
      index: candidate.handleIndex ?? 0,
      type: candidate.handleType ?? 'input',
    };
  };

  /** Pointer-down handler: starts a connection drag, selects a node, or pans. */
  const onMouseDown = (options: { e: MouseEvent; target?: FabricObject }): void => {
    if (!canvas) return;

    const event = options.e;

    const handle = handleMetaOf(options.target);

    if (handle && handle.type === 'output') {
      edgeDrag = {
        from: handle.id,
        fromPosition: handle.side,
        fromIndex: handle.index,
      };
      send({
        type: 'START_NEW_EDGE',
        payload: { from: handle.id, position: handle.side, index: handle.index },
      });
      return;
    }

    const nodeId = (options.target as unknown as { nodeId?: string } | undefined)
      ?.nodeId;

    if (nodeId) {
      send({ type: 'SELECT', payload: nodeId });
      return;
    }

    panning = { x: event.clientX, y: event.clientY, panX, panY };
    canvas.set({ selection: false });
  };

  /** Pointer-move handler: previews connections, updates panning, moves nodes. */
  const onMouseMove = (options: { e: MouseEvent }): void => {
    if (!canvas) return;
    const event = options.e;

    if (edgeDrag) {
      send({
        type: 'MOVE_NEW_EDGE',
        payload: { x: event.clientX, y: event.clientY },
      });
      return;
    }

    if (panning) {
      panX = panning.panX + (event.clientX - panning.x);
      panY = panning.panY + (event.clientY - panning.y);
      applyViewport();
      syncBoard();
    }
  };

  /** Pointer-up handler: commits connections, nodes, edges and pans. */
  const onMouseUp = (options: { e: MouseEvent; target?: FabricObject }): void => {
    if (!canvas) return;
    const event = options.e;

    if (edgeDrag) {
      const handle = handleMetaOf(options.target);

      if (handle && handle.type === 'input' && handle.id !== edgeDrag.from) {
        send({
          type: 'ADD_EDGE',
          payload: {
            from: edgeDrag.from,
            to: handle.id,
            toPosition: handle.side,
            toIndex: handle.index,
            fromPosition: edgeDrag.fromPosition,
            fromIndex: edgeDrag.fromIndex,
          },
        });
      } else {
        send('CLEAR_NEW_EDGE');
      }

      edgeDrag = undefined;
      return;
    }

    if (panning) {
      panning = undefined;
      return;
    }

    void event;
    send({ type: 'COMMIT', payload: undefined });
  };

  /** Double-click handler: opens the editor on the hit node. */
  const onDoubleClick = (options: {
    e: MouseEvent;
    target?: FabricObject;
  }): void => {
    const nodeId = (options.target as unknown as { nodeId?: string } | undefined)
      ?.nodeId;

    if (!nodeId) {
      send('DESELECT');
      return;
    }

    send({ type: 'EDIT', payload: nodeId });
  };

  /** Wheel handler: zooms the viewport around the pointer. */
  const onMouseWheel = (options: { e: WheelEvent }): void => {
    if (!canvas) return;
    const event = options.e;
    event.preventDefault();

    const rect = canvasRect();
    zoomAnchor = {
      x: event.clientX - (rect?.left ?? 0),
      y: event.clientY - (rect?.top ?? 0),
    };

    send({ type: 'ZOOM', payload: -event.deltaY / 500 });
  };

  /** Drag handler: pushes the dragged node position into the machine. */
  const onObjectMoving = (options: { target?: FabricObject }): void => {
    const target = options.target;
    if (!target) return;

    const nodeId = (target as unknown as { nodeId?: string }).nodeId;
    if (!nodeId) return;

    send({
      type: 'MOVE',
      payload: {
        id: nodeId,
        x: Math.round(target.left ?? 0),
        y: Math.round(target.top ?? 0),
      },
    });
  };

  /** Resizes the canvas with its container. */
  const resize = (): void => {
    if (!canvas || !container) return;

    width = container.clientWidth;
    height = container.clientHeight;
    if (width <= 0 || height <= 0) return;

    canvas.setDimensions({ width, height });
    applyViewport();
    syncBoard();
  };

  createEffect(() => {
    const current = data();
    const selectedId = selected();
    const positions = edgesPositions();

    if (!current) return;

    reconcileNodes((current.nodes ?? []) as Node[], selectedId);
    reconcileEdges(
      (current.edges ?? []) as (Edge & { id: string })[],
      positions ?? {},
      selectedId,
    );
    restack();
    canvas?.requestRenderAll();
  });

  createEffect(() => {
    reconcilePreview(newEdge());
    restack();
    canvas?.requestRenderAll();
  });

  createEffect(() => {
    const next = zoom();
    if (!canvas || applyingViewport) return;

    const factor = next / appliedZoom;
    if (Math.abs(factor - 1) < 1e-6) return;

    if (zoomAnchor) {
      panX = zoomAnchor.x - factor * (zoomAnchor.x - panX);
      panY = zoomAnchor.y - factor * (zoomAnchor.y - panY);
      zoomAnchor = undefined;
    }

    appliedZoom = next;
    applyViewport();
    syncBoard();
  });

  onMount(() => {
    service.resume();

    if (props.register) {
      service.addOptions(({ action }) => ({
        actions: { register: action(({ context }) => props.register!(context)) },
      }));
    }

    if (props.edgesAllowed) {
      const edgesAllowed = props.edgesAllowed;
      service.addOptions(() => ({
        guards: {
          edgesAllowed: {
            ADD_EDGE: ({ context: { data }, payload }) => {
              const first = data?.nodes?.find(({ id }) => payload.from === id) as
                | Node<N>
                | undefined;
              const second = data?.nodes?.find(({ id }) => payload.to === id) as
                | Node<N>
                | undefined;

              if (!first || !second) return false;
              return edgesAllowed(first, second, payload);
            },
          },
        },
      }));
    }

    /** Creates the fabric canvas, wires its events and configures the graph. */
    const mount = (): void => {
      if (!container || !canvasEl) return;

      try {
        canvas = new Canvas(canvasEl, {
          selection: false,
          preserveObjectStacking: true,
          renderOnAddRemove: false,
          fireRightClick: false,
          stopContextMenu: true,
          ...(props.background ? { backgroundColor: props.background } : {}),
        });
      } catch {
        canvas = undefined;
      }

      if (canvas) {
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.setDimensions({ width, height });

        canvas.on('mouse:down', onMouseDown as any);
        canvas.on('mouse:move', onMouseMove as any);
        canvas.on('mouse:up', onMouseUp as any);
        canvas.on('mouse:dblclick', onDoubleClick as any);
        canvas.on('mouse:wheel', onMouseWheel as any);
        canvas.on('object:moving', onObjectMoving as any);

        applyViewport();
        syncBoard();

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);
      }

      send({
        type: 'CONFIGURE',
        payload: {
          nodes: (props.config?.nodes ?? DEFAULT_NODES) as any,
          edges: (props.config?.edges ?? []) as any,
          defaultData: props.defaultData,
        },
      });
    };

    if (props.delay) {
      mountTimeout = setTimeout(mount, props.delay);
    } else {
      mount();
    }
  });

  onCleanup(() => {
    if (mountTimeout) clearTimeout(mountTimeout);
    resizeObserver?.disconnect();

    if (canvas) {
      canvas.off('mouse:down', onMouseDown as any);
      canvas.off('mouse:move', onMouseMove as any);
      canvas.off('mouse:up', onMouseUp as any);
      canvas.off('mouse:dblclick', onDoubleClick as any);
      canvas.off('mouse:wheel', onMouseWheel as any);
      canvas.off('object:moving', onObjectMoving as any);

      for (const record of nodeRecords.values()) {
        disposeFabricObject(record.rect);
        disposeFabricObject(record.label);
        record.extras.forEach(disposeFabricObject);
      }
      for (const record of edgeRecords.values()) {
        disposeFabricObject(record.path);
        record.extras.forEach(disposeFabricObject);
      }
      for (const record of handleRecords.values()) {
        record.circles.forEach(disposeFabricObject);
      }
      if (preview) disposeFabricObject(preview);

      nodeRecords.clear();
      edgeRecords.clear();
      handleRecords.clear();
      preview = undefined;

      void canvas.dispose();
      canvas = undefined;
    }
  });

  /** Zoom controls overlay handlers. */
  const zoomBy = (delta: number) => () => send({ type: 'ZOOM', payload: delta });

  return (
    <div
      class='relative h-full w-full overflow-hidden'
      ref={el => (container = el)}
      style={
        props.grid === false
          ? undefined
          : {
              'background-image':
                'radial-gradient(circle, #b8b8b8bf 1px, rgba(0, 0, 0, 0) 1px)',
              'background-size': '30px 30px',
            }
      }
    >
      <canvas ref={el => (canvasEl = el)} class='block h-full w-full' />

      <Panels flow={props.flow} {...props.panels} />

      {props.controls !== false && (
        <div class='pointer-events-all absolute right-4 bottom-4 z-40 flex items-center gap-1 rounded-lg border border-gray-200 bg-white/95 p-1 shadow-md backdrop-blur-sm'>
          <button
            type='button'
            title='Zoom out'
            class='size-7 cursor-pointer rounded text-sm font-bold text-gray-600 hover:bg-gray-100'
            onClick={zoomBy(-0.2)}
          >
            −
          </button>
          <button
            type='button'
            title='Reset zoom'
            class='cursor-pointer rounded px-2 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-100'
            onClick={() => send('TOGGLE_ZOOM')}
          >
            {Math.round(untrack(zoom) * 100)}%
          </button>
          <button
            type='button'
            title='Zoom in'
            class='size-7 cursor-pointer rounded text-sm font-bold text-gray-600 hover:bg-gray-100'
            onClick={zoomBy(0.2)}
          >
            +
          </button>
        </div>
      )}

      {props.controlsAddons && <props.controlsAddons flow={props.flow} />}
    </div>
  );
};
