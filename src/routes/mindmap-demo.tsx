import { createSignal, onMount, onCleanup } from 'solid-js';
import { createFileRoute } from '@tanstack/solid-router';

import Element from '~/features/mindmap/ui/components/Element/Element';
import Link from '~/features/mindmap/ui/components/Link/Link';
import {
  renderCanvas2D,
  handleCanvasMouseMove,
} from '~/features/mindmap/ui/components/examples';
import {
  drawRipple,
  getPulseScale,
  getGlowIntensity,
} from '~/features/mindmap/ui/animations';
import { DEMO_ELEMENTS, DEMO_LINKS } from './mindmap-demo.data';

export const Route = createFileRoute('/mindmap-demo')({
  component: () => {
    let canvasRef: HTMLCanvasElement | undefined;
    const [selectedId, setSelectedId] = createSignal<string | null>(null);
    const [hoveredId, setHoveredId] = createSignal<string | null>(null);
    const [curveType, setCurveType] = createSignal<'quadratic' | 'cubic'>(
      'cubic',
    );
    const [zoom, setZoom] = createSignal(1);
    const [focusMode, setFocusMode] = createSignal(false);
    const [collapsedNodes, setCollapsedNodes] = createSignal<Set<string>>(
      new Set(),
    );
    const [, setEditingId] = createSignal<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [clickRipples, setClickRipples] = createSignal<
      Array<{
        x: number;
        y: number;
        startTime: number;
      }>
    >([]);

    // État mutable pour les éléments (pour permettre l'édition)
    const [elements, setElements] = createSignal([...DEMO_ELEMENTS]);

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
    const getVisibleElements = () => {
      const collapsed = collapsedNodes();
      const visible = new Set<string>();

      // Fonction récursive pour déterminer les éléments visibles
      const addVisible = (elem: (typeof DEMO_ELEMENTS)[0]) => {
        visible.add(elem.id);
        if (!collapsed.has(elem.id) && elem.childrenIds) {
          elem.childrenIds.forEach(childId => {
            const child = elements().find(e => e.id === childId);
            if (child) addVisible(child);
          });
        }
      };

      // Commencer par l'élément racine
      const root = elements().find(e => e.id === 'center');
      if (root) addVisible(root);

      return elements().filter(e => visible.has(e.id));
    };

    // Créer les composants Element et Link
    const elementComponents = () =>
      getVisibleElements().map(elem =>
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
      const visibleIds = new Set(getVisibleElements().map(e => e.id));

      return DEMO_LINKS.filter(
        link =>
          visibleIds.has(link.sourceId) && visibleIds.has(link.targetId),
      ).map(link => {
        const sourceElem = elements().find(e => e.id === link.sourceId)!;
        const targetElem = elements().find(e => e.id === link.targetId)!;

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
      if (!canvasRef) return;

      let animationTime = 0;

      // Boucle d'animation
      const animate = () => {
        const ctx = canvasRef!.getContext('2d');
        if (!ctx) return;

        animationTime += 0.016; // ~60fps

        // Nettoyer et configurer le canvas
        ctx.fillStyle = '#F9FAFB';
        ctx.fillRect(0, 0, canvasRef!.width, canvasRef!.height);

        // Appliquer les transformations (zoom et pan)
        ctx.save();
        const pan = panOffset();
        ctx.translate(pan.x, pan.y);
        ctx.scale(zoom(), zoom());

        // Rendu
        const elemComps = elementComponents();
        const linkComps = linkComponents();
        renderCanvas2D(canvasRef!, elemComps, linkComps);

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

            // Mettre en évidence les connexions si focusMode est activé
            if (focusMode()) {
              // Assombrir tout sauf l'élément sélectionné et ses connexions
              ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
              ctx.fillRect(
                0,
                0,
                canvasRef!.width / zoom(),
                canvasRef!.height / zoom(),
              );

              // Re-dessiner l'élément sélectionné et ses connexions
              // (Cette partie nécessiterait plus de logique pour identifier les connexions)
            }
          }

          if (selectedLink) {
            const path = selectedLink.utils.getPath(curveType());
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

      // Gestion des événements
      const handleMouseDown = (event: MouseEvent) => {
        const rect = canvasRef!.getBoundingClientRect();
        const scaleX = canvasRef!.width / rect.width;
        const scaleY = canvasRef!.height / rect.height;
        const pan = panOffset();
        const x = ((event.clientX - rect.left) * scaleX - pan.x) / zoom();
        const y = ((event.clientY - rect.top) * scaleY - pan.y) / zoom();

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
            x: event.clientX - pan.x,
            y: event.clientY - pan.y,
          });
        }
      };

      const handleMouseMove = (event: MouseEvent) => {
        if (!canvasRef) return;
        const rect = canvasRef.getBoundingClientRect();
        const scaleX = canvasRef!.width / rect.width;
        const scaleY = canvasRef!.height / rect.height;
        const pan = panOffset();
        const x = ((event.clientX - rect.left) * scaleX - pan.x) / zoom();
        const y = ((event.clientY - rect.top) * scaleY - pan.y) / zoom();

        // Gérer le drag d'élément
        const draggedId = draggedElementId();
        if (draggedId) {
          const offset = dragOffset();
          const newX = x - offset.x;
          const newY = y - offset.y;

          setElements(prev =>
            prev.map(elem =>
              elem.id === draggedId ? { ...elem, x: newX, y: newY } : elem,
            ),
          );
          return;
        }

        // Gérer le pan du canvas
        if (isPanning()) {
          const start = panStart();
          setPanOffset({
            x: event.clientX - start.x,
            y: event.clientY - start.y,
          });
          return;
        }

        // Gérer le survol
        const elemComps = elementComponents();
        const linkComps = linkComponents();

        let hoveredElement = null;
        let isOverButton = false;

        // Vérifier d'abord les boutons
        for (const elemComp of elemComps) {
          const elem = elemComp.element;
          if (elem.childrenIds && elem.childrenIds.length > 0) {
            const indicatorX = elem.x + elem.width + 5;
            const indicatorY = elem.y + elem.height / 2;
            const radius = 8;

            const distance = Math.sqrt(
              Math.pow(x - indicatorX, 2) + Math.pow(y - indicatorY, 2),
            );

            if (distance <= radius + 5) {
              hoveredElement = `${elem.id}-button`;
              isOverButton = true;
              break;
            }
          }
        }

        // Si pas sur un bouton, vérifier les éléments
        if (!isOverButton) {
          for (const elemComp of elemComps) {
            if (elemComp.utils.isPointInside(x, y)) {
              hoveredElement = elemComp.element.id;
              break;
            }
          }

          // Vérifier les liens si pas sur un élément
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

        // Gérer le curseur
        if (!canvasRef) return;

        if (draggedId || isPanning()) {
          canvasRef.style.cursor = 'grabbing';
        } else if (hoveredElement) {
          canvasRef.style.cursor = 'grab';
        } else {
          canvasRef.style.cursor = 'grab';
        }

        handleCanvasMouseMove(
          { clientX: x, clientY: y },
          canvasRef,
          elemComps,
          linkComps,
        );
      };

      const handleMouseUp = () => {
        setDraggedElementId(null);
        setIsPanning(false);
      };

      const handleMouseLeave = () => {
        setDraggedElementId(null);
        setIsPanning(false);
      };

      const handleClick = (event: MouseEvent) => {
        const rect = canvasRef!.getBoundingClientRect();
        const scaleX = canvasRef!.width / rect.width;
        const scaleY = canvasRef!.height / rect.height;
        const pan = panOffset();
        const x = ((event.clientX - rect.left) * scaleX - pan.x) / zoom();
        const y = ((event.clientY - rect.top) * scaleY - pan.y) / zoom();

        const elemComps = elementComponents();
        const linkComps = linkComponents();

        // Vérifier d'abord les clics sur les boutons expand/collapse
        for (const elemComp of elemComps) {
          const elem = elemComp.element;
          if (elem.childrenIds && elem.childrenIds.length > 0) {
            const indicatorX = elem.x + elem.width + 5;
            const indicatorY = elem.y + elem.height / 2;
            const radius = 8;

            const distance = Math.sqrt(
              Math.pow(x - indicatorX, 2) + Math.pow(y - indicatorY, 2),
            );

            if (distance <= radius + 5) {
              setClickRipples(prev => [
                ...prev,
                {
                  x: indicatorX,
                  y: indicatorY,
                  startTime: Date.now(),
                },
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

        // Si pas de clic sur bouton, utiliser la détection standard
        let elementClicked = false;
        let linkClicked = false;

        for (const elemComp of elemComps) {
          if (elemComp.utils.isPointInside(x, y)) {
            setSelectedId(elemComp.element.id);
            elementClicked = true;
            break;
          }
        }

        if (!elementClicked) {
          for (const linkComp of linkComps) {
            if (linkComp.utils.isPointNearPath(x, y, 8)) {
              setSelectedId(linkComp.link.id);
              linkClicked = true;
              break;
            }
          }
        }

        if (!elementClicked && !linkClicked) {
          setSelectedId(null);
        }
      };

      const handleWheel = (event: WheelEvent) => {
        event.preventDefault();

        // Détecter si c'est un geste de pinch/zoom ou un scroll
        if (event.ctrlKey) {
          // Pinch/zoom détecté (ctrlKey est automatiquement set sur trackpad pinch)
          const delta = event.deltaY > 0 ? 0.95 : 1.05; // Réduction de sensibilité
          setZoom(z => Math.max(0.5, Math.min(3, z * delta)));
        } else {
          // Simple scroll - pourrait être utilisé pour pan dans le futur
          // Pour l'instant, on applique un zoom très réduit
          const delta = event.deltaY > 0 ? 0.98 : 1.02; // Très réduit
          setZoom(z => Math.max(0.5, Math.min(3, z * delta)));
        }
      };

      const handleDoubleClick = (event: MouseEvent) => {
        const rect = canvasRef!.getBoundingClientRect();
        const scaleX = canvasRef!.width / rect.width;
        const scaleY = canvasRef!.height / rect.height;
        const pan = panOffset();
        const x = ((event.clientX - rect.left) * scaleX - pan.x) / zoom();
        const y = ((event.clientY - rect.top) * scaleY - pan.y) / zoom();

        const elemComps = elementComponents();

        // Trouver l'élément cliqué
        for (const elemComp of elemComps) {
          if (elemComp.utils.isPointInside(x, y)) {
            const elem = elemComp.element;
            setEditingId(elem.id);

            // Créer un input temporaire pour l'édition
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
              setEditingId(null);
            };

            input.addEventListener('blur', saveEdit);
            input.addEventListener('keydown', e => {
              if (e.key === 'Enter') {
                saveEdit();
              } else if (e.key === 'Escape') {
                document.body.removeChild(input);
                setEditingId(null);
              }
            });

            return;
          }
        }
      };

      canvasRef.addEventListener('mousedown', handleMouseDown);
      canvasRef.addEventListener('mousemove', handleMouseMove);
      canvasRef.addEventListener('mouseup', handleMouseUp);
      canvasRef.addEventListener('mouseleave', handleMouseLeave);
      canvasRef.addEventListener('click', handleClick);
      canvasRef.addEventListener('dblclick', handleDoubleClick);
      canvasRef.addEventListener('wheel', handleWheel, { passive: false });

      return onCleanup(() => {
        canvasRef?.removeEventListener('mousedown', handleMouseDown);
        canvasRef?.removeEventListener('mousemove', handleMouseMove);
        canvasRef?.removeEventListener('mouseup', handleMouseUp);
        canvasRef?.removeEventListener('mouseleave', handleMouseLeave);
        canvasRef?.removeEventListener('click', handleClick);
        canvasRef?.removeEventListener('dblclick', handleDoubleClick);
        canvasRef?.removeEventListener('wheel', handleWheel);
      });
    });

    return (
      <div class='w-full h-full flex flex-col gap-4 bg-white p-4'>
        <div class='flex flex-col gap-2'>
          <h1 class='text-3xl font-bold text-gray-900'>
            Démo Mindmap Interactive
          </h1>
          <p class='text-gray-600'>
            Cliquez sur les nœuds pour les replier/déplier. Double-cliquez
            pour éditer.
          </p>

          <div class='flex gap-4 flex-wrap'>
            <div class='flex gap-2 items-center'>
              <label for='curve-type' class='font-semibold text-gray-700'>
                Type de courbe :
              </label>
              <select
                id='curve-type'
                value={curveType()}
                onChange={e =>
                  setCurveType(
                    e.currentTarget.value as 'quadratic' | 'cubic',
                  )
                }
                class='px-3 py-2 border border-gray-300 rounded-md bg-white'
              >
                <option value='cubic'>Cubique</option>
                <option value='quadratic'>Quadratique</option>
              </select>
            </div>

            <div class='flex gap-2 items-center'>
              <label for='zoom' class='font-semibold text-gray-700'>
                Zoom : {(zoom() * 100).toFixed(0)}%
              </label>
              <input
                id='zoom'
                type='range'
                min='0.5'
                max='3'
                step='0.1'
                value={zoom()}
                onChange={e => setZoom(parseFloat(e.currentTarget.value))}
                class='w-32'
              />
            </div>

            <div class='flex gap-2 items-center'>
              <label class='font-semibold text-gray-700'>
                <input
                  type='checkbox'
                  checked={focusMode()}
                  onChange={e => setFocusMode(e.currentTarget.checked)}
                  class='mr-2'
                />
                Mode Focus
              </label>
            </div>

            {/* {selectedId() && (
              <div class='flex gap-2 items-center px-3 py-2 bg-blue-50 border border-blue-200 rounded-md'>
                <span class='font-semibold text-gray-700'>
                  Sélectionné :
                </span>
                <code class='text-blue-600'>{selectedId()}</code>
                <button
                  onClick={() => setSelectedId(null)}
                  class='ml-2 px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600'
                >
                  Désélectionner
                </button>
              </div>
            )}

            {hoveredId() && (
              <div class='flex gap-2 items-center px-3 py-2 bg-purple-50 border border-purple-200 rounded-md'>
                <span class='font-semibold text-gray-700'>Survolé :</span>
                <code class='text-purple-600'>{hoveredId()}</code>
              </div>
            )}

            {editingId() && (
              <div class='flex gap-2 items-center px-3 py-2 bg-orange-50 border border-orange-200 rounded-md'>
                <span class='font-semibold text-gray-700'>
                  Édition en cours...
                </span>
              </div>
            )} */}
          </div>

          <div class='flex gap-2'>
            <button
              onClick={() => setCollapsedNodes(new Set())}
              class='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'
            >
              Tout déplier
            </button>
            <button
              onClick={() => {
                const allParents = new Set(
                  elements()
                    .filter(e => e.childrenIds && e.childrenIds.length > 0)
                    .map(e => e.id),
                );
                setCollapsedNodes(allParents);
              }}
              class='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'
            >
              Tout replier
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              class='px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600'
            >
              Réinitialiser la vue
            </button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={1200}
          height={600}
          class='w-full border-2 border-gray-300 rounded-lg bg-white cursor-grab active:cursor-grabbing'
          style='max-width: 100%; height: auto;'
        />

        <div class='grid grid-cols-2 gap-4 text-sm text-gray-600'>
          <div class='flex flex-col gap-2'>
            <h3 class='font-semibold text-gray-900'>Contrôles :</h3>
            <ul class='list-disc list-inside space-y-1'>
              <li>
                <strong>Clic simple sur bouton</strong> : Replier/déplier
                les enfants d'un nœud
              </li>
              <li>
                <strong>Glisser un élément</strong> : Cliquer et faire
                glisser pour déplacer un nœud
              </li>
              <li>
                <strong>Glisser le canvas</strong> : Cliquer sur le fond et
                faire glisser pour naviguer
              </li>
              <li>
                <strong>Double-clic</strong> : Éditer le titre d'un nœud
              </li>
              <li>
                <strong>Survol</strong> : Mettre en évidence un nœud
              </li>
              <li>
                <strong>Molette</strong> : Zoom in/out
              </li>
              <li>
                <strong>Mode Focus</strong> : Isoler le nœud sélectionné
              </li>
            </ul>
          </div>

          <div class='flex flex-col gap-2'>
            <h3 class='font-semibold text-gray-900'>Informations :</h3>
            <ul class='list-disc list-inside space-y-1'>
              <li>
                <strong>{getVisibleElements().length}</strong> éléments
                visibles (total: {elements().length})
              </li>
              <li>
                <strong>{linkComponents().length}</strong> liens visibles
              </li>
              <li>
                <strong>{collapsedNodes().size}</strong> nœuds repliés
              </li>
              <li>Type de courbe : {curveType()}</li>
              <li>
                Zoom : <strong>{(zoom() * 100).toFixed(0)}%</strong>
              </li>
              <li>
                Pan :{' '}
                <strong>
                  x: {panOffset().x.toFixed(0)}, y:{' '}
                  {panOffset().y.toFixed(0)}
                </strong>
              </li>
              {draggedElementId() && (
                <li class='text-green-600 font-semibold'>
                  🖐️ Déplacement en cours : {draggedElementId()}
                </li>
              )}
              {isPanning() && (
                <li class='text-blue-600 font-semibold'>
                  🗺️ Navigation en cours
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  },
});
