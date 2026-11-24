// sokak.js : the street (exterior) set of "Uykusuz", rebuilt for v6.
// The side-by-side board showed the reference's exteriors are richer than v5's single tall block. What the reference
// street has (ref/kolaj/r01_hook_1.jpg) and this set copies as a grammar, not as a picture:
//   * a frontal, eye-level view: buildings side by side, a LOW one in the middle, so a BAND OF SKY shows above it
//   * people behind lit windows (the street is lived in), a warm shop on the ground floor of the middle building
//   * street furniture in layers: hedge, bench, lamp post with a pool of light, a tree, the road, a parked car
// Windows are real holes: the facade card has (almost) transparent panes; rooms, lights and people stand behind it at
// their own depth, so the camera gets parallax and the lens blur reads the right depth through the glass.
// v7: every person on the street is a real Stick (neighbours behind the glass, the baker, the passer-by), each with a
// small thing to do; what they hold and how they hold it lives in props.js.
import * as THREE from 'three';
import { card, rng, vgrad, ramp, smoother, lerp } from '/engine/src/layer.js';
import { Stick, walk, joints, armTo } from '/engine/src/stick.js';
import * as P from './paint.js';
import * as Rm from './room.js';
import { mugPose, readPose, carryPose } from './props.js';

export const WW = 1.5, WH = 1.7;                                   // window hole (m)
const FLOOR0 = 4.4, FH = 3.2;                                      // first-floor slab, storey height
export const BLD = {
  MID: { x0: -7, x1: 7, z: -12, H: 11.2, top: 3.2, X: [-4.8, -1.6, 1.6, 4.8], Y: [6.15, 9.35], col: ['#57475b', '#4b3d50'], ledge: '#2a1f36', ground: 'bakery', px: 120, win: 'six' },
  SOL: { x0: -20, x1: -7.3, z: -12.8, H: 27.4, top: 0, X: [-18, -15.1, -12.2, -9.3], Y: [6.15, 9.35, 12.55, 15.75, 18.95, 22.15, 25.35], col: ['#423444', '#3a2d3d'], ledge: '#231a2e', ground: 'terzi', px: 90, win: 'four',
    balc: [[-18, 12.55], [-12.2, 18.95], [-15.1, 15.75]] },
  SAG: { x0: 7.3, x1: 20, z: -12.5, H: 21, top: 0, X: [9.3, 12.2, 15.1, 18], Y: [6.15, 9.35, 12.55, 15.75, 18.95], col: ['#3b3749', '#332f41'], ledge: '#201b2c', ground: 'bufe', px: 90, win: 'two',
    balc: [[12.2, 12.55], [18, 6.15], [9.3, 15.75]] },
};
export const DOOR = { x0: .85, x1: 2.35, y0: 7.65, y1: 9.95 };     // our balcony door (MID, top floor)
const ME_FLOOR = 7.6, ME_SIT = { x: 1.2, z: -12.85 }, ME_BALC = { x: 1.9, z: -11.45 };

// ------------------------------------------------------------------ painters
function glass(g, x0, y0, W_, H_, v = .5) {      // alpha stays far below .5: the depth pass looks through it. v varies the glare
  g.fillStyle = 'rgba(110,125,190,.10)'; g.fillRect(x0, y0, W_, H_);
  g.save(); g.beginPath(); g.rect(x0, y0, W_, H_); g.clip();
  const o = (v - .5) * .5, wd = .18 + v * .14;
  g.fillStyle = `rgba(255,255,255,${.035 + v * .04})`; g.beginPath(); g.moveTo(x0 + W_ * (o + .02), y0 + H_); g.lineTo(x0 + W_ * (o + .02 + wd), y0 + H_); g.lineTo(x0 + W_ * (o + .62 + wd), y0); g.lineTo(x0 + W_ * (o + .62), y0); g.fill();
  g.restore();
}
function hole(g, X, Y, s, cx, cy, type = 'four', v = .5) {
  const x0 = X(cx - WW / 2), y0 = Y(cy + WH / 2), W_ = WW * s, H_ = WH * s, f = .12 * s;
  g.fillStyle = '#1a1323'; g.fillRect(x0 - f, y0 - f, W_ + 2 * f, H_ + 2 * f);
  if (type === 'two') { g.fillStyle = '#2a2034'; g.fillRect(x0 - f * 1.6, y0 - f * 2.2, W_ + f * 3.2, f * 1.2); }      // a lintel
  g.clearRect(x0, y0, W_, H_); glass(g, x0, y0, W_, H_, v);
  g.fillStyle = '#1a1323';
  if (type === 'four') { g.fillRect(x0 + W_ / 2 - .04 * s, y0, .08 * s, H_); g.fillRect(x0, y0 + H_ * .34, W_, .065 * s); }
  else if (type === 'two') { g.fillRect(x0 + W_ / 2 - .04 * s, y0 + H_ * .2, .08 * s, H_ * .8); g.fillRect(x0, y0 + H_ * .2, W_, .065 * s); }
  else { for (const k of [1 / 3, 2 / 3]) g.fillRect(x0 + W_ * k - .03 * s, y0, .06 * s, H_); g.fillRect(x0, y0 + H_ * .5, W_, .06 * s); }
  g.fillStyle = '#2e2440'; g.fillRect(x0 - .2 * s, y0 + H_ + f * .5, W_ + .4 * s, .15 * s);
  g.fillStyle = 'rgba(255,225,200,.10)'; g.fillRect(x0 - .2 * s, y0 + H_ + f * .5, W_ + .4 * s, .03 * s);
}
function railFlat(g, X, Y, s, cx, cy) {          // a French balcony across the lower part of a window
  const x0 = X(cx - 1.0), y0 = Y(cy - WH / 2 + .7), y1 = Y(cy - WH / 2 - .3), w = 2.0 * s;
  g.fillStyle = '#1b1427'; g.fillRect(x0, y0, w, .07 * s); g.fillRect(x0, y1, w, .16 * s);
  for (let i = 0; i <= 12; i++) g.fillRect(x0 + i * w / 12 - .022 * s, y0, .045 * s, y1 - y0);
}
function shutter(g, x, y, w, h, s) {
  g.fillStyle = '#3e3550'; g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(0,0,0,.28)'; for (let k = 0; k < h; k += .14 * s) g.fillRect(x, y + k, w, .04 * s);
  g.fillStyle = 'rgba(255,230,210,.06)'; for (let k = .07 * s; k < h; k += .14 * s) g.fillRect(x, y + k, w, .02 * s);
  g.fillStyle = '#231b2e'; g.fillRect(x, y + h - .12 * s, w, .12 * s);
}
function sign(g, x, y, w, h, txt, s, col = '#cdbfa6') {
  g.fillStyle = '#271e31'; g.fillRect(x, y, w, h);
  g.fillStyle = col; g.font = `800 ${h * .62}px Bahnschrift`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, x + w / 2, y + h * .54);
}
function bakeryFront(g, X, Y, s) {
  const fr = '#1b1424';
  g.fillStyle = fr; g.fillRect(X(-6.45), Y(3.15), 5.1 * s, 2.6 * s);                                   // shop window, 4 panes
  g.clearRect(X(-6.3), Y(3.0), 4.8 * s, 2.3 * s); glass(g, X(-6.3), Y(3.0), 4.8 * s, 2.3 * s);
  g.fillStyle = fr; for (const x of [-5.1, -3.9, -2.7]) g.fillRect(X(x) - .05 * s, Y(3.0), .1 * s, 2.3 * s);
  g.fillStyle = fr; g.fillRect(X(-1.1), Y(2.85), 1.5 * s, 2.85 * s);                                    // glass door
  g.clearRect(X(-.97), Y(2.72), 1.24 * s, 2.67 * s); glass(g, X(-.97), Y(2.72), 1.24 * s, 2.67 * s);
  g.fillStyle = fr; g.fillRect(X(-.97), Y(1.45), 1.24 * s, .07 * s); g.fillRect(X(.08), Y(1.75), .06 * s, .5 * s);
  g.fillStyle = '#2b2136'; g.fillRect(X(-6.6), Y(.7), 5.4 * s, .7 * s);                                // plinth
  sign(g, X(-6.8), Y(4.36), 7.6 * s, .6 * s, 'F I R I N', s, '#efe0c2');
  const ax0 = -6.75, ax1 = .75, top = 3.74, bot = 3.18, n = 13, sw = (ax1 - ax0) / n;                 // striped awning
  for (let i = 0; i < n; i++) {
    g.fillStyle = i % 2 ? '#eadbc0' : '#2f7f86';
    g.beginPath(); g.moveTo(X(ax0 + i * sw), Y(top)); g.lineTo(X(ax0 + (i + 1) * sw), Y(top)); g.lineTo(X(ax0 + (i + 1) * sw), Y(bot));
    g.quadraticCurveTo(X(ax0 + (i + .5) * sw), Y(bot - .26), X(ax0 + i * sw), Y(bot)); g.fill();
  }
  g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(X(ax0), Y(top), (ax1 - ax0) * s, .12 * s);
  // the apartment entrance (our door), a canopy, the number plate
  g.fillStyle = fr; g.fillRect(X(2.6), Y(2.95), 1.7 * s, 2.95 * s); g.fillStyle = '#3b2c4c'; g.fillRect(X(2.72), Y(2.82), 1.46 * s, 2.82 * s);
  g.fillStyle = '#251c35'; g.fillRect(X(2.88), Y(2.6), 1.14 * s, 1.05 * s); g.fillStyle = '#c9a07a'; g.fillRect(X(3.95), Y(1.3), .12 * s, .05 * s);
  g.fillStyle = '#1b1424'; g.fillRect(X(2.35), Y(3.32), 2.2 * s, .14 * s);
  g.fillStyle = '#c9b48a'; g.fillRect(X(4.45), Y(2.42), .38 * s, .26 * s); g.fillStyle = '#2a2040'; g.font = `800 ${.2 * s}px Bahnschrift`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('27', X(4.64), Y(2.29));
  g.fillStyle = fr; g.fillRect(X(4.95), Y(3.05), 1.7 * s, 2.35 * s); shutter(g, X(5.05), Y(2.95), 1.5 * s, 2.25 * s, s);   // a closed shop
}
function groundShops(g, X, Y, s, S) {
  const bays = S.ground === 'terzi' ? [[S.x0 + 1, S.x0 + 6.3], [S.x0 + 8.6, S.x1 - .7]] : [[S.x0 + .7, S.x0 + 5.6], [S.x0 + 7.8, S.x1 - 1]];
  for (const [a, b] of bays) { g.fillStyle = '#1b1424'; g.fillRect(X(a) - .12 * s, Y(3.25), (b - a + .24) * s, 3.25 * s); shutter(g, X(a), Y(3.15), (b - a) * s, 3.15 * s, s); }
  const [a, b] = bays[0]; sign(g, X(a), Y(4.05), (b - a) * s, .6 * s, S.ground === 'terzi' ? 'T E R Z İ' : 'B Ü F E', s);
  const d0 = bays[0][1] + .6;                                                                     // the building's door
  g.fillStyle = '#1b1424'; g.fillRect(X(d0), Y(2.9), 1.5 * s, 2.9 * s); g.fillStyle = '#33284a'; g.fillRect(X(d0 + .12), Y(2.78), 1.26 * s, 2.78 * s);
  g.fillStyle = '#251c35'; g.fillRect(X(d0 + .25), Y(2.55), 1.0 * s, 1.0 * s);
  g.fillStyle = '#2b2136'; g.fillRect(0, Y(.35), (S.x1 - S.x0) * s, .35 * s);
  // a scribble of graffiti on one shutter
  g.strokeStyle = 'rgba(214,120,140,.45)'; g.lineWidth = .07 * s; g.lineCap = 'round'; const gx = X(bays[1][0] + .6), gy = Y(1.4);
  g.beginPath(); g.moveTo(gx, gy); g.quadraticCurveTo(gx + .3 * s, gy - .7 * s, gx + .6 * s, gy); g.quadraticCurveTo(gx + .8 * s, gy - .6 * s, gx + 1.1 * s, gy - .1 * s); g.lineTo(gx + 1.5 * s, gy - .5 * s); g.stroke();
}
function ourDoor(g, X, Y, s) {
  const { x0, x1, y0, y1 } = DOOR;
  g.fillStyle = '#1a1323'; g.fillRect(X(x0) - .13 * s, Y(y1) - .13 * s, (x1 - x0 + .26) * s, (y1 - y0 + .13) * s);
  g.clearRect(X(x0), Y(y1), (x1 - x0) * s, (y1 - y0) * s); glass(g, X(x0), Y(y1), (x1 - x0) * s, (y1 - y0) * s);
  g.fillStyle = '#1a1323'; g.fillRect(X(1.95) - .035 * s, Y(y1), .07 * s, (y1 - y0) * s); g.fillRect(X(x0), Y(9.5), (x1 - x0) * s, .06 * s);
}
function roofProps(g, X, Y, s, H) {
  g.fillStyle = '#231b30';
  g.fillRect(X(-4.6), Y(H + 1.75), 1.8 * s, 1.15 * s); g.beginPath(); g.ellipse(X(-3.7), Y(H + 1.75), .9 * s, .18 * s, 0, 0, 7); g.fill();   // water tank
  for (const x of [-4.45, -3.05]) g.fillRect(X(x), Y(H + .6), .1 * s, .6 * s);
  g.fillRect(X(3.9), Y(H + 3.0), .06 * s, 3.0 * s); for (const [y, l] of [[2.8, .9], [2.4, .7], [2.0, .5]]) g.fillRect(X(3.93 - l / 2), Y(y + H), l * s, .05 * s);   // antenna
  g.beginPath(); g.ellipse(X(6.1), Y(H + .6), .42 * s, .3 * s, -.5, 0, 7); g.fill(); g.fillRect(X(6.05), Y(H + .35), .08 * s, .35 * s);         // dish
  g.fillRect(X(-.7), Y(H + 1.15), .6 * s, 1.15 * s); g.fillRect(X(-.8), Y(H + 1.25), .8 * s, .14 * s);                                       // chimney
}
function facade(S) {
  return (g, w, h) => {
    const s = w / (S.x1 - S.x0), X = x => (x - S.x0) * s, Y = y => h - y * s, H = S.H;
    g.fillStyle = vgrad(g, 0, Y(H), Y(0), [[0, S.col[0]], [1, S.col[1]]]); g.fillRect(0, Y(H), w, H * s);
    g.fillStyle = 'rgba(0,0,0,.07)'; for (let y = .8; y < H; y += .8) g.fillRect(0, Y(y), w, .03 * s);
    g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(0, Y(H), .45 * s, H * s);
    g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(w - .14 * s, Y(H), .14 * s, H * s);
    for (let y = FLOOR0; y < H - 1; y += FH) { g.fillStyle = S.ledge; g.fillRect(0, Y(y + .1), w, .28 * s); g.fillStyle = 'rgba(255,225,200,.09)'; g.fillRect(0, Y(y + .1), w, .05 * s); }
    g.fillStyle = S.ledge; g.fillRect(0, Y(H), w, .5 * s); g.fillStyle = 'rgba(255,225,200,.12)'; g.fillRect(0, Y(H) + .5 * s, w, .05 * s);
    const RV = rng(Math.abs(S.x1) * 17 + 3);
    for (const y of S.Y) for (const x of S.X) { const v = RV(); if (S === BLD.MID && x === 1.6 && y > 8) continue; hole(g, X, Y, s, x, y, S.win, v); }
    for (const [x, y] of S.balc || []) railFlat(g, X, Y, s, x, y);
    if (S.ground === 'bakery') { bakeryFront(g, X, Y, s); ourDoor(g, X, Y, s); roofProps(g, X, Y, s, H); }
    else groundShops(g, X, Y, s, S);
  };
}
// the dark rooms behind every building (moonlit furniture, barely there)
function rooms(S) {
  return (g, w, h) => {
    const s = w / (S.x1 - S.x0), R = rng(Math.abs(S.x0) * 13 + 5);
    g.fillStyle = '#16101f'; g.fillRect(0, 0, w, h);
    for (const y of S.Y) for (const x of S.X) {
      const cx = (x - S.x0) * s, cy = h - y * s; g.fillStyle = 'rgba(80,72,120,.28)';
      if (R() < .5) g.fillRect(cx - .6 * s, cy + .15 * s, 1.0 * s, .9 * s); else { g.beginPath(); g.arc(cx + .35 * s, cy - .1 * s, .22 * s, 0, 7); g.fill(); g.fillRect(cx + .3 * s, cy + .1 * s, .1 * s, .8 * s); }
    }
  };
}
// a lit room seen through a window: card 2.8 x 3.1 m, the hole is its middle 1.5 x 1.7
export function roomLight(g, w, h, kind, seed = 1, k = 0) {
  const R = rng(seed), cx = w / 2, cy = h / 2, s = w / 2.8;
  if (kind === 'tv') {
    const gr = g.createRadialGradient(cx + .9 * s, cy, 0, cx, cy, w * .7); gr.addColorStop(0, '#b4c8ff'); gr.addColorStop(.45, '#6178c4'); gr.addColorStop(1, '#2a2f5c');
    g.fillStyle = gr; g.fillRect(0, 0, w, h); return;
  }
  g.fillStyle = vgrad(g, 0, cy - .85 * s, cy + .85 * s, [[0, '#ffcf8c'], [.55, '#f4a861'], [1, '#df8648']]); g.fillRect(0, 0, w, h);   // amber, warm at the top
  const gr = g.createRadialGradient(cx + (R() - .5) * .8 * s, cy - .35 * s, 0, cx, cy, w * .6);
  gr.addColorStop(0, 'rgba(255,226,170,.35)'); gr.addColorStop(1, 'rgba(120,60,50,.45)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(60,30,40,.25)'; g.fillRect(0, 0, w, h * .14);
  const ink = 'rgba(42,22,32,.82)';
  if (kind === 'lamp') { g.fillStyle = ink; g.fillRect(cx - .02 * s, 0, .04 * s, cy - .55 * s); g.beginPath(); g.moveTo(cx - .3 * s, cy - .3 * s); g.lineTo(cx + .3 * s, cy - .3 * s); g.lineTo(cx + .14 * s, cy - .62 * s); g.lineTo(cx - .14 * s, cy - .62 * s); g.fill(); g.fillStyle = '#fff0cf'; g.beginPath(); g.ellipse(cx, cy - .3 * s, .28 * s, .045 * s, 0, 0, 7); g.fill(); }
  if (kind === 'shelf') { g.fillStyle = ink; for (const y of [-.1, .38]) g.fillRect(cx - .72 * s, cy + y * s, 1.15 * s, .05 * s); for (let i = 0; i < 10; i++) { const bh = (.2 + R() * .14) * s; g.fillRect(cx - .66 * s + i * .11 * s, cy - .1 * s - bh, .085 * s, bh); } }
  if (kind === 'plant') { g.fillStyle = ink; g.fillRect(cx + .15 * s, cy + .52 * s, .32 * s, .32 * s); for (let i = 0; i < 8; i++) { g.save(); g.translate(cx + .31 * s, cy + .55 * s); g.rotate((i / 7 - .5) * 1.9); g.beginPath(); g.ellipse(0, -.3 * s, .07 * s, .3 * s, 0, 0, 7); g.fill(); g.restore(); } }
  if (kind === 'frame') { for (const [x, y, fw, fh, c] of [[-.5, -.5, .5, .62, '#e6845a'], [.12, -.42, .36, .3, '#3a6f86']]) { g.fillStyle = ink; g.fillRect(cx + x * s, cy + y * s, fw * s, fh * s); g.fillStyle = c; g.globalAlpha = .75; g.fillRect(cx + (x + .04) * s, cy + (y + .04) * s, (fw - .08) * s, (fh - .08) * s); g.globalAlpha = 1; }
    g.fillStyle = 'rgba(42,22,32,.55)'; g.fillRect(cx - .9 * s, cy + .55 * s, 1.8 * s, .05 * s); }
  if (kind === 'sofa') { g.fillStyle = ink; g.beginPath(); g.roundRect(cx - .8 * s, cy + .38 * s, 1.25 * s, .6 * s, .14 * s); g.fill(); g.fillStyle = 'rgba(120,60,70,.75)'; for (const x of [-.62, -.2]) { g.beginPath(); g.roundRect(cx + x * s, cy + .3 * s, .36 * s, .3 * s, .1 * s); g.fill(); }
    g.fillStyle = ink; g.fillRect(cx + .62 * s, cy - .3 * s, .03 * s, 1.2 * s); g.beginPath(); g.moveTo(cx + .47 * s, cy - .28 * s); g.lineTo(cx + .8 * s, cy - .28 * s); g.lineTo(cx + .72 * s, cy - .55 * s); g.lineTo(cx + .55 * s, cy - .55 * s); g.fill(); }
  if (kind === 'curtain' || R() < .45) {                         // a curtain: drawn from the left by k (0 open .. 1 closed)
    const open = kind === 'curtain' ? .15 + .85 * k : .22 + R() * .1, x1 = cx - .75 * s + 1.5 * s * open;
    g.fillStyle = 'rgba(250,236,214,.62)'; g.beginPath(); g.moveTo(cx - .9 * s, 0); g.lineTo(x1, 0); g.quadraticCurveTo(x1 - .1 * s, cy, x1 + .04 * s, h); g.lineTo(cx - .9 * s, h); g.fill();
    g.fillStyle = 'rgba(160,110,100,.25)'; for (let i = 1; i < 6; i++) { const xx = lerp(cx - .9 * s, x1, i / 6); g.fillRect(xx, 0, .03 * s, h); }
  }
}
export function ourRoom(g, w, h) {                // 3.4 x 3.2 m behind our balcony door (x -0.1..3.3, y 7.6..10.8)
  const s = w / 3.4, X = x => (x + .1) * s, Y = y => h - (y - 7.6) * s;
  g.fillStyle = vgrad(g, 0, 0, h, [[0, '#a86f58'], [.5, '#c98f66'], [1, '#9c6656']]); g.fillRect(0, 0, w, h);
  const gr = g.createRadialGradient(X(2.15), Y(8.8), 0, X(2.15), Y(8.8), 1.7 * s); gr.addColorStop(0, 'rgba(255,222,165,.8)'); gr.addColorStop(1, 'rgba(255,222,165,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a2036'; g.fillRect(X(.95), Y(9.85), .62 * s, .8 * s); g.fillStyle = '#e6845a'; g.fillRect(X(.99), Y(9.81), .54 * s, .72 * s);
  g.fillStyle = '#f3d29a'; g.beginPath(); g.arc(X(1.26), Y(9.52), .13 * s, 0, 7); g.fill();
  g.fillStyle = '#2f2346'; g.beginPath(); g.moveTo(X(.99), Y(9.09)); g.lineTo(X(1.15), Y(9.35)); g.lineTo(X(1.3), Y(9.2)); g.lineTo(X(1.53), Y(9.45)); g.lineTo(X(1.53), Y(9.09)); g.fill();
  g.fillStyle = '#3f2a3a'; g.fillRect(X(1.75), Y(9.62), .75 * s, .05 * s);
  const R = rng(4); for (let i = 0; i < 7; i++) { g.fillStyle = Rm.BOOKC[i]; const bh = (.2 + R() * .1) * s; g.fillRect(X(1.8 + i * .095), Y(9.62) - bh, .075 * s, bh); }
  g.fillStyle = '#5a3a3c'; g.fillRect(0, Y(7.78), w, .18 * s);
}
function bakeryIn(g, w, h) {                       // 7.2 x 3.4 m behind the shop window (x -6.6..0.6)
  const s = w / 7.2, X = x => (x + 6.6) * s, Y = y => h - y * s;
  g.fillStyle = vgrad(g, 0, 0, h, [[0, '#d39a62'], [1, '#b8784e']]); g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.08)'; for (let x = 0; x < w; x += .3 * s) g.fillRect(x, Y(1.6), .02 * s, 1.6 * s); for (let y = .3; y < 1.6; y += .3) g.fillRect(0, Y(y), w, .02 * s);   // tiles
  for (const y of [1.75, 2.35, 2.95]) {
    g.fillStyle = '#6a4030'; g.fillRect(X(-6.2), Y(y), 4.9 * s, .06 * s);
    const R = rng(y * 10 | 0);
    for (let x = -6.1; x < -1.5; x += .32) {
      if (R() < .5) { g.fillStyle = '#b8682e'; g.beginPath(); g.ellipse(X(x + .14), Y(y + .1), .15 * s, .09 * s, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,230,180,.5)'; g.fillRect(X(x + .06), Y(y + .14), .16 * s, .02 * s); }
      else { g.strokeStyle = '#c47a3a'; g.lineWidth = .05 * s; g.beginPath(); g.ellipse(X(x + .14), Y(y + .12), .12 * s, .1 * s, 0, 0, 7); g.stroke(); }  // simit
    }
  }
  for (const x of [-5.2, -3.4, -1.6]) { g.fillStyle = '#2a1c22'; g.fillRect(X(x) - .01 * s, 0, .02 * s, Y(3.0)); }
}
function counter(g, w, h) {                        // 4.2 x 1.05 m, front of the bakery counter
  g.fillStyle = '#5a3a34'; g.fillRect(0, h * .1, w, h * .9); g.fillStyle = '#7a5040'; g.fillRect(0, 0, w, h * .12);
  g.fillStyle = 'rgba(255,240,220,.18)'; g.fillRect(w * .05, h * .2, w * .9, h * .38);
  const R = rng(3); for (let i = 0; i < 12; i++) { g.strokeStyle = '#c47a3a'; g.lineWidth = h * .05; g.beginPath(); g.ellipse(w * (.08 + i * .075), h * (.45 - R() * .05), w * .025, h * .06, 0, 0, 7); g.stroke(); }
}
function balcony(g, w, h) {                        // 3.2 x 1.45 m: slab edge (y 7.25-7.6) and a rail 1 m above it
  const s = w / 3.2, Y = y => h - (y - 7.25) * s;
  g.fillStyle = '#2b2138'; g.fillRect(0, Y(7.6), w, .35 * s); g.fillStyle = 'rgba(255,225,200,.12)'; g.fillRect(0, Y(7.6), w, .04 * s);
  g.fillStyle = '#16101e'; g.fillRect(0, Y(8.64), w, .08 * s); g.fillRect(0, Y(7.74), w, .05 * s);
  for (let i = 0; i <= 18; i++) g.fillRect(i * w / 18 - .022 * s, Y(8.64), .045 * s, .92 * s);
  g.fillStyle = '#b5583e'; g.fillRect(.18 * s, Y(8.0), .36 * s, .36 * s); g.fillStyle = '#3d6a52';
  for (let i = 0; i < 9; i++) { g.save(); g.translate(.36 * s, Y(8.0)); g.rotate((i / 8 - .5) * 2); g.beginPath(); g.ellipse(0, -.25 * s, .06 * s, .25 * s, 0, 0, 7); g.fill(); g.restore(); }
}
function smallDesk(g, w, h) {                      // 1.3 x .85 m, top at .78
  const s = w / 1.3, Y = y => h - y * s;
  g.fillStyle = '#7a4f45'; g.fillRect(0, Y(.8), w, .07 * s); g.fillStyle = '#4a2e2e'; g.fillRect(.08 * s, Y(.74), .08 * s, .74 * s); g.fillRect(w - .16 * s, Y(.74), .08 * s, .74 * s);
  g.fillStyle = '#e0602f'; g.fillRect(.7 * s, Y(.92), .32 * s, .06 * s); g.fillStyle = '#3a6f86'; g.fillRect(.73 * s, Y(.98), .28 * s, .06 * s);   // two books
}
export function ground(g, w, h) {                  // 160 x 36 m street seen from above; canvas top = far edge (z -13)
  const s = h / 36, Z = z => (z + 13) * s;
  g.fillStyle = '#3d3247'; g.fillRect(0, 0, w, Z(-6.7));
  g.strokeStyle = 'rgba(0,0,0,.32)'; g.lineWidth = .05 * s;
  for (let z = -12.2; z < -6.7; z += 1.1) { g.beginPath(); g.moveTo(0, Z(z)); g.lineTo(w, Z(z)); g.stroke(); }
  for (let x = 0; x < w; x += 1.1 * s) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, Z(-6.7)); g.stroke(); }
  g.fillStyle = '#6e5c74'; g.fillRect(0, Z(-6.75), w, .22 * s); g.fillStyle = 'rgba(255,226,196,.18)'; g.fillRect(0, Z(-6.75), w, .05 * s); g.fillStyle = '#1f1828'; g.fillRect(0, Z(-6.53), w, .1 * s);
  g.fillStyle = '#272031'; g.fillRect(0, Z(-6.43), w, Z(5) - Z(-6.43));
  g.fillStyle = 'rgba(240,220,190,.26)'; for (let x = 0; x < w; x += 6 * s) g.fillRect(x, Z(-.4), 3 * s, .14 * s);
  g.fillStyle = '#4a3e55'; g.fillRect(0, Z(5), w, .22 * s); g.fillStyle = '#352b3f'; g.fillRect(0, Z(5.22), w, h);
  g.fillStyle = '#2a2232'; g.beginPath(); g.ellipse(w * .5 + 3 * s, Z(-3), .5 * s, .3 * s, 0, 0, 7); g.fill();     // manhole
}
function hedge(g, w, h) {
  g.fillStyle = '#2a2034'; g.fillRect(0, h * .55, w, h * .45);
  g.fillStyle = '#20302c'; const R = rng(2); for (let i = 0; i < 26; i++) { g.beginPath(); g.ellipse(w * (i + .5) / 26, h * (.5 + R() * .1), w * .03, h * .35, 0, 0, 7); g.fill(); }
}
function bench(g, w, h) {
  g.fillStyle = '#17111f'; g.fillRect(w * .05, h * .4, w * .9, h * .1); g.fillRect(w * .05, h * .05, w * .9, h * .08); g.fillRect(w * .05, h * .2, w * .9, h * .08);
  g.fillRect(w * .1, h * .45, w * .05, h * .55); g.fillRect(w * .85, h * .45, w * .05, h * .55); g.fillRect(w * .1, 0, w * .04, h * .5); g.fillRect(w * .86, 0, w * .04, h * .5);
}
function car(g, w, h) {                           // 4.6 x 1.55 m, side view
  g.fillStyle = '#1a1424'; g.beginPath(); g.moveTo(w * .02, h * .82); g.lineTo(w * .03, h * .5); g.quadraticCurveTo(w * .1, h * .42, w * .22, h * .4);
  g.lineTo(w * .32, h * .08); g.lineTo(w * .7, h * .08); g.lineTo(w * .82, h * .4); g.quadraticCurveTo(w * .97, h * .44, w * .98, h * .58); g.lineTo(w * .98, h * .82); g.fill();
  g.fillStyle = '#3a3158'; g.beginPath(); g.moveTo(w * .35, h * .14); g.lineTo(w * .5, h * .14); g.lineTo(w * .5, h * .38); g.lineTo(w * .27, h * .38); g.fill();
  g.beginPath(); g.moveTo(w * .53, h * .14); g.lineTo(w * .67, h * .14); g.lineTo(w * .76, h * .38); g.lineTo(w * .53, h * .38); g.fill();
  g.fillStyle = 'rgba(255,255,255,.1)'; g.beginPath(); g.moveTo(w * .4, h * .14); g.lineTo(w * .45, h * .14); g.lineTo(w * .37, h * .38); g.lineTo(w * .32, h * .38); g.fill();
  g.beginPath(); g.moveTo(w * .58, h * .14); g.lineTo(w * .62, h * .14); g.lineTo(w * .68, h * .38); g.lineTo(w * .64, h * .38); g.fill();
  g.strokeStyle = 'rgba(255,226,196,.26)'; g.lineWidth = h * .018; g.lineJoin = 'round'; g.beginPath(); g.moveTo(w * .04, h * .49); g.quadraticCurveTo(w * .1, h * .42, w * .22, h * .4); g.lineTo(w * .32, h * .08); g.lineTo(w * .7, h * .08); g.lineTo(w * .82, h * .4); g.quadraticCurveTo(w * .96, h * .44, w * .975, h * .56); g.stroke();
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(w * .513, h * .4, w * .006, h * .38); g.fillRect(w * .26, h * .4, w * .006, h * .36);
  g.fillStyle = 'rgba(255,226,196,.3)'; g.fillRect(w * .46, h * .46, w * .04, h * .018); g.fillRect(w * .7, h * .46, w * .04, h * .018);
  for (const x of [.2, .78]) { g.fillStyle = '#0c0910'; g.beginPath(); g.arc(w * x, h * .82, h * .17, 0, 7); g.fill(); g.fillStyle = '#3a3148'; g.beginPath(); g.arc(w * x, h * .82, h * .085, 0, 7); g.fill(); g.fillStyle = '#16111f'; g.beginPath(); g.arc(w * x, h * .82, h * .035, 0, 7); g.fill(); }
  g.fillStyle = '#e6c27a'; g.fillRect(w * .955, h * .5, w * .02, h * .06); g.fillStyle = '#c0483e'; g.fillRect(w * .022, h * .52, w * .016, h * .07);
}
function cloud(g, w, h, seed) {
  const R = rng(seed);
  for (let i = 0; i < 7; i++) { const x = w * (.1 + R() * .8), y = h * (.4 + R() * .3), cw = w * (.12 + R() * .2), ch = h * (.12 + R() * .18);
    g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(x, y, cw, ch, 0, 0, 7); g.fill(); }
}
function catPaint(g, w, h, t) {                     // .9 x .8 m: a cat on the parapet, tail swinging, eyes catching the light
  g.clearRect(0, 0, w, h); const s = w / .9, ink = '#0b0a0e';
  g.fillStyle = ink; g.beginPath(); g.ellipse(.45 * s, h - .2 * s, .2 * s, .19 * s, 0, 0, 7); g.fill();
  g.beginPath(); g.arc(.45 * s, h - .47 * s, .12 * s, 0, 7); g.fill();
  for (const d of [-1, 1]) { g.beginPath(); g.moveTo(.45 * s + d * .11 * s, h - .5 * s); g.lineTo(.45 * s + d * .09 * s, h - .66 * s); g.lineTo(.45 * s + d * .02 * s, h - .56 * s); g.fill(); }
  const a = Math.sin(t * 1.6) * .5; g.strokeStyle = ink; g.lineWidth = .045 * s; g.lineCap = 'round';
  g.beginPath(); g.moveTo(.62 * s, h - .06 * s); g.quadraticCurveTo(.8 * s, h - .05 * s, .8 * s + Math.sin(a) * .08 * s, h - .3 * s - Math.cos(a) * .05 * s); g.stroke();
  const bl = (t % 3.1) < .12 ? .2 : 1; g.fillStyle = '#f2d36b';
  for (const d of [-1, 1]) { g.beginPath(); g.ellipse(.45 * s + d * .05 * s, h - .47 * s, .025 * s, .02 * s * bl, 0, 0, 7); g.fill(); }
}

// ------------------------------------------------------------------ build
export function build(A, W, CUES, extraFor) {
  const R = rng(21), Rc = rng(77);
  W.sk = { lights: [], ppl: {} };
  for (const [key, S] of Object.entries(BLD)) {
    const w = S.x1 - S.x0, cx = (S.x0 + S.x1) / 2, Ht = S.H + S.top;
    W.sk[key] = card(A, w, Ht, facade(S), { pos: [cx, Ht / 2, S.z], px: S.px, order: 10 });
    W.sk[key + 'r'] = card(A, w, S.H, rooms(S), { pos: [cx, S.H / 2, S.z - 1.3], px: 30, order: 6 });
  }
  // far neighbours at the frame edges
  for (const [x, z, w, hgt, seed] of [[-30, -16, 20, 19, 41], [30, -15.5, 20, 16, 43]]) {
    card(A, w, hgt, (g, cw, ch) => { g.fillStyle = '#3a3150'; g.fillRect(0, 0, cw, ch); const RR = rng(seed); for (let y = 2; y < hgt - 1; y += 3.2) for (let xx = 1; xx < w - 1; xx += 2.6) { g.fillStyle = RR() < -1 ? '#8f7458' : '#211a30'; g.fillRect(xx / w * cw, ch - y / hgt * ch - 1.6 / hgt * ch, 1.3 / w * cw, 1.5 / hgt * ch); } g.fillStyle = '#2a2038'; g.fillRect(0, 0, cw, ch * .02); },
      { pos: [x, hgt / 2, z], px: 30, order: 5 });
  }
  // window lights. Night: about half are on at 03:47 and go out one by one; by 5 s only ours is left.
  // Dawn: a few new ones come on (people getting up).
  const special = { 'SOL,-12.2,9.35': { kind: 'lamp', off: 3.85, who: 'n1' }, 'SOL,-15.1,9.35': { kind: 'tv', off: 4.45, who: 'n2' }, 'SOL,-9.3,12.55': { kind: 'curtain', off: 4.32 },
    'SOL,-15.1,12.55': { kind: 'shelf', off: 3.4 }, 'SOL,-12.2,6.15': { kind: 'plant', off: 4.7 }, 'SOL,-9.3,6.15': { kind: 'person', off: 3.62 }, 'SOL,-18,9.35': { kind: 'lamp', off: 4.05 },
    'SAG,12.2,9.35': { dawn: 'frame' }, 'SAG,15.1,6.15': { dawn: 'lamp' }, 'SOL,-12.2,12.55': { dawn: 'shelf' }, 'SAG,9.3,12.55': { dawn: 'shelf' }, 'MID,-4.8,6.15': { dawn: 'lamp' } };
  special['SOL,-9.3,6.15'].kind = 'frame';
  const late = { 'SAG,15.1,9.35': { kind: 'lamp', off: 2.62 } };          // named after v6: they roll the dice like any window, then override
  const kinds = ['lamp', 'shelf', 'plant', 'frame', 'lamp', 'sofa'];
  for (const [key, S] of Object.entries(BLD)) for (const y of S.Y) for (const x of S.X) {
    if (key === 'MID' && x === 1.6 && y > 8) continue;
    const sp = special[`${key},${x},${y}`];
    let kind, on0, off = 99, dawnOn = false;
    if (sp && sp.dawn) { kind = sp.dawn; on0 = false; dawnOn = true; }
    else if (sp) { kind = sp.kind; on0 = true; off = sp.off; }
    else { kind = kinds[Math.floor(R() * kinds.length)]; on0 = R() < .42; off = .5 + R() * 2.4; if (key === 'SOL' && y < 14 && x > -16) off = 3.1 + R() * 1.7;
      const lt = late[`${key},${x},${y}`]; if (lt) { kind = lt.kind; on0 = true; off = lt.off; } }
    const seed = Math.floor(R() * 999);
    const m = card(A, 2.8, 3.1, (g, w, h, kk = 0) => roomLight(g, w, h, kind, seed, kk), { pos: [x, y, S.z - 1.2], px: 80, order: 7 });
    m.userData.keep = true; m.material.opacity = 0;
    const sp2 = card(A, 3.6, 3.4, (g, w, h) => P.glow(g, w, h, '255,176,104', .05), { pos: [x, y - .1, S.z + .06], px: 24, add: true, order: 11, opacity: 0 }); sp2.userData.keep = true;
    const L = { m, kind, on0, off, dawnOn, seed, sp: sp2 }; W.sk.lights.push(L);
    if (kind === 'curtain') W.sk.curtain = L;
    if (on0 && off < 6 && (sp || late[`${key},${x},${y}`] || Rc() < .45)) CUES.push({ t: off, s: 'klik', g: .2 + Rc() * .16 });   // not every switch clicks: 33 at once rattled
  }
  // our room behind the balcony door: wall, desk, lamp, chair, and me
  W.sk.ourRoom = card(A, 3.4, 3.2, ourRoom, { pos: [1.6, ME_FLOOR + 1.6, -13.25], px: 200, order: 7 }); W.sk.ourRoom.userData.keep = true;
  W.sk.oDesk = card(A, 1.3, .85, smallDesk, { pos: [2.25, ME_FLOOR + .425, -12.6], px: 300, order: 9 });
  W.sk.oLamp = card(A, .42, .56, Rm.lamp, { pos: [2.12, ME_FLOOR + .8 + .28, -12.62], px: 400, order: 9 });
  W.sk.oChair = card(A, Rm.CHAIR.w, Rm.CHAIR.h, Rm.chair, { pos: [ME_SIT.x - Rm.CHAIR.hip + Rm.CHAIR.w / 2, ME_FLOOR + Rm.CHAIR.h / 2, ME_SIT.z - .03], px: 300, order: 8 });
  W.sk.oSpill = card(A, 5.2, 4.6, (g, w, h) => P.glow(g, w, h, '255,180,108', .06), { pos: [1.6, 8.7, -11.93], px: 24, add: true, order: 11 }); W.sk.oSpill.userData.keep = true;
  W.sk.oGlow = card(A, 3.2, 3.2, (g, w, h) => P.glow(g, w, h, '255,205,140', .1), { pos: [2.05, ME_FLOOR + 1.05, -12.55], px: 60, add: true, order: 9 }); W.sk.oGlow.userData.keep = true;
  W.sk.balcony = card(A, 3.2, 1.45, balcony, { pos: [1.6, 7.25 + .725, -10.95], px: 200, order: 14 });
  for (const x of [0, 3.2]) { card(A, 1.05, 1.45, (g, w, h) => { const s2 = w / 1.05; g.fillStyle = '#2b2138'; g.fillRect(0, h - .35 * s2, w, .35 * s2); g.fillStyle = '#16101e'; g.fillRect(0, h - 1.39 * s2, w, .08 * s2);
      for (let i = 0; i <= 6; i++) g.fillRect(i * w / 6 - .022 * s2, h - 1.39 * s2, .045 * s2, 1.04 * s2); }, { pos: [x, 7.25 + .725, -11.47], rot: [0, Math.PI / 2, 0], px: 200, order: 13 }); }
  W.sk.slab = card(A, 3.2, 1.05, (g, w, h) => { g.fillStyle = '#231a2e'; g.fillRect(0, 0, w, h); }, { pos: [1.6, 7.3, -11.47], rot: [Math.PI / 2, 0, 0], px: 20, order: 11 });
  W.sk.meA = new Stick(A, { order: 12, height: 1.72, hood: '#36b39b', hoodDark: '#21806f', rimDir: [1, -.3], px: 280, extra: extraFor('heldA') });
  W.sk.meA.mesh.userData.keep = true;
  // the bakery: dark at night, lit at dawn with the baker
  W.sk.bakery = card(A, 7.2, 3.4, bakeryIn, { pos: [-3.0, 1.7, -13.1], px: 110, order: 7 }); W.sk.bakery.userData.keep = true;
  W.sk.counter = card(A, 4.2, .92, counter, { pos: [-3.7, .46, -12.55], px: 120, order: 9 }); W.sk.counter.userData.keep = true;
  W.sk.pend = [-5.2, -3.4, -1.6].map(x => { const m = card(A, 1.6, 1.6, (g, w, h) => P.glow(g, w, h, '255,214,150', .12), { pos: [x, 2.95, -12.7], px: 60, add: true, order: 9, opacity: 0 }); m.userData.keep = true; return m; });
  W.sk.shopGlow = card(A, 7.5, 3.4, (g, w, h) => P.glow(g, w, h, '255,196,130', .2), { pos: [-3.0, 1.9, -11.9], px: 30, add: true, order: 16, opacity: 0 }); W.sk.shopGlow.userData.keep = true;
  W.sk.shopPool = card(A, 9, 5, (g, w, h) => P.glow(g, w, h, '255,190,125', .08), { pos: [-3.0, .03, -9.6], rot: [-Math.PI / 2, 0, 0], px: 20, add: true, order: 4, opacity: 0 }); W.sk.shopPool.userData.keep = true;
  W.sk.bulbs = card(A, 7.6, .7, (g, w, h) => { const n = 17; for (let i = 0; i <= n; i++) { const k = i / n, x = w * k, y = h * (.2 + .5 * 4 * k * (1 - k) * .6 + (i % 2) * .04);
      const gr = g.createRadialGradient(x, y, 0, x, y, h * .32); gr.addColorStop(0, 'rgba(255,236,190,1)'); gr.addColorStop(.25, 'rgba(255,200,130,.5)'); gr.addColorStop(1, 'rgba(255,200,130,0)'); g.fillStyle = gr; g.fillRect(x - h * .4, y - h * .4, h * .8, h * .8); } },
    { pos: [-3.0, 4.38, -11.85], px: 120, add: true, order: 17, opacity: 0 }); W.sk.bulbs.userData.keep = true;
  const person = (key, S, wx, wy, o, lift = .12) => {            // a figure half a metre behind a window, on a step so the head sits mid-window
    const m = new Stick(A, { order: 8, height: 1.95, rimDir: [1, -.3], px: 120, ...o }); m.mesh.userData.keep = true;      // a little larger than life: they have to read from across the street
    m.home = [wx, wy - WH / 2 - .9 + lift, S.z - .75]; W.sk[key] = m; return m; };
  W.sk.baker = new Stick(A, { order: 8, height: 1.7, hood: '#f1e9da', hoodDark: '#cfc5b3', hoodBack: false, strings: false, apron: '#3a6f86', hat: 'toque', hatColor: '#fbf6ec', rimDir: [1, -.3], px: 120, extra: extraFor('heldBk') });
  W.sk.baker.mesh.userData.keep = true;
  // night: n1 yawns and switches off, n2 watches TV, n3 has a last tea at the window, n4 is on the phone
  person('n1', BLD.SOL, -12.12, 9.35, { hood: '#c94a5a', hoodDark: '#963646', rimDir: [-1, -.3] });
  person('n2', BLD.SOL, -15.76, 9.35, { hood: '#e8c27a', hoodDark: '#b8955a', rim: '#a9c4ff' }, .5);
  W.sk.chair2 = card(A, Rm.ARMCHAIR.w, Rm.ARMCHAIR.h, Rm.armchair, { pos: [W.sk.n2.home[0] - Rm.ARMCHAIR.hip * 1.13 + Rm.ARMCHAIR.w * 1.13 / 2, W.sk.n2.home[1] + Rm.ARMCHAIR.h * 1.13 / 2, W.sk.n2.home[2] - .03], px: 160, order: 7 });
  W.sk.chair2.scale.setScalar(1.13);
  W.sk.chair2.userData.keep = true;
  person('n3', BLD.SOL, -9.17, 6.15, { hood: '#7b61c9', hoodDark: '#57439a', extra: extraFor('heldN3') });
  person('n4', BLD.SAG, 15.2, 9.35, { hood: '#8a64cf', hoodDark: '#62449c', hat: 'beanie', hatColor: '#e8c27a', rimDir: [-1, -.3], extra: extraFor('heldN4') });
  // dawn: two neighbours stretch at their windows, a third drinks her first coffee
  person('d1', BLD.MID, -4.91, 6.15, { hood: '#4f72d8', hoodDark: '#35509f' });
  person('d2', BLD.SAG, 12.11, 9.35, { hood: '#e0705a', hoodDark: '#a84b3c', rimDir: [-1, -.3] });
  person('d3', BLD.SOL, -12.1, 12.55, { hood: '#5aa66e', hoodDark: '#3c754b', extra: extraFor('heldD3') });
  // a passer-by at dawn: cap, backpack
  W.sk.walker = new Stick(A, { order: 18, height: 1.86, hood: '#e0602f', hoodDark: '#a8452a', hat: 'cap', hatColor: '#f2c34a', rimDir: [1, -.3], px: 130, extra: extraFor('heldWk') }); W.sk.walker.mesh.userData.keep = true;
  W.sk.branch = card(A, 1.7, 1.05, (g, w, h) => { const RR = rng(19); g.fillStyle = '#0e0a14'; g.lineCap = 'round';
      g.strokeStyle = '#0e0a14'; g.lineWidth = h * .05; g.beginPath(); g.moveTo(w, h * .05); g.quadraticCurveTo(w * .6, h * .2, w * .15, h * .55); g.stroke();
      for (let i = 0; i < 46; i++) { const k = RR(), x = w * (1 - k * .85), y = h * (.05 + k * .5) + (RR() - .3) * h * .35; g.save(); g.translate(x, y); g.rotate(RR() * 6); g.beginPath(); g.ellipse(0, 0, w * .035, h * .1, 0, 0, 7); g.fill(); g.restore(); } },
    { px: 200, order: 25 });
  // the cat on the parapet
  W.sk.cat = card(A, .9, .8, null, { pos: [5.3, BLD.MID.H + .4, -11.9], px: 220, order: 12 });
  // street furniture
  W.sk.ground = card(A, 160, 36, ground, { pos: [0, -.005, 5], rot: [-Math.PI / 2, 0, 0], px: 40, order: 3 });
  W.sk.hedge = card(A, 5.0, .8, hedge, { pos: [-3.9, .4, -11.45], px: 100, order: 15 });
  W.sk.bench = card(A, 1.9, .95, bench, { pos: [5.7, .475, -10.9], px: 120, order: 15 });
  W.sk.bin = card(A, .6, .95, (g, w, h) => { g.fillStyle = '#17111f'; g.fillRect(w * .1, h * .12, w * .8, h * .88); g.fillRect(0, h * .05, w, h * .1); }, { pos: [-6.6, .475, -10.9], px: 120, order: 15 });
  W.sk.lampP = card(A, 2.4, 7.6, P.lampPost, { pos: [-8.4, 3.8, -7.4], px: 90, order: 20 });
  W.sk.lampG = card(A, 6, 6, (g, w, h) => P.glow(g, w, h, '255,200,140', .12), { pos: [-7.3, 7.35, -7.3], px: 30, add: true, order: 21 }); W.sk.lampG.userData.keep = true;
  W.sk.pool = card(A, 9, 6, (g, w, h) => P.glow(g, w, h, '255,190,130', .05), { pos: [-7.3, .02, -8.6], rot: [-Math.PI / 2, 0, 0], px: 20, add: true, order: 4 }); W.sk.pool.userData.keep = true;
  W.sk.tree = card(A, 4.6, 6.4, (g, w, h) => P.tree(g, w, h, 3), { pos: [12.6, 3.2, -8.6], px: 70, order: 20 });
  W.sk.car = card(A, 4.6, 1.55, car, { pos: [10.6, .78, -4.0], px: 110, order: 22 });
  // sky life: drifting clouds, a plane's blinking light
  W.sk.clouds = [[-30, 34, 26, 4, 3], [12, 41, 32, 4.5, 7], [44, 30, 24, 3.5, 9], [-60, 44, 30, 4, 12]].map(([x, y, w, h, sd]) => {
    const m = card(A, w, h, (g, cw, ch) => cloud(g, cw, ch, sd), { pos: [x, y, -95], px: 8, order: 4, opacity: .35 }); m.userData.keep = true; m.userData.x0 = x; return m; });
  W.sk.plane = card(A, .9, .9, (g, w, h) => P.glow(g, w, h, '255,90,90', .3), { pos: [-60, 47, -100], px: 30, add: true, order: 4 }); W.sk.plane.userData.keep = true;
}

// ------------------------------------------------------------------ per frame
const blinkAt = (t, seed) => { const p = 2.6 + (seed % 3) * .7, x = (t + seed * .37) % p; return x < .12 ? 1 - Math.abs(x - .06) / .06 : 0; };
export function update(W, t, name, cam) {
  const K = W.sk, dawn = name === 'baslik' || name === 'son';
  // window lights
  for (const L of K.lights) {
    let k = 0;
    if (dawn) k = L.dawnOn ? 1 : 0;
    else if (L.on0) k = t < L.off ? 1 : (t < L.off + .07 ? .45 : 0);
    if (L.kind === 'tv' && k > 0) k *= .75 + .25 * Math.sin(t * 23) * Math.sin(t * 7.3);
    L.m.material.opacity = k; L.m.material.color.setScalar(L.kind === 'tv' ? .74 : .8);
    L.sp.material.opacity = k * (L.kind === 'tv' ? 0 : .3);
  }
  if (K.curtain && !dawn) { const c = smoother(ramp(t, 3.35, 4.05)); if (c !== K.curtainK) { K.curtainK = c; K.curtain.m.userData.paint.redraw(c); } }
  // our room: always lit
  K.ourRoom.material.color.setScalar(1.0); K.oGlow.material.opacity = dawn ? .35 : .6; K.oSpill.material.opacity = dawn ? .15 : .42;
  // bakery: lights come on at dawn
  const bk = dawn ? 1 : .1; K.bakery.material.color.setScalar(bk); K.counter.material.color.setScalar(dawn ? .9 : .12);
  K.pend.forEach(m => m.material.opacity = dawn ? .55 : 0);
  K.shopGlow.material.opacity = dawn ? .22 : 0; K.shopPool.material.opacity = dawn ? .7 : 0; K.bulbs.material.opacity = dawn ? .85 * (.92 + .08 * Math.sin(t * 9)) : 0;
  // street light: on at night
  K.lampG.material.opacity = dawn ? .12 : .8; K.pool.material.opacity = dawn ? 0 : .55;
  // sky life
  for (const c of K.clouds) { c.position.x = c.userData.x0 + t * .35; c.material.color.set(dawn ? '#ffc39a' : '#6e6aa8'); c.material.opacity = dawn ? .5 : .3; }
  K.plane.visible = !dawn; K.plane.position.x = -46 + t * 3.2; K.plane.material.opacity = (t % 1.1) < .12 ? 1 : .12;
  // a blurred branch poking into a top corner of the close shots, 4 m in front of the lens (placed from the camera)
  const BR = { pencereler: 1, cephe: -1, son: 1 }[name];
  K.branch.visible = !!BR && !!cam;
  if (K.branch.visible) {
    const d = 4, hh = d * Math.tan(cam.fov * Math.PI / 360), hw = hh * cam.aspect, q = cam.quaternion;
    const off = new THREE.Vector3(BR * hw * .9, hh * .82, -d).applyQuaternion(q);
    K.branch.position.copy(cam.position).add(off); K.branch.quaternion.copy(q); K.branch.scale.x = BR;
    K.branch.material.color.setScalar(dawn ? .55 : .35);
  }
  // the cat
  { const P2 = K.cat.userData.paint; catPaint(P2.g, P2.w, P2.h, t); P2.tex.needsUpdate = true; }

  // ---- people. Every hand is placed by reach (props.js); figures behind a lit window keep their own colours.
  const me = K.meA;
  me.mesh.visible = true;
  if (!dawn) {
    // night: at the desk behind the balcony door with a book; a page turns at 5.95 and 6.75
    const flick = Math.min(1, [5.95, 6.75].map(x => Math.exp(-Math.pow((t - x) / .14, 2))).reduce((a, b) => a + b));
    const a = readPose({ sit: 1, lean: 7 + flick * 2, legs: [[0, 0], [6, -4]], head: -8 }, flick);
    W.heldA = a.held;
    me.at(ME_SIT.x, ME_FLOOR, ME_SIT.z).set(a.pose, { look: .7, expr: flick > .4 ? 'grin' : 'smile', blink: blinkAt(t, 1) });
    me.mesh.material.color.setScalar(.95);
  } else {
    // dawn: on the balcony, one hand on the rail. One sip (36.55 s), then the mug goes up to the camera (37.9 - 39.6 s)
    const base = { lean: -2, head: 4, legs: [[5, 0], [-5, 0]] }, Jb = joints(base);
    const up = smoother(ramp(t, 37.85, 38.3)) * (1 - smoother(ramp(t, 39.35, 39.75)));
    const a = mugPose(base, .4, t, name === 'son' ? 36.55 : null, { up, other: [Jb.sh[0] + .5, Jb.sh[1] - .36] });
    const look = lerp(lerp(.4, .72, a.k), .08, smoother(ramp(t, 37.6, 38.0)));
    W.heldA = a.held;
    me.at(ME_BALC.x, ME_FLOOR, ME_BALC.z).set(a.pose, { look, expr: a.k > .45 ? 'happy' : t > 37.7 ? 'grin' : 'smile', blink: blinkAt(t, 3) });
    me.mesh.material.color.set('#fff1e2');
  }
  // n1: stands at the window, yawns, reaches for the switch; the light goes at 3.85
  const n1 = K.n1;
  n1.mesh.visible = !dawn && t < 3.92;
  if (n1.mesh.visible) {
    const yawn = Math.exp(-Math.pow((t - 3.3) / .28, 2)), reach = smoother(ramp(t, 3.52, 3.8));
    const base = { lean: -4 * yawn, head: 3 }, J = joints(base), sw = armTo(base, [J.sh[0] + 1.05, J.sh[1] + .22]);
    const a0 = [lerp(8 + 150 * yawn, sw[0], reach), lerp(4 + 26 * yawn, sw[1], reach)];
    n1.at(...n1.home).set({ ...base, arms: [a0, [-8 - 150 * yawn * (1 - reach), -4 - 30 * yawn * (1 - reach)]] },
      { look: reach > .3 ? .8 : .1, expr: yawn > .3 ? 'yawn' : 'tired', blink: blinkAt(t, 5) });
    n1.mesh.material.color.setScalar(.92);
  }
  // n2: in the armchair in front of the TV; lifts the remote and switches it off at 4.45
  const n2 = K.n2;
  n2.mesh.visible = K.chair2.visible = !dawn && t < 4.5;
  if (n2.mesh.visible) {
    const base = { sit: 1, lean: -7, legs: [[-2, 24], [5, -3]], head: 4 }, J = joints(base), rem = smoother(ramp(t, 4.05, 4.35));
    const hand = [J.hip[0] + lerp(.55, .8, rem), J.hip[1] + lerp(.14, .62, rem)];
    n2.at(...n2.home).set({ ...base, arms: [armTo(base, hand), armTo(base, [J.hip[0] + .35, J.hip[1] + .16])] },
      { look: .8, expr: t > 4.0 ? 'tired' : 'neutral', blink: blinkAt(t, 6) });
    n2.mesh.material.color.set('#c9d6ff'); K.chair2.material.color.set('#e6e9ff');
  }
  // n3: a last tea at the window (a sip at 1.7), light out at 3.62.  n4: on the phone, pacing, light out at 2.62
  const n3 = K.n3, n4 = K.n4;
  n3.mesh.visible = !dawn && t < 3.68;
  if (n3.mesh.visible) {
    const a = mugPose({ lean: 1, head: 2 }, .12, t, 1.7);
    W.heldN3 = a.held;
    n3.at(...n3.home).set(a.pose, { look: lerp(.12, .62, a.k), expr: a.k > .45 ? 'happy' : 'smile', blink: blinkAt(t, 7) });
    n3.mesh.material.color.setScalar(.92);
  }
  n4.mesh.visible = !dawn && t < 2.68;
  if (n4.mesh.visible) {
    const base = { lean: 2, head: 3 + Math.sin(t * 3) * 2 }, J = joints(base), gs = Math.sin(t * 4.2);
    W.heldN4 = { kind: 'phone' };
    n4.at(n4.home[0] + Math.sin(t * 1.5) * .14, n4.home[1], n4.home[2], true).set({ ...base, arms: [armTo(base, [J.head[0] + .4, J.head[1] - .04]), [-28 + 26 * gs, -52 - 18 * gs]] },
      { look: .5, expr: Math.sin(t * 9) > 0 ? 'o' : 'smile', blink: blinkAt(t, 8) });
    n4.mesh.material.color.setScalar(.92);
  }
  // dawn: d1 and d2 stretch and yawn at their windows, d3 has her first coffee
  const stretch = (m, t0, flip, seed) => {
    const k = smoother(ramp(t, t0, t0 + .8)) * (1 - smoother(ramp(t, t0 + 2.1, t0 + 2.9))), sway = Math.sin((t - t0) * 2.2) * k;
    m.at(m.home[0], m.home[1], m.home[2], flip).set({ lean: -5 * k + sway * 2, head: -4 * k, arms: [[8 + 158 * k + sway * 6, 4 + 16 * k], [-8 - 150 * k + sway * 6, -4 - 18 * k]] },
      { look: .15, expr: k > .5 ? 'yawn' : k > .05 ? 'happy' : 'smile', blink: blinkAt(t, seed) });
    m.mesh.material.color.setScalar(.95);
  };
  K.d1.mesh.visible = K.d2.mesh.visible = K.d3.mesh.visible = dawn;
  if (dawn) {
    stretch(K.d1, 31.1, false, 11); stretch(K.d2, 32.5, true, 12);
    const a = mugPose({ lean: 1, head: 2 }, .2, t, 33.7);
    W.heldD3 = a.held;
    K.d3.at(...K.d3.home).set(a.pose, { look: lerp(.2, .62, a.k), expr: a.k > .45 ? 'happy' : 'smile', blink: blinkAt(t, 13) });
    K.d3.mesh.material.color.setScalar(.95);
  }
  // the baker carries a tray of bread along the counter to the shelves, then lifts it into place
  K.baker.mesh.visible = dawn;
  if (dawn) {
    const w = ramp(t, 30.5, 33.5), moving = w > 0 && w < 1, put = smoother(ramp(t, 33.6, 34.3)) * (1 - smoother(ramp(t, 35.0, 35.5)));
    const a = carryPose({ ...(moving ? walk(t * 1.2, .7) : {}), lean: 3, head: -2 }, .12 + put * .3 + (moving ? Math.abs(Math.sin(t * 1.2 * Math.PI * 2)) * .02 : 0));
    W.heldBk = a.held;
    K.baker.at(lerp(-2.4, -4.6, w), 0, -12.9, true).set(a.pose, { look: .5, expr: 'smile', blink: blinkAt(t, 8) });
    K.baker.mesh.material.color.setScalar(.95);
  }
  // a passer-by crosses during the title: 2.1 m/s, the speed of that stride
  K.walker.mesh.visible = name === 'baslik';
  if (name === 'baslik') {
    W.heldWk = { kind: 'pack', col: '#3a6f86' };
    K.walker.at(lerp(-9.6, 1.3, ramp(t, 30.4, 35.5)), 0, -9.4).set({ ...walk(t * 1.55, 1), lean: 3 }, { look: .7, expr: 'smile', blink: blinkAt(t, 9) });
    K.walker.mesh.material.color.set('#ffe9d6');
  }
}
