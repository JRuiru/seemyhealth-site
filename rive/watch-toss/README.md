# watch-toss

The "Keep it. Seriously." scene on the app page (the section about keeping your own smartwatch),
built with the Rive CLI. It replaces the photo in that section's 4:3 dark card.

- Linked to the Rive file `watch-toss` (Drafts project, file 2677192; see `push:` in `rive.yaml`).
  `scene.rml` carries the ids that tie each object to that file, so it is the source. Edit it, or
  edit in the Rive editor and `rive pull` it back, then `rive push`.
- Six single-frame poses (`Pose 1 Hold` … `Pose 6 Payoff`) each key every animated property, and
  the `Toss` timeline (330 frames, 5.5 s) runs Idle (pose 1) to End (pose 6): hold and bob, wind-up,
  throw, an empty beat, the boomerang return and catch, set down and two pats, then the blips fly
  to the phone and a thumbs-up comes in. End holds the payoff, which is also the reduced-motion still.
- `logo.webp` is the app icon (192 px), embedded as the `logo` image asset and drawn on the phone
  screen at 78 px, clipped to a 22% corner.
- Check: `rive . --verify` and `rive inspect . --summary`
- Build: `rive . --once` (no scripts, so an unsigned build plays on the web runtime), then copy
  `build/watch-toss.riv` to `public/media/watch-toss.riv`.

The page relies on these names: artboard and state machine `WatchToss`; view model `WatchToss` with
triggers `play` (page to file; from Idle or End it plays the Toss from the top) and `skip` (page
to file; from anywhere to End), and `joke` (file to page, at 1.70 s, when the page swaps
"We've already been through this…" for "JK."). The artboard is 800 x 600 and transparent; both lines are HTML, never text in the
file. `public/media/watch-toss-still.webp` is the End frame, shown until the file loads and for
good with reduced motion or Data Saver; render it again after changing the payoff.
