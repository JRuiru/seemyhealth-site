# cta-thumb

The thumb on the app page's "Still scrolling?" section (`src/pages/app.astro`), built with the Rive CLI.

- `gen.py` writes `scene.rml` (the timing, poses and colours live there): `python3 -I gen.py scene.rml`
- Check: `rive . --verify` and `rive inspect . --summary`
- Build: `rive . --once`, then copy `build/cta-thumb.riv` to `public/media/cta-thumb.riv`.
  `--publish` adds a Rive watermark unless the project is linked to a file in the Rive account.

The page relies on these names: artboard and state machine `CtaThumb`; view model `CtaThumb` with
triggers `play` and `skip` (page to file) and `tapped` (file to page, at 2.45 s); the tap point at
artboard (150, 200) on a 600 x 320 artboard.
