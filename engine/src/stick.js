// stick.js : silhouette stickmen painted with Canvas 2D on a card that stands in the 3D world.
// Read from the reference frames, side by side with our own stills (v7 pass):
//   * a big round black head on a thin black neck; black stick legs with small shoes; round caps everywhere
//   * a hoodie in one flat colour with a thin black outline: narrow body, sleeves as thick tubes that end in a cuff and
//     a black mitten hand; the hood hangs BEHIND the neck (it does not ring the head); two white drawstrings
//   * a RIM of warm light on the lit side: the whole silhouette repeated behind itself, shifted toward the light
//   * white face marks only: oval eyes, a bold smile stroke; no nose, no pupils unless surprised
// Units: 1 = one head diameter. Origin between the feet, y up, the figure faces +x.
import * as THREE from 'three';
import { paintTex, mix } from './layer.js';

const D = Math.PI / 180;
export const L = { thigh: .95, shin: .95, torso: 1.25, up: .68, fore: .64, neck: .22 };
export const POSE = {
  stand: { lean: 0, head: 0, arms: [[8, 4], [-8, -4]], legs: [[4, 0], [-4, 0]], sit: 0 },
};
export const SEAT = .92;          // height of a seat top under a sitting figure, in head units (hip 1.007 minus half a thigh)

// joints from a pose, in head units
export function joints(p) {
  const sit = p.sit || 0;                                   // 0 standing, 1 sitting on a chair (hip drops, thighs forward)
  const hip = [p.hipX || 0, (L.thigh + L.shin) * (1 - .47 * sit) + (p.hipY || 0)];
  const lean = (p.lean || 0) * D;
  const neck = [hip[0] + Math.sin(lean) * L.torso, hip[1] + Math.cos(lean) * L.torso];
  const head = [neck[0] + Math.sin(lean + (p.head || 0) * D * .3) * (L.neck + .5), neck[1] + Math.cos(lean) * (L.neck + .5)];
  const sh = [neck[0] - Math.sin(lean) * .14, neck[1] - Math.cos(lean) * .14];
  const limb = (o, a1, a2, l1, l2) => {        // angles in degrees from straight down, positive = toward +x (forward)
    const k = [o[0] + Math.sin(a1 * D) * l1, o[1] - Math.cos(a1 * D) * l1];
    const e = [k[0] + Math.sin((a1 + a2) * D) * l2, k[1] - Math.cos((a1 + a2) * D) * l2];
    return [o, k, e];
  };
  const arms = (p.arms || POSE.stand.arms).map(([a, b]) => limb(sh, a + (p.lean || 0), b, L.up, L.fore));
  const legs = (p.legs || POSE.stand.legs).map(([a, b]) => limb(hip, a + sit * 88, b - sit * 88, L.thigh, L.shin));
  return { hip, neck, head, sh, arms, legs, L };
}
// where the mouth is for a face turned by `look` (-1 .. 1)
export const mouthOf = (J, look = .35) => [J.head[0] + look * .25, J.head[1] - .2];
// arm angles [a, b] (the pair used in pose.arms) that put the hand on a target point. bend 1 = elbow down / back.
export function armTo(pose, target, bend = 1) {
  const J = joints({ ...pose, arms: null });
  const dx = target[0] - J.sh[0], dy = target[1] - J.sh[1], l1 = L.up, l2 = L.fore;
  const d = Math.min(l1 + l2 - .002, Math.max(Math.abs(l1 - l2) + .002, Math.hypot(dx, dy)));
  const phi = Math.atan2(dx, -dy);                          // direction to the target, measured like the limb angles
  const al = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)), be = Math.acos((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2));
  return [(phi - bend * al) / D - (pose.lean || 0), bend * (Math.PI - be) / D];
}

export class Stick {
  // opts: height (world units of the whole figure, default 1.75), hood (colour or null = bare stick), hoodDark,
  //       hoodBack (the hood hanging behind the neck), strings, apron (colour), hat ('beanie'|'toque'|'cap'|null), hatColor,
  //       rim (colour), rimDir ([x,y] in screen space, unit), rimW (head units), px (texture px per head unit),
  //       extra(g, J, tx, ty, px, sil, when) : props drawn with the figure; when = 'back' | 'mid' | 'front'
  constructor(parent, opts = {}) {
    this.o = Object.assign({ height: 1.75, hood: '#36b39b', hoodDark: '#1f7f6e', hoodBack: true, strings: true, apron: null, hat: null, hatColor: '#f08a3c',
      rim: '#f6c48a', rimDir: [1, -.35], rimW: .045, px: 150, ink: '#08070b', face: '#fbf6ee', extra: null }, opts);
    const U = 5.2;                                             // canvas covers 5.2 x 5.6 head units (arms can reach up)
    this.U = U; this.VU = 5.6;
    this.P = paintTex(U * this.o.px, this.VU * this.o.px, null);
    this.mask = paintTex(U * this.o.px, this.VU * this.o.px, null, { mip: false });
    const hu = this.o.height / 4.45;                         // world size of one head unit (figure is ~4.45 heads tall)
    this.hu = hu;
    const mat = new THREE.MeshBasicMaterial({ map: this.P.tex, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(U * hu, this.VU * hu), mat);
    this.mesh.geometry.translate(0, this.VU * hu / 2 - .35 * hu, 0);   // origin = feet
    this.mesh.userData.depthMat = new THREE.MeshBasicMaterial({ map: this.P.tex, alphaTest: .5, colorWrite: false, side: THREE.DoubleSide });
    if (this.o.order != null) this.mesh.renderOrder = this.o.order;
    parent.add(this.mesh);
    this.pose = { ...POSE.stand }; this.face = { look: .35, expr: 'smile', blink: 0 };
  }
  set(pose = {}, face = {}) { this.pose = { ...POSE.stand, ...pose }; this.face = { look: .35, expr: 'smile', blink: 0, ...face }; this.draw(); return this; }

  // paints the figure: (1) silhouette into the mask, (2) rim = mask shifted toward the light, tinted, (3) the figure
  draw() {
    const o = this.o, px = o.px, P = this.P, M = this.mask, g = P.g, U = this.U;
    const J = joints(this.pose);
    const tx = x => (x + U / 2) * px, ty = y => (this.VU - .35 - y) * px;   // head units -> canvas px (feet .35 above bottom)
    const pass = (gg, sil) => this._figure(gg, J, tx, ty, px, sil);
    M.g.setTransform(1, 0, 0, 1, 0, 0); M.g.clearRect(0, 0, M.w, M.h); pass(M.g, true);
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, P.w, P.h);
    const rw = o.rimW * px, [dx, dy] = o.rimDir;
    if (rw > 0) {
      g.save(); g.drawImage(M.canvas, dx * rw, dy * rw); g.globalCompositeOperation = 'source-in'; g.fillStyle = o.rim; g.fillRect(0, 0, P.w, P.h); g.restore();
    }
    pass(g, false);
    P.tex.needsUpdate = true;
  }

  _figure(g, J, tx, ty, px, sil) {
    const o = this.o, ink = sil ? '#000' : o.ink, lw = .14 * px, C = c => sil ? '#000' : c, u = px;
    const line = (pts, w, col, cap = 'round') => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = cap; g.lineJoin = 'round'; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(tx(p[0]), ty(p[1])) : g.moveTo(tx(p[0]), ty(p[1]))); g.stroke(); };
    const dot = (p, r, col) => { g.fillStyle = col; g.beginPath(); g.arc(tx(p[0]), ty(p[1]), r * px, 0, 7); g.fill(); };
    const along = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    // a small shoe that stays square to the shin (toe up when the leg swings forward, heel up when it pushes off)
    const shoe = leg => {
      const k = leg[1], e = leg[2], a = Math.max(-1.1, Math.min(1.1, Math.atan2(e[0] - k[0], k[1] - e[1])));
      g.save(); g.translate(tx(e[0]), ty(e[1])); g.rotate(-a); g.fillStyle = ink;
      g.beginPath(); g.moveTo(-.085 * u, .075 * u); g.lineTo(-.085 * u, -.01 * u); g.quadraticCurveTo(-.08 * u, -.075 * u, 0, -.075 * u);
      g.quadraticCurveTo(.17 * u, -.07 * u, .235 * u, .02 * u); g.quadraticCurveTo(.25 * u, .075 * u, .19 * u, .075 * u); g.closePath(); g.fill(); g.restore();
    };
    // a mitten: an oval along the forearm, the thumb on its upper / front side
    const hand = arm => {
      const el = arm[1], h = arm[2], a = Math.atan2(el[1] - h[1], h[0] - el[0]);
      g.save(); g.translate(tx(h[0]), ty(h[1])); g.rotate(a); g.fillStyle = ink;
      g.beginPath(); g.ellipse(.035 * u, 0, .135 * u, .112 * u, 0, 0, 7); g.fill();
      g.beginPath(); g.ellipse(.02 * u, -.1 * u, .07 * u, .05 * u, -.45, 0, 7); g.fill(); g.restore();
    };
    const sleeve = (arm, back) => {
      line(arm, lw, ink); hand(arm);
      if (!o.hood) return;
      const [s, e, h] = arm, col = C(back ? o.hoodDark : o.hood), cuff = sil ? '#000' : back ? mix(o.hoodDark, '#000000', .28) : o.hoodDark;
      dot(s, .185, ink); line([s, e, along(e, h, .9)], .37 * px, ink, 'butt');
      dot(s, .152, col); line([s, e, along(e, h, .8)], .30 * px, col, 'butt');
      line([along(e, h, .745), along(e, h, .925)], .41 * px, ink, 'butt'); line([along(e, h, .765), along(e, h, .905)], .34 * px, cuff, 'butt');
    };
    if (o.extra) o.extra(g, J, tx, ty, px, sil, 'back');
    // back limbs first
    line(J.legs[1], lw, ink); shoe(J.legs[1]);
    sleeve(J.arms[1], true);
    line([J.neck, J.head], lw, ink);                                           // the neck
    if (o.hood) {
      const n = J.neck, h = J.hip, lean = Math.atan2(n[0] - h[0], n[1] - h[1]);
      g.save(); g.translate(tx(h[0]), ty(h[1])); g.rotate(lean);
      const H = L.torso * u, tw = .62 * u, bw = .58 * u, hem = .15 * u;
      if (o.hoodBack) {                                                        // the hood hangs behind the neck
        g.beginPath(); g.moveTo(.06 * u, -H - .09 * u); g.quadraticCurveTo(-.22 * u, -H - .19 * u, -.41 * u, -H + .02 * u);
        g.quadraticCurveTo(-.51 * u, -H + .32 * u, -.34 * u, -H + .47 * u); g.quadraticCurveTo(-.2 * u, -H + .4 * u, -.16 * u, -H + .2 * u); g.closePath();
        g.fillStyle = C(o.hoodDark); g.fill(); g.strokeStyle = ink; g.lineWidth = .055 * u; g.lineJoin = 'round'; g.stroke();
        if (!sil) { g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = .028 * u; g.lineCap = 'round'; g.beginPath(); g.moveTo(-.18 * u, -H - .07 * u); g.quadraticCurveTo(-.37 * u, -H + .08 * u, -.36 * u, -H + .3 * u); g.stroke(); }
      }
      const body = () => { g.beginPath(); g.moveTo(-bw / 2 + .08 * u, hem); g.quadraticCurveTo(-bw / 2, hem, -bw / 2, hem - .08 * u);
        g.lineTo(-tw / 2, -H + .22 * u); g.quadraticCurveTo(-tw / 2, -H - .01 * u, -.13 * u, -H - .05 * u);
        g.lineTo(.13 * u, -H - .05 * u); g.quadraticCurveTo(tw / 2, -H - .01 * u, tw / 2, -H + .22 * u);
        g.lineTo(bw / 2, hem - .08 * u); g.quadraticCurveTo(bw / 2, hem, bw / 2 - .08 * u, hem); g.closePath(); };
      body();
      if (sil) g.fillStyle = '#000';
      else { const gr = g.createLinearGradient(-tw / 2, 0, tw / 2, 0); gr.addColorStop(0, mix(o.hood, o.hoodDark, .85)); gr.addColorStop(.55, o.hood); gr.addColorStop(1, mix(o.hood, '#ffffff', .1)); g.fillStyle = gr; }
      g.fill();
      if (!sil) {
        g.save(); g.clip();
        if (o.apron) { g.fillStyle = o.apron; g.fillRect(-.06 * u, -H + .5 * u, bw, H); g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(-bw, -H + .5 * u, 2 * bw, .045 * u); }
        g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(-bw, hem - .16 * u, 2 * bw, .2 * u);                                  // the hem band
        g.restore();
        g.lineCap = 'round';
        if (!o.apron) { g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = .028 * u; g.beginPath(); g.moveTo(bw / 2 - .03 * u, -.52 * u); g.quadraticCurveTo(.05 * u, -.44 * u, .03 * u, -.06 * u); g.stroke(); }   // pocket seam
        if (o.strings) { g.strokeStyle = o.face; g.fillStyle = o.face; g.globalAlpha = .92; g.lineWidth = .03 * u;
          for (const [x, l] of [[.1, .38], [.2, .3]]) { g.beginPath(); g.moveTo(x * u, -H + .05 * u); g.lineTo(x * u, -H + (.05 + l) * u); g.stroke(); g.beginPath(); g.arc(x * u, -H + (.07 + l) * u, .028 * u, 0, 7); g.fill(); }
          g.globalAlpha = 1; }
      }
      body(); g.strokeStyle = ink; g.lineWidth = .06 * u; g.lineJoin = 'round'; g.stroke();
      g.beginPath(); g.ellipse(.01 * u, -H - .035 * u, .2 * u, .075 * u, 0, 0, 7); g.fillStyle = C(o.hoodDark); g.fill(); g.strokeStyle = ink; g.lineWidth = .045 * u; g.stroke();   // collar
      g.restore();
    } else line([J.hip, J.neck], lw, ink);
    // front leg
    line(J.legs[0], lw, ink); shoe(J.legs[0]);
    if (o.extra) o.extra(g, J, tx, ty, px, sil, 'mid');
    // head and hat
    dot(J.head, .5, ink);
    const hx = tx(J.head[0]), hy = ty(J.head[1]), hc = C(o.hatColor), hd = sil ? '#000' : mix(o.hatColor, '#000000', .2);
    if (o.hat === 'beanie') {
      g.fillStyle = hc; g.beginPath(); g.ellipse(hx, hy - .14 * u, .535 * u, .46 * u, 0, Math.PI, 0); g.closePath(); g.fill();
      g.beginPath(); g.arc(hx - .04 * u, hy - .64 * u, .11 * u, 0, 7); g.fill();
      g.fillStyle = hd; g.beginPath(); g.roundRect(hx - .57 * u, hy - .3 * u, 1.14 * u, .21 * u, .08 * u); g.fill();
      if (!sil) { g.fillStyle = 'rgba(0,0,0,.16)'; for (let i = 0; i < 9; i++) g.fillRect(hx - .5 * u + i * .12 * u, hy - .28 * u, .025 * u, .17 * u); }
    } else if (o.hat === 'toque') {
      g.fillStyle = hc; for (const [x, y, r] of [[-.25, -.8, .25], [.02, -.9, .29], [.27, -.8, .25]]) { g.beginPath(); g.arc(hx + x * u, hy + y * u, r * u, 0, 7); g.fill(); }
      g.beginPath(); g.roundRect(hx - .4 * u, hy - .78 * u, .8 * u, .42 * u, .05 * u); g.fill();
      g.fillStyle = hd; g.beginPath(); g.roundRect(hx - .43 * u, hy - .5 * u, .86 * u, .16 * u, .04 * u); g.fill();
    } else if (o.hat === 'cap') {
      g.fillStyle = hc; g.beginPath(); g.ellipse(hx - .02 * u, hy - .1 * u, .535 * u, .45 * u, 0, Math.PI, 0); g.closePath(); g.fill();
      g.fillStyle = hd; g.beginPath(); g.moveTo(hx + .2 * u, hy - .2 * u); g.quadraticCurveTo(hx + .7 * u, hy - .26 * u, hx + .92 * u, hy - .08 * u); g.quadraticCurveTo(hx + .6 * u, hy - .1 * u, hx + .2 * u, hy - .08 * u); g.closePath(); g.fill();
    }
    sleeve(J.arms[0], false);
    if (o.extra) o.extra(g, J, tx, ty, px, sil, 'front');
    if (!sil) this._face(g, J, tx, ty, px);
  }

  _face(g, J, tx, ty, px) {
    const f = this.face, c = this.o.face, hx = tx(J.head[0]), hy = ty(J.head[1]);
    const look = f.look ?? 0, ex = hx + look * .22 * px, sep = .29 * px * (1 - .32 * Math.abs(look)), ey = hy - .03 * px;
    const bl = 1 - (f.blink || 0);
    g.fillStyle = c; g.strokeStyle = c; g.lineCap = 'round';
    const eye = x => {
      if (f.expr === 'surprised') {
        g.beginPath(); g.arc(x, ey, .115 * px, 0, 7); g.fill(); g.fillStyle = '#000'; g.beginPath(); g.arc(x + look * .03 * px, ey, .048 * px, 0, 7); g.fill(); g.fillStyle = c; return;
      }
      if (f.expr === 'happy' || f.expr === 'yawn' || bl < .15) {        // closed: little arcs
        const up = f.expr === 'happy';
        g.lineWidth = .058 * px; g.beginPath(); g.arc(x, ey + (up ? .045 : -.03) * px, .082 * px, up ? Math.PI * 1.12 : Math.PI * .12, up ? Math.PI * 1.88 : Math.PI * .88); g.stroke(); return;
      }
      const ry = .1 * px * bl * (f.expr === 'tired' ? .55 : 1);
      g.beginPath(); g.ellipse(x, ey + (f.expr === 'tired' ? .03 * px : 0), .068 * px, ry, 0, 0, 7); g.fill();
      if (f.expr === 'smug' || f.expr === 'tired') { g.fillStyle = this.o.ink; g.fillRect(x - .09 * px, ey - .13 * px, .18 * px, .1 * px + (f.expr === 'smug' ? .025 * px : 0)); g.fillStyle = c; }
    };
    eye(ex - sep / 2); eye(ex + sep / 2);
    const mx = ex + look * .03 * px, my = hy + .2 * px;
    g.lineWidth = .06 * px;
    if (f.expr === 'surprised' || f.expr === 'o') { g.lineWidth = .05 * px; g.beginPath(); g.ellipse(mx, my + .02 * px, .065 * px, .085 * px, 0, 0, 7); g.stroke(); }
    else if (f.expr === 'yawn') { g.beginPath(); g.ellipse(mx, my + .03 * px, .105 * px, .15 * px, 0, 0, 7); g.fill(); g.fillStyle = '#3a1418'; g.beginPath(); g.ellipse(mx, my + .05 * px, .068 * px, .1 * px, 0, 0, 7); g.fill(); }
    else if (f.expr === 'neutral' || f.expr === 'tired') { g.beginPath(); g.moveTo(mx - .09 * px, my); g.lineTo(mx + .09 * px, my); g.stroke(); }
    else if (f.expr === 'sip') { g.beginPath(); g.arc(mx, my, .03 * px, 0, 7); g.fill(); }
    else {                                                              // a smile, lifted on the side the face turns to
      const w = f.expr === 'grin' ? .21 : .16;
      g.save(); g.translate(mx, my - .02 * px); g.rotate(-look * .28); g.beginPath(); g.arc(0, -.1 * px, w * px, Math.PI * .2, Math.PI * .8); g.stroke(); g.restore();
    }
  }
  // place the figure: feet at x,y,z, facing the camera; flip = mirror (faces left)
  at(x, y, z, flip = false) { this.mesh.position.set(x, y, z); this.mesh.scale.x = flip ? -1 : 1; return this; }
}

// a walk cycle in pose angles (phase in cycles)
export function walk(ph, amp = 1) {
  const s = Math.sin(ph * Math.PI * 2), c = Math.cos(ph * Math.PI * 2);
  return { arms: [[-22 * s * amp, 18 + 8 * c], [22 * s * amp, 18 - 8 * c]], legs: [[26 * s * amp, -Math.max(0, -c) * 40 * amp], [-26 * s * amp, -Math.max(0, c) * 40 * amp]], hipY: Math.abs(c) * .04 };
}
