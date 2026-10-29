// Plays each [data-kind-icon] canvas's Rive tab icon once, as the app page's theme tabs do
// (src/pages/app.astro): the same files, state machine and view model (isLightMode, play).
let started = false;

export function startKindIcons() {
  if (started) return;
  started = true;
  const canvases = Array.from(document.querySelectorAll<HTMLCanvasElement>('[data-kind-icon]'));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  if (!canvases.length || saveData) return;

  Promise.all([
    import('@rive-app/canvas-lite'),
    import('@rive-app/canvas-lite/rive.wasm?url'),
  ]).then(([runtime, { default: wasmUrl }]) => {
    runtime.RuntimeLoader.setWasmUrl(wasmUrl);
    canvases.forEach((canvas) => {
      const icon = new runtime.Rive({
        canvas,
        src: `/media/app-icons/${canvas.dataset.kindIcon}.riv`,
        stateMachine: 'State Machine 1',
        autoplay: true,
        autoBind: true,
        onLoad: () => {
          icon.resizeDrawingSurfaceToCanvas();
          const ink = icon.viewModelInstance?.boolean('isLightMode');
          if (ink) ink.value = false;
          canvas.hidden = false;
          if (!reducedMotion) setTimeout(() => icon.viewModelInstance?.trigger('play')?.trigger(), 500);
        },
      });
    });
  }).catch(() => { /* the icon is decoration: the eyebrow reads without it */ });
}
