/**
 * Jsdom environment stubs required by the fabric.js canvas during component
 * rendering tests.
 */

class ObserverStub {
  /** Required by the `ResizeObserver` and `IntersectionObserver` interfaces. */
  observe() {}
  /** Required by the `ResizeObserver` and `IntersectionObserver` interfaces. */
  unobserve() {}
  /** Required by the `ResizeObserver` and `IntersectionObserver` interfaces. */
  disconnect() {}
  /** Required by the `IntersectionObserver` interface. */
  takeRecords() {
    return [] as never[];
  }
}

const globals = globalThis as Record<string, unknown>;

if (!('ResizeObserver' in globals)) globals.ResizeObserver = ObserverStub;
if (!('IntersectionObserver' in globals))
  globals.IntersectionObserver = ObserverStub;

if (!('requestAnimationFrame' in globals)) {
  globals.requestAnimationFrame = (callback: FrameRequestCallback) =>
    setTimeout(() => callback(Date.now()), 16) as unknown as number;
  globals.cancelAnimationFrame = (handle: number) => clearTimeout(handle);
}

/**
 * Builds a minimal 2D context stub bound to its canvas element, required by
 * fabric.js rendering in jsdom where `HTMLCanvasElement.getContext` is not
 * implemented.
 *
 * @param canvas - Canvas element owning the context.
 *
 * @returns The 2D context stub.
 */
const createContextStub = (canvas: HTMLCanvasElement) => ({
  canvas,
  font: '',
  fillStyle: '',
  strokeStyle: '',
  textAlign: 'left',
  textBaseline: 'alphabetic',
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  shadowBlur: 0,
  shadowColor: 'rgba(0,0,0,0)',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  imageSmoothingEnabled: true,
  measureText: (text: string) => ({
    width: String(text ?? '').length * 8,
    actualBoundingBoxAscent: 8,
    actualBoundingBoxDescent: 2,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: String(text ?? '').length * 8,
  }),
  fillText: () => {},
  strokeText: () => {},
  save: () => {},
  restore: () => {},
  translate: () => {},
  rotate: () => {},
  scale: () => {},
  clearRect: () => {},
  fillRect: () => {},
  strokeRect: () => {},
  beginPath: () => {},
  closePath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  bezierCurveTo: () => {},
  quadraticCurveTo: () => {},
  arc: () => {},
  arcTo: () => {},
  ellipse: () => {},
  rect: () => {},
  roundRect: () => {},
  fill: () => {},
  stroke: () => {},
  clip: () => {},
  setLineDash: () => {},
  getLineDash: () => [] as number[],
  createLinearGradient: () => ({ addColorStop: () => {} }),
  createRadialGradient: () => ({ addColorStop: () => {} }),
  createPattern: () => null,
  drawImage: () => {},
  transform: () => {},
  setTransform: () => {},
  resetTransform: () => {},
  getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
  getImageData: () => ({ data: new Uint8ClampedArray(4) }),
  putImageData: () => {},
  isPointInPath: () => false,
  isPointInStroke: () => false,
});

if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
  ): unknown {
    return createContextStub(this);
  } as unknown as HTMLCanvasElement['getContext'];
}
