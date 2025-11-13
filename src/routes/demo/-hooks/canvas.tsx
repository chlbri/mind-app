import { createSignal, onMount } from 'solid-js';
import * as v from 'valibot';
import type {
  ElementSchema,
  LinkSchema,
} from '~/features/mindmap/schemas';
import {
  drawRipple,
  getGlowIntensity,
  getPulseScale,
} from '~/features/mindmap/ui/animations';
import {
  Element,
  handleCanvasMouseMove,
  Link,
  renderCanvas2D,
} from '~/features/mindmap/ui/components';

export type CanvasProps = {
  elements: v.InferOutput<typeof ElementSchema>[];
  links: v.InferOutput<typeof LinkSchema>[];
};

export const createCanvas = ({ elements, links }: CanvasProps) => {
  // let canvasRef: HTMLCanvasElement | undefined;
  const [canvasRef, setCanvasRef] = createSignal<
    HTMLCanvasElement | undefined
  >(undefined);

  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  const [hoveredId, setHoveredId] = createSignal<string | null>(null);
  const [zoom, setZoom] = createSignal(1);

  const [collapsedNodes, setCollapsedNodes] = createSignal<Set<string>>(
    new Set(),
  );
  const [, setClickRipples] = createSignal<
    Array<{
      x: number;
      y: number;
      startTime: number;
    }>
  >([]);

  // État mutable pour les éléments (pour permettre l'édition)
  const [_elements, setElements] = createSignal([...elements]);
  // État mutable pour les links (pour permettre l'édition)
  const [_links] = createSignal([...links]);

  // État pour le drag des éléments
  const [draggedElementId, setDraggedElementId] = createSignal<
    string | null
  >(null);
  const [dragOffset, setDragOffset] = createSignal({ x: 0, y: 0 });

  // État pour le pan du canvas
  const [isPanning, setIsPanning] = createSignal(false);
  const [panOffset, setPanOffset] = createSignal({ x: 0, y: 0 });
  const [panStart, setPanStart] = createSignal({ x: 0, y: 0 });

  // Gestionnaire d'animations

  // Filtrer les éléments visibles selon l'état de repliement
  const visibleElements = () => {
    const collapsed = collapsedNodes();
    const visible = new Set<string>();

    // Fonction récursive pour déterminer les éléments visibles
    const addVisible = (elem: v.InferOutput<typeof ElementSchema>) => {
      visible.add(elem.id);
      if (!collapsed.has(elem.id) && elem.childrenIds) {
        elem.childrenIds.forEach(childId => {
          const child = _elements().find(e => e.id === childId);
          if (child) addVisible(child);
        });
      }
    };

    // Commencer par l'élément racine
    const root = _elements().find(e => e.id === 'center');
    if (root) addVisible(root);

    return _elements().filter(e => visible.has(e.id));
  };

  // Créer les composants Element et Link
  const elementComponents = () =>
    visibleElements().map(elem =>
      Element({
        element: elem,
        onClick: id => {
          console.log('Element onClick:', id);
          setSelectedId(id);
        },
        onDoubleClick: id => {
          console.log('Element onDoubleClick:', id);
        },
      }),
    );

  const linkComponents = () => {
    const visibleIds = new Set(visibleElements().map(e => e.id));

    return _links()
      .filter(
        link =>
          visibleIds.has(link.sourceId) && visibleIds.has(link.targetId),
      )
      .map(link => {
        const sourceElem = _elements().find(e => e.id === link.sourceId)!;
        const targetElem = _elements().find(e => e.id === link.targetId)!;

        return Link({
          link,
          sourceX: sourceElem.x,
          sourceY: sourceElem.y,
          sourceWidth: sourceElem.width,
          sourceHeight: sourceElem.height,
          targetX: targetElem.x,
          targetY: targetElem.y,
          targetWidth: targetElem.width,
          targetHeight: targetElem.height,
          onClick: id => {
            console.log('Cliqué sur le lien:', id);
            setSelectedId(id);
          },
        });
      });
  };

  onMount(() => {
    let animationTime = 0;

    // Boucle d'animation
    const animate = () => {
      const ctx = canvasRef()?.getContext('2d');
      if (!ctx) return;

      animationTime += 0.016; // ~60fps

      // Nettoyer et configurer le canvas
      ctx.fillStyle = '#F9FAFB';
      ctx.fillRect(0, 0, canvasRef()!.width, canvasRef()!.height);

      // Appliquer les transformations (zoom et pan)
      ctx.save();
      const pan = panOffset();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom(), zoom());

      // Rendu
      const elemComps = elementComponents();
      const linkComps = linkComponents();
      renderCanvas2D(canvasRef()!, elemComps, linkComps);

      // Dessiner les effets de ripple au clic
      const now = Date.now();
      setClickRipples(prev => {
        const active = prev.filter(ripple => now - ripple.startTime < 600);
        active.forEach(ripple => {
          const progress = (now - ripple.startTime) / 600;
          drawRipple(ctx, ripple.x, ripple.y, progress);
        });
        return active;
      });

      // Dessiner les indicateurs de repliement/dépliement
      elemComps.forEach(elemComp => {
        const elem = elemComp.element;
        if (elem.childrenIds && elem.childrenIds.length > 0) {
          const isCollapsed = collapsedNodes().has(elem.id);
          const indicatorX = elem.x + elem.width + 5;
          const indicatorY = elem.y + elem.height / 2;

          // Effet de pulsation sur l'indicateur si survolé
          const isHovered = hoveredId() === elem.id;
          const scale = isHovered ? getPulseScale(animationTime, 4) : 1;
          const radius = 8 * scale;

          // Cercle pour l'indicateur
          ctx.beginPath();
          ctx.arc(indicatorX, indicatorY, radius, 0, Math.PI * 2);
          ctx.fillStyle = isCollapsed ? '#EF4444' : '#10B981';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Icône + ou -
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (isCollapsed) {
            // + icon
            ctx.moveTo(indicatorX - 4, indicatorY);
            ctx.lineTo(indicatorX + 4, indicatorY);
            ctx.moveTo(indicatorX, indicatorY - 4);
            ctx.lineTo(indicatorX, indicatorY + 4);
          } else {
            // - icon
            ctx.moveTo(indicatorX - 4, indicatorY);
            ctx.lineTo(indicatorX + 4, indicatorY);
          }
          ctx.stroke();
        }
      });

      // Afficher les infos de sélection avec effet de focus
      if (selectedId()) {
        const selectedElem = elemComps.find(
          e => e.element.id === selectedId(),
        );
        const selectedLink = linkComps.find(
          l => l.link.id === selectedId(),
        );

        if (selectedElem) {
          const elem = selectedElem.element;

          // Effet de glow animé
          const glowIntensity = getGlowIntensity(animationTime);
          ctx.shadowColor = '#3B82F6';
          ctx.shadowBlur = glowIntensity;
          ctx.strokeStyle = '#3B82F6';
          ctx.lineWidth = 3;
          ctx.strokeRect(
            elem.x - 5,
            elem.y - 5,
            elem.width + 10,
            elem.height + 10,
          );
          ctx.shadowBlur = 0;
        }

        if (selectedLink) {
          const path = selectedLink.utils.getPath('cubic');
          const glowIntensity = getGlowIntensity(animationTime);
          ctx.shadowColor = '#3B82F6';
          ctx.shadowBlur = glowIntensity;
          ctx.strokeStyle = '#3B82F6';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(path.startX, path.startY);
          ctx.bezierCurveTo(
            path.controlX1,
            path.controlY1,
            path.controlX2,
            path.controlY2,
            path.endX,
            path.endY,
          );
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // Effet de survol
      if (hoveredId()) {
        const hoveredElem = elemComps.find(
          e => e.element.id === hoveredId(),
        );

        if (hoveredElem) {
          const elem = hoveredElem.element;
          ctx.strokeStyle = '#60A5FA';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(
            elem.x - 3,
            elem.y - 3,
            elem.width + 6,
            elem.height + 6,
          );
          ctx.setLineDash([]);
        }
      }

      ctx.restore();

      requestAnimationFrame(animate);
    };

    animate();
  });

  return {
    canvasRef,
    elements: _elements,
    visibleElements,
    linkComponents,
    collapsedNodes,
    setCollapsedNodes,
    zoom,
    setZoom,
    setPanOffset,

    Canvas: () => (
      <canvas
        ref={setCanvasRef}
        width={1200}
        height={600}
        class='w-full border-2 border-gray-300 rounded-lg bg-white cursor-grab active:cursor-grabbing'
        style='max-width: 100%; height: auto;'
        onLoad={() => {
          if (!canvasRef) return;

          let animationTime = 0;

          // Boucle d'animation
          const animate = () => {
            const ctx = canvasRef()?.getContext('2d');
            if (!ctx) return;

            animationTime += 0.016; // ~60fps

            // Nettoyer et configurer le canvas
            ctx.fillStyle = '#F9FAFB';
            ctx.fillRect(0, 0, canvasRef()!.width, canvasRef()!.height);

            // Appliquer les transformations (zoom et pan)
            ctx.save();
            const pan = panOffset();
            ctx.translate(pan.x, pan.y);
            ctx.scale(zoom(), zoom());

            // Rendu
            const elemComps = elementComponents();
            const linkComps = linkComponents();
            renderCanvas2D(canvasRef()!, elemComps, linkComps);

            // Dessiner les effets de ripple au clic
            const now = Date.now();
            setClickRipples(prev => {
              const active = prev.filter(
                ripple => now - ripple.startTime < 600,
              );
              active.forEach(ripple => {
                const progress = (now - ripple.startTime) / 600;
                drawRipple(ctx, ripple.x, ripple.y, progress);
              });
              return active;
            });

            // Dessiner les indicateurs de repliement/dépliement
            elemComps.forEach(elemComp => {
              const elem = elemComp.element;
              if (elem.childrenIds && elem.childrenIds.length > 0) {
                const isCollapsed = collapsedNodes().has(elem.id);
                const indicatorX = elem.x + elem.width + 5;
                const indicatorY = elem.y + elem.height / 2;

                // Effet de pulsation sur l'indicateur si survolé
                const isHovered = hoveredId() === elem.id;
                const scale = isHovered
                  ? getPulseScale(animationTime, 4)
                  : 1;
                const radius = 8 * scale;

                // Cercle pour l'indicateur
                ctx.beginPath();
                ctx.arc(indicatorX, indicatorY, radius, 0, Math.PI * 2);
                ctx.fillStyle = isCollapsed ? '#EF4444' : '#10B981';
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Icône + ou -
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                if (isCollapsed) {
                  // + icon
                  ctx.moveTo(indicatorX - 4, indicatorY);
                  ctx.lineTo(indicatorX + 4, indicatorY);
                  ctx.moveTo(indicatorX, indicatorY - 4);
                  ctx.lineTo(indicatorX, indicatorY + 4);
                } else {
                  // - icon
                  ctx.moveTo(indicatorX - 4, indicatorY);
                  ctx.lineTo(indicatorX + 4, indicatorY);
                }
                ctx.stroke();
              }
            });

            // Afficher les infos de sélection avec effet de focus
            if (selectedId()) {
              const selectedElem = elemComps.find(
                e => e.element.id === selectedId(),
              );
              const selectedLink = linkComps.find(
                l => l.link.id === selectedId(),
              );

              if (selectedElem) {
                const elem = selectedElem.element;

                // Effet de glow animé
                const glowIntensity = getGlowIntensity(animationTime);
                ctx.shadowColor = '#3B82F6';
                ctx.shadowBlur = glowIntensity;
                ctx.strokeStyle = '#3B82F6';
                ctx.lineWidth = 3;
                ctx.strokeRect(
                  elem.x - 5,
                  elem.y - 5,
                  elem.width + 10,
                  elem.height + 10,
                );
                ctx.shadowBlur = 0;
              }

              if (selectedLink) {
                const path = selectedLink.utils.getPath('cubic');
                const glowIntensity = getGlowIntensity(animationTime);
                ctx.shadowColor = '#3B82F6';
                ctx.shadowBlur = glowIntensity;
                ctx.strokeStyle = '#3B82F6';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(path.startX, path.startY);
                ctx.bezierCurveTo(
                  path.controlX1,
                  path.controlY1,
                  path.controlX2,
                  path.controlY2,
                  path.endX,
                  path.endY,
                );
                ctx.stroke();
                ctx.shadowBlur = 0;
              }
            }

            // Effet de survol
            if (hoveredId()) {
              const hoveredElem = elemComps.find(
                e => e.element.id === hoveredId(),
              );

              if (hoveredElem) {
                const elem = hoveredElem.element;
                ctx.strokeStyle = '#60A5FA';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(
                  elem.x - 3,
                  elem.y - 3,
                  elem.width + 6,
                  elem.height + 6,
                );
                ctx.setLineDash([]);
              }
            }

            ctx.restore();

            requestAnimationFrame(animate);
          };

          animate();
        }}
        onMouseMove={event => {
          const { currentTarget } = event;
          const rect = currentTarget.getBoundingClientRect();
          const scaleX = currentTarget.width / rect.width;
          const scaleY = currentTarget.height / rect.height;
          const pan = panOffset();
          const x =
            ((event.clientX - rect.left) * scaleX - pan.x) / zoom();
          const y = ((event.clientY - rect.top) * scaleY - pan.y) / zoom();

          const draggedId = draggedElementId();
          if (draggedId) {
            const offset = dragOffset();
            setElements(prev =>
              prev.map(elem =>
                elem.id === draggedId
                  ? { ...elem, x: x - offset.x, y: y - offset.y }
                  : elem,
              ),
            );
            return;
          }

          if (isPanning()) {
            const start = panStart();
            setPanOffset({
              x: event.clientX - start.x,
              y: event.clientY - start.y,
            });
            return;
          }

          const elemComps = elementComponents();
          const linkComps = linkComponents();
          let hoveredElement = null;
          let isOverButton = false;

          for (const elemComp of elemComps) {
            const elem = elemComp.element;
            if (elem.childrenIds && elem.childrenIds.length > 0) {
              const indicatorX = elem.x + elem.width + 5;
              const indicatorY = elem.y + elem.height / 2;
              const distance = Math.sqrt(
                Math.pow(x - indicatorX, 2) + Math.pow(y - indicatorY, 2),
              );
              if (distance <= 13) {
                hoveredElement = `${elem.id}-button`;
                isOverButton = true;
                break;
              }
            }
          }

          if (!isOverButton) {
            for (const elemComp of elemComps) {
              if (elemComp.utils.isPointInside(x, y)) {
                hoveredElement = elemComp.element.id;
                break;
              }
            }
            if (!hoveredElement) {
              for (const linkComp of linkComps) {
                if (linkComp.utils.isPointNearPath(x, y, 8)) {
                  hoveredElement = linkComp.link.id;
                  break;
                }
              }
            }
          }

          setHoveredId(hoveredElement);

          if (draggedId || isPanning()) {
            currentTarget.style.cursor = 'grabbing';
          } else if (hoveredElement) {
            currentTarget.style.cursor = 'grab';
          } else {
            currentTarget.style.cursor = 'grab';
          }

          handleCanvasMouseMove(
            { clientX: x, clientY: y },
            currentTarget,
            elemComps,
            linkComps,
          );
        }}
        onMouseUp={() => {
          setDraggedElementId(null);
          setIsPanning(false);
        }}
        onMouseLeave={() => {
          setDraggedElementId(null);
          setIsPanning(false);
        }}
        onClick={event => {
          const { currentTarget } = event;
          const rect = currentTarget.getBoundingClientRect();
          const scaleX = currentTarget.width / rect.width;
          const scaleY = currentTarget.height / rect.height;
          const pan = panOffset();
          const x =
            ((event.clientX - rect.left) * scaleX - pan.x) / zoom();
          const y = ((event.clientY - rect.top) * scaleY - pan.y) / zoom();

          const elemComps = elementComponents();
          const linkComps = linkComponents();

          for (const elemComp of elemComps) {
            const elem = elemComp.element;
            if (elem.childrenIds && elem.childrenIds.length > 0) {
              const indicatorX = elem.x + elem.width + 5;
              const indicatorY = elem.y + elem.height / 2;
              const distance = Math.sqrt(
                Math.pow(x - indicatorX, 2) + Math.pow(y - indicatorY, 2),
              );

              if (distance <= 13) {
                setClickRipples(prev => [
                  ...prev,
                  { x: indicatorX, y: indicatorY, startTime: Date.now() },
                ]);
                setCollapsedNodes(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(elem.id)) {
                    newSet.delete(elem.id);
                  } else {
                    newSet.add(elem.id);
                  }
                  return newSet;
                });
                setSelectedId(elem.id);
                return;
              }
            }
          }

          let elementClicked = false;
          for (const elemComp of elemComps) {
            if (elemComp.utils.isPointInside(x, y)) {
              setSelectedId(elemComp.element.id);
              elementClicked = true;
              break;
            }
          }

          if (!elementClicked) {
            let linkClicked = false;
            for (const linkComp of linkComps) {
              if (linkComp.utils.isPointNearPath(x, y, 8)) {
                setSelectedId(linkComp.link.id);
                linkClicked = true;
                break;
              }
            }
            if (!linkClicked) {
              setSelectedId(null);
            }
          }
        }}
        onDblClick={event => {
          const { currentTarget } = event;
          const rect = currentTarget.getBoundingClientRect();
          const scaleX = currentTarget.width / rect.width;
          const scaleY = currentTarget.height / rect.height;
          const pan = panOffset();
          const x =
            ((event.clientX - rect.left) * scaleX - pan.x) / zoom();
          const y = ((event.clientY - rect.top) * scaleY - pan.y) / zoom();

          const elemComps = elementComponents();

          for (const elemComp of elemComps) {
            if (elemComp.utils.isPointInside(x, y)) {
              const elem = elemComp.element;
              const input = document.createElement('input');
              input.type = 'text';
              input.value = elem.title.replace(/\\n/g, ' ');
              input.style.position = 'fixed';
              input.style.left = `${event.clientX}px`;
              input.style.top = `${event.clientY}px`;
              input.style.zIndex = '1000';
              input.style.padding = '8px';
              input.style.fontSize = '14px';
              input.style.border = '2px solid #3B82F6';
              input.style.borderRadius = '4px';
              input.style.backgroundColor = 'white';
              input.style.minWidth = '200px';

              document.body.appendChild(input);
              input.focus();
              input.select();

              const saveEdit = () => {
                const newTitle = input.value.trim();
                if (newTitle && newTitle !== elem.title) {
                  setElements(prev =>
                    prev.map(e =>
                      e.id === elem.id ? { ...e, title: newTitle } : e,
                    ),
                  );
                }
                document.body.removeChild(input);
              };

              input.addEventListener('blur', saveEdit);
              input.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                  saveEdit();
                } else if (e.key === 'Escape') {
                  document.body.removeChild(input);
                }
              });
              return;
            }
          }
        }}
        onWheel={event => {
          event.preventDefault();
          const delta = event.ctrlKey
            ? event.deltaY > 0
              ? 0.95
              : 1.05
            : event.deltaY > 0
              ? 0.98
              : 1.02;
          setZoom(z => Math.max(0.5, Math.min(3, z * delta)));
        }}
        onMouseDown={({ currentTarget, clientX, clientY }) => {
          const rect = currentTarget.getBoundingClientRect();
          const scaleX = currentTarget.width / rect.width;
          const scaleY = currentTarget.height / rect.height;
          const pan = panOffset();
          const x = ((clientX - rect.left) * scaleX - pan.x) / zoom();
          const y = ((clientY - rect.top) * scaleY - pan.y) / zoom();

          const elemComps = elementComponents();

          // Vérifier si on clique sur un élément
          let clickedOnElement = false;
          for (const elemComp of elemComps) {
            if (elemComp.utils.isPointInside(x, y)) {
              // Début du drag de l'élément
              setDraggedElementId(elemComp.element.id);
              setDragOffset({
                x: x - elemComp.element.x,
                y: y - elemComp.element.y,
              });
              clickedOnElement = true;
              break;
            }
          }

          // Si pas sur un élément, commencer le pan
          if (!clickedOnElement) {
            setIsPanning(true);
            setPanStart({
              x: clientX - pan.x,
              y: clientY - pan.y,
            });
          }
        }}
      />
    ),
  };
};
