# cta-thumb

The thumb on the app page's closing section ("Still here? Need a hand?") (`src/pages/app.astro`), built with the Rive CLI.

- Linked to the Rive file `cta-thumb` (Drafts project, file 2675900; see `push:` in `rive.yaml`).
  `scene.rml` now carries the ids that tie each object to that file, so it is the source. Edit it,
  or edit in the Rive editor and `rive pull` it back, then `rive push`.
- Check: `rive . --verify` and `rive inspect . --summary`
- Build: `rive . --publish`, then copy `build/cta-thumb.riv` to `public/media/cta-thumb.riv`.

The page relies on these names: artboard and state machine `CtaThumb`; view model `CtaThumb` with
triggers `play` and `skip` (page to file) and `tapped` (file to page, at 2.45 s); the tap point at
artboard (150, 200) on a 600 x 320 artboard.
