import type { InferOutput } from 'valibot';
import type { LinkSchema } from '~/features/mindmap/schemas/link';

/**
 * Props pour le composant Link
 * Contient toutes les données métier et visuelles d'une relation entre deux nœuds
 */
export type LinkProps = {
  /** Données du lien validées par Valibot */
  link: InferOutput<typeof LinkSchema>;
  /** Position X du nœud source */
  sourceX: number;
  /** Position Y du nœud source */
  sourceY: number;
  /** Largeur du nœud source (pour calculer le point de sortie) */
  sourceWidth: number;
  /** Hauteur du nœud source (pour calculer le point de sortie) */
  sourceHeight: number;
  /** Position X du nœud cible */
  targetX: number;
  /** Position Y du nœud cible */
  targetY: number;
  /** Largeur du nœud cible (pour calculer le point d'entrée) */
  targetWidth: number;
  /** Hauteur du nœud cible (pour calculer le point d'entrée) */
  targetHeight: number;
  /** Callback optionnel lors du clic sur le lien */
  onClick?: (id: string) => void;
  /** Callback optionnel pour éditer le label */
  onEditLabel?: (id: string) => void;
  /** Classes CSS additionnelles */
  class?: string;
};

/**
 * Types de courbes supportées pour le rendu Canvas
 */
export type CurveType = 'quadratic' | 'cubic' | 'arc' | 'straight';

/**
 * Composant Link pour rendu Canvas avec courbure visuelle
 *
 * ⚠️ Ce composant est optimisé pour une utilisation dans un Canvas 2D/3D.
 * Il calcule les courbes de Bézier et les points de contrôle pour un rendu
 * performant. Aucun rendu DOM natif.
 *
 * La courbure est calculée dynamiquement basée sur :
 * - La propriété `curvature` du schéma Link (0-100)
 * - La distance entre les nœuds source et cible
 * - La direction du lien (horizontale, verticale, diagonale)
 *
 * @example
 * ```tsx
 * import { Link } from '~/features/mindmap/ui/components/Link';
 * import type { InferOutput } from 'valibot';
 * import type { LinkSchema } from '~/features/mindmap/schemas/link';
 *
 * const link: InferOutput<typeof LinkSchema> = {
 *   id: 'link-123',
 *   sourceId: 'elem-1',
 *   targetId: 'elem-2',
 *   type: 'related',
 *   curvature: 50,
 *   color: '#000000',
 *   strokeWidth: 2,
 *   // ... autres propriétés
 * };
 *
 * const MyComponent = () => {
 *   return (
 *     <Link
 *       link={link}
 *       sourceX={100}
 *       sourceY={150}
 *       sourceWidth={200}
 *       sourceHeight={100}
 *       targetX={400}
 *       targetY={300}
 *       targetWidth={200}
 *       targetHeight={100}
 *       onClick={(id) => console.log('Clicked:', id)}
 *     />
 *   );
 * };
 * ```
 *
 * Utilisation avec Canvas 2D :
 * ```tsx
 * const ctx = canvas.getContext('2d');
 * const linkComponent = <Link {...linkProps} />;
 * const path = linkComponent.utils.getPath('cubic');
 *
 * ctx.strokeStyle = path.color;
 * ctx.lineWidth = path.strokeWidth;
 * ctx.setLineDash(path.lineDash);
 *
 * ctx.beginPath();
 * ctx.moveTo(path.startX, path.startY);
 * ctx.bezierCurveTo(
 *   path.controlX1,
 *   path.controlY1,
 *   path.controlX2,
 *   path.controlY2,
 *   path.endX,
 *   path.endY
 * );
 * ctx.stroke();
 * ctx.setLineDash([]);
 *
 * // Optionnel : afficher le label
 * if (path.showLabel && path.label) {
 *   ctx.fillStyle = path.labelColor;
 *   ctx.font = '12px Arial';
 *   ctx.fillText(path.label, path.labelX, path.labelY);
 * }
 * ```
 *
 * Utilisation avec Canvas 3D (Three.js) :
 * ```tsx
 * import * as THREE from 'three';
 *
 * const path = linkComponent.utils.getPath('cubic');
 * const curve = new THREE.CubicBezierCurve3(
 *   new THREE.Vector3(path.startX, path.startY, 0),
 *   new THREE.Vector3(path.controlX1, path.controlY1, 0),
 *   new THREE.Vector3(path.controlX2, path.controlY2, 0),
 *   new THREE.Vector3(path.endX, path.endY, 0),
 * );
 *
 * const points = curve.getPoints(50);
 * const geometry = new THREE.BufferGeometry().setFromPoints(points);
 * const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: path.color }));
 * scene.add(line);
 * ```
 */
export const Link = (props: LinkProps) => {
  /**
   * Récupère le centre d'un nœud
   */
  const getNodeCenter = (
    x: number,
    y: number,
    width: number,
    height: number,
  ) => ({
    x: x + width / 2,
    y: y + height / 2,
  });

  /**
   * Récupère le point de sortie du nœud source (côté où commence la courbe)
   */
  const getSourcePoint = () => {
    const targetCenter = getNodeCenter(
      props.targetX,
      props.targetY,
      props.targetWidth,
      props.targetHeight,
    );
    const sourceCenter = getNodeCenter(
      props.sourceX,
      props.sourceY,
      props.sourceWidth,
      props.sourceHeight,
    );

    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;
    const angle = Math.atan2(dy, dx);

    // Calculer le point sur le bord du source
    let x = sourceCenter.x;
    let y = sourceCenter.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      x = dx > 0 ? props.sourceX + props.sourceWidth : props.sourceX;
      y = sourceCenter.y + (x - sourceCenter.x) * Math.tan(angle);
    } else {
      y = dy > 0 ? props.sourceY + props.sourceHeight : props.sourceY;
      x = sourceCenter.x + (y - sourceCenter.y) / Math.tan(angle);
    }

    return { x, y };
  };

  /**
   * Récupère le point d'entrée du nœud cible (côté où se termine la courbe)
   */
  const getTargetPoint = () => {
    const targetCenter = getNodeCenter(
      props.targetX,
      props.targetY,
      props.targetWidth,
      props.targetHeight,
    );
    const sourceCenter = getNodeCenter(
      props.sourceX,
      props.sourceY,
      props.sourceWidth,
      props.sourceHeight,
    );

    const dx = sourceCenter.x - targetCenter.x;
    const dy = sourceCenter.y - targetCenter.y;
    const angle = Math.atan2(dy, dx);

    // Calculer le point sur le bord de la cible
    let x = targetCenter.x;
    let y = targetCenter.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      x = dx > 0 ? props.targetX + props.targetWidth : props.targetX;
      y = targetCenter.y + (x - targetCenter.x) * Math.tan(angle);
    } else {
      y = dy > 0 ? props.targetY + props.targetHeight : props.targetY;
      x = targetCenter.x + (y - targetCenter.y) / Math.tan(angle);
    }

    return { x, y };
  };

  /**
   * Calcule les points de contrôle pour une courbe de Bézier quadratique
   * Courbure simple avec un seul point de contrôle
   */
  const getQuadraticControlPoint = () => {
    const sourcePoint = getSourcePoint();
    const targetPoint = getTargetPoint();
    const midX = (sourcePoint.x + targetPoint.x) / 2;
    const midY = (sourcePoint.y + targetPoint.y) / 2;

    // Calculer la perpendiculaire au segment
    const dx = targetPoint.x - sourcePoint.x;
    const dy = targetPoint.y - sourcePoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normaliser et appliquer la courbure
    const curveAmount = (props.link.curvature / 100) * (distance * 0.3);
    const perpX = (-dy / distance) * curveAmount;
    const perpY = (dx / distance) * curveAmount;

    return {
      controlX: midX + perpX,
      controlY: midY + perpY,
    };
  };

  /**
   * Calcule les points de contrôle pour une courbe de Bézier cubique
   * Courbure double avec deux points de contrôle pour plus de contrôle
   */
  const getCubicControlPoints = () => {
    const sourcePoint = getSourcePoint();
    const targetPoint = getTargetPoint();

    const dx = targetPoint.x - sourcePoint.x;
    const dy = targetPoint.y - sourcePoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculer la perpendiculaire
    const perpX = (-dy / distance) * 0.3;
    const perpY = (dx / distance) * 0.3;

    // Appliquer la courbure (0-100 converti en coefficient)
    const curveAmount = (props.link.curvature / 100) * distance;

    return {
      // Premier point de contrôle (proche de la source)
      control1X: sourcePoint.x + dx * 0.3 + perpX * curveAmount,
      control1Y: sourcePoint.y + dy * 0.3 + perpY * curveAmount,
      // Deuxième point de contrôle (proche de la cible)
      control2X: targetPoint.x - dx * 0.3 - perpX * curveAmount,
      control2Y: targetPoint.y - dy * 0.3 - perpY * curveAmount,
    };
  };

  /**
   * Récupère les données complètes du chemin pour le rendu Canvas
   * @param curveType - Type de courbe à utiliser ('quadratic', 'cubic', 'arc', 'straight')
   * @returns Objet contenant tous les paramètres nécessaires pour tracer le lien
   */
  const getPath = (curveType: CurveType = 'cubic') => {
    const sourcePoint = getSourcePoint();
    const targetPoint = getTargetPoint();
    const lineDashPattern = {
      solid: [] as number[],
      dashed: [5, 5],
      dotted: [2, 3],
    };

    // Récupérer les données de style
    const strokeStyle = props.link.strokeStyle || 'solid';
    const lineDash =
      lineDashPattern[strokeStyle as keyof typeof lineDashPattern] || [];

    let controlPoints = {
      control1X: 0,
      control1Y: 0,
      control2X: 0,
      control2Y: 0,
    };

    if (curveType === 'cubic') {
      controlPoints = getCubicControlPoints();
    } else if (curveType === 'quadratic') {
      const quad = getQuadraticControlPoint();
      controlPoints = {
        control1X: quad.controlX,
        control1Y: quad.controlY,
        control2X: quad.controlX,
        control2Y: quad.controlY,
      };
    }

    // Calculer la position du label
    const labelX = (sourcePoint.x + targetPoint.x) / 2;
    const labelY = (sourcePoint.y + targetPoint.y) / 2 - 10;

    return {
      // Points de la courbe
      startX: sourcePoint.x,
      startY: sourcePoint.y,
      endX: targetPoint.x,
      endY: targetPoint.y,
      controlX1: controlPoints.control1X,
      controlY1: controlPoints.control1Y,
      controlX2: controlPoints.control2X,
      controlY2: controlPoints.control2Y,

      // Style
      color: props.link.color,
      strokeWidth: props.link.strokeWidth,
      lineDash,
      curvature: props.link.curvature,

      // Label
      label: props.link.label,
      showLabel: props.link.showLabel,
      labelX,
      labelY,
      labelPosition: props.link.labelPosition,
      labelColor: '#000000',

      // Métadonnées
      type: props.link.type,
      bidirectional: props.link.bidirectional,
    };
  };

  /**
   * Vérifie si un point (clickX, clickY) est proche du chemin du lien
   * Utile pour détecter les clics sur le lien dans le Canvas
   * @param clickX - Position X du clic
   * @param clickY - Position Y du clic
   * @param tolerance - Distance en pixels pour considérer comme un clic valide (défaut: 5)
   * @returns true si le clic est proche du lien
   */
  const isPointNearPath = (
    clickX: number,
    clickY: number,
    tolerance: number = 5,
  ): boolean => {
    const sourcePoint = getSourcePoint();
    const targetPoint = getTargetPoint();

    // Distance simple point-to-line pour une approximation rapide
    const dx = targetPoint.x - sourcePoint.x;
    const dy = targetPoint.y - sourcePoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return false;

    // Projection du point sur le segment
    let t =
      ((clickX - sourcePoint.x) * dx + (clickY - sourcePoint.y) * dy) /
      (distance * distance);
    t = Math.max(0, Math.min(1, t));

    const projX = sourcePoint.x + t * dx;
    const projY = sourcePoint.y + t * dy;

    const distToPath = Math.sqrt(
      (clickX - projX) ** 2 + (clickY - projY) ** 2,
    );
    return distToPath <= tolerance;
  };

  /**
   * Récupère la longueur totale de la courbe
   * Utile pour calculer les longueurs de trait pointillé/tirets
   * @param curveType - Type de courbe à utiliser
   * @returns Longueur approximative de la courbe en pixels
   */
  const getPathLength = (curveType: CurveType = 'cubic'): number => {
    const path = getPath(curveType);
    const sourcePoint = { x: path.startX, y: path.startY };
    const targetPoint = { x: path.endX, y: path.endY };

    // Pour une courbe de Bézier cubique, approximation avec 10 segments
    let length = 0;
    let prevX = sourcePoint.x;
    let prevY = sourcePoint.y;

    for (let i = 1; i <= 10; i++) {
      const t = i / 10;
      const mt = 1 - t;

      // Formule de Bézier cubique
      const x =
        mt * mt * mt * sourcePoint.x +
        3 * mt * mt * t * path.controlX1 +
        3 * mt * t * t * path.controlX2 +
        t * t * t * targetPoint.x;

      const y =
        mt * mt * mt * sourcePoint.y +
        3 * mt * mt * t * path.controlY1 +
        3 * mt * t * t * path.controlY2 +
        t * t * t * targetPoint.y;

      const segmentLength = Math.sqrt((x - prevX) ** 2 + (y - prevY) ** 2);
      length += segmentLength;

      prevX = x;
      prevY = y;
    }

    return length;
  };

  // Gestionnaires d'événements
  const handleClick = () => {
    props.onClick?.(props.link.id);
  };

  const handleEditLabel = () => {
    props.onEditLabel?.(props.link.id);
  };

  // Exporter les utilitaires
  const utils = {
    getPath,
    getSourcePoint,
    getTargetPoint,
    isPointNearPath,
    getPathLength,
    getQuadraticControlPoint,
    getCubicControlPoints,
    handleClick,
    handleEditLabel,
  };

  // Retourner un objet contenant le lien et les utilitaires
  return {
    link: props.link,
    utils,
  };
};
