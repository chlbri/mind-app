import { createFileRoute } from '@tanstack/solid-router';
import { createSignal } from 'solid-js';

/** Zoom demonstration route testing canvas layout stability under dynamic scaling. */
export const Route = createFileRoute('/zoom')({ component: ZoomDemo });

/** Interactive zoom preview component with a scale slider control. */
function ZoomDemo() {
  const [zoom, setZoom] = createSignal(1);

  return (
    <div class='flex flex-col items-center justify-center p-6'>
      {/* Controls */}
      <div class='mb-4 flex items-center gap-2'>
        <label for='zoomSlider' class='text-sm font-medium'>
          Zoom Level: {zoom().toFixed(1)}x ({Math.round(zoom() * 100)}%)
        </label>
        <input
          id='zoomSlider'
          type='range'
          min='1'
          max='2'
          step='0.1'
          value={zoom()}
          onInput={e => setZoom(parseFloat(e.currentTarget.value))}
          class='cursor-pointer'
        />
      </div>

      {/* Viewport Window */}
      <div class='relative h-60 w-96 overflow-auto rounded-lg border-2 border-slate-800 shadow-md'>
        {/* Zoom Canvas */}
        <div
          id='canvas'
          class='box-border origin-top-left bg-slate-100 p-4 text-left transition-transform duration-100'
          style={{
            transform: `scale(${zoom()})`,
            width: `${100 / zoom()}%`,
            height: `${100 / zoom()}%`,
          }}
        >
          <h3 class='text-lg font-bold text-slate-800'>Iframe-style Zoom</h3>
          <p class='mb-4 text-sm text-slate-600'>
            Drag the slider to test layout stability.
          </p>

          <div class='flex gap-2'>
            <div class='flex-1 rounded bg-emerald-500 p-2 text-center text-white'>
              Box A
            </div>
            <div class='flex-1 rounded bg-emerald-500 p-2 text-center text-white'>
              Box B
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
