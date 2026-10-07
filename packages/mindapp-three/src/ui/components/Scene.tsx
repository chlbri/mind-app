import { createEffect, onCleanup, onMount, untrack, type JSX } from 'solid-js';
import {
  AmbientLight,
  Color,
  DirectionalLight,
  GridHelper,
  Group,
  PerspectiveCamera,
  Plane,
  Raycaster,
  Scene as ThreeScene,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Mesh,
  type Object3D,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import {
  AMBIENT_LIGHT_INTENSITY,
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  DEFAULT_CAMERA_DISTANCE,
  DEFAULT_NODES,
  DIRECTIONAL_LIGHT_INTENSITY,
  GRID_DIVISIONS,
  GRID_SIZE,
  SCENE_BACKGROUND,
} from '#services/main.machine.data';
import type { Data, Edge, Node, Point3D } from '#services/main.machine.typings';

import { ForceSimulation3D } from '../globals/physics/forceSimulation';
import {
  createEdgeTube,
  createLabelSprite,
  disposeObject3D,
  setEdgeSelected,
  setNodeSelected,
  updateEdgeTube,
} from '../globals/three/factories';
import { Panels } from './Panels';
import type { SceneProps } from './Scene.types';

/** Node subset consumed by the scene reconciliation. */
type SceneNode = Node & { position: Point3D };

/** Edge subset consumed by the scene reconciliation. */
type SceneEdge = Edge & { id: string };

/**
 * 3D scene canvas component rendering the flowchart with three.js: a WebGL renderer,
 * an orbit-controlled perspective camera, raycasted node dragging, and a
 * force-directed physics simulation animating the layout.
 *
 * @template | {@linkcode Data} `N` - Custom node data dictionary type extending type
 *   {@linkcode Data}.
 * @template | {@linkcode Data} `E` - Custom edge data dictionary type extending type
 *   {@linkcode Data}.
 *
 * @param props - Scene configuration, event handlers, and flow value of type
 *   {@linkcode SceneProps}.
 *
 * @returns The rendered Solid component.
 *
 * @see {@linkcode ForceSimulation3D}
 */
export const Scene = <N extends Data = Data, E extends Data = Data>(
  props: SceneProps<N, E>,
): JSX.Element => {
  const { service, hooks, send } = props.flow;

  /** Reactive graph data of the machine context. */
  const data = hooks.state({ selector: s => s.context.data });
  /** Reactive selected identifier of the machine context. */
  const selected = hooks.state({ selector: s => s.context.selected });
  /** Reactive physics enabled flag of the machine context. */
  const physicsEnabled = hooks.state({ selector: s => s.context.physics?.enabled });
  /** Reactive zoom factor of the machine context. */
  const zoom = hooks.state({ selector: s => s.context.zoom });

  /** Layout dimensions of the scene: `2` locks the layout to the XY plane. */
  const dimensions: 2 | 3 = props.dimensions ?? 3;

  /** Force-directed simulation driving the node layout. */
  const simulation = new ForceSimulation3D({ dimensions });

  /** Container element receiving the WebGL canvas. */
  let container: HTMLDivElement | undefined;
  /** WebGL renderer, undefined when WebGL is unavailable. */
  let renderer: WebGLRenderer | undefined;
  /** Three.js scene graph root. */
  let threeScene: ThreeScene | undefined;
  /** Perspective camera observing the scene. */
  let camera: PerspectiveCamera | undefined;
  /** Orbit controls rotating, panning and dollying the camera. */
  let controls: OrbitControls | undefined;
  /** Layer group holding every node group. */
  let nodesLayer: Group | undefined;
  /** Layer group holding every edge mesh. */
  let edgesLayer: Group | undefined;
  /** Observer resizing the renderer with its container. */
  let resizeObserver: ResizeObserver | undefined;

  /** Raycaster resolving pointer intersections with node meshes. */
  const raycaster = new Raycaster();
  /** Pointer coordinates in normalized device coordinate space. */
  const pointer = new Vector2();

  /** Node groups indexed by node id. */
  const nodeGroups = new Map<string, Group>();
  /** Edge meshes indexed by edge id. */
  const edgeMeshes = new Map<string, Mesh>();
  /** Latest graph nodes reconciled from the machine. */
  let latestNodes: SceneNode[] = [];
  /** Latest graph edges reconciled from the machine. */
  let latestEdges: SceneEdge[] = [];
  /** Last reconciled node ids signature, used to detect structural changes. */
  let lastNodeIds = '';
  /** Last reconciled link ids signature, used to detect structural changes. */
  let lastLinkIds = '';

  /** Animation frame identifier of the render loop. */
  let animationId = 0;
  /** Ongoing drag state, undefined when idle. */
  let drag: { id: string; offset: Vector3; plane: Plane } | undefined;
  /** Guards the zoom effect against controls change feedback loops. */
  let applyingZoom = false;
  /** Timeout identifier of the delayed mount. */
  let mountTimeout: ReturnType<typeof setTimeout> | undefined;

  onCleanup(service.pause);

  /**
   * Resolves the label text of a node from its data dictionary.
   *
   * @param node - Node entity of type {@linkcode SceneNode}.
   *
   * @returns The label text string.
   */
  const labelOf = (node: SceneNode): string => {
    const content = (node.data as Record<string, unknown> | undefined)?.content;
    const label = (node.data as Record<string, unknown> | undefined)?.label;
    return String(content ?? label ?? node.id);
  };

  /**
   * Walks up the object tree to resolve the node id owning a raycast hit.
   *
   * @param object - Hit object of type `Object3D`.
   *
   * @returns The owning node id, or `undefined`.
   */
  const nodeIdOf = (object: Object3D | undefined): string | undefined => {
    let current: Object3D | undefined = object;
    while (current) {
      const id = current.userData?.nodeId;
      if (id) return id as string;
      current = current.parent ?? undefined;
    }
    return undefined;
  };

  /** Updates the normalized pointer coordinates from a pointer event. */
  const updatePointer = (event: PointerEvent): void => {
    if (!renderer) return;
    const rect = renderer.domElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  /** Raycasts the pointer against the node groups and resolves the hit node id. */
  const raycastNode = (): string | undefined => {
    if (!camera || !threeScene) return undefined;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects([...nodeGroups.values()], true);
    for (const hit of hits) {
      const id = nodeIdOf(hit.object);
      if (id) return id;
    }
    return undefined;
  };

  /**
   * Raycasts the pointer against a plane and resolves the hit point.
   *
   * @param plane - Intersection plane of type `Plane`.
   *
   * @returns The hit point of type `Vector3`, or `undefined` when the ray misses.
   */
  const raycastPlane = (plane: Plane): Vector3 | undefined => {
    if (!camera) return undefined;
    raycaster.setFromCamera(pointer, camera);
    return raycaster.ray.intersectPlane(plane, new Vector3()) ?? undefined;
  };

  /**
   * Rebuilds an edge tube from the current simulation positions.
   *
   * @param id - Edge identifier.
   * @param mesh - Edge mesh of type `Mesh`.
   */
  const refreshEdge = (id: string, mesh: Mesh): void => {
    const edge = latestEdges.find(candidate => candidate.id === id);
    if (!edge) return;
    const from = simulation.bodies.get(edge.from);
    const to = simulation.bodies.get(edge.to);
    if (!from || !to) return;
    updateEdgeTube(mesh, from.position, to.position);
  };

  /** Rebuilds every edge tube connected to a node after a drag move. */
  const refreshEdgesOf = (nodeId: string): void => {
    for (const [id, mesh] of edgeMeshes) {
      const edge = latestEdges.find(candidate => candidate.id === id);
      if (edge?.from === nodeId || edge?.to === nodeId) refreshEdge(id, mesh);
    }
  };

  /** Pointer-down handler selecting and starting a node drag. */
  const onPointerDown = (event: PointerEvent): void => {
    updatePointer(event);
    const id = raycastNode();

    if (!id) {
      send('DESELECT');
      return;
    }

    send({ type: 'SELECT', payload: id });

    if (!camera || !controls) return;
    const group = nodeGroups.get(id);
    if (!group) return;

    const plane =
      dimensions === 2
        ? new Plane(new Vector3(0, 0, 1), 0)
        : new Plane().setFromNormalAndCoplanarPoint(
            camera.getWorldDirection(new Vector3()).negate(),
            group.position,
          );
    const hit = raycastPlane(plane);
    if (!hit) return;

    controls.enabled = false;
    drag = { id, offset: group.position.clone().sub(hit), plane };
    simulation.setFixed(id, true);
  };

  /**
   * Double-click handler opening the editor on the hit node by dispatching `EDIT`.
   *
   * A double-click on empty space clears the current selection and edition.
   *
   * @param event - Mouse double-click event of the renderer canvas.
   */
  const onDoubleClick = (event: MouseEvent): void => {
    updatePointer(event as unknown as PointerEvent);
    const id = raycastNode();

    if (!id) {
      send('DESELECT');
      return;
    }

    send({ type: 'EDIT', payload: id });
  };

  /** Pointer-move handler dragging the active node along its camera-facing plane. */
  const onPointerMove = (event: PointerEvent): void => {
    if (!drag) return;
    updatePointer(event);

    const hit = raycastPlane(drag.plane);
    if (!hit) return;

    const position = hit.add(drag.offset);
    const point: Point3D = {
      x: position.x,
      y: position.y,
      z: dimensions === 2 ? 0 : position.z,
    };
    simulation.teleport(drag.id, point);

    const group = nodeGroups.get(drag.id);
    if (group) group.position.set(point.x, point.y, point.z);
    refreshEdgesOf(drag.id);
  };

  /** Pointer-up handler committing the dragged node position and pinning it. */
  const onPointerUp = (): void => {
    if (!drag) return;
    const { id } = drag;
    drag = undefined;
    if (controls) controls.enabled = true;

    const body = simulation.bodies.get(id);
    if (!body) return;

    const wasFixed = latestNodes.find(node => node.id === id)?.fixed ?? false;
    simulation.setFixed(id, wasFixed);

    send({ type: 'MOVE', payload: { id, ...body.position } });
    send({ type: 'PIN_NODE', payload: { id, fixed: true } });
    send({ type: 'COMMIT', payload: undefined });
  };
  /** Controls change handler syncing the machine zoom with the camera distance. */
  const onControlsChange = (): void => {
    if (!camera || applyingZoom) return;
    const distance = camera.position.length();
    if (distance < 0.001) return;

    const factor = DEFAULT_CAMERA_DISTANCE / distance;
    const current = untrack(zoom);
    if (Math.abs(factor - current) > 0.01) {
      send({ type: 'ZOOM', payload: factor - current });
    }
  };

  /** Render loop ticking the simulation, syncing objects and rendering the scene. */
  const animate = (): void => {
    animationId = requestAnimationFrame(animate);

    if (untrack(physicsEnabled) && !simulation.isSettled()) {
      simulation.tick();

      for (const [id, group] of nodeGroups) {
        const body = simulation.bodies.get(id);
        if (body) {
          group.position.set(body.position.x, body.position.y, body.position.z);
        }
      }
      for (const [id, mesh] of edgeMeshes) {
        refreshEdge(id, mesh);
      }

      if (simulation.isSettled()) {
        send({ type: 'APPLY_PHYSICS', payload: simulation.positions() });
      }
    }

    controls?.update();
    if (renderer && threeScene && camera) {
      renderer.render(threeScene, camera);
    }
  };

  /** Resizes the camera aspect ratio and the renderer with its container. */
  const resize = (): void => {
    if (!renderer || !camera || !container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  /**
   * Reconciles the three.js object graph with the machine data: creates, updates and
   * disposes node groups and edge meshes.
   *
   * @param nodes - Graph nodes of type {@linkcode SceneNode}.
   * @param edges - Graph edges of type {@linkcode SceneEdge}.
   */
  const reconcile = (nodes: SceneNode[], edges: SceneEdge[]): void => {
    if (!threeScene || !nodesLayer || !edgesLayer) return;

    latestNodes = nodes;
    latestEdges = edges;

    const nodeIds = new Set(nodes.map(node => node.id));
    const edgeIds = new Set(edges.map(edge => edge.id));

    for (const [id, group] of nodeGroups) {
      if (!nodeIds.has(id)) {
        nodesLayer.remove(group);
        disposeObject3D(group);
        nodeGroups.delete(id);
      }
    }

    for (const [id, mesh] of edgeMeshes) {
      if (!edgeIds.has(id)) {
        edgesLayer.remove(mesh);
        disposeObject3D(mesh);
        edgeMeshes.delete(id);
      }
    }

    for (const node of nodes) {
      let group = nodeGroups.get(node.id);

      if (!group) {
        group = new Group();
        group.name = node.id;
        group.userData = { nodeId: node.id };
        nodesLayer.add(group);
        nodeGroups.set(node.id, group);
      }

      group.position.set(node.position.x, node.position.y, node.position.z);

      const isSelected = untrack(selected) === node.id;
      const dataChanged = group.userData.lastData !== node.data;
      const selectionChanged = group.userData.lastSelected !== isSelected;

      if (dataChanged || selectionChanged) {
        group.userData.lastData = node.data;
        group.userData.lastSelected = isSelected;

        if (props.Node) {
          props.Node({
            ...node,
            selected: isSelected,
            group,
          } as any);
        } else if (dataChanged) {
          const previous = group.getObjectByName('label');
          if (previous) {
            group.remove(previous);
            disposeObject3D(previous);
          }
          const sprite = createLabelSprite({ text: labelOf(node) });
          sprite.name = 'label';
          sprite.position.set(0, 1.5, 0);
          group.add(sprite);
        }
      }
    }

    for (const edge of edges) {
      const from = nodes.find(node => node.id === edge.from);
      const to = nodes.find(node => node.id === edge.to);
      if (!from || !to) continue;

      let mesh = edgeMeshes.get(edge.id);

      if (!mesh) {
        mesh = createEdgeTube({ id: edge.id, from: from.position, to: to.position });
        edgesLayer.add(mesh);
        edgeMeshes.set(edge.id, mesh);
      } else {
        const previousFrom = mesh.userData.from3d as Point3D | undefined;
        const previousTo = mesh.userData.to3d as Point3D | undefined;
        const moved =
          !previousFrom ||
          !previousTo ||
          previousFrom.x !== from.position.x ||
          previousFrom.y !== from.position.y ||
          previousFrom.z !== from.position.z ||
          previousTo.x !== to.position.x ||
          previousTo.y !== to.position.y ||
          previousTo.z !== to.position.z;

        if (moved) updateEdgeTube(mesh, from.position, to.position);
      }

      mesh.userData.from3d = { ...from.position };
      mesh.userData.to3d = { ...to.position };

      if (props.Edge) {
        const isSelected = untrack(selected) === edge.id;
        const dataChanged = mesh.userData.lastData !== edge.data;
        const selectionChanged = mesh.userData.lastSelected !== isSelected;

        if (dataChanged || selectionChanged) {
          mesh.userData.lastData = edge.data;
          mesh.userData.lastSelected = isSelected;
          props.Edge({
            ...edge,
            from3d: from.position,
            to3d: to.position,
            selected: isSelected,
            mesh,
          } as any);
        }
      }
    }
  };

  createEffect(() => {
    const current = data();
    if (!current) return;

    // Track the selection so custom 3D renderers are re-invoked on selection changes.
    selected();

    const nodes = (current.nodes ?? []) as SceneNode[];
    const edges = (current.edges ?? []) as SceneEdge[];

    const nodeIds = nodes.map(node => node.id).join(',');
    const linkIds = edges.map(edge => `${edge.from}>${edge.to}`).join(',');

    if (nodeIds !== lastNodeIds || linkIds !== lastLinkIds) {
      lastNodeIds = nodeIds;
      lastLinkIds = linkIds;
      simulation.sync(nodes, edges, true);
    } else {
      simulation.sync(nodes, edges, false);
    }

    reconcile(nodes, edges);
  });

  createEffect(() => {
    const current = selected();
    for (const [id, group] of nodeGroups) {
      setNodeSelected(group, id === current);
    }
    for (const [id, mesh] of edgeMeshes) {
      setEdgeSelected(mesh, id === current);
    }
  });

  createEffect(() => {
    if (physicsEnabled()) simulation.reheat();
  });

  createEffect(() => {
    const factor = zoom();
    if (!camera || !controls) return;

    const target = DEFAULT_CAMERA_DISTANCE / factor;
    const current = camera.position.length();
    if (Math.abs(target - current) < 0.05) return;

    applyingZoom = true;
    camera.position.setLength(target);
    controls.update();
    applyingZoom = false;
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
              return edgesAllowed(first, second);
            },
          },
        },
      }));
    }

    if (props.onNodeAdded || props.onNodeDeleted) {
      let previousNodeIds = new Set<string>();
      createEffect(() => {
        const nodes = (data()?.nodes ?? []) as SceneNode[];
        const nodeIds = new Set(nodes.map(node => node.id));

        for (const id of previousNodeIds) {
          if (!nodeIds.has(id)) props.onNodeDeleted?.(id);
        }
        for (const node of nodes) {
          if (!previousNodeIds.has(node.id)) props.onNodeAdded?.(node as any);
        }
        previousNodeIds = nodeIds;
      });
    }

    if (props.onEdgeAdded || props.onEdgeDeleted) {
      let previousEdgeIds = new Set<string>();
      createEffect(() => {
        const edges = (data()?.edges ?? []) as SceneEdge[];
        const edgeIds = new Set(edges.map(edge => edge.id));

        for (const id of previousEdgeIds) {
          if (!edgeIds.has(id)) props.onEdgeDeleted?.(id);
        }
        for (const edge of edges) {
          if (!previousEdgeIds.has(edge.id)) props.onEdgeAdded?.(edge as any);
        }
        previousEdgeIds = edgeIds;
      });
    }

    /** Initializes the WebGL renderer, scene, camera, controls and lights. */
    const mount = (): void => {
      if (!container) return;

      if (props.physics === false) {
        send('TOGGLE_PHYSICS');
      }

      try {
        renderer = new WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(
          container.clientWidth || 800,
          container.clientHeight || 600,
        );
        container.appendChild(renderer.domElement);
      } catch {
        renderer = undefined;
      }

      if (renderer) {
        threeScene = new ThreeScene();
        threeScene.background = new Color(SCENE_BACKGROUND);

        camera = new PerspectiveCamera(
          CAMERA_FOV,
          (container.clientWidth || 800) / (container.clientHeight || 600),
          CAMERA_NEAR,
          CAMERA_FAR,
        );
        const cameraPosition = props.cameraPosition ?? {
          x: 0,
          y: DEFAULT_CAMERA_DISTANCE * 0.7,
          z: DEFAULT_CAMERA_DISTANCE,
        };
        camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
        camera.lookAt(0, 0, 0);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.addEventListener('change', onControlsChange);

        threeScene.add(new AmbientLight(0xffffff, AMBIENT_LIGHT_INTENSITY));
        const directional = new DirectionalLight(
          0xffffff,
          DIRECTIONAL_LIGHT_INTENSITY,
        );
        directional.position.set(20, 40, 20);
        threeScene.add(directional);

        const grid = new GridHelper(GRID_SIZE, GRID_DIVISIONS);
        grid.name = 'grid';

        if (dimensions === 2) {
          grid.rotation.x = Math.PI / 2;
          grid.position.z = -2;
        }

        threeScene.add(grid);

        nodesLayer = new Group();
        nodesLayer.name = 'nodes';
        edgesLayer = new Group();
        edgesLayer.name = 'edges';
        threeScene.add(edgesLayer, nodesLayer);

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);

        renderer.domElement.addEventListener('pointerdown', onPointerDown);
        renderer.domElement.addEventListener('dblclick', onDoubleClick);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        animationId = requestAnimationFrame(animate);
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
    cancelAnimationFrame(animationId);

    if (renderer) {
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('dblclick', onDoubleClick);
    }
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);

    controls?.removeEventListener('change', onControlsChange);
    controls?.dispose();

    resizeObserver?.disconnect();

    if (threeScene) {
      for (const group of nodeGroups.values()) disposeObject3D(group);
      for (const mesh of edgeMeshes.values()) disposeObject3D(mesh);
      nodeGroups.clear();
      edgeMeshes.clear();
      disposeObject3D(threeScene);
    }

    renderer?.dispose();
    if (renderer?.domElement.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement);
    }

    renderer = undefined;
    threeScene = undefined;
    camera = undefined;
    controls = undefined;
  });

  return (
    <div class='relative h-full w-full overflow-hidden' ref={el => (container = el)}>
      <Panels flow={props.flow} panels={props.panels} />
      {props.controlsAddons && <props.controlsAddons flow={props.flow} />}
    </div>
  );
};
