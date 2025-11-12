import type { InferOutput } from 'valibot';
import type { ElementSchema } from '~/features/mindmap/schemas/element';

/**
 * Props pour le composant Element
 * Contient toutes les données métier et visuelles d'un nœud du mindmap
 */
export type ElementProps = {
  /** Données de l'élément validées par Valibot */
  element: InferOutput<typeof ElementSchema>;
  /** Callback optionnel lors du clic sur l'élément */
  onClick?: (id: string) => void;
  /** Callback optionnel lors du double-clic (édition) */
  onDoubleClick?: (id: string) => void;
  /** Classes CSS additionnelles */
  class?: string;
};

/**
 * Composant Element pour rendu Canvas
 *
 * ⚠️ Ce composant est optimisé pour une utilisation dans un Canvas 2D/3D.
 * Il exporte les données de l'élément pour que le Canvas les rende directement.
 * Aucun rendu DOM natif - utiliser uniquement pour accéder aux données.
 *
 * @example
 * ```tsx
 * import { createSignal } from 'solid-js';
 * import { Element } from '~/features/mindmap/ui/components/Element';
 * import type { InferOutput } from 'valibot';
 * import type { ElementSchema } from '~/features/mindmap/schemas/element';
 *
 * const [selectedId, setSelectedId] = createSignal<string | null>(null);
 *
 * const MyComponent = () => {
 *   const element: InferOutput<typeof ElementSchema> = {
 *     id: 'elem-123',
 *     title: 'Mon nœud',
 *     x: 100,
 *     y: 150,
 *     width: 200,
 *     height: 100,
 *     // ... autres propriétés
 *   };
 *
 *   return (
 *     <Element
 *       element={element}
 *       onClick={(id) => setSelectedId(id)}
 *       onDoubleClick={(id) => console.log('Edit:', id)}
 *     />
 *   );
 * };
 * ```
 *
 * Utilisation avec Canvas 2D :
 * ```tsx
 * const canvasElement = document.querySelector('canvas');
 * const ctx = canvasElement.getContext('2d');
 *
 * // Récupérer les données de l'élément
 * const renderElement = (element) => {
 *   ctx.fillStyle = element.backgroundColor;
 *   ctx.fillRect(element.x, element.y, element.width, element.height);
 *
 *   ctx.strokeStyle = element.borderColor;
 *   ctx.lineWidth = element.borderWidth;
 *   ctx.strokeRect(element.x, element.y, element.width, element.height);
 *
 *   ctx.fillStyle = element.textColor;
 *   ctx.font = `${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
 *   ctx.fillText(element.title, element.x + 10, element.y + element.height / 2);
 * };
 * ```
 */
export const Element = (props: ElementProps) => {
  /**
   * Gestionnaire du clic sur l'élément
   * À utiliser dans le rendu Canvas pour détecter les interactions
   */
  const handleClick = () => {
    props.onClick?.(props.element.id);
  };

  /**
   * Gestionnaire du double-clic (édition)
   * À utiliser dans le rendu Canvas pour activer le mode édition
   */
  const handleDoubleClick = () => {
    props.onDoubleClick?.(props.element.id);
  };

  /**
   * Fonction utilitaire pour déterminer si une position (x, y) est à l'intérieur de l'élément
   * Utile pour la détection de clics dans le Canvas
   *
   * @param clickX - Position X du clic
   * @param clickY - Position Y du clic
   * @returns true si le clic est à l'intérieur de l'élément
   */
  const isPointInside = (clickX: number, clickY: number): boolean => {
    const elem = props.element;
    return (
      clickX >= elem.x &&
      clickX <= elem.x + elem.width &&
      clickY >= elem.y &&
      clickY <= elem.y + elem.height
    );
  };

  /**
   * Récupère le centre de l'élément (utile pour les connexions aux liens)
   * @returns Objet {x, y} représentant le centre
   */
  const getCenter = () => {
    const elem = props.element;
    return {
      x: elem.x + elem.width / 2,
      y: elem.y + elem.height / 2,
    };
  };

  /**
   * Récupère le point de connexion le plus proche pour une cible donnée
   * Utile pour tracer les liens vers cet élément
   *
   * @param targetX - Position X de la cible
   * @param targetY - Position Y de la cible
   * @returns Point {x, y} sur le bord de l'élément le plus proche de la cible
   */
  const getConnectionPoint = (targetX: number, targetY: number) => {
    const elem = props.element;
    const center = getCenter();
    const dx = targetX - center.x;
    const dy = targetY - center.y;
    const angle = Math.atan2(dy, dx);

    // Trouver l'intersection avec le rectangle
    let x = center.x;
    let y = center.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Intersection avec le côté gauche ou droit
      if (dx > 0) {
        x = elem.x + elem.width;
      } else {
        x = elem.x;
      }
      y = center.y + (x - center.x) * Math.tan(angle);
    } else {
      // Intersection avec le côté haut ou bas
      if (dy > 0) {
        y = elem.y + elem.height;
      } else {
        y = elem.y;
      }
      x = center.x + (y - center.y) / Math.tan(angle);
    }

    return { x, y };
  };

  // Exporter les handlers et utilitaires
  const utils = {
    isPointInside,
    getCenter,
    getConnectionPoint,
    handleClick,
    handleDoubleClick,
  };

  // Retourner un objet contenant l'élément et les utilitaires
  // (ce composant n'a pas de rendu DOM)
  return {
    element: props.element,
    utils,
  };
};

export default Element;
