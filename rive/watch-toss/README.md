# watch-toss

The "Keep it. Seriously." scene on the app page (the section about keeping your own smartwatch),
built with the Rive CLI. It replaces the photo in that section's 4:3 dark card.

- Not linked to a Rive file yet (no `push:` in `rive.yaml`). `scene.rml` is the source.
- Six single-frame poses (`Pose 1 Hold` … `Pose 6 Payoff`) each key every animated property, and
  the `Toss` timeline (330 frames, 5.5 s) runs Idle (pose 1) to End (pose 6): hold and bob, wind-up,
  throw, an empty beat, the boomerang return and catch, set down and two pats, then the blips fly
  to the phone and a thumbs-up comes in. End holds the payoff, which is also the reduced-motion still.
- Check: `rive . --verify` and `rive inspect . --summary`
- Build: `rive . --once` (no scripts, so an unsigned build plays on the web runtime), then copy
  `build/watch-toss.riv` to `public/media/watch-toss.riv`.

The page relies on these names: artboard and state machine `WatchToss`; view model `WatchToss` with
triggers `play` (page to file; from Idle or End it plays the Toss from the top) and `skip` (page
to file; from anywhere to End), and `joke` (file to page, at 1.70 s, when "Just kidding."
appears). The artboard is 800 x 600 and transparent; "Just kidding." is HTML, never text in the
file.
