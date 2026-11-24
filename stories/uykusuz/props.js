// props.js : what the characters hold, and the poses that hold it.
// A prop is painted inside the character's own card, so it shares his rim light and his depth. The hands are placed by
// reach (armTo): the prop decides where the hand has to be, never the other way round. (v6 moved the arm by angles and
// the mug ended up on the forehead.)
// A held thing is an object: { kind: 'mug' | 'book' | 'guitar' | 'tray' | 'phone' | 'pack', ...state }
import { joints, armTo, mouthOf } from '/engine/src/stick.js';
import { lerp, smoother, ramp } from '/engine/src/layer.js';

const D = Math.PI / 180;
const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];   // y up, counter-clockwise
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mixp = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ------------------------------------------------------------------ poses
// a sip: 0 .. 1 (mug at the mouth, held there for half a second) .. 0, centred on t0
export const sipK = (t, t0) => smoother(ramp(t, t0 - .62, t0 - .12)) * (1 - smoother(ramp(t, t0 + .48, t0 + .95)));
const tiltK = (t, t0) => smoother(ramp(t, t0 - .2, t0 + .22)) * (1 - smoother(ramp(t, t0 + .4, t0 + .7)));
// MUG in the front hand. k: 0 = held in front of the chest, 1 = rim on the lips. up: 0..1 raised in a toast.
// The mug's rim corner on the drinker's side is (-.30, +.17) from the grip; the hand goes where that corner meets the mouth.
export function mugPose(base, look, t, t0, { up = 0, other = null, steam = 1 } = {}) {
  const J = joints(base), k = t0 == null ? 0 : sipK(t, t0), tau = k * .3 + (t0 == null ? 0 : tiltK(t, t0)) * .55;
  const M = mouthOf(J, look);
  const rest = [J.sh[0] + .64, J.sh[1] - .46 + Math.sin(t * 1.3) * .012];
  const lips = [M[0] + .30 * Math.cos(tau) + .17 * Math.sin(tau) - .03, M[1] + .30 * Math.sin(tau) - .17 * Math.cos(tau)];
  const toast = [J.sh[0] + .98, J.sh[1] + .66];
  let hand = mixp(rest, lips, k); hand[0] += Math.sin(k * Math.PI) * .1;                     // the hand swings out a little on the way up
  hand = mixp(hand, toast, up);
  const arms = [armTo(base, hand), other ? armTo(base, other) : (base.arms ? base.arms[1] : [-6, 10])];
  return { pose: { ...base, arms }, held: { kind: 'mug', tilt: tau * (1 - up), steam: steam * (1 - k) * (1 - up * .5), t }, k };
}
// BOOK held open in front of the chest; flick 0..1 = a page being turned (the back hand goes up to the page)
export function readPose(base, flick = 0) {
  const J = joints(base), a = (9 + flick * 4) * D;
  const B = [J.sh[0] + .7, J.sh[1] - .3 + flick * .03];
  const f = add(B, rot([.24, .05], -a)), b = add(B, rot([-.2, .1 + flick * .34], -a));
  return { pose: { ...base, arms: [armTo(base, f), armTo(base, b)] }, held: { kind: 'book', at: B, rot: a, flick } };
}
// GUITAR on the lap, neck up and forward. st 0..1 = a strum (the hand crosses the strings), chord = where the fret hand is
export const GTR = { k: .8, ang: 36 * D };
export function guitarPose(base, st = 0, chord = 0) {
  const J = joints(base), th = GTR.ang, n = [Math.cos(th), Math.sin(th)], m = [-Math.sin(th), Math.cos(th)];
  const B = [J.hip[0] + .3, J.hip[1] + .42], fret = 1.0 + chord * .13;
  const at = (x, y) => [B[0] + n[0] * x + m[0] * y, B[1] + n[1] * x + m[1] * y];
  return { pose: { ...base, arms: [armTo(base, at(.04, .11 - st * .22)), armTo(base, at(fret, -.01))] }, held: { kind: 'guitar', at: B, ang: th, fret } };
}
// both hands forward, carrying something flat (the baker's tray)
export function carryPose(base, bob = 0) {
  const J = joints(base), c = [J.sh[0] + .62, J.sh[1] - .42 + bob];
  return { pose: { ...base, arms: [armTo(base, add(c, [.12, 0])), armTo(base, add(c, [-.1, .0]))] }, held: { kind: 'tray', at: c } };
}

// ------------------------------------------------------------------ painters
export function drawHeld(h, g, J, tx, ty, px, sil, when) {
  if (!h) return;
  const u = px, ink = sil ? '#000' : '#08070b', C = c => sil ? '#000' : c;
  if (h.kind === 'mug' && when === 'front') {
    const hand = J.arms[0][2], hx = tx(hand[0]), hy = ty(hand[1]);
    if (!sil && h.steam > .05) {                                              // steam rises straight up, whatever the tilt
      g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = .034 * u;
      const gr = g.createLinearGradient(0, hy - .24 * u, 0, hy - .76 * u); gr.addColorStop(0, 'rgba(255,246,232,0)'); gr.addColorStop(.25, `rgba(255,246,232,${.42 * h.steam})`); gr.addColorStop(1, 'rgba(255,246,232,0)');
      g.strokeStyle = gr;
      for (let k = 0; k < 2; k++) { g.beginPath();
        for (let i = 0; i <= 16; i++) { const y = i / 16, x = hx - (.22 - k * .1) * u + Math.sin(y * 7 - h.t * 2.6 + k * 2) * .035 * u * (.4 + y); i ? g.lineTo(x, hy - (.24 + y * .52) * u) : g.moveTo(x, hy - (.24 + y * .52) * u); }
        g.stroke(); }
      g.restore();
    }
    g.save(); g.translate(hx, hy); g.rotate(-(h.tilt || 0));
    const col = C(h.col || '#efe4cf');
    g.strokeStyle = col; g.lineWidth = .052 * u; g.beginPath(); g.arc(-.03 * u, -.01 * u, .088 * u, -1.5, 1.5); g.stroke();      // handle
    g.fillStyle = col; g.beginPath(); g.roundRect(-.30 * u, -.17 * u, .26 * u, .32 * u, [.015 * u, .015 * u, .07 * u, .07 * u]); g.fill();
    if (!sil) {
      g.save(); g.clip();
      g.fillStyle = h.band || '#e0602f'; g.fillRect(-.31 * u, -.045 * u, .28 * u, .07 * u);
      g.fillStyle = 'rgba(70,40,40,.2)'; g.fillRect(-.31 * u, -.18 * u, .075 * u, .34 * u);                                       // the side away from the light
      g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(-.085 * u, -.15 * u, .022 * u, .26 * u);
      g.restore();
      g.fillStyle = '#fffaf0'; g.beginPath(); g.ellipse(-.17 * u, -.17 * u, .13 * u, .03 * u, 0, 0, 7); g.fill();               // rim
      g.fillStyle = '#6b3a24'; g.beginPath(); g.ellipse(-.17 * u, -.168 * u, .105 * u, .018 * u, 0, 0, 7); g.fill();            // coffee
    }
    g.fillStyle = ink; g.beginPath(); g.ellipse(.025 * u, -.005 * u, .062 * u, .105 * u, .15, 0, 7); g.fill();                    // fingers through the handle
    g.restore();
  } else if (h.kind === 'book' && when === 'front') {
    // an open book seen from outside: the two covers meet at the spine, the far one foreshortened, the page block on top
    const col = h.col || '#e0602f';
    g.save(); g.translate(tx(h.at[0]), ty(h.at[1])); g.rotate(h.rot || 0); g.lineJoin = 'round';
    const quad = (pts, fill) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x * u, y * u) : g.moveTo(x * u, y * u)); g.closePath(); g.fillStyle = fill; g.fill(); };
    const far = [[0, 0], [-.22, -.04], [-.22, -.6], [0, -.63]], near = [[0, 0], [.31, -.05], [.31, -.67], [0, -.63]];
    if (sil) { quad([[-.24, -.02], [-.24, -.66], [0, -.7], [.33, -.72], [.33, -.03], [0, .02]], '#000'); g.restore(); return; }
    g.strokeStyle = ink; g.lineWidth = .05 * u;
    for (const q of [far, near]) { quad(q, ink); g.stroke(); }
    quad([[-.2, -.6], [0, -.63], [0, -.685], [-.2, -.65]], '#f3ead8'); quad([[0, -.63], [.29, -.67], [.29, -.725], [0, -.685]], '#f3ead8');   // pages
    g.strokeStyle = 'rgba(120,96,80,.5)'; g.lineWidth = .012 * u; for (const k of [.35, .7]) { g.beginPath(); g.moveTo(-.2 * u, (-.6 - .05 * k) * u); g.lineTo(0, (-.63 - .055 * k) * u); g.lineTo(.29 * u, (-.67 - .055 * k) * u); g.stroke(); }
    quad(far, shade(col, .3)); quad(near, col);
    quad([[-.035, 0], [.04, -.005], [.04, -.635], [-.035, -.625]], shade(col, .45));                                           // spine
    quad([[.1, -.5], [.25, -.524], [.25, -.565], [.1, -.54]], 'rgba(255,240,215,.85)'); quad([[.1, -.43], [.2, -.446], [.2, -.47], [.1, -.454]], 'rgba(255,240,215,.5)');
    g.fillStyle = 'rgba(255,240,215,.7)'; g.beginPath(); g.ellipse(.175 * u, -.24 * u, .05 * u, .055 * u, 0, 0, 7); g.fill();
    if (h.flick > .04) {                                                                                                        // a page going over
      const k = Math.min(1, h.flick), tipx = lerp(.27, -.16, k), tipy = -.69 - Math.sin(k * Math.PI) * .2;
      g.fillStyle = '#fbf4e6'; g.beginPath(); g.moveTo(0, -.66 * u); g.quadraticCurveTo(tipx * .5 * u, (tipy - .08) * u, tipx * u, tipy * u); g.quadraticCurveTo(tipx * .4 * u, (tipy + .06) * u, 0, -.66 * u); g.fill();
    }
    g.fillStyle = ink; g.beginPath(); g.ellipse(.24 * u, -.085 * u, .05 * u, .075 * u, .3, 0, 7); g.fill();                     // thumb on the cover
    g.restore();
  } else if (h.kind === 'guitar') {
    const q = GTR.k * u;
    g.save(); g.translate(tx(h.at[0]), ty(h.at[1])); g.rotate(-h.ang); g.lineJoin = 'round'; g.lineCap = 'round';
    if (when === 'mid') {
      const body = () => { g.beginPath(); g.moveTo(-.55 * q, 0);
        g.bezierCurveTo(-.55 * q, -.3 * q, -.36 * q, -.42 * q, -.14 * q, -.42 * q); g.bezierCurveTo(.06 * q, -.42 * q, .1 * q, -.28 * q, .22 * q, -.27 * q);
        g.bezierCurveTo(.32 * q, -.26 * q, .34 * q, -.32 * q, .46 * q, -.32 * q); g.bezierCurveTo(.6 * q, -.32 * q, .7 * q, -.2 * q, .7 * q, -.06 * q); g.lineTo(.7 * q, .06 * q);
        g.bezierCurveTo(.7 * q, .2 * q, .6 * q, .32 * q, .46 * q, .32 * q); g.bezierCurveTo(.34 * q, .32 * q, .32 * q, .26 * q, .22 * q, .27 * q);
        g.bezierCurveTo(.1 * q, .28 * q, .06 * q, .42 * q, -.14 * q, .42 * q); g.bezierCurveTo(-.36 * q, .42 * q, -.55 * q, .3 * q, -.55 * q, 0); g.closePath(); };
      const neck = () => { g.beginPath(); g.moveTo(.6 * q, -.06 * q); g.lineTo(1.72 * q, -.047 * q); g.lineTo(1.77 * q, -.088 * q); g.lineTo(2.0 * q, -.078 * q); g.quadraticCurveTo(2.05 * q, 0, 2.0 * q, .078 * q);
        g.lineTo(1.77 * q, .088 * q); g.lineTo(1.72 * q, .047 * q); g.lineTo(.6 * q, .06 * q); g.closePath(); };
      if (sil) { g.fillStyle = '#000'; g.strokeStyle = '#000'; g.lineWidth = .05 * q; neck(); g.fill(); g.stroke(); body(); g.fill(); g.stroke(); g.restore(); return; }
      // tuners, neck, headstock
      g.fillStyle = '#d9c9a8'; for (const x of [1.82, 1.9, 1.98]) for (const s of [-1, 1]) { g.fillRect((x - .008) * q, s * .08 * q - (s < 0 ? .04 * q : 0), .016 * q, .04 * q); g.beginPath(); g.ellipse(x * q, s * .125 * q, .03 * q, .022 * q, 0, 0, 7); g.fill(); }
      neck(); g.fillStyle = '#5a3320'; g.fill(); g.strokeStyle = ink; g.lineWidth = .035 * q; g.stroke();
      g.fillStyle = '#26130f'; g.beginPath(); g.moveTo(.6 * q, -.048 * q); g.lineTo(1.72 * q, -.037 * q); g.lineTo(1.72 * q, .037 * q); g.lineTo(.6 * q, .048 * q); g.fill();       // fretboard
      g.fillStyle = '#efe4cf'; g.fillRect(1.715 * q, -.04 * q, .016 * q, .08 * q);                                                                                   // nut
      g.strokeStyle = 'rgba(232,214,178,.75)'; g.lineWidth = .009 * q; g.lineCap = 'butt';
      for (let n = 1; n <= 13; n++) { const x = 1.72 - 1.92 * (1 - Math.pow(2, -n / 12)); if (x < .7) break; g.beginPath(); g.moveTo(x * q, -.046 * q); g.lineTo(x * q, .046 * q); g.stroke(); }
      g.fillStyle = 'rgba(240,226,196,.8)'; for (const n of [2.5, 4.5, 6.5, 8.5]) { const x = 1.72 - 1.92 * (1 - Math.pow(2, -n / 12)); g.beginPath(); g.arc(x * q, 0, .013 * q, 0, 7); g.fill(); }
      // body: wood, binding, sound hole, pick guard, bridge
      body(); const gr = g.createRadialGradient(.2 * q, -.12 * q, .05 * q, .05 * q, 0, .75 * q); gr.addColorStop(0, '#eab064'); gr.addColorStop(.55, '#d28a3f'); gr.addColorStop(1, '#a8632b');
      g.fillStyle = gr; g.fill();
      g.save(); g.clip(); g.fillStyle = 'rgba(70,30,20,.2)'; g.fillRect(-.6 * q, .2 * q, 1.4 * q, .3 * q);                              // the lower side, away from the light
      g.strokeStyle = 'rgba(120,60,30,.16)'; g.lineWidth = .012 * q; for (let y = -.4; y < .42; y += .07) { g.beginPath(); g.moveTo(-.56 * q, y * q); g.lineTo(.72 * q, (y + .015) * q); g.stroke(); }
      g.restore();
      g.save(); g.translate(.07 * q, 0); g.scale(.93, .92); g.translate(-.07 * q, 0); body(); g.strokeStyle = 'rgba(255,238,205,.5)'; g.lineWidth = .016 * q; g.stroke(); g.restore();
      body(); g.strokeStyle = ink; g.lineWidth = .045 * q; g.lineCap = 'round'; g.stroke();
      g.fillStyle = '#2b1712'; g.beginPath(); g.moveTo(.13 * q, .1 * q); g.quadraticCurveTo(.2 * q, .3 * q, .42 * q, .24 * q); g.quadraticCurveTo(.44 * q, .12 * q, .36 * q, .06 * q); g.closePath(); g.fill();   // pick guard
      g.strokeStyle = 'rgba(250,232,200,.7)'; g.lineWidth = .014 * q; g.beginPath(); g.arc(.26 * q, 0, .165 * q, 0, 7); g.stroke();
      g.strokeStyle = '#3a1d14'; g.lineWidth = .03 * q; g.beginPath(); g.arc(.26 * q, 0, .138 * q, 0, 7); g.stroke();
      g.fillStyle = '#170b0a'; g.beginPath(); g.arc(.26 * q, 0, .115 * q, 0, 7); g.fill();
      g.fillStyle = '#2b1712'; g.beginPath(); g.roundRect(-.26 * q, -.16 * q, .09 * q, .32 * q, .02 * q); g.fill(); g.fillStyle = '#efe4cf'; g.fillRect(-.215 * q, -.1 * q, .014 * q, .2 * q);
      // strings
      g.strokeStyle = 'rgba(255,244,220,.72)'; g.lineWidth = .0075 * q; g.lineCap = 'butt';
      for (let i = 0; i < 6; i++) { const k = i / 5 - .5; g.beginPath(); g.moveTo(-.21 * q, k * .17 * q); g.lineTo(1.72 * q, k * .066 * q); g.lineTo((1.82 + (2 - Math.abs(i - 2.5)) * .05) * q, Math.sign(k) * .06 * q); g.stroke(); }
    } else if (when === 'front') {                                               // the fret hand's fingers come over the neck
      g.strokeStyle = ink; g.lineWidth = .05 * u;
      for (let i = 0; i < 4; i++) { const x = (h.fret - .09 + i * .058) * u; g.beginPath(); g.moveTo(x, -.075 * u); g.lineTo(x + .012 * u, .03 * u); g.stroke(); }
    }
    g.restore();
  } else if (h.kind === 'tray' && when === 'front') {
    g.save(); g.translate(tx(h.at[0]), ty(h.at[1]));
    g.fillStyle = C('#3a2620'); g.beginPath(); g.roundRect(-.5 * u, -.02 * u, 1.0 * u, .07 * u, .03 * u); g.fill();
    for (const [x, r] of [[-.3, 0], [.0, .06], [.3, -.04]]) {
      g.save(); g.translate(x * u, -.1 * u); g.rotate(r);
      g.fillStyle = C('#d99a52'); g.beginPath(); g.ellipse(0, 0, .15 * u, .095 * u, 0, 0, 7); g.fill();
      if (!sil) { g.fillStyle = 'rgba(255,236,190,.55)'; g.beginPath(); g.ellipse(-.01 * u, -.035 * u, .1 * u, .03 * u, 0, 0, 7); g.fill();
        g.strokeStyle = 'rgba(120,60,24,.6)'; g.lineWidth = .016 * u; for (const k of [-.06, 0, .06]) { g.beginPath(); g.moveTo((k - .02) * u, -.05 * u); g.lineTo((k + .02) * u, .03 * u); g.stroke(); } }
      g.restore();
    }
    g.fillStyle = ink; for (const x of [.14, -.1]) { g.beginPath(); g.ellipse(x * u, .0, .06 * u, .045 * u, 0, 0, 7); g.fill(); }
    g.restore();
  } else if (h.kind === 'phone' && when === 'front') {
    const hand = J.arms[0][2];
    g.save(); g.translate(tx(hand[0]), ty(hand[1])); g.rotate(-.2);
    g.fillStyle = C('#1b1a24'); g.beginPath(); g.roundRect(-.1 * u, -.2 * u, .12 * u, .3 * u, .03 * u); g.fill();
    if (!sil) { g.fillStyle = 'rgba(170,200,255,.85)'; g.fillRect(-.1 * u, -.17 * u, .025 * u, .24 * u); }
    g.restore();
  } else if (h.kind === 'pack' && when === 'back') {
    const n = J.neck, hp = J.hip, lean = Math.atan2(n[0] - hp[0], n[1] - hp[1]);
    g.save(); g.translate(tx(hp[0]), ty(hp[1])); g.rotate(lean);
    g.fillStyle = C(h.col || '#3a6f86'); g.strokeStyle = ink; g.lineWidth = .055 * u;
    g.beginPath(); g.roundRect(-.66 * u, -1.16 * u, .46 * u, .84 * u, .14 * u); g.fill(); g.stroke();
    if (!sil) { g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.roundRect(-.62 * u, -.74 * u, .3 * u, .34 * u, .06 * u); g.fill(); }
    g.restore();
  }
}
function shade(c, k) { const n = parseInt(c.slice(1), 16), f = v => Math.round(v * (1 - k)).toString(16).padStart(2, '0'); return '#' + f((n >> 16) & 255) + f((n >> 8) & 255) + f(n & 255); }
