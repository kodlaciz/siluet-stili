// layer.js : the world is made of flat painted cards standing in 3D space (2.5D). Canvas 2D paints them, three.js places
// them, so a real camera gives real parallax and a real depth for the lens blur.
import * as THREE from 'three';

// a canvas + its texture. draw(g, w, h) paints in pixels; call .redraw() to repaint a dynamic card.
export function paintTex(pxW, pxH, draw, { mip = true } = {}) {
  const c = document.createElement('canvas'); c.width = Math.round(pxW); c.height = Math.round(pxH);
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace; tex.anisotropy = 8;
  tex.generateMipmaps = mip; tex.minFilter = mip ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
  const o = { canvas: c, g, tex, w: c.width, h: c.height,
    redraw(...a) { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height); draw(g, c.width, c.height, ...a); tex.needsUpdate = true; } };
  if (draw) o.redraw();
  return o;
}

// card: a plane of w x h world units carrying a painted texture.
//   opts: px (texture pixels per world unit, default 160), pos, rot, order (renderOrder), draw, opacity, add (additive light)
export function card(parent, w, h, draw, opts = {}) {
  const ppu = opts.px ?? 160;
  const P = paintTex(Math.min(8192, w * ppu), Math.min(8192, h * ppu), draw, opts);
  const mat = new THREE.MeshBasicMaterial({ map: P.tex, transparent: true, depthWrite: false, depthTest: true,
    opacity: opts.opacity ?? 1, blending: opts.add ? THREE.AdditiveBlending : THREE.NormalBlending, side: THREE.DoubleSide });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  // depth twin: writes depth where the paint is solid (lens blur reads it). Additive light cards have no depth.
  if (!opts.add && !opts.noDepth) m.userData.depthMat = new THREE.MeshBasicMaterial({ map: P.tex, alphaTest: opts.alphaTest ?? .5, colorWrite: false, side: THREE.DoubleSide });
  if (opts.pos) m.position.set(...opts.pos);
  if (opts.rot) m.rotation.set(...opts.rot);
  if (opts.order != null) m.renderOrder = opts.order;
  m.userData.paint = P; m.userData.w = w; m.userData.h = h;
  parent.add(m);
  return m;
}

// a flat colour quad (cheap: windows, light pools, bars)
export function quad(parent, w, h, color, opts = {}) {
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: opts.opacity ?? 1, depthWrite: false,
    blending: opts.add ? THREE.AdditiveBlending : THREE.NormalBlending, side: THREE.DoubleSide });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  if (!opts.add && !opts.noDepth) m.userData.depthMat = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide });
  if (opts.pos) m.position.set(...opts.pos);
  if (opts.order != null) m.renderOrder = opts.order;
  parent.add(m); return m;
}

// helpers for painting
export const lerp = (a, b, k) => a + (b - a) * k;
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
export const smoother = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * x * (x * (x * 6 - 15) + 10);
export const ramp = (t, a, b) => clamp01((t - a) / (b - a));
export function rng(seed = 1) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export function hex(c) { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
export function mix(c1, c2, k) { const a = hex(c1), b = hex(c2); return '#' + a.map((v, i) => Math.round(lerp(v, b[i], k)).toString(16).padStart(2, '0')).join(''); }
export function vgrad(g, x, y0, y1, stops) { const gr = g.createLinearGradient(x, y0, x, y1); for (const [k, c] of stops) gr.addColorStop(k, c); return gr; }
export function rrect(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
