# cta-thumb

The thumb on the app page's closing section ("Still here? Need a hand?") (`src/pages/app.astro`), built with the Rive CLI.

- Linked to the Rive file `cta-thumb` (Drafts project, file 2675900; see `push:` in `rive.yaml`).
  `scene.rml` now carries the ids that tie each object to that file, so it is the source. Edit it,
  or edit in the Rive editor and `rive pull` it back, then `rive push`.
- Check: `rive . --verify` and `rive inspect . --summary`
- Build: `rive . --publish`, then copy `build/cta-thumb.riv` to `public/media/cta-thumb.riv`.

## Interface (what the page relies on)

- Artboard and state machine `CtaThumb`, **640 x 440** (was 600 x 320; the extra width and height
  are on the right and bottom, so every coordinate below is unchanged).
- **Tap point: artboard (150, 200).** The fingertip lands there at frame 147 (2.45 s), when
  `tapped` fires.
- View model `CtaThumb`:
  - `play` (trigger, page to file): plays the visit from the start; from the end pose it replays.
  - `skip` (trigger, page to file): from any state, to the hidden end pose; no `tapped`.
  - `tapped` (trigger, file to page): once per play, at the press.
  - `pointX`, `pointY` (numbers, page to file, defaults 0 and 105): the offset of the OTHER button's
    centre from the tap point, in artboard units. Side by side about (325, 0), stacked about
    (0, 105). Set them before `play`.
- The visit: enters from the lower right (0 to 0.6 s), points at (150 + pointX, 200 + pointY) and
  wiggles there without pressing (to about 1.7 s), glides to the tap point (1.7 to 2.35 s), taps
  (2.45 s, burst), leaves off the right edge (by 3.6 s).
- Rig: `Point Target` (inside `Tap Point`, at 150, 200) has x/y bound to pointX/pointY; `Rig`
  carries a TranslationConstraint to it whose `strength` is keyed 1 while pointing and eased to 0
  over the glide, so the tap lands on (150, 200) whatever the numbers say.

Where the art goes, measured in the web runtime, relative to the tap point (x right, y down):

| offset | fingertip while pointing | art while pointing | art over the whole visit (in frame) |
|---|---|---|---|
| (325, 0) | (+325, 0) | x +304 to +483, y -5 to +247 (bottom cut at +240) | to x +489 (the artboard's right edge) |
| (0, 105) | (0, +105) | x -21 to +158, y +100 to +352 (cut by the bottom edge) | to the bottom edge |

The art spans about x -21 to +158 and y -5 to +247 around the fingertip in any pose, and the
entry and exit cross the right and bottom edges. At the tap the art spans x -22 to +120,
y -25 to +217. The bottom edge relies on the page's fade.
