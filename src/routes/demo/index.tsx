import { createFileRoute } from '@tanstack/solid-router';

import { DEMO_ELEMENTS, DEMO_LINKS } from './-data';
import { createCanvas } from './-hooks/canvas';

export const Route = createFileRoute('/demo/')({
  component: () => {
    const {
      elements,
      visibleElements,
      linkComponents,
      collapsedNodes,
      setCollapsedNodes,
      zoom,
      setZoom,
      setPanOffset,
      Canvas,
    } = createCanvas({
      elements: DEMO_ELEMENTS,
      links: DEMO_LINKS,
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
                setPanOffset({ x: 0, y: 0 });
                setZoom(1);
              }}
              class='px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600'
            >
              Réinitialiser la vue
            </button>
          </div>
        </div>

        <Canvas />

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
                <strong>{visibleElements().length}</strong> éléments
                visibles (total: {elements().length})
              </li>
              <li>
                <strong>{linkComponents().length}</strong> liens visibles
              </li>
              <li>
                <strong>{collapsedNodes().size}</strong> nœuds repliés
              </li>
              <li>
                Zoom : <strong>{(zoom() * 100).toFixed(0)}%</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  },
});
