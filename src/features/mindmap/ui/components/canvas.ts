/**
 * Exemples d'utilisation des composants Element et Link
 * pour rendu Canvas 2D et 3D
 */

// ============================================================================
// 1. RENDU CANVAS 2D BASIQUE
// ============================================================================

/**
 * Exemple : Rendu d'éléments et liens dans un canvas 2D avec SolidJS
 */
export const renderCanvas2D = (
  canvas: HTMLCanvasElement,
  elements: any[],
  links: any[],
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Effacer le canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Rendu des liens d'abord (pour qu'ils soient sous les éléments)
  links.forEach(linkComponent => {
    const path = linkComponent.utils.getPath('cubic');

    // Ombre pour donner de la profondeur
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Appliquer le style avec une épaisseur augmentée
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.strokeWidth * 1.5; // 50% plus épais
    ctx.setLineDash(path.lineDash);

    // Tracer la courbe de Bézier
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

    // Réinitialiser le pattern de tirets et l'ombre
    ctx.setLineDash([]);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Dessiner des points aux deux extrémités
    const dotRadius = 5;

    // Point de départ (source)
    ctx.fillStyle = path.color;
    ctx.beginPath();
    ctx.arc(path.startX, path.startY, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    // Point d'arrivée (target)
    ctx.beginPath();
    ctx.arc(path.endX, path.endY, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    // Afficher le label si nécessaire
    if (path.showLabel && path.label) {
      ctx.fillStyle = path.labelColor;
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(path.label, path.labelX, path.labelY);
    }
  });

  // Rendu des éléments
  elements.forEach(elementComponent => {
    const element = elementComponent.element;

    // Fond
    ctx.fillStyle = element.backgroundColor;
    ctx.beginPath();
    ctx.font = `${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
    const width = ctx.measureText(element.title).width + 20;
    const height = element.fontSize + 20;
    ctx.roundRect(
      element.x,
      element.y,
      width,
      height,
      element.borderRadius,
    );
    ctx.fill();

    // Bordure
    ctx.strokeStyle = element.borderColor;
    ctx.lineWidth = element.borderWidth;
    ctx.stroke();

    // Texte
    ctx.fillStyle = element.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerX = element.x + width / 2;
    const centerY = element.y + height / 2;

    ctx.fillText(element.title, centerX, centerY, element.width);
  });
};

// ============================================================================
// 2. RENDU THREE.JS (CANVAS 3D)
// ============================================================================

/**
 * Exemple : Rendu avec Three.js pour une visualisation 3D
 * Note: Assurez-vous d'importer Three.js au niveau du module:
 * import * as THREE from 'three';
 */
export const renderCanvas3D = (
  scene: any,
  elements: any[],
  links: any[],
  THREE: any,
) => {
  // Créer les éléments en tant que plans 3D
  elements.forEach(elementComponent => {
    const element = elementComponent.element;

    // Créer une géométrie de plan
    const geometry = new THREE.PlaneGeometry(
      element.width,
      element.height,
    );
    const material = new THREE.MeshBasicMaterial({
      color: element.backgroundColor,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      element.x + element.width / 2,
      element.y + element.height / 2,
      0,
    );

    scene.add(mesh);

    // Ajouter une bordure
    const edgeGeometry = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: element.borderColor,
      linewidth: element.borderWidth,
    });
    const wireframe = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    wireframe.position.set(mesh.position.x, mesh.position.y, 0.01);
    scene.add(wireframe);
  });

  // Créer les liens en tant que courbes 3D
  links.forEach(linkComponent => {
    const path = linkComponent.utils.getPath('quadratic');

    // Créer une courbe de Bézier cubique
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(path.startX, path.startY, 0),
      new THREE.Vector3(path.controlX1, path.controlY1, 0),
      new THREE.Vector3(path.controlX2, path.controlY2, 0),
      new THREE.Vector3(path.endX, path.endY, 0),
    );

    // Créer la géométrie à partir de la courbe
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: path.color,
      linewidth: path.strokeWidth,
    });

    const line = new THREE.Line(geometry, material);
    scene.add(line);
  });
};

// ============================================================================
// 3. GESTION DES INTERACTIONS
// ============================================================================

/**
 * Gestion des clics sur le canvas 2D pour sélectionner éléments/liens
 */
export const handleCanvasClick = (
  event: MouseEvent,
  canvas: HTMLCanvasElement,
  elements: any[],
  links: any[],
  onElementSelected: (id: string) => void,
  onLinkSelected: (id: string) => void,
) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Vérifier les clics sur les liens d'abord (ils doivent être au-dessus)
  for (const linkComponent of links) {
    if (linkComponent.utils.isPointNearPath(x, y, 5)) {
      onLinkSelected(linkComponent.link.id);
      return;
    }
  }

  // Vérifier les clics sur les éléments
  for (const elementComponent of elements) {
    if (elementComponent.utils.isPointInside(x, y)) {
      onElementSelected(elementComponent.element.id);
      return;
    }
  }
};

/**
 * Double-clic pour éditer
 */
export const handleCanvasDoubleClick = (
  event: MouseEvent,
  canvas: HTMLCanvasElement,
  elements: any[],
  links: any[],
  onElementEdit: (id: string) => void,
  onLinkEdit: (id: string) => void,
) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Vérifier les éléments
  for (const elementComponent of elements) {
    if (elementComponent.utils.isPointInside(x, y)) {
      onElementEdit(elementComponent.element.id);
      return;
    }
  }

  // Vérifier les liens
  for (const linkComponent of links) {
    if (linkComponent.utils.isPointNearPath(x, y, 5)) {
      onLinkEdit(linkComponent.link.id);
      return;
    }
  }
};

/**
 * Survol pour afficher le curseur de lien
 */
export const handleCanvasMouseMove = (
  event: Pick<MouseEvent, 'clientX' | 'clientY'>,
  canvas: HTMLCanvasElement,
  elements: any[],
  links: any[],
) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Vérifier les liens
  for (const linkComponent of links) {
    if (linkComponent.utils.isPointNearPath(x, y, 5)) {
      canvas.style.cursor = 'pointer';
      return;
    }
  }

  // Vérifier les éléments
  for (const elementComponent of elements) {
    if (elementComponent.utils.isPointInside(x, y)) {
      canvas.style.cursor = 'pointer';
      return;
    }
  }

  canvas.style.cursor = 'default';
};
