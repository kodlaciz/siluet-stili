// bars.js : the letterbox that closes in.
// Measured on the reference, frame by frame at full height:
//   * at rest the bars are 62 px (picture 1920 x 956, about 2:1)
//   * for the moments the hero's ability is at work they close to 128 px (picture 1920 x 824, about 2.35:1)
//   * closing takes 4 frames (2-10), opening takes 5; both follow a smoothstep
//   * the picture is not zoomed or moved: the bars slide over it
//   * in the same frames the grade turns cold (post.js, look.tight) and a low swell plays (mix.py, cue 'dar')
// A film spends 1-21 % of its length in tight bars; one hold lasts 0.6-34 s (median 3 s).
export const BARS = { rest: 62, tight: 128, closeFrames: 4, openFrames: 5 };
// The cold grade of the tight-bar moments: tight_rgb = M * rgb + o on finished display values (0..1). Fitted to 8 pairs of
// reference frames of the same scene, bars open against bars closed (12,000 blocks): warm colours go grey-lilac, cool
// ones a little bluer, the frame gets about 10 % darker. Then trimmed a little (red x 1.06, green x .99, chroma x .95, offset x .7)
// until our own tight frames had the colour families of the reference's tight frames (a quarter purple, a third blue,
// no warm, silhouettes still black). post.js builds its shader from these numbers.
export const TIGHT_GRADE = { M: [[.508, .367, .061], [.158, .679, .105], [.163, .304, .537]], o: [-.016, -.012, .023] };

const smooth = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);

// spans: [[t0, t1], ...] or [[t0, t1, closeFrames, openFrames], ...], times in seconds.
//   t0 = the last frame at rest (put it on a cut, or on the beat inside a shot); the bars are closed closeFrames later
//   t1 = the last closed frame; the bars are back at rest openFrames later
// Returns 0 (rest) .. 1 (tight). Counted in whole frames, so every render gives the same bars.
export function tightAt(t, spans, fps = 24) {
  const n = Math.round(t * fps);
  let k = 0;
  for (const [t0, t1, cf = BARS.closeFrames, of = BARS.openFrames] of spans) {
    const a = Math.round(t0 * fps), b = Math.round(t1 * fps);
    if (n <= a || n >= b + of) continue;
    k = Math.max(k, n <= b ? smooth((n - a) / cf) : 1 - smooth((n - b) / of));
  }
  return k;
}

// bar height in px (at 1080 high) for a look: look.tight slides it from look.bars to look.barsTight
export const barPx = look => { const r = look.bars ?? BARS.rest; return r + ((look.barsTight ?? BARS.tight) - r) * (look.tight ?? 0); };

// the same grade for a colour painted on the 2D overlay (HUD, captions): '#rrggbb' in, '#rrggbb' out, k = look.tight
export function tightColor(hex, k = 1) {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255), { M, o } = TIGHT_GRADE;
  return '#' + c.map((v, i) => { const g = Math.max(0, M[i][0] * c[0] + M[i][1] * c[1] + M[i][2] * c[2] + o[i]);
    return Math.round(255 * Math.min(1, v + (g - v) * k)).toString(16).padStart(2, '0'); }).join('');
}

// sound cues for a list of spans: a low swell where the bars close, a breath of air where they open (mix.py)
export const barCues = spans => spans.flatMap(([t0, t1]) => [{ t: t0, s: 'dar' }, { t: t1, s: 'ac' }]);
