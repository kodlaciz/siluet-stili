---
name: siluet-stili
description: Make a 16:9 "What If" film in the silhouette stickman style (black stickmen with a warm rim light, flat vector sets, strong depth of field, letterbox, a glowing title card) with three.js + Canvas 2D and frame-exact capture. Use when the user asks for a silhouette / stickman What-If video, a hook in this style, or a new story for the siluet-stili engine.
---

# siluet-stili

Flat painted cards stand in a real 3D scene (2.5D). Canvas 2D paints every card and every character; three.js places them, so a real camera gives real parallax and a real depth for the lens blur. Puppeteer calls `window.render(t)` for every frame and pipes PNGs into ffmpeg. No Remotion, no realtime clock.

## Files
- `engine/src/main.js`: loads `stories/<name>/story.js`, renders frame t, draws the story's 2D overlay, then the letterbox.
- `engine/src/bars.js`: the letterbox that closes in. `tightAt(t, spans, fps)` gives `look.tight` (0 = bars at 62 px, 1 = bars at 128 px, 4 frames to close, 5 to open). `barCues(spans)` gives the sound cues. `tightColor(hex, k)` grades a colour of the 2D overlay the same way the picture is graded.
- `engine/src/post.js`: colour pass → depth pass (alpha > .5) → lens blur (scatter-as-gather by depth) → bloom → grade (sat, contrast, lift, tint, vignette, the cold grade of the tight-bar moments, flash, fade, grain).
- `engine/src/layer.js`: `card(parent, w, h, draw, opts)`, `quad`, `paintTex`, easing and colour helpers.
- `engine/src/stick.js`: `Stick`: black head on a thin neck, stick legs with shoes, a hoodie with outline (narrow body, sleeves that end in a cuff and a mitten hand, the hood hanging behind the neck, drawstrings), hats (beanie, cap, toque), an apron, a rim light (the silhouette repeated behind itself toward the light), white face marks (smile, grin, happy, smug, tired, yawn, surprised, o). `walk(phase)`. `joints(pose)`, `armTo(pose, target)` (the arm angles that put the hand on a point) and `mouthOf(J, look)` are for placing hands.
- `engine/src/camera.js`: `CamPath` keys: hold with `push` (fov % per second, negative = pull) and `drift`, `glide` / `cut` between keys, `kick` for impacts.
- `engine/audio/mix.py`: places the voice lines, synthesizes the score and sound effects with numpy, ducks the music, loudness -15 LUFS / -1.5 dBTP.
- `stories/uykusuz/`: the example: story.js (sets, shots, acting), sokak.js (the street set: buildings with real window holes, rooms and neighbours behind the glass, bakery, street furniture), props.js (what the characters hold, and the poses that hold it), paint.js and room.js (painters), SCRIPT.md, voice/.

## Make a video
```bash
cd engine
node render.mjs <story> --stills=2,8,17,26,33 --scale=0.5   # contact sheet first, always
node render.mjs <story> --cues=1                            # writes audio/cues.json (sound cues + voice line times)
python audio/mix.py ../stories/<story>                      # voice + score + sfx -> audio/mix.wav
node render.mjs <story> --name=<story>_v1                   # 1920x1080, 24 fps, ~3 min for 40 s
```

## The style in numbers (measured on the reference hooks, `analiz/gorsel.md`)
- Letterbox on every frame: 62 px top and bottom at rest, 128 px while the hero's ability is at work (`look.tight`).
  - Closing takes 4 frames (2–10 measured, median 4–6), opening 5 (3–6 measured), both eased. The picture is not zoomed: the bars slide over it.
  - While the bars are closed the grade turns cold (no warm colour left, a quarter purple, a third blue, about 10 % darker) and a low swell plays on the close.
  - A hook spends 0–22 % of its length in tight bars; one hold lasts 0.6–34 s. Close on a cut, or inside a shot on the word that matters.
- About a third of the frame is sharp (28–38 % of tiles); everything else sits in the lens blur.
- Strong vignette: corners at ~30 % of the centre's brightness.
- Lifted blacks: the darkest 5 % sits at luma 0.04–0.06. Never pure black inside the picture.
- Calm colour: median chroma 7–12, the brightest colours ~17–30. Warm lights on cool / mauve sets.
- Camera: still 23–45 % of the time, slow pushes 29–54 %, pulls 15–25 %; a push is ~1.2 %/s.
- A cut or a transition every 2–3 s in the hook (12–20 in 40–50 s).
- Voice: ~2 words per second and a third of the hook without words (music, sound, picture).

## Rules learned the hard way
- **Transparent cards draw by `renderOrder` first, depth second.** A character with the default order 0 is painted BEFORE the wall and disappears behind it. Give every card an order and give characters one above the furniture they stand in front of.
- **Tint sets, not people.** Night / dawn = material colour on the set's cards (`tintGroup`). Characters get their own, lighter tint, or the rim light dies.
- **Purple creeps in.** A violet night tint on violet walls made 59 % of the frame purple (reference max 36 %). Use a greyer night tint and put warm light pools on the walls.
- **Check every camera against the set's edges.** A low wide shot saw past the end of the ground card; a sun placed "behind the city" was hidden by the skyline. Contact sheet first.
- **The grid card needs room for its labels.** Keep counters and captions outside the figure rows.
- **The numbers are not the whole picture.** v5 had every measure inside the reference's range, yet next to the reference its street was a bare tall block. Always put a still of your copy next to a reference still of the same kind of shot. What fixed it (v6): an eye-level frontal street, a low middle building with a band of sky above it, people behind lit windows, a warm shop, layered street furniture. A second pair of eyes (a reviewer agent comparing stills) found the rest: facades too light, light not spilling onto the wall, no focal window.
- **Windows as holes.** Paint the panes nearly transparent (alpha < .5) so the depth pass sees through them; put the lit room card about 1.2 m behind the wall and the people about 0.7 m behind it. The camera gets parallax and the lens blur gets the right depth.
- **Foreground props near the lens are placed from the camera** (a fixed offset in camera space), not in world space, or a 4 m change of camera turns a corner leaf into a third of the frame.
- **The prop decides where the hand goes.** Posing an arm by angles put the mug on the forehead (v6). Say where the thing is (the mug's rim on the mouth, the guitar on the lap, the book in front of the chest) and solve the arm with `armTo`. `props.js` has `mugPose`, `readPose`, `guitarPose`, `carryPose`; each returns the pose and the held thing.
- **A sip has a shape.** Up in half a second, held on the lips for half a second while the mug tips, down in half a second; the eyes close. A short bump of the arm reads as a twitch.
- **The seat goes under the hip.** A chair is anchored to its sitter: `CHAIR.seat` is the height of a sitting Stick's thighs and `CHAIR.hip` is where the hip belongs on the card. Put the chair a few centimetres behind the sitter, not 30: in an oblique shot a chair 30 cm back slides out from under him.
- **People behind glass shift toward the camera.** A figure 0.75 m inside a window, seen from the side, appears shifted by `offset × 0.75 / distance`. Place each head in a pane, clear of the window bars, for the shot that shows it.
- **Extras are characters too.** A painted bust in a window reads as a blob next to a real Stick. Make every person a Stick (a little larger than life if they are far away) and give each one a small thing to do.
- **Focus follows the subject when the camera dives.** Compute the focus from the camera to the hero every frame on a glide, and shrink the range with it; a fixed focus leaves him soft exactly when he fills the frame.
- **Texture resolution follows the closest shot.** A Stick's `px` is texture pixels per head: for a close-up where the head is 400 px on screen, 150 is soft.
- **Tight bars are a signal, not decoration.** The reference closes its bars while the ability is working; in its hooks the witness, the number and the title stay open. In Uykusuz that is "Sen hariç." and the close shots of his night.
- **Everything near the edge must survive the tight bars.** They take 66 px more from the top and the bottom. Let the HUD ride down with the bar (`dy = (BARS.tight - BARS.rest) * look.tight`) and check a still of every tight shot.
- **The overlay is graded too.** The 2D overlay is drawn after the post pass, so a warm HUD stays warm over a cold picture. Pass its colours through `tightColor(hex, look.tight)`.
- **Measure small things at full size.** The first measurer read the bars on 270-row frames and reported one median: "60 px on every frame". At 1080 rows, frame by frame, the bars are 62 px and close to 128 px.
- **Fit a grade on the reference, then check it on your own frames.** The cold grade fitted on reference pairs made our tight frames 70 % blue (reference 29–37 %), because our night is bluer than theirs. It was trimmed until our tight frames had the reference's colour families.
- **A pipe hides a failed step.** `python mix.py ... | tail -1 && node render.mjs` rendered v9 with the old sound: the mix had failed and `tail` returned success. Check the file's time, or do not pipe a step whose failure matters.
- Fonts: the system's `Segoe UI Black` (titles) and `Bahnschrift` (labels) have the Turkish letters; Arial Rounded does not. Both are Windows fonts: on macOS or Linux pick an installed font with ğ, ş, ı, İ and set it in the story.

## Setup
`cd engine && npm install`, `pip install -r requirements.txt` (numpy), ffmpeg on the PATH, Google Chrome. `engine/chrome.mjs` looks for Chrome in the usual places; set `CHROME_PATH` for any other browser. The finished sample is `ornek/uykusuz.mp4`; the measured reports and raw numbers are in `analiz/`.
