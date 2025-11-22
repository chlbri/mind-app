/**
 * Animations et transitions pour les mindmaps interactives
 */

/**
 * Interpolation linéaire entre deux valeurs
 */
export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

/**
 * Ease-out cubic pour des animations fluides
 */
export const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

/**
 * Ease-in-out cubic pour des animations fluides
 */
export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/**
 * Animation de pulsation pour l'élément sélectionné
 */
export const getPulseScale = (time: number, frequency = 2): number => {
  return 1 + Math.sin(time * frequency) * 0.05;
};

/**
 * Animation de glow pour l'élément survolé
 */
export const getGlowIntensity = (time: number, frequency = 3): number => {
  return 10 + Math.sin(time * frequency) * 5;
};

/**
 * Animation de rebond pour les nouveaux éléments
 */
export const bounceIn = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;

  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/**
 * Classe pour gérer les animations de transition
 */
export class TransitionManager {
  private animations = new Map<
    string,
    {
      startTime: number;
      duration: number;
      startValue: number;
      endValue: number;
      easing: (t: number) => number;
    }
  >();

  /**
   * Démarre une nouvelle animation
   */
  start(
    id: string,
    startValue: number,
    endValue: number,
    duration: number,
    easing: (t: number) => number = easeInOutCubic,
  ) {
    this.animations.set(id, {
      startTime: Date.now(),
      duration,
      startValue,
      endValue,
      easing,
    });
  }

  /**
   * Obtient la valeur actuelle d'une animation
   */
  getValue(id: string): number | null {
    const animation = this.animations.get(id);
    if (!animation) return null;

    const elapsed = Date.now() - animation.startTime;
    const progress = Math.min(elapsed / animation.duration, 1);

    if (progress >= 1) {
      this.animations.delete(id);
      return animation.endValue;
    }

    const easedProgress = animation.easing(progress);
    return lerp(animation.startValue, animation.endValue, easedProgress);
  }

  /**
   * Vérifie si une animation est en cours
   */
  isAnimating(id: string): boolean {
    return this.animations.has(id);
  }

  /**
   * Annule une animation
   */
  cancel(id: string) {
    this.animations.delete(id);
  }

  /**
   * Annule toutes les animations
   */
  cancelAll() {
    this.animations.clear();
  }
}

/**
 * Gestionnaire d'animations pour expand/collapse
 */
export class CollapseAnimationManager {
  private collapsing = new Map<
    string,
    {
      startTime: number;
      duration: number;
      isExpanding: boolean;
    }
  >();

  /**
   * Démarre une animation de collapse/expand
   */
  start(id: string, isExpanding: boolean, duration = 300) {
    this.collapsing.set(id, {
      startTime: Date.now(),
      duration,
      isExpanding,
    });
  }

  /**
   * Obtient le facteur d'échelle pour un nœud (0 = complètement collapsé, 1 = complètement visible)
   */
  getScale(id: string): number {
    const animation = this.collapsing.get(id);
    if (!animation) return 1;

    const elapsed = Date.now() - animation.startTime;
    const progress = Math.min(elapsed / animation.duration, 1);

    if (progress >= 1) {
      this.collapsing.delete(id);
      return animation.isExpanding ? 1 : 0;
    }

    const easedProgress = easeOutCubic(progress);
    return animation.isExpanding ? easedProgress : 1 - easedProgress;
  }

  /**
   * Obtient l'opacité pour un nœud
   */
  getOpacity(id: string): number {
    const scale = this.getScale(id);
    return scale;
  }
}

/**
 * Dessine un effet de particules pour les interactions
 */
export const drawParticles = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  color = '#3B82F6',
) => {
  const particleCount = 8;
  const radius = 30;

  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2 + time * 2;
    const distance = radius + Math.sin(time * 5 + i) * 10;

    const px = x + Math.cos(angle) * distance;
    const py = y + Math.sin(angle) * distance;

    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.5 + Math.sin(time * 3 + i) * 0.3;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
};

/**
 * Dessine des ondes de propagation pour l'effet de clic
 */
export const drawRipple = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number,
  color = '#3B82F6',
) => {
  const maxRadius = 50;
  const radius = maxRadius * easeOutCubic(progress);
  const opacity = 1 - progress;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.globalAlpha = opacity;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.globalAlpha = 1;
};
