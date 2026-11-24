// paint.js : Canvas 2D painters for "Uykusuz" (flat vector look: flat fills, soft gradients, dark frames, no outlines on
// the world). Colours are painted for neutral light; each set is tinted for night / dawn with material colour.
import { rng, vgrad, mix } from '/engine/src/layer.js';

export function sky(g, w, h, kind) {
  if (kind === 'night') g.fillStyle = vgrad(g, 0, 0, h, [[0, '#0a1030'], [.5, '#1a2250'], [.8, '#2e2c5c'], [1, '#4a3462']]);
  else g.fillStyle = vgrad(g, 0, 0, h, [[0, '#26305e'], [.38, '#4f4c86'], [.62, '#a8687e'], [.8, '#ee935e'], [1, '#ffcb85']]);
  g.fillRect(0, 0, w, h);
  const R = rng(kind === 'night' ? 11 : 12);
  if (kind === 'night') {
    for (let i = 0; i < 420; i++) {
      const x = R() * w, y = R() * h * .72, r = .6 + R() * R() * 2.4;
      g.globalAlpha = .25 + R() * .7; g.fillStyle = R() < .15 ? '#ffe6c0' : '#e8ecff'; g.beginPath(); g.arc(x, y, r * w / 2400, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
  }
  // flat clouds: long ellipses, lit underside
  for (let i = 0; i < 9; i++) {
    const x = R() * w, y = h * (.25 + R() * .5), cw = w * (.12 + R() * .2), ch = h * (.012 + R() * .018);
    if (kind === 'night') { g.fillStyle = 'rgba(92,80,140,.32)'; g.beginPath(); g.ellipse(x, y, cw, ch, 0, 0, 7); g.fill(); }
    else {
      g.fillStyle = 'rgba(122,78,132,.55)'; g.beginPath(); g.ellipse(x, y, cw, ch, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,190,130,.75)'; g.beginPath(); g.ellipse(x, y + ch * .45, cw * .92, ch * .5, 0, 0, Math.PI); g.fill();
    }
  }
}

// soft round glow (additive cards): white core falling off
export function glow(g, w, h, col = '255,236,200', core = .18) {
  const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  gr.addColorStop(0, `rgba(${col},1)`); gr.addColorStop(core, `rgba(${col},.55)`); gr.addColorStop(.5, `rgba(${col},.14)`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}
export function disc(g, w, h, col, edge = '#00000000') {
  g.fillStyle = col; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 2, 0, 7); g.fill();
}
// god rays: thin wedges from the centre, fading out
export function rays(g, w, h, n = 22) {
  const R = rng(5), cx = w / 2, cy = h / 2;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + R() * .12, da = .012 + R() * .025, L = w * (.38 + R() * .12);
    const gr = g.createRadialGradient(cx, cy, w * .03, cx, cy, L);
    gr.addColorStop(0, 'rgba(255,240,220,.9)'); gr.addColorStop(.35, 'rgba(255,232,210,.35)'); gr.addColorStop(1, 'rgba(255,230,210,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, L, a - da, a + da); g.closePath(); g.fill();
  }
}

// a band of building silhouettes with a few lit windows
export function skyline(g, w, h, { seed = 1, col = '#1a1736', lit = .05, minH = .25, maxH = .9, win = '#f3c07e', bw = [.03, .08] } = {}) {
  const R = rng(seed); let x = -w * .01;
  while (x < w) {
    const bwid = w * (bw[0] + R() * (bw[1] - bw[0])), bh = h * (minH + R() * (maxH - minH));
    g.fillStyle = col; g.fillRect(x, h - bh, bwid + 1, bh);
    if (R() < .3) g.fillRect(x + bwid * .3, h - bh - h * .04, bwid * .12, h * .04);   // roof box
    if (R() < .15) { g.fillRect(x + bwid * .48, h - bh - h * .12, w * .0015, h * .12); }  // antenna
    const cs = Math.max(2, Math.floor(bwid / (w * .008))), rs = Math.floor(bh / (h * .05));
    for (let r = 1; r < rs; r++) for (let c = 0; c < cs; c++) if (R() < lit) {
      g.fillStyle = win; g.globalAlpha = .55 + R() * .45;
      g.fillRect(x + (c + .3) * bwid / cs, h - bh + r * h * .05, bwid / cs * .45, h * .022);
    }
    g.globalAlpha = 1; x += bwid + w * .002 * R();
  }
}

// OUR building's facade. Window holes are painted dark; the lights are separate quads in front.
// geometry (metres): width W, height H, columns X[], floors Y[] (window centres), window ww x wh
export const FAC = { W: 16, H: 25, X: [-6, -3, 0, 3, 6], Y: [5.9, 9.1, 12.3, 15.5, 18.7, 21.9], ww: 1.5, wh: 1.9 };
export function facade(g, w, h) {
  const s = w / FAC.W, X = x => (x + FAC.W / 2) * s, Y = y => h - y * s;
  g.fillStyle = vgrad(g, 0, 0, h, [[0, '#575068'], [.6, '#4f4860'], [1, '#433d54']]); g.fillRect(0, 0, w, h);
  // vertical pilasters, slightly lighter
  for (const x of [-7.6, -1.5, 1.5, 7.6]) { g.fillStyle = 'rgba(255,255,255,.035)'; g.fillRect(X(x) - .25 * s, 0, .5 * s, h); }
  // floor ledges
  for (let fl = 0; fl < 7; fl++) {
    const y = 4.3 + fl * 3.2;
    g.fillStyle = '#2f2441'; g.fillRect(0, Y(y), w, .32 * s);
    g.fillStyle = 'rgba(255,222,200,.10)'; g.fillRect(0, Y(y), w, .06 * s);
  }
  // roof parapet + water tank
  g.fillStyle = '#2b2140'; g.fillRect(0, 0, w, .7 * s);
  // windows
  for (const y of FAC.Y) for (const x of FAC.X) {
    const x0 = X(x - FAC.ww / 2), y0 = Y(y + FAC.wh / 2), ww = FAC.ww * s, wh = FAC.wh * s;
    g.fillStyle = '#1a1323'; g.fillRect(x0 - .14 * s, y0 - .14 * s, ww + .28 * s, wh + .28 * s);       // frame
    g.fillStyle = vgrad(g, 0, y0, y0 + wh, [[0, '#2c2440'], [1, '#1f1930']]); g.fillRect(x0, y0, ww, wh); // glass, dark
    g.fillStyle = '#1a1323'; g.fillRect(x0 + ww / 2 - .05 * s, y0, .1 * s, wh); g.fillRect(x0, y0 + wh * .38, ww, .08 * s);
    g.fillStyle = '#3a2d4d'; g.fillRect(x0 - .22 * s, y0 + wh + .1 * s, ww + .44 * s, .16 * s);          // sill
  }
  // balconies (railing) on two floors, like the reference's facades
  for (const [x, y] of [[-3, 9.1], [3, 12.3], [0, 18.7]]) {
    const x0 = X(x - 1.2), y0 = Y(y - .55), bw = 2.4 * s;
    g.fillStyle = '#271d36'; g.fillRect(x0 - .1 * s, y0, bw + .2 * s, .18 * s);
    g.fillRect(x0 - .1 * s, y0 - 1.05 * s, bw + .2 * s, .09 * s);
    for (let i = 0; i <= 12; i++) g.fillRect(x0 + i * bw / 12 - .03 * s, y0 - 1.05 * s, .06 * s, 1.05 * s);
  }
  // ground floor: a bakery with an awning and a door
  g.fillStyle = '#2a2038'; g.fillRect(0, Y(3.9), w, 3.9 * s);
  g.fillStyle = '#c99a6a'; g.fillRect(X(-6.8), Y(3.3), 5.2 * s, 2.3 * s);                       // shop window (warm, dim)
  g.fillStyle = 'rgba(40,24,30,.55)'; g.fillRect(X(-6.8), Y(3.3), 5.2 * s, 2.3 * s);
  g.fillStyle = '#1b1424'; for (const x of [-6.8, -5.07, -3.33, -1.6]) g.fillRect(X(x) - .05 * s, Y(3.3), .1 * s, 2.3 * s);
  const aw = (x0, x1, y) => { const n = 9, sw = (x1 - x0) / n; for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? '#e9dcc4' : '#2f8f80'; g.beginPath(); g.moveTo(X(x0 + i * sw), Y(y)); g.lineTo(X(x0 + (i + 1) * sw), Y(y)); g.lineTo(X(x0 + (i + 1) * sw), Y(y - .6)); g.quadraticCurveTo(X(x0 + (i + .5) * sw), Y(y - .85), X(x0 + i * sw), Y(y - .6)); g.fill(); } };
  aw(-7.2, -1.2, 3.85);
  g.fillStyle = '#1b1424'; g.fillRect(X(1.2), Y(2.9), 1.6 * s, 2.9 * s); g.fillStyle = '#3b2c4c'; g.fillRect(X(1.32), Y(2.78), 1.36 * s, 2.78 * s);
  g.fillStyle = '#c9a07a'; g.fillRect(X(1.5), Y(2.5), .5 * s, .7 * s); g.fillRect(X(2.1), Y(2.5), .5 * s, .7 * s);
  g.fillStyle = '#e9dcc4'; g.font = `700 ${.55 * s}px Bahnschrift`; g.textAlign = 'center'; g.fillText('FIRIN', X(-4.2), Y(4.15));
}

// the light behind a lit window: warm gradient, a curtain on one side, a hint of a lamp
export function windowLight(g, w, h, seed = 1) {
  const R = rng(seed);
  g.fillStyle = vgrad(g, 0, 0, h, [[0, '#ffd99a'], [.6, '#f6b56c'], [1, '#e89a58']]); g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,240,215,.55)';
  const side = R() < .5; g.beginPath();
  if (side) { g.moveTo(0, 0); g.lineTo(w * .32, 0); g.quadraticCurveTo(w * .18, h * .5, w * .26, h); g.lineTo(0, h); }
  else { g.moveTo(w, 0); g.lineTo(w * .68, 0); g.quadraticCurveTo(w * .82, h * .5, w * .74, h); g.lineTo(w, h); }
  g.fill();
  g.fillStyle = 'rgba(120,60,40,.35)'; g.fillRect(w * (side ? .55 : .2), h * .62, w * .25, h * .38);
  // frame cross (same as the facade's)
  g.fillStyle = '#1a1323'; g.fillRect(w / 2 - w * .033, 0, w * .066, h); g.fillRect(0, h * .38, w, h * .042);
}

// sidewalk + road seen from above (a ground plane)
export function street(g, w, h) {
  g.fillStyle = '#2b2234'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a2f45'; g.fillRect(0, 0, w, h * .45);
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3;
  for (let x = 0; x < w; x += w / 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h * .45); g.stroke(); }
  g.fillStyle = '#5a4a62'; g.fillRect(0, h * .45, w, h * .015);
  g.fillStyle = 'rgba(240,220,190,.25)'; for (let x = 0; x < w; x += w / 14) g.fillRect(x, h * .75, w / 30, h * .01);
}
// lamp post (near foreground) and a tree silhouette
export function lampPost(g, w, h) {
  const s = w / 2;
  g.fillStyle = '#100c18';
  g.fillRect(w * .45, h * .08, w * .1, h * .92);
  g.beginPath(); g.moveTo(w * .5, h * .1); g.quadraticCurveTo(w * .52, h * .02, w * .85, h * .03); g.lineTo(w * .85, h * .05); g.quadraticCurveTo(w * .56, h * .05, w * .55, h * .12); g.fill();
  g.fillStyle = '#1b1526'; g.fillRect(w * .72, h * .03, w * .26, h * .022);
  g.fillStyle = '#ffe2b0'; g.fillRect(w * .75, h * .052, w * .2, h * .008);
}
export function tree(g, w, h, seed = 3, col = '#120d1b') {
  const R = rng(seed);
  g.fillStyle = col;
  g.fillRect(w * .47, h * .45, w * .06, h * .55);
  for (let i = 0; i < 26; i++) {
    const a = R() * Math.PI * 2, rr = R() * .28;
    g.beginPath(); g.ellipse(w * (.5 + Math.cos(a) * rr), h * (.32 + Math.sin(a) * rr * .8), w * (.12 + R() * .1), h * (.09 + R() * .07), R() * 3, 0, 7); g.fill();
  }
  g.fillStyle = 'rgba(255,224,196,.075)';                       // leaves catching the light on the upper right
  for (let i = 0; i < 12; i++) { const a = -1.3 + R() * 1.6, rr = .16 + R() * .16; g.beginPath(); g.ellipse(w * (.5 + Math.cos(a) * rr), h * (.32 + Math.sin(a) * rr * .8), w * (.05 + R() * .05), h * (.03 + R() * .03), R() * 3, 0, 7); g.fill(); }
}
