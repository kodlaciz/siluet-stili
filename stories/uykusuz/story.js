// Uykusuz : "Ya hiç uyuman gerekmeseydi?" A 40-second hook in the silhouette What-If style (16:9, 24 fps).
// Hook grammar copied from the three reference hooks (analiz/script.md): power in action -> a witness -> the number
// contrast on a dark card -> the title question -> "here's how it works".
import * as THREE from 'three';
import { card, quad, paintTex, lerp, clamp01, ease, smoother, ramp, rng, mix } from '/engine/src/layer.js';
import { Stick, walk, joints } from '/engine/src/stick.js';
import { CamPath } from '/engine/src/camera.js';
import { BARS, tightAt, barCues, tightColor } from '/engine/src/bars.js';
import * as P from './paint.js';
import * as Rm from './room.js';
import * as Sk from './sokak.js';
import { drawHeld, mugPose, readPose, guitarPose } from './props.js';

export const NAME = 'uykusuz'; export const FPS = 24; export const DUR = 40;
// voice lines: [id, start s]  (voice/satir/*.wav, placed by engine/audio/mix.py)
export const LINES = [['L01', .7], ['L02', 5.4], ['L03', 8.0], ['L04', 10.45], ['L05', 13.2], ['L06', 17.45], ['L07', 20.4],
  ['L08', 22.9], ['L09', 27.7], ['L10', 29.3], ['L11', 31.2], ['L12', 38.0]];
// shots: [start, name]
const SH = [[0, 'dis'], [3.0, 'pencereler'], [5.0, 'cephe'], [7.4, 'oda'], [9.0, 'yigin'], [10.2, 'gitar'], [11.8, 'saat'], [13.0, 'japonca'],
  [14.6, 'gokyuzu'], [15.8, 'safak'], [17.3, 'arkadas'], [18.9, 'kule'], [20.0, 'yakin'], [22.4, 'kart'], [27.6, 'kart2'], [30.4, 'baslik'], [35.5, 'son']];
const EXT = ['dis', 'pencereler', 'cephe', 'baslik', 'son'], ROOMS = ['oda', 'yigin', 'gitar', 'saat', 'japonca', 'gokyuzu', 'safak', 'arkadas', 'kule', 'yakin'];
const DAY = ['safak', 'arkadas', 'kule', 'yakin'];
// tight bars: the stretches where his ability is at work (the reference closes its bars from 62 to 128 px there, and
// turns the grade cold).
//   5.4 - 6.6  inside the shot of the one lit window, on the words "Sen hariç."; open again before the dive into the room
//   9.0 - 14.6 the close shots of his night (three books, a new song, the clock racing, Japanese), from cut to cut;
//              the bars open on the sky turning to dawn
const TIGHT = [[5.4, 6.6], [9.0, 14.6]];
export const CUES = [];
const shotAt = t => { let i = 0; while (i + 1 < SH.length && SH[i + 1][0] <= t) i++; return i; };

const W = {};          // world handles
const NIGHT = new THREE.Color('#7d84b0'), DAWN = new THREE.Color('#ffd2a8'), DAWN_EXT = new THREE.Color('#e6b9a0'), NIGHT_EXT = new THREE.Color('#7a7fa8'), NIGHT_IN = new THREE.Color('#6a72a0');
const tintGroup = (grp, col) => grp.traverse(o => { if (o.isMesh && !o.userData.keep && o.material.color) o.material.color.copy(col); });

export async function setup(ctx) {
  const { scene } = ctx;
  await document.fonts.load("900 64px 'Segoe UI Black'"); await document.fonts.load("700 64px Bahnschrift");

  // ---------------------------------------------------------------- SET A: the street (night and dawn), built in sokak.js
  // three buildings side by side, the low middle one ours; the sky shows as a band above it (v6, see sokak.js)
  const A = new THREE.Group(); scene.add(A); W.A = A;
  W.skyN = card(A, 300, 130, (g, w, h) => P.sky(g, w, h, 'night'), { pos: [0, 40, -140], px: 10, order: 0 });
  W.skyD = card(A, 300, 130, (g, w, h) => P.sky(g, w, h, 'dawn'), { pos: [0, 31, -139.9], px: 10, order: 1, opacity: 0 });
  W.skyN.userData.keep = W.skyD.userData.keep = true;
  W.moon = card(A, 6, 6, (g, w, h) => P.disc(g, w, h, '#f4ecd8'), { pos: [6.9, 36.6, -100], px: 40, order: 2 }); W.moon.userData.keep = true; W.moon.material.color.setScalar(.86);
  W.moonG = card(A, 34, 34, (g, w, h) => P.glow(g, w, h, '200,205,255', .08), { pos: [6.9, 36.6, -99.9], px: 8, add: true, order: 3, opacity: .55 }); W.moonG.userData.keep = true;
  W.sun = card(A, 16, 16, (g, w, h) => P.glow(g, w, h, '255,236,200', .25), { pos: [14.7, 27, -100], px: 24, add: true, order: 3, opacity: 0 }); W.sun.userData.keep = true;
  W.sun.material.color.setScalar(1.6);
  W.rays = card(A, 130, 130, (g, w, h) => P.rays(g, w, h), { pos: [14.7, 27, -99], px: 8, add: true, order: 4, opacity: 0 }); W.rays.userData.keep = true;
  W.far = card(A, 260, 34, (g, w, h) => P.skyline(g, w, h, { seed: 2, col: '#2b2650', lit: .02, minH: .2, maxH: .75 }), { pos: [0, 24, -100], px: 10, order: 5 });
  W.mid = card(A, 170, 30, (g, w, h) => P.skyline(g, w, h, { seed: 7, col: '#1f1a3d', lit: .03, minH: .3, maxH: 1, bw: [.04, .1] }), { pos: [0, 13, -60], px: 14, order: 5 });
  Sk.build(A, W, CUES, extraFor);
  // dust motes / embers drifting in front
  { const n = 160, pos = new Float32Array(n * 3), R2 = rng(5); for (let i = 0; i < n; i++) { pos[i * 3] = (R2() - .5) * 40; pos[i * 3 + 1] = R2() * 26; pos[i * 3 + 2] = -8 + R2() * 30; }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    W.dust = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#fff0dc', size: .09, transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending }));
    W.dust.userData.keep = true; W.dust.renderOrder = 30; A.add(W.dust); W.dust0 = pos.slice(); }
  // birds for the dawn
  W.birds = card(A, 6, 2, (g, w, h) => { g.strokeStyle = '#2a1f3a'; g.lineWidth = 5; g.lineCap = 'round'; for (const [x, y, s] of [[.2, .5, 1], [.38, .3, .8], [.55, .6, .9], [.7, .35, .7]]) { g.beginPath(); g.moveTo(w * x - 24 * s, h * y - 10 * s); g.quadraticCurveTo(w * x - 8 * s, h * y - 16 * s, w * x, h * y); g.quadraticCurveTo(w * x + 8 * s, h * y - 16 * s, w * x + 24 * s, h * y - 10 * s); g.stroke(); } }, { pos: [8, 22.8, -40], px: 60, order: 4, opacity: 0 });

  // ---------------------------------------------------------------- SET B: the room (x = 1000)
  const B = new THREE.Group(); B.position.set(1000, 0, 0); scene.add(B); W.B = B;
  W.rSkyN = card(B, 60, 30, (g, w, h) => P.sky(g, w, h, 'night'), { pos: [3, 8, -40], px: 12, order: 0 });
  W.rSkyD = card(B, 60, 30, (g, w, h) => P.sky(g, w, h, 'dawn'), { pos: [3, 8, -39.9], px: 12, order: 1, opacity: 0 });
  W.rSkyN.userData.keep = W.rSkyD.userData.keep = true;
  W.rMoon = card(B, 2.2, 2.2, (g, w, h) => P.disc(g, w, h, '#f4ecd8'), { pos: [4.5, 9, -39.5], px: 60, order: 2 }); W.rMoon.userData.keep = true;
  W.rCity = card(B, 70, 14, (g, w, h) => P.skyline(g, w, h, { seed: 31, col: '#241e44', lit: .12, minH: .3, maxH: 1, bw: [.04, .09] }), { pos: [3, 2.5, -30], px: 14, order: 2 });
  W.rSun = card(B, 18, 18, (g, w, h) => P.glow(g, w, h, '255,226,180', .2), { pos: [6, 6, -38], px: 16, add: true, order: 3, opacity: 0 }); W.rSun.userData.keep = true; W.rSun.material.color.setScalar(1.5);
  W.wall = card(B, Rm.ROOM.W, Rm.ROOM.H, Rm.wall, { pos: [0, Rm.ROOM.H / 2, -4], px: 160, order: 5 });
  W.floor = card(B, 12, 8, Rm.floor, { pos: [0, 0, 0], rot: [-Math.PI / 2, 0, 0], px: 100, order: 4 });
  W.door = card(B, 1.2, 2.3, Rm.door, { px: 120, order: 6 });
  W.doorPiv = new THREE.Group(); W.doorPiv.position.set(-5.4, 0, -3.97); B.add(W.doorPiv); W.doorPiv.add(W.door); W.door.position.set(.6, 1.15, 0);
  W.clock = card(B, .7, .7, null, { pos: [-.9, 3.55, -3.97], px: 400, order: 7 });
  W.clockTime = -1;
  // the chair stands where the sitter's hip is (ME.x - CHAIR.hip), a hair behind him, so it does not slide under him in oblique shots
  W.chair = card(B, Rm.CHAIR.w, Rm.CHAIR.h, Rm.chair, { pos: [ME.x - Rm.CHAIR.hip + Rm.CHAIR.w / 2, Rm.CHAIR.h / 2, ME.z - .03], px: 420, order: 8 });
  W.desk = card(B, 2.6, 1.0, Rm.desk, { pos: [1.15, .5, -2.3], px: 300, order: 12 });
  W.deskTop = card(B, 2.6, .62, Rm.deskTop, { pos: [1.15, .8, -2.61], rot: [-Math.PI / 2, 0, 0], px: 300, order: 12 });
  W.lamp = card(B, .55, .75, Rm.lamp, { pos: [2.05, 1.172, -2.7], px: 500, order: 13 });
  W.lampGlow = card(B, 5, 5, (g, w, h) => P.glow(g, w, h, '255,200,130', .1), { pos: [1.92, 1.2, -2.66], px: 60, add: true, order: 14, opacity: .75 }); W.lampGlow.userData.keep = true;
  W.lampPool = card(B, 9, 5.5, (g, w, h) => P.glow(g, w, h, '255,176,100', .05), { pos: [1.9, 1.5, -3.95], px: 40, add: true, order: 6, opacity: .9 }); W.lampPool.userData.keep = true;
  W.moonShaft = card(B, 3.2, 3.6, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(170,190,255,.0)'); gr.addColorStop(1, 'rgba(170,190,255,.5)'); g.fillStyle = gr; g.beginPath(); g.moveTo(w * .3, 0); g.lineTo(w * .7, 0); g.lineTo(w, h); g.lineTo(0, h); g.fill(); }, { pos: [2.5, .02, -1.9], rot: [-Math.PI / 2, 0, 0], px: 60, add: true, order: 5, opacity: .35 }); W.moonShaft.userData.keep = true;
  W.sunShaft = card(B, 4.5, 6, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,190,120,.0)'); gr.addColorStop(1, 'rgba(255,190,120,.6)'); g.fillStyle = gr; g.beginPath(); g.moveTo(w * .35, 0); g.lineTo(w * .65, 0); g.lineTo(w, h); g.lineTo(w * .1, h); g.fill(); }, { pos: [1.6, .03, -1.0], rot: [-Math.PI / 2, 0, -.35], px: 50, add: true, order: 5, opacity: 0 }); W.sunShaft.userData.keep = true;
  // laptop with kana on the screen (dynamic)
  // the laptop: a deck lying on the desk and a lit screen standing on its hinge, both turned a little toward the sitter
  { const yaw = -.2, tilt = -.2, hx = .95, hz = -2.74;
    W.deck = card(B, .56, .36, Rm.laptopDeck, { pos: [hx + Math.sin(yaw) * .18, .806, hz + Math.cos(yaw) * .18], px: 1300, order: 13 });
    W.deck.rotation.order = 'YXZ'; W.deck.rotation.set(-Math.PI / 2, yaw, 0);
    W.laptop = card(B, .56, .37, null, { pos: [hx + Math.sin(yaw) * .185 * Math.sin(tilt), .806 + .185 * Math.cos(tilt), hz + Math.cos(yaw) * .185 * Math.sin(tilt)], px: 1500, order: 14 });
    W.laptop.rotation.order = 'YXZ'; W.laptop.rotation.set(tilt, yaw, 0); W.laptop.userData.keep = true;
    W.laptopGlow = card(B, 1.5, 1.2, (g, w, h) => P.glow(g, w, h, '170,196,255', .1), { pos: [hx - .05, 1.0, hz + .12], px: 60, add: true, order: 15, opacity: 0 }); W.laptopGlow.userData.keep = true; }
  W.kana = ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'さ', 'し', '日', '本', '語'];
  // book stack on the desk (dynamic) and the tall tower on the floor (pieces fall)
  W.stack = card(B, .5, .6, null, { pos: [.25, 1.1, -2.55], px: 500, order: 13 });
  W.tower = [];
  { const R3 = rng(77); let y = 0;
    for (let i = 0; i < 26; i++) { const th = .07 + R3() * .04, bw = .3 + R3() * .13, c = Rm.BOOKC[Math.floor(R3() * Rm.BOOKC.length)];
      const m = card(B, bw, th, (g, w, h) => Rm.book(g, w, h, c, i), { px: 400, order: 15 });
      const x0 = -2.55 + (R3() - .5) * .05; m.position.set(x0, y + th / 2, -1.55); W.tower.push({ m, x0, y0: y + th / 2, th, vx: -(.2 + R3() * 1.3) * (i / 26 + .2), dz: (R3() - .5) * .8, spin: (R3() - .5) * 9, delay: (26 - i) * .022 + R3() * .03, rest: R3() * .12, restRot: (R3() - .5) * .5 }); y += th; } }
  W.mugM = card(B, .15, .14, (g, w, h) => Rm.mug(g, w, h), { pos: [1.5, .872, -2.5], px: 1200, order: 14 });
  W.notes = card(B, 1.6, 1.4, null, { pos: [.2, 1.9, -2.2], px: 300, order: 17, noDepth: true });
  W.plant = card(B, 1.6, 2.4, (g, w, h) => { g.fillStyle = '#c96a4a'; g.fillRect(w * .32, h * .78, w * .36, h * .22); g.fillStyle = '#2e5a4c'; const R4 = rng(8); for (let i = 0; i < 18; i++) { g.save(); g.translate(w * .5, h * .8); g.rotate((R4() - .5) * 1.6); g.beginPath(); g.ellipse(0, -h * (.25 + R4() * .2), w * .08, h * (.22 + R4() * .1), 0, 0, 7); g.fill(); g.restore(); } }, { pos: [-3.3, 1.2, 2.2], px: 120, order: 40 });
  // people
  W.me = new Stick(B, { order: 14, height: 1.72, hood: '#36b39b', hoodDark: '#21806f', rimDir: [1, -.3], px: 300, extra: extraFor('held') });
  W.me.at(ME.x, 0, ME.z);
  W.pal = new Stick(B, { order: 16, height: 1.78, hood: '#e3a23c', hoodDark: '#b07a26', hat: 'beanie', hatColor: '#d0464f', rimDir: [1, -.3], px: 340 });
  W.pal.at(-4.8, 0, -3.2);
  W.held = null;   // what "me" holds: { kind: 'book' | 'guitar' | 'mug', ... } or null (see props.js)
  // room dust
  { const n = 90, pos = new Float32Array(n * 3), R5 = rng(9); for (let i = 0; i < n; i++) { pos[i * 3] = (R5() - .5) * 10; pos[i * 3 + 1] = R5() * 4.5; pos[i * 3 + 2] = -3.5 + R5() * 5; }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    W.rdust = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffe8cc', size: .022, transparent: true, opacity: .6, depthWrite: false, blending: THREE.AdditiveBlending }));
    W.rdust.userData.keep = true; B.add(W.rdust); W.rdust0 = pos.slice(); }

  // ---------------------------------------------------------------- SET C: the number card (x = 2000)
  const C = new THREE.Group(); C.position.set(2000, 0, 0); scene.add(C); W.C = C;
  W.cardBg = card(C, 34, 19, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h * .55, 0, w / 2, h * .55, w * .6); gr.addColorStop(0, '#2a3460'); gr.addColorStop(.55, '#151b38'); gr.addColorStop(1, '#070a18'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, { pos: [0, 0, -12], px: 60, order: 0 });
  W.lines = card(C, 40, 22, null, { pos: [0, 0, -11], px: 50, order: 1, noDepth: true });
  W.grid = card(C, 22, 9.5, null, { pos: [0, .35, -8], px: 110, order: 2 });

  // cameras: keys per shot (world coordinates)
  const a = (x, y, z) => [x, y, z], b = (x, y, z) => [x + 1000, y, z], c = (x, y, z) => [x + 2000, y, z];
  W.path = new CamPath([
    { t: 0, pos: a(0, 5.8, 16), look: a(0, 6.0, -12), fov: 40, push: 1.3, drift: [.04, .02, 0] },
    { t: 3.0, move: 'cut', pos: a(-6.8, 9.4, 1.5), look: a(-13.6, 9.6, -13.5), fov: 24, push: 0, drift: [.22, 0, 0] },
    { t: 5.0, move: 'cut', pos: a(4.2, 9.0, 3.0), look: a(1.4, 9.3, -12.9), fov: 25, push: 1.6 },
    { t: 7.4, move: 'glide', dur: .85, pos: a(1.5, 8.75, -9.2), look: a(1.5, 8.75, -12), fov: 26 },
    { t: 7.4, move: 'cut', pos: b(.2, 1.4, 3.2), look: b(.3, 1.05, -2.4), fov: 34, push: -1.15, drift: [.06, 0, 0] },
    { t: 9.0, move: 'cut', pos: b(.04, 1.2, -1.2), look: b(.14, 1.0, -2.55), fov: 28, push: -1.3 },
    { t: 10.2, move: 'cut', pos: b(-1.3, 1.25, 1.0), look: b(-.45, 1.05, -2.2), fov: 33, push: 1.4 },
    { t: 11.8, move: 'cut', pos: b(-.75, 3.5, -2.25), look: b(-.9, 3.55, -4), fov: 30, push: 2.2 },
    { t: 13.0, move: 'cut', pos: b(-.22, 1.27, -1.02), look: b(.92, 1.0, -2.72), fov: 28, push: -1.1, drift: [.03, 0, 0] },
    { t: 14.6, move: 'cut', pos: b(2.3, 2.75, -.6), look: b(2.5, 2.85, -4.0), fov: 34, push: 1.3 },
    { t: 15.8, move: 'cut', pos: b(-.8, 1.6, 5.4), look: b(-1.9, 1.2, -2.4), fov: 40, push: 0, drift: [-.08, 0, 0] },
    { t: 17.3, move: 'cut', pos: b(-2.55, 1.55, .55), look: b(-3.25, 1.45, -1.25), fov: 31, push: 1.6 },
    { t: 18.9, move: 'cut', pos: b(-1.2, 1.5, 4.2), look: b(-2.3, 1.2, -1.6), fov: 38, push: -1.4 },
    { t: 20.0, move: 'cut', pos: b(.3, 1.12, .55), look: b(-.55, 1.08, -2.15), fov: 30, push: 0, drift: [.05, 0, 0] },
    { t: 22.4, move: 'cut', pos: c(0, 0, 12), look: c(0, -.2, -8), fov: 46, push: 0, drift: [.1, .02, 0] },
    { t: 27.6, move: 'cut', pos: c(.4, .2, 8.6), look: c(.3, .1, -8), fov: 46, push: 1.2 },
    { t: 30.4, move: 'cut', pos: a(0, 6.2, 19), look: a(0, 7.9, -12), fov: 42, push: -1.05, drift: [.1, .04, 0] },
    { t: 35.5, move: 'cut', pos: a(-1.6, 9.0, 3.2), look: a(1.9, 8.8, -11.45), fov: 25, push: 1.3 },
    { t: 39.9, move: 'glide', dur: 1.6, pos: a(1.8, 8.75, -8.6), look: a(1.7, 8.75, -12), fov: 30 },
  ], { fps: FPS });
  W.path.kick(19.15, .7);

  // sound cues (the mix reads these)
  CUES.push({ t: 3.0, s: 'cut' }, { t: 6.6, s: 'whoosh' }, { t: 7.4, s: 'room' }, { t: 8.7, s: 'pop' }, { t: 9.25, s: 'pop' }, { t: 9.8, s: 'pop' },
    { t: 10.5, s: 'strum' }, { t: 11.0, s: 'strum' }, { t: 11.3, s: 'strum' }, { t: 11.9, s: 'strum' }, { t: 12.2, s: 'strum' }, { t: 12.5, s: 'strum' },
    { t: 11.8, s: 'ticks' }, { t: 13.3, s: 'kana' }, { t: 13.7, s: 'kana' }, { t: 14.1, s: 'kana' }, { t: 14.6, s: 'shimmer' },
    { t: 15.8, s: 'whoosh2' }, { t: 16.0, s: 'door' }, { t: 16.75, s: 'yawn' }, { t: 17.3, s: 'sting' }, { t: 19.0, s: 'crash' }, { t: 22.4, s: 'whoosh' }, { t: 23.0, s: 'tick' },
    { t: 27.6, s: 'sting' }, { t: 29.3, s: 'hit' }, { t: 30.4, s: 'whoosh2' }, { t: 31.2, s: 'boom' }, { t: 35.5, s: 'cut' }, { t: 38.2, s: 'whoosh' });
  CUES.push(...barCues(TIGHT));
  ctx.W = W;
}

// what a character holds is drawn inside his own card (so it shares his rim and depth): W[key] = a held thing or null (props.js)
const extraFor = key => (g, J, tx, ty, px, sil, when) => drawHeld(W[key], g, J, tx, ty, px, sil, when);
const ME = { x: -.62, z: -2.15 };          // where the hero sits in the room
const ROMAJI = ['a', 'i', 'u', 'e', 'o', 'ka', 'ki', 'ku', 'sa', 'shi', 'nichi', 'hon', 'go'];

const blinkAt = (t, seed) => { const p = 2.6 + (seed % 3) * .7, x = (t + seed * .37) % p; return x < .12 ? 1 - Math.abs(x - .06) / .06 : 0; };

export function frame(t, ctx) {
  const { cam } = ctx, s = shotAt(t), name = SH[s][1];
  W.A.visible = EXT.includes(name); W.B.visible = ROOMS.includes(name); W.C.visible = name === 'kart' || name === 'kart2';
  const look = { bars: BARS.rest, tight: tightAt(t, TIGHT, FPS), vignette: .58, vigSize: 1, grain: .022, bloom: .6, bloomAt: .8, sat: .9, contrast: 1.0, lift: [.045, .038, .062] };
  W.path.apply(cam, t);

  // ---- exterior
  if (W.A.visible) {
    const dawn = name === 'baslik' || name === 'son' ? 1 : 0;
    W.skyD.material.opacity = dawn; W.moon.visible = W.moonG.visible = !dawn;
    W.sun.material.opacity = dawn * (.75 + .25 * ramp(t, 30.4, 36)); W.sun.position.y = 30 + 16 * ramp(t, 30.4, 40);
    W.rays.material.opacity = dawn * .3; W.rays.rotation.z = t * .02; W.rays.position.y = W.sun.position.y;
    W.birds.material.opacity = dawn; W.birds.position.x = -22 + (t - 30.4) * 8;
    tintGroup(W.A, dawn ? DAWN_EXT : NIGHT_EXT);
    Sk.update(W, t, name, cam);
    const P0 = W.dust0, p = W.dust.geometry.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) { p[i] = P0[i] + Math.sin(t * .3 + i) * .6 + t * .15; p[i + 1] = P0[i + 1] + Math.sin(t * .23 + i * .7) * .5; }
    W.dust.geometry.attributes.position.needsUpdate = true;
    const L = { dis: { focus: 28.5, coc: 6, range: 12, nearK: 1.3, sat: .76 }, pencereler: { focus: 16.5, coc: 10, range: 3.5, nearK: 2, sat: .76 }, cephe: { focus: 16.2, coc: 10, range: 3, nearK: 2, sat: .76 },
      baslik: { focus: 31.5, coc: 6, range: 14, nearK: 1.3, sat: .8, tint: [1.02, .98, .96] }, son: { focus: 15.1, coc: 10, range: 3.5, nearK: 2, sat: .8, tint: [1.02, .98, .96] } };
    Object.assign(look, L[name]);
    if (name === 'cephe' || name === 'son') {
      const hero = name === 'son' ? new THREE.Vector3(1.9, 9.0, -11.45) : new THREE.Vector3(1.3, 8.6, -12.85), fwd = cam.getWorldDirection(new THREE.Vector3());
      const d = Math.max(1.5, hero.sub(cam.position).dot(fwd)); look.range *= Math.max(.25, d / look.focus); look.focus = d;
    }
    if (name === 'cephe') look.flash = .55 * ramp(t, 7.05, 7.4);           // whoosh into the window
    if (name === 'son') look.fade = ramp(t, 39.45, 40);
  }

  // ---- room
  if (W.B.visible) {
    const day = DAY.includes(name) ? 1 : name === 'gokyuzu' ? smoother(ramp(t, 14.7, 15.75)) : 0;
    tintGroup(W.B, NIGHT_IN.clone().lerp(DAWN, day));
    const ct = new THREE.Color('#ffffff').lerp(NIGHT_IN, .35 * (1 - day));       // people: lit, a little cooler at night
    W.me.mesh.material.color.copy(ct); W.pal.mesh.material.color.copy(ct);
    W.rSkyD.material.opacity = day; W.rSun.material.opacity = day; W.rSun.position.y = -1 + 7 * day;
    W.rMoon.position.y = 9 - 9 * day; W.rMoon.visible = day < .98;
    const lk = name === 'japonca' ? .68 : 1;                // the laptop shot looks straight into the lamp's pool on the wall
    W.lampGlow.material.opacity = .48 * (1 - day) * lk; W.lampPool.material.opacity = (.95 * (1 - day) + .1) * lk;
    W.moonShaft.material.opacity = .35 * (1 - day); W.sunShaft.material.opacity = .6 * day;
    const mins = clockMins(t), key = Math.round(mins * 4);
    if (key !== W.clockTime) { W.clockTime = key; const P2 = W.clock.userData.paint; P2.g.clearRect(0, 0, P2.w, P2.h); Rm.clockFace(P2.g, P2.w, P2.h, Math.floor(mins / 60), mins % 60); P2.tex.needsUpdate = true; }
    drawStack(t);
    drawLaptop(t, name, day);
    W.mugM.visible = !DAY.includes(name);                    // by day the mug is in his hand
    drawNotes(t, name === 'gitar');
    // the tower stands until 19.0, then rains on the friend
    const towerOn = DAY.includes(name);
    for (const b of W.tower) {
      b.m.visible = towerOn;
      const tf = t - 19.0 - b.delay;
      if (tf <= 0 || !towerOn) { b.m.position.set(b.x0, b.y0, -1.55); b.m.rotation.z = 0; continue; }
      const tl = Math.sqrt(Math.max(0, (b.y0 - b.th / 2) / 4.9)), land = tf >= tl;
      b.m.position.set(b.x0 + b.vx * Math.min(tf, tl), Math.max(b.th / 2 + b.rest, b.y0 - 4.9 * tf * tf), -1.55 + b.dz * Math.min(tf, tl));
      b.m.rotation.z = land ? b.restRot : b.spin * tf;
    }
    // ME
    // Hands are placed by reach: the prop says where they go (props.js).
    const legs = [[0, 0], [6, -4]];
    if (name === 'oda' || name === 'yigin') {
      const flick = Math.min(1, [8.7, 9.25, 9.8].map(x => Math.exp(-Math.pow((t - x) / .14, 2))).reduce((a, b) => a + b));
      const a = readPose({ sit: 1, lean: 7 + flick * 2, legs, head: -8 }, flick);
      W.held = t < 9.95 ? a.held : null;
      W.me.set(a.pose, { look: .7, expr: flick > .4 ? 'grin' : 'smile', blink: blinkAt(t, 1) });
    } else if (name === 'gitar' || name === 'saat') {
      const st = Math.min(1, [10.5, 11.0, 11.3, 11.9, 12.2, 12.5].map(x => Math.exp(-Math.pow((t - x) / .09, 2))).reduce((a, b) => a + b));
      const chord = smoother(ramp(t, 11.1, 11.26)) - .6 * smoother(ramp(t, 12.0, 12.16));
      const a = guitarPose({ sit: 1, lean: 3, legs: [[0, 0], [8, -6]], head: 4 + Math.sin(t * 6) * 3 }, st, chord);
      W.held = a.held;
      W.me.set(a.pose, { look: .5, expr: 'happy', blink: 0 });
    } else if (name === 'japonca' || name === 'gokyuzu') {
      W.held = null;
      W.me.set({ sit: 1, lean: 9, legs, arms: [[62, 38], [52, 50]], head: -4 }, { look: .7, expr: 'smile', blink: blinkAt(t, 2) });
    } else {
      // dawn: leaning back with the mug. He glances over his shoulder at the door, answers, then takes one sip (21.55 s).
      const base = { sit: 1, lean: -4, legs: [[-2, 26], [5, -3]], head: 3 }, Jb = joints(base);
      const sipAt = name === 'yakin' ? 21.55 : null;
      let look = lerp(.5, -.45, smoother(ramp(t, 16.2, 16.5)));
      if (name === 'yakin') look = lerp(-.4, .15, smoother(ramp(t, 20.2, 20.5)));
      const a = mugPose(base, look, t, sipAt, { other: [Jb.hip[0] + .6, Jb.hip[1] + .13] });
      look = lerp(look, .72, a.k);
      const talk = t > 20.4 && t < 21.05 && Math.sin(t * 38) > 0, shock = name === 'kule' && t > 19.05 && t < 19.75;
      W.held = a.held;
      W.me.set(a.pose, { look, expr: a.k > .45 ? 'happy' : talk ? 'o' : shock ? 'surprised' : name === 'yakin' && t > 20.3 ? 'smug' : 'smile', blink: blinkAt(t, 3) });
    }
    // PAL: the door opens at 16.0, he walks out yawning, freezes, books rain on him
    W.pal.mesh.visible = DAY.includes(name);
    W.doorPiv.rotation.y = DAY.includes(name) ? -1.5 * smoother(ramp(t, 15.95, 16.5)) : 0;
    if (W.pal.mesh.visible) {
      const wk = ramp(t, 16.15, 16.85), x = lerp(-4.8, -3.25, smoother(wk));
      const yawn = Math.exp(-Math.pow((t - 16.95) / .3, 2)), froze = t > 17.2;
      let pose = { ...walk(t * 1.7, wk < 1 ? 1 : 0) }, face = { look: .5, expr: 'tired', blink: 0 };
      if (wk >= 1) { pose = { arms: [[150 * yawn, 30], [-150 * yawn, -30]], legs: [[4, 0], [-4, 0]], lean: -4 * yawn }; face = { look: .4, expr: yawn > .3 ? 'yawn' : 'tired' }; }
      if (froze) {
        const k = smoother(ramp(t, 17.2, 17.32)), talk = t > 17.45 && t < 19.4 && Math.sin(t * 34) > -.2;
        pose = { arms: [[30 * k, 40], [-20, -20]], legs: [[4, 0], [-4, 0]], lean: -7 * k, hipY: .05 * k };
        face = { look: .55, expr: talk ? 'surprised' : 'surprised', blink: 0 };
        if (t > 19.05) { const c = smoother(ramp(t, 19.05, 19.2)); pose = { arms: [[150 * c, 70 * c], [-150 * c, -70 * c]], legs: [[8, 0], [-8, 0]], lean: -3, hipY: -.1 * c, sit: .15 * c }; face = { look: .2, expr: t > 19.6 ? 'tired' : 'surprised' }; }
      }
      W.pal.at(x, 0, -1.25).set(pose, face);
    }
    const dawnLook = { tint: [1.04, 1, .95], sat: .92 };
    const L = { oda: { focus: 5.7, coc: 12, range: 3.5, sat: .82 }, yigin: { focus: 1.4, coc: 16, range: .7, nearK: 3 }, gitar: { focus: 3.4, coc: 14, range: 2.2, sat: .82 },
      saat: { focus: 1.75, coc: 14, range: 1.0, sat: .72 }, japonca: { focus: 2.12, coc: 18, range: 1.0, nearK: 3 }, gokyuzu: { focus: 3.4, coc: 12, range: 2 },
      safak: { focus: 7.4, coc: 10, range: 4, ...dawnLook }, arkadas: { focus: 1.95, coc: 16, range: 1.2, ...dawnLook }, kule: { focus: 5.8, coc: 10, range: 3.5, ...dawnLook },
      yakin: { focus: 2.85, coc: 16, range: 1.5, ...dawnLook, sat: 1.0 } };
    Object.assign(look, L[name]);
    if (name === 'gokyuzu') look.flash = .35 * Math.exp(-Math.pow((t - 15.75) / .08, 2));
    const P0 = W.rdust0, p = W.rdust.geometry.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) { p[i] = P0[i] + Math.sin(t * .2 + i) * .25; p[i + 1] = P0[i + 1] + Math.sin(t * .17 + i * .5) * .2 + t * .01; }
    W.rdust.geometry.attributes.position.needsUpdate = true;
  }

  // ---- number card
  if (W.C.visible) { drawGrid(t); drawLines(t); Object.assign(look, { coc: 0, vignette: .7, bloomAt: .7, bloom: .8 }); }
  return look;
}
const clockMins = t => 3 * 60 + 47 + 153 * smoother(ramp(t, 7.4, 15.8)) + (t > 15.8 ? (t - 15.8) * .4 : 0);

// ------------------------------------------------------------------ dynamic cards
const POPS = [8.7, 9.25, 9.8];
function drawStack(t) {
  const P2 = W.stack.userData.paint, g = P2.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, P2.w, P2.h);
  const n = POPS.filter(x => t > x).length + (t > 15.8 ? 4 : 0);
  const R = rng(3); let y = P2.h;
  for (let i = 0; i < n; i++) { const bh = P2.h * (.095 + R() * .03), bw = P2.w * (.52 + R() * .16), x = (P2.w - bw) / 2 + (R() - .5) * P2.w * .08; y -= bh;
    const tp = POPS[i] ?? -9, drop = i < 3 ? (1 - smoother(ramp(t, tp, tp + .14))) * P2.h * .35 : 0;
    g.save(); g.translate(x, y - drop); Rm.book(g, bw, bh, Rm.BOOKC[(i * 3 + 1) % Rm.BOOKC.length], i + 1); g.restore(); }
  P2.tex.needsUpdate = true;
}
// the laptop's screen: a language app showing one kana card at a time. Lit all night, asleep by day.
function drawLaptop(t, name, day) {
  const P2 = W.laptop.userData.paint, g = P2.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, P2.w, P2.h);
  const on = day < .5, study = name === 'japonca', since = Math.max(0, t - 13.25);
  const i = study ? Math.floor(since / .4) % W.kana.length : 0;
  Rm.laptopScreen(g, P2.w, P2.h, { on, kana: W.kana[i], romaji: ROMAJI[i], prog: (i + 1) / 13, count: `${i + 1} / 13`, pop: study ? Math.exp(-(since % .4) / .07) : 0 });
  P2.tex.needsUpdate = true;
  W.laptop.material.color.setScalar(on ? .68 : .62); W.laptopGlow.material.opacity = on ? .2 : 0;
}
function drawNotes(t, on) {
  const P2 = W.notes.userData.paint, g = P2.g, w = P2.w, h = P2.h; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
  if (on) for (const [t0, x] of [[10.5, .3], [11.3, .5], [11.9, .4], [12.5, .62]]) {
    const a = t - t0; if (a < 0 || a > 1.6) continue;
    g.globalAlpha = Math.min(1, a * 5) * (1 - a / 1.6); g.fillStyle = '#fff3dc'; g.font = `700 ${h * .2}px 'Segoe UI Symbol'`;
    g.fillText(a > .8 ? '♫' : '♪', w * (x + a * .1), h * (.85 - a * .45));
  }
  g.globalAlpha = 1; P2.tex.needsUpdate = true;
}
// 80 figures, one per year of an 80-year life; 27 go to sleep; then all wake for "Senin için? Sıfır."
function drawGrid(t) {
  const P2 = W.grid.userData.paint, g = P2.g, w = P2.w, h = P2.h; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
  const cols = 16, rows = 5, cw = w / (cols + 1), ch = h * .135, x0 = cw, y0 = h * .1;
  const R = rng(14), sleepers = new Set(); while (sleepers.size < 27) sleepers.add(Math.floor(R() * 80));
  const wake = ramp(t, 27.9, 28.5), sleepK = ramp(t, 24.3, 26.6);
  for (let i = 0; i < 80; i++) {
    const r = Math.floor(i / cols), c = i % cols, x = x0 + c * cw, y = y0 + r * ch * 1.18;
    const app = smoother(ramp(t, 22.7 + i * .012, 23.0 + i * .012)); if (app <= 0) continue;
    const order = [...sleepers].indexOf(i), sl = sleepers.has(i) ? clamp01(sleepK * 27 - order) * (1 - wake) : 0;
    g.save(); g.translate(x, y + ch * .5 + (1 - app) * ch * .4); g.globalAlpha = app;
    const s = ch * .9;
    if (sl > .5) {   // lying, blue, with a z
      g.fillStyle = '#5a6fb0'; g.beginPath(); g.arc(-s * .35, s * .32, s * .14, 0, 7); g.fill(); g.fillRect(-s * .22, s * .28, s * .6, s * .08);
      g.fillStyle = '#9fb3ff'; g.font = `900 ${s * .3}px 'Segoe UI Black'`; g.fillText('z', s * .1, s * .05 - Math.sin(t * 3 + i) * s * .05);
    } else {
      const pop = Math.exp(-Math.pow((t - 28.2 - (i % 7) * .03) / .12, 2)) * (sleepers.has(i) ? 1 : 0);
      g.translate(0, -pop * s * .25);
      g.fillStyle = '#d6d1c7'; g.beginPath(); g.arc(0, -s * .32, s * .15, 0, 7); g.fill();
      g.strokeStyle = '#d6d1c7'; g.lineWidth = s * .07; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -s * .2); g.lineTo(0, s * .12); g.moveTo(-s * .14, s * .42); g.lineTo(0, s * .12); g.lineTo(s * .14, s * .42); g.moveTo(-s * .16, -s * .02); g.lineTo(0, -s * .12); g.lineTo(s * .16, -s * .02); g.stroke();
    }
    g.restore();
  }
  // axis
  g.globalAlpha = ramp(t, 22.6, 23.2); g.fillStyle = '#e9d9b0'; g.fillRect(x0 - cw * .5, h * .9, cw * cols, h * .006);
  g.font = `700 ${h * .04}px Bahnschrift`; g.textAlign = 'center';
  for (const [k, lab] of [[0, '0'], [8, '40'], [16, '80 YIL']]) g.fillText(lab, x0 - cw * .5 + k * cw, h * .96);
  g.globalAlpha = 1; P2.tex.needsUpdate = true;
}
function drawLines(t) {
  const P2 = W.lines.userData.paint, g = P2.g, w = P2.w, h = P2.h; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
  const R = rng(6); g.strokeStyle = 'rgba(170,185,230,.35)'; g.lineWidth = 2;
  for (let i = 0; i < 46; i++) { const y = R() * h, sp = 40 + R() * 90, L = 60 + R() * 70, x = ((R() * w + t * sp) % (w + L)) - L; g.beginPath(); g.moveTo(x, y); g.lineTo(x + L, y); g.stroke(); }
  P2.tex.needsUpdate = true;
}

// ------------------------------------------------------------------ 2D overlay: HUD clock, numbers, title
const glowText = (g, txt, x, y, size, col = '#ffb45a', blur = 26, weight = 900, font = "'Segoe UI Black'", a = 1) => {
  g.save(); g.globalAlpha = a; g.font = `${weight} ${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.shadowColor = col; g.shadowBlur = blur; g.fillStyle = col; g.lineJoin = 'round'; g.lineWidth = size * .07; g.strokeStyle = col;
  g.strokeText(txt, x, y); g.fillText(txt, x, y); g.shadowBlur = 0; g.fillStyle = mix(col, '#ffffff', .3); g.fillText(txt, x, y); g.restore();
};
export function overlay(g, t, ctx, look) {
  const s = shotAt(t), name = SH[s][1];
  // HUD clock (top right) from the first shot to the dawn
  if (t < 20.0 && name !== 'saat') {
    const mins = clockMins(t);
    const a = ramp(t, .4, .9);
    const hh = String(Math.floor(mins / 60)).padStart(2, '0'), mm = String(Math.floor(mins % 60)).padStart(2, '0');
    const dy = (BARS.tight - BARS.rest) * (look?.tight ?? 0);       // the clock rides down with the bar
    g.save(); g.globalAlpha = a; g.translate(1700, 150 + dy);
    const kT = look?.tight ?? 0, hudC = tightColor('#f2c27e', kT), hudT = tightColor('#ffb45a', kT);                 // the HUD takes the cold grade too
    g.strokeStyle = hudC; g.lineWidth = 5; g.fillStyle = 'rgba(16,12,30,.75)'; g.beginPath(); g.arc(0, 0, 52, 0, 7); g.fill(); g.stroke();
    for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; g.beginPath(); g.moveTo(Math.sin(an) * 40, -Math.cos(an) * 40); g.lineTo(Math.sin(an) * 47, -Math.cos(an) * 47); g.stroke(); }
    const ha = ((mins / 60) % 12) / 12 * Math.PI * 2, ma = (mins % 60) / 60 * Math.PI * 2;
    g.lineCap = 'round'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(ha) * 24, -Math.cos(ha) * 24); g.stroke();
    g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(ma) * 36, -Math.cos(ma) * 36); g.stroke();
    g.restore();
    glowText(g, `${hh}:${mm}`, 1700, 262 + dy, 58, hudT, 22, 900, "'Segoe UI Black'", a);
  }
  // number card captions
  if (name === 'kart' || name === 'kart2') {
    const a1 = ramp(t, 22.8, 23.3) * (1 - ramp(t, 27.5, 27.8));
    if (a1 > 0) glowText(g, '80 YILLIK ÖMÜR', 960, 190, 50, '#e9d9b0', 14, 900, "'Segoe UI Black'", a1);
    const k = ramp(t, 24.3, 26.6), wake = ramp(t, 27.9, 28.7);
    const n = Math.round(27 * k * (1 - wake));
    if (k > 0) glowText(g, `${n} YIL UYKU`, 960, 945, 70, wake > .5 ? '#ffb45a' : '#9fb3ff', 30, 900, "'Segoe UI Black'", Math.min(1, k * 3));
    const z = ramp(t, 29.25, 29.45);
    if (z > 0) { const sc = 1 + .25 * (1 - z); g.save(); g.translate(960, 600); g.scale(sc, sc); g.fillStyle = 'rgba(7,10,24,.6)'; g.fillRect(-500, -260, 1000, 380); glowText(g, 'SIFIR', 0, 70, 230, '#ffb45a', 50, 900, "'Segoe UI Black'", z); g.restore(); }
  }
  // the title over the dawn street
  if (name === 'baslik') {
    const a = smoother(ramp(t, 31.0, 31.8)) * (1 - ramp(t, 35.1, 35.5));
    if (a > 0) {
      const sp = 1 - smoother(ramp(t, 31.0, 32.2));
      g.save(); g.globalAlpha = a; g.letterSpacing = `${6 + sp * 18}px`;
      glowText(g, 'YA HİÇ UYUMAN', 960, 205, 64, '#f6e7cf', 16);
      g.letterSpacing = `${4 + sp * 14}px`;
      glowText(g, 'GEREKMESEYDİ?', 960, 325, 118, '#ffb04f', 36);
      g.globalAlpha = a * .8; g.fillStyle = '#f6e7cf'; g.fillRect(960 - 330 * a, 362, 660 * a, 3);
      g.letterSpacing = '8px'; g.font = "700 30px Bahnschrift"; g.textAlign = 'center'; g.fillText('BİR ÇÖP ADAM HİKÂYESİ', 960, 410);
      g.restore();
    }
  }
}
