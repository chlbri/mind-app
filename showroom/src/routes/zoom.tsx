import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";

export const Route = createFileRoute("/zoom")({
  component: ZoomDemo,
});

function ZoomDemo() {
  const [zoom, setZoom] = createSignal(1);

  return (
    <div class="flex flex-col items-center justify-center p-6">
      {/* Controls */}
      <div class="flex items-center gap-2 mb-4">
        <label for="zoomSlider" class="text-sm font-medium">
          Zoom Level: {zoom().toFixed(1)}x ({Math.round(zoom() * 100)}%)
        </label>
        <input
          id="zoomSlider"
          type="range"
          min="1"
          max="2"
          step="0.1"
          value={zoom()}
          onInput={(e) => setZoom(parseFloat(e.currentTarget.value))}
          class="cursor-pointer"
        />
      </div>

      {/* Viewport Window */}
      <div class="w-96 h-60 border-2 border-slate-800 rounded-lg overflow-scroll relative shadow-md">
        {/* Zoom Canvas */}
        <div
          id="canvas"
          class="p-4 bg-slate-100 origin-top-left transition-transform duration-100 box-border text-left"
          style={{
            transform: `scale(${zoom()})`,
            width: `${100 / zoom()}%`,
            height: `${100 / zoom()}%`,
          }}
        >
          <h3 class="font-bold text-lg text-slate-800">Iframe-style Zoom</h3>
          <p class="text-sm text-slate-600 mb-4">Drag the slider to test layout stability.</p>

          <div class="flex gap-2">
            <div class="flex-1 bg-emerald-500 text-white p-2 text-center rounded">Box A</div>
            <div class="flex-1 bg-emerald-500 text-white p-2 text-center rounded">Box B</div>
          </div>
        </div>
      </div>
    </div>
  );
}
