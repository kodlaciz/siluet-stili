// room.js : painters for the flat (room) set: wall with a window hole, floor boards, desk, lamp, clock, shelf, door...
import { rng, vgrad } from '/engine/src/layer.js';

// back wall, 12 x 5 m, window hole at x 1.4..3.6, y 1.5..4.1 (metres, origin bottom-left = -6, 0)
export const ROOM = { W: 12, H: 5, win: [1.4, 3.6, 1.5, 4.1], door: [-5.4, -4.2, 0, 2.3] };
export function wall(g, w, h) {
  const s = w / ROOM.W, X = x => (x + ROOM.W / 2) * s, Y = y => h - y * s;
  g.fillStyle = vgrad(g, 0, 0, h, [[0, '#666278'], [.7, '#605b70'], [1, '#544f63']]); g.fillRect(0, 0, w, h);
  // wallpaper stripes, very soft
  for (let x = 0; x < w; x += .5 * s) { g.fillStyle = 'rgba(255,255,255,.025)'; g.fillRect(x, 0, .22 * s, h); }
  // skirting + cornice
  g.fillStyle = '#3f3254'; g.fillRect(0, Y(.22), w, .22 * s); g.fillStyle = '#4c3d63'; g.fillRect(0, 0, w, .14 * s);
  // window: frame, sill, then cut the hole
  const [x0, x1, y0, y1] = ROOM.win;
  g.fillStyle = '#2a2036'; g.fillRect(X(x0) - .14 * s, Y(y1) - .14 * s, (x1 - x0 + .28) * s, (y1 - y0 + .28) * s);
  g.fillStyle = '#4a3a5e'; g.fillRect(X(x0) - .3 * s, Y(y0) - .02 * s, (x1 - x0 + .6) * s, .16 * s);
  g.clearRect(X(x0), Y(y1), (x1 - x0) * s, (y1 - y0) * s);
  g.fillStyle = '#2a2036'; g.fillRect(X((x0 + x1) / 2) - .05 * s, Y(y1), .1 * s, (y1 - y0) * s); g.fillRect(X(x0), Y(y0 + (y1 - y0) * .62), (x1 - x0) * s, .08 * s);
  // curtains
  g.fillStyle = '#3a6f86';
  g.beginPath(); g.moveTo(X(x0 - .45), Y(y1 + .25)); g.lineTo(X(x0 + .15), Y(y1 + .25)); g.quadraticCurveTo(X(x0 - .05), Y((y0 + y1) / 2), X(x0 + .1), Y(y0 - .3)); g.lineTo(X(x0 - .5), Y(y0 - .3)); g.fill();
  g.beginPath(); g.moveTo(X(x1 + .45), Y(y1 + .25)); g.lineTo(X(x1 - .15), Y(y1 + .25)); g.quadraticCurveTo(X(x1 + .05), Y((y0 + y1) / 2), X(x1 - .1), Y(y0 - .3)); g.lineTo(X(x1 + .5), Y(y0 - .3)); g.fill();
  g.fillStyle = '#2a2036'; g.fillRect(X(x0 - .6), Y(y1 + .3), (x1 - x0 + 1.2) * s, .06 * s);
  // door frame (the door itself is a separate card that swings)
  const [d0, d1, , dh] = ROOM.door;
  g.fillStyle = '#2a2036'; g.fillRect(X(d0) - .1 * s, Y(dh) - .1 * s, (d1 - d0 + .2) * s, (dh + .1) * s);
  g.fillStyle = '#1a1424'; g.fillRect(X(d0), Y(dh), (d1 - d0) * s, dh * s);
  // poster, shelf with plant and a frame
  g.fillStyle = '#2a2036'; g.fillRect(X(-2.9), Y(3.6), 1.2 * s, 1.6 * s);
  g.fillStyle = '#e6845a'; g.fillRect(X(-2.82), Y(3.52), 1.04 * s, 1.44 * s);
  g.fillStyle = '#f3d29a'; g.beginPath(); g.arc(X(-2.3), Y(2.9), .28 * s, 0, 7); g.fill();
  g.fillStyle = '#2f2346'; g.beginPath(); g.moveTo(X(-2.82), Y(2.08)); g.lineTo(X(-2.5), Y(2.7)); g.lineTo(X(-2.2), Y(2.35)); g.lineTo(X(-1.78), Y(2.9)); g.lineTo(X(-1.78), Y(2.08)); g.fill();
  g.fillStyle = '#3f3254'; g.fillRect(X(4.1), Y(2.75), 1.5 * s, .08 * s);
  g.fillStyle = '#c96a4a'; g.fillRect(X(4.3), Y(3.05), .32 * s, .3 * s);
  g.fillStyle = '#4f9a6e'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(X(4.46 + Math.cos(i) * .2), Y(3.2 + Math.sin(i * 2) * .1 + .1), .16 * s, .06 * s, i, 0, 7); g.fill(); }
  g.fillStyle = '#e9dcc4'; g.fillRect(X(4.9), Y(3.15), .5 * s, .4 * s); g.fillStyle = '#3a6f86'; g.fillRect(X(4.95), Y(3.1), .4 * s, .3 * s);
}
export function floor(g, w, h) {
  g.fillStyle = '#4c3747'; g.fillRect(0, 0, w, h);
  const R = rng(4), bw = w / 26;
  for (let i = 0; i < 26; i++) {
    g.fillStyle = `rgba(255,220,200,${.02 + R() * .04})`; g.fillRect(i * bw, 0, bw, h);
    g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(i * bw, 0, 3, h);
    for (let y = R() * h * .3; y < h; y += h * (.25 + R() * .3)) g.fillRect(i * bw, y, bw, 3);
  }
  // rug
  g.fillStyle = '#2f6d74'; g.beginPath(); g.ellipse(w * .5, h * .62, w * .22, h * .2, 0, 0, 7); g.fill();
  g.strokeStyle = '#e9dcc4'; g.lineWidth = 8; g.beginPath(); g.ellipse(w * .5, h * .62, w * .19, h * .17, 0, 0, 7); g.stroke();
}
export function door(g, w, h) {
  g.fillStyle = '#7a5a6e'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#5a3f52'; g.lineWidth = w * .04; g.strokeRect(w * .15, h * .08, w * .7, h * .36); g.strokeRect(w * .15, h * .52, w * .7, h * .4);
  g.fillStyle = '#e8c27a'; g.beginPath(); g.arc(w * .86, h * .52, w * .05, 0, 7); g.fill();
}
// desk seen from the front, 2.6 x 1.0 m card (top surface at 0.8 m). The top itself is deskTop, a card lying flat.
export function desk(g, w, h) {
  const s = w / 2.6, Y = y => h - y * s;
  g.fillStyle = '#4a2e2e'; for (const x of [.07, 2.43]) { g.beginPath(); g.moveTo(x * s, Y(.72)); g.lineTo((x + .1) * s, Y(.72)); g.lineTo((x + .085) * s, h); g.lineTo((x + .015) * s, h); g.fill(); }   // tapered legs
  g.fillStyle = '#573632'; g.fillRect(.04 * s, Y(.72), w - .08 * s, .1 * s);                                    // apron under the top
  g.fillStyle = '#5c3a36'; g.beginPath(); g.roundRect(w - .98 * s, Y(.72), .86 * s, .47 * s, [0, 0, .02 * s, .02 * s]); g.fill();   // drawer block
  for (const y of [.69, .47]) { g.fillStyle = '#4a2e2e'; g.fillRect(w - .94 * s, Y(y), .78 * s, .19 * s); g.fillStyle = '#6a4540'; g.fillRect(w - .93 * s, Y(y - .01), .76 * s, .17 * s);
    g.fillStyle = '#e8c27a'; g.beginPath(); g.roundRect(w - .62 * s, Y(y - .08), .14 * s, .028 * s, .014 * s); g.fill(); }
  g.fillStyle = '#7a4f45'; g.beginPath(); g.roundRect(0, Y(.8), w, .085 * s, .02 * s); g.fill();              // the front edge of the top
  g.fillStyle = 'rgba(255,225,195,.22)'; g.fillRect(.02 * s, Y(.8), w - .04 * s, .018 * s);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(.02 * s, Y(.735), w - .04 * s, .02 * s);
}
// the desk top seen from above, 2.6 x 0.62 m; canvas top = the far edge (by the wall). The lamp stands at the right.
export function deskTop(g, w, h) {
  g.fillStyle = vgrad(g, 0, 0, h, [[0, '#7c5247'], [1, '#8f6150']]); g.fillRect(0, 0, w, h);
  const R = rng(12); g.fillStyle = 'rgba(60,30,24,.1)'; for (let i = 0; i < 26; i++) g.fillRect(R() * w, R() * h, w * (.08 + R() * .25), h * .012);
  const gr = g.createRadialGradient(w * .74, h * .45, 0, w * .74, h * .45, w * .3); gr.addColorStop(0, 'rgba(255,214,150,.5)'); gr.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, 0, w, h * .06);
}
// an arm lamp, 0.55 x 0.75 m: weighted base, two arms with brass joints, a cone shade lit from inside, turned to the left
export function lamp(g, w, h) {
  const ink = '#1d1726';
  g.fillStyle = ink; g.beginPath(); g.ellipse(w * .5, h * .965, w * .24, h * .035, 0, 0, 7); g.fill(); g.fillRect(w * .44, h * .9, w * .12, h * .06);
  g.strokeStyle = ink; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = w * .042;
  g.beginPath(); g.moveTo(w * .5, h * .92); g.lineTo(w * .66, h * .55); g.lineTo(w * .42, h * .25); g.stroke();
  g.fillStyle = '#e8c27a'; for (const [x, y] of [[.66, .55], [.42, .25], [.5, .915]]) { g.beginPath(); g.arc(w * x, h * y, w * .034, 0, 7); g.fill(); }
  g.save(); g.translate(w * .42, h * .25); g.rotate(.62);
  g.fillStyle = ink; g.fillRect(-w * .05, -h * .06, w * .1, h * .05);
  g.beginPath(); g.moveTo(-w * .07, -h * .03); g.lineTo(w * .07, -h * .03); g.lineTo(w * .22, h * .2); g.lineTo(-w * .22, h * .2); g.closePath();
  g.fillStyle = vgrad(g, 0, -h * .03, h * .2, [[0, '#c9783e'], [1, '#f0a85a']]); g.fill();
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.moveTo(-w * .07, -h * .03); g.lineTo(-w * .01, -h * .03); g.lineTo(-w * .05, h * .2); g.lineTo(-w * .22, h * .2); g.fill();
  g.fillStyle = '#fff1c8'; g.beginPath(); g.ellipse(0, h * .2, w * .22, h * .036, 0, 0, 7); g.fill();
  g.restore();
}
// a chair seen from the side; whoever sits on it faces +x. Card 0.9 x 1.0 m. The seat top is CHAIR.seat above the floor
// (the height of a sitting Stick's thighs) and the sitter's hip belongs at x = CHAIR.hip from the card's left edge.
export const CHAIR = { w: .9, h: 1.0, seat: .355, hip: .36 };
export function chair(g, w, h, { wood = '#2f2233', pad = '#5b466b' } = {}) {
  const s = w / CHAIR.w, X = x => x * s, Y = y => h - y * s, S = CHAIR.seat;
  g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = wood; g.lineWidth = .05 * s;
  g.beginPath(); g.moveTo(X(.13), Y(.03)); g.lineTo(X(.2), Y(S - .06)); g.quadraticCurveTo(X(.2), Y(S + .25), X(.115), Y(.9)); g.stroke();   // back leg, bent up into the back post
  g.beginPath(); g.moveTo(X(.66), Y(.03)); g.lineTo(X(.61), Y(S - .06)); g.stroke();                                                        // front leg
  g.lineWidth = .028 * s; g.beginPath(); g.moveTo(X(.155), Y(.16)); g.lineTo(X(.645), Y(.16)); g.stroke();                                    // stretcher
  g.fillStyle = wood; g.beginPath(); g.roundRect(X(.15), Y(S - .04), .54 * s, .05 * s, .02 * s); g.fill();                                   // seat frame
  g.fillStyle = pad; g.beginPath(); g.roundRect(X(.16), Y(S), .51 * s, .058 * s, .028 * s); g.fill();                                        // cushion
  g.fillStyle = 'rgba(255,230,205,.2)'; g.beginPath(); g.roundRect(X(.19), Y(S - .005), .45 * s, .014 * s, .007 * s); g.fill();
  g.save(); g.translate(X(.172), Y(.66)); g.rotate(-.1);                                                                                     // back pad
  g.fillStyle = pad; g.beginPath(); g.roundRect(-.035 * s, -.2 * s, .078 * s, .4 * s, .036 * s); g.fill();
  g.fillStyle = 'rgba(255,230,205,.18)'; g.beginPath(); g.roundRect(.022 * s, -.17 * s, .013 * s, .34 * s, .006 * s); g.fill(); g.restore();
}
// an armchair for the TV watcher, same convention. Card 1.2 x 1.1 m
export const ARMCHAIR = { w: 1.2, h: 1.1, seat: .355, hip: .52 };
export function armchair(g, w, h, col = '#3b3256', hi = '#4d4370') {
  const s = w / ARMCHAIR.w, X = x => x * s, Y = y => h - y * s, S = ARMCHAIR.seat;
  g.fillStyle = col; g.save(); g.translate(X(.3), Y(.63)); g.rotate(-.13); g.beginPath(); g.roundRect(-.13 * s, -.42 * s, .27 * s, .84 * s, .12 * s); g.fill(); g.restore();
  g.beginPath(); g.roundRect(X(.2), Y(S - .02), .82 * s, (S - .08) * s, .06 * s); g.fill();
  g.fillStyle = hi; g.beginPath(); g.roundRect(X(.32), Y(S), .68 * s, .1 * s, .045 * s); g.fill();
  g.fillStyle = 'rgba(255,230,205,.12)'; g.beginPath(); g.roundRect(X(.36), Y(S - .008), .6 * s, .016 * s, .008 * s); g.fill();
  g.fillStyle = '#16111f'; g.fillRect(X(.26), Y(.07), .07 * s, .07 * s); g.fillRect(X(.9), Y(.07), .07 * s, .07 * s);
}
// the laptop, two cards: the screen (0.56 x 0.37 m, standing, lit) and the deck (0.56 x 0.36 m, lying on the desk)
export function laptopScreen(g, w, h, { on = true, kana = 'あ', romaji = 'a', prog = .2, count = '1 / 13', pop = 0 } = {}) {
  g.fillStyle = '#17131f'; g.beginPath(); g.roundRect(0, 0, w, h, w * .035); g.fill();
  g.strokeStyle = 'rgba(190,180,215,.35)'; g.lineWidth = w * .006; g.beginPath(); g.roundRect(w * .004, w * .004, w - w * .008, h - w * .008, w * .032); g.stroke();
  const bx = w * .032, by = w * .034, sw = w - 2 * bx, sh = h - by - w * .05;
  g.save(); g.beginPath(); g.roundRect(bx, by, sw, sh, w * .012); g.clip();
  if (!on) { g.fillStyle = '#231d33'; g.fillRect(bx, by, sw, sh); }
  else {
    g.fillStyle = vgrad(g, 0, by, by + sh, [[0, '#dfe7f8'], [1, '#c2cfee']]); g.fillRect(bx, by, sw, sh);
    g.fillStyle = '#27335f'; g.fillRect(bx, by, sw, sh * .13);                                                              // top bar
    g.fillStyle = '#ff8f6b'; g.beginPath(); g.arc(bx + sw * .04, by + sh * .065, sh * .022, 0, 7); g.fill();
    g.fillStyle = '#ffd27a'; g.beginPath(); g.arc(bx + sw * .075, by + sh * .065, sh * .022, 0, 7); g.fill();
    g.fillStyle = '#e8eeff'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.font = `700 ${sh * .075}px 'Yu Gothic', 'Meiryo', sans-serif`; g.fillText('日本語  ·  1', bx + sw * .5, by + sh * .07);
    g.textAlign = 'right'; g.font = `700 ${sh * .07}px Bahnschrift`; g.fillText(count, bx + sw * .96, by + sh * .07);
    for (const [dx, a] of [[-.33, .35], [.33, .35]]) { g.fillStyle = `rgba(255,255,255,${a})`; g.beginPath(); g.roundRect(bx + sw * (.5 + dx) - sw * .11, by + sh * .3, sw * .22, sh * .42, sw * .02); g.fill(); }   // the cards before and after
    const cw = sw * .36 * (1 + pop * .06), chh = sh * .58 * (1 + pop * .06), cx = bx + sw * .5, cy = by + sh * .5;
    g.fillStyle = 'rgba(30,40,90,.22)'; g.beginPath(); g.roundRect(cx - cw / 2 + sw * .008, cy - chh / 2 + sh * .025, cw, chh, sw * .025); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(cx - cw / 2, cy - chh / 2, cw, chh, sw * .025); g.fill();
    g.fillStyle = '#1d2a5a'; g.textAlign = 'center'; g.font = `700 ${sh * .36}px 'Yu Gothic', 'Meiryo', sans-serif`; g.fillText(kana, cx, cy - sh * .04);
    g.fillStyle = '#2f9e8a'; g.font = `700 ${sh * .1}px Bahnschrift`; g.fillText(romaji, cx, cy + sh * .21);
    g.fillStyle = 'rgba(39,51,95,.2)'; g.beginPath(); g.roundRect(bx + sw * .12, by + sh * .89, sw * .76, sh * .045, sh * .022); g.fill();   // progress
    g.fillStyle = '#36b39b'; g.beginPath(); g.roundRect(bx + sw * .12, by + sh * .89, sw * .76 * prog, sh * .045, sh * .022); g.fill();
  }
  g.fillStyle = 'rgba(255,255,255,.07)'; g.beginPath(); g.moveTo(bx + sw * .55, by); g.lineTo(bx + sw * .8, by); g.lineTo(bx + sw * .5, by + sh); g.lineTo(bx + sw * .25, by + sh); g.fill();   // glare
  g.restore();
  g.fillStyle = '#3a3350'; g.beginPath(); g.arc(w * .5, by * .52, w * .006, 0, 7); g.fill();
}
export function laptopDeck(g, w, h) {              // canvas top = the hinge
  g.fillStyle = vgrad(g, 0, 0, h, [[0, '#4a4358'], [1, '#383244']]); g.beginPath(); g.roundRect(0, 0, w, h, [w * .01, w * .01, w * .04, w * .04]); g.fill();
  g.fillStyle = '#15111d'; g.fillRect(w * .08, 0, w * .84, h * .035);                                                       // hinge
  g.fillStyle = '#1b1624'; g.beginPath(); g.roundRect(w * .055, h * .09, w * .89, h * .5, w * .012); g.fill();
  const rows = 5, cols = 14, kw = w * .89 / cols, kh = h * .5 / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (r === 4 && c > 3 && c < 9) { if (c === 4) { g.fillStyle = '#342e42'; g.beginPath(); g.roundRect(w * .055 + c * kw + kw * .1, h * .09 + r * kh + kh * .12, kw * 5 - kw * .2, kh * .76, kw * .1); g.fill(); } continue; }
    g.fillStyle = '#342e42'; g.beginPath(); g.roundRect(w * .055 + c * kw + kw * .1, h * .09 + r * kh + kh * .12, kw * .8, kh * .76, kw * .1); g.fill();
  }
  g.fillStyle = '#423b52'; g.beginPath(); g.roundRect(w * .34, h * .66, w * .32, h * .28, w * .015); g.fill();
  g.fillStyle = vgrad(g, 0, 0, h * .5, [[0, 'rgba(190,206,255,.34)'], [1, 'rgba(190,206,255,0)']]); g.fillRect(0, 0, w, h * .5);   // the screen's light on the keys
}
export function clockFace(g, w, h, hh, mm) {
  const cx = w / 2, cy = h / 2, r = w * .46;
  g.fillStyle = '#2a2036'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
  g.fillStyle = '#efe4cf'; g.beginPath(); g.arc(cx, cy, r * .86, 0, 7); g.fill();
  g.fillStyle = '#2a2036'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.save(); g.translate(cx + Math.sin(a) * r * .72, cy - Math.cos(a) * r * .72); g.rotate(a); g.fillRect(-r * .025, -r * .07, r * .05, r * .14); g.restore(); }
  const hand = (a, L, lw) => { g.strokeStyle = '#1a1424'; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(a) * L, cy - Math.cos(a) * L); g.stroke(); };
  hand(((hh % 12) + mm / 60) / 12 * Math.PI * 2, r * .45, r * .09); hand(mm / 60 * Math.PI * 2, r * .66, r * .06);
  g.fillStyle = '#e0602f'; g.beginPath(); g.arc(cx, cy, r * .07, 0, 7); g.fill();
}
export const BOOKC = ['#e0602f', '#3a6f86', '#e8c27a', '#7b61c9', '#36b39b', '#c94a5a', '#efe4cf', '#4a6ad0', '#f08a3c', '#5aa66e'];
// a book lying flat: seen from the spine (title block, ribs) or, every third one, from the page side
export function book(g, w, h, c, kind = 0) {
  const r = Math.min(h * .2, w * .03);
  g.fillStyle = c; g.beginPath(); g.roundRect(0, 0, w, h, r); g.fill();
  if (kind % 3 === 2) {
    g.fillStyle = '#f1e7d2'; g.fillRect(w * .02, h * .17, w * .96, h * .66);
    g.strokeStyle = 'rgba(120,96,80,.35)'; g.lineWidth = Math.max(1, h * .03); for (const k of [.36, .5, .64]) { g.beginPath(); g.moveTo(w * .02, h * k); g.lineTo(w * .98, h * k); g.stroke(); }
  } else {
    g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, h * .76, w, h * .24);
    g.fillStyle = 'rgba(255,255,255,.16)'; g.fillRect(0, h * .05, w, h * .12);
    g.fillStyle = 'rgba(255,244,220,.82)'; g.fillRect(w * (.16 + (kind % 2) * .3), h * .32, w * .32, h * .18); g.fillRect(w * (.16 + (kind % 2) * .3), h * .58, w * .18, h * .09);
    g.fillStyle = 'rgba(0,0,0,.28)'; for (const x of [.06, .09, .9, .93]) g.fillRect(w * x, 0, w * .012, h);
  }
  g.strokeStyle = '#1a1424'; g.lineWidth = Math.max(2, h * .06); g.beginPath(); g.roundRect(1, 1, w - 2, h - 2, r); g.stroke();
}
// the mug on the desk (the same mug the hero holds: cream, an orange band)
export function mug(g, w, h, c = '#efe4cf') {
  g.strokeStyle = c; g.lineWidth = w * .11; g.beginPath(); g.arc(w * .72, h * .58, w * .17, -1.4, 1.4); g.stroke();
  g.fillStyle = c; g.beginPath(); g.roundRect(w * .1, h * .22, w * .6, h * .74, [w * .03, w * .03, w * .14, w * .14]); g.fill();
  g.fillStyle = '#e0602f'; g.fillRect(w * .1, h * .5, w * .6, h * .16);
  g.fillStyle = 'rgba(70,40,40,.2)'; g.fillRect(w * .1, h * .22, w * .16, h * .74);
  g.fillStyle = '#fffaf0'; g.beginPath(); g.ellipse(w * .4, h * .22, w * .3, h * .07, 0, 0, 7); g.fill();
  g.fillStyle = '#6b3a24'; g.beginPath(); g.ellipse(w * .4, h * .225, w * .24, h * .04, 0, 0, 7); g.fill();
}
