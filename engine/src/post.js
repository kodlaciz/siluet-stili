// post.js : the look of the silhouette style.
// Per frame (all at output size, half-float):
//   1. colour pass   : the layered cards, alpha-blended back to front              -> rtCol
//   2. depth pass    : every card writes its depth where its alpha > .5             -> rtDep.depthTexture
//   3. lens blur     : scatter-as-gather by depth. A sample spreads over us by ITS own blur size when it is in front,
//                      by OUR size when it is behind: a soft foreground bleeds over a sharp character, a sharp character
//                      never picks up the background                                -> rtLens
//   4. bloom         : what is brighter than `bloomAt` glows (5 blurred levels)
//   5. final         : grade (sat, contrast, lift, gain, tint), vignette, the cold grade of the tight-bar moments, flash, grain
import * as THREE from 'three';
import { TIGHT_GRADE } from './bars.js';

const FS_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const DEPTH_FN = `
uniform float near; uniform float far;
float linZ(float d){ float z = d * 2.0 - 1.0; return (2.0 * near * far) / (far + near - z * (far - near)); }`;

const LENS_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D tColor; uniform sampler2D tDepth; uniform vec2 res;
uniform float focus; uniform float cocMax; uniform float range; uniform float nearK;
${DEPTH_FN}
const int N = 96;
float coc(float z){ float d = z - focus; return clamp(abs(d) * (d < 0.0 ? nearK : 1.0) / max(range, 0.01), 0.0, d < 0.0 ? 1.8 : 1.0) * cocMax; }
void main(){
  float z = linZ(texture2D(tDepth, vUv).x);
  float r = coc(z);
  // probe: does a blurred thing in FRONT of us reach this pixel? then gather over its radius, else over our own
  float R = r, Rmax = cocMax * 1.8;
  for (int i = 0; i < 24; i++) {
    float fi = float(i);
    float d = Rmax * (0.25 + 0.75 * fract(fi * 0.618034)); float a = fi * 2.39996;
    vec2 o = vec2(cos(a), sin(a)) * d / res;
    float zs = linZ(texture2D(tDepth, vUv + o).x);
    if (zs < z - 0.02) { float rs = coc(zs); if (rs >= d * 0.8) R = max(R, rs); }
  }
  if (R < 0.6) { gl_FragColor = texture2D(tColor, vUv); return; }
  vec3 acc = texture2D(tColor, vUv).rgb; float wsum = 1.0;
  for (int i = 0; i < N; i++) {
    float fi = float(i);
    float a = fi * 2.39996;
    float d = sqrt((fi + 0.5) / float(N)) * R;
    vec2 o = vec2(cos(a), sin(a)) * d / res;
    float zs = linZ(texture2D(tDepth, vUv + o).x);
    float rs = coc(zs);
    float reach = zs < z - 0.02 ? rs : min(rs, r);
    float w = clamp(reach - d + 1.0, 0.0, 1.0) / max(reach * reach, 1.0) * 40.0;
    acc += texture2D(tColor, vUv + o).rgb * w; wsum += w;
  }
  gl_FragColor = vec4(acc / wsum, 1.0);
}`;

const BRIGHT_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D tColor; uniform vec2 texel; uniform float threshold; uniform float knee;
void main(){
  vec3 c = texture2D(tColor, vUv + texel * vec2(-1.0, -1.0)).rgb + texture2D(tColor, vUv + texel * vec2(1.0, -1.0)).rgb
         + texture2D(tColor, vUv + texel * vec2(-1.0, 1.0)).rgb + texture2D(tColor, vUv + texel * vec2(1.0, 1.0)).rgb;
  c = min(c * 0.25, vec3(12.0));
  float br = max(c.r, max(c.g, c.b));
  float soft = clamp(br - threshold + knee, 0.0, 2.0 * knee); soft = soft * soft / (4.0 * knee + 1e-4);
  gl_FragColor = vec4(c * max(soft, br - threshold) / max(br, 1e-4), 1.0);
}`;
const BLUR_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D tColor; uniform vec2 dir;
void main(){
  vec3 c = texture2D(tColor, vUv).rgb * 0.227027;
  c += (texture2D(tColor, vUv + dir * 1.3846).rgb + texture2D(tColor, vUv - dir * 1.3846).rgb) * 0.316216;
  c += (texture2D(tColor, vUv + dir * 3.2308).rgb + texture2D(tColor, vUv - dir * 3.2308).rgb) * 0.070270;
  gl_FragColor = vec4(c, 1.0);
}`;

const v3 = a => `vec3(${a.map(x => x.toFixed(4)).join(', ')})`;
const FINAL_FRAG = `
precision highp float;
const vec3 TG_R = ${v3(TIGHT_GRADE.M[0])}; const vec3 TG_G = ${v3(TIGHT_GRADE.M[1])}; const vec3 TG_B = ${v3(TIGHT_GRADE.M[2])}; const vec3 TG_O = ${v3(TIGHT_GRADE.o)};
varying vec2 vUv;
uniform sampler2D tComp; uniform sampler2D tB0; uniform sampler2D tB1; uniform sampler2D tB2; uniform sampler2D tB3; uniform sampler2D tB4; uniform vec2 res;
uniform float sat; uniform vec3 lift; uniform vec3 gain; uniform float vignette; uniform float vigSize; uniform float contrast;
uniform float flash; uniform vec3 tint; uniform float bloom; uniform float grain; uniform float seed; uniform float tight; uniform float fade;
float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
void main(){
  vec3 c = texture2D(tComp, vUv).rgb;
  vec3 b = texture2D(tB0, vUv).rgb * 0.5 + texture2D(tB1, vUv).rgb * 0.8 + texture2D(tB2, vUv).rgb * 1.3 + texture2D(tB3, vUv).rgb * 1.8 + texture2D(tB4, vUv).rgb * 1.8;
  b /= 1.0 + 0.4 * max(b.r, max(b.g, b.b));
  c += b * bloom;
  c *= tint;
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(l), c, sat);
  c = (c - 0.5) * contrast + 0.5;
  vec2 q = vUv - 0.5; q.x *= res.x / res.y;
  c *= 1.0 - vignette * smoothstep(vigSize * 0.35, vigSize * 1.05, length(q) * 1.15);
  c = lift + c * (gain - lift);                    // after the vignette: the corners stay dark but never black
  // tight bars: while the letterbox is closed the reference grades the picture cold. A matrix + offset on the finished
  // pixel (numbers in bars.js).
  vec3 tg = vec3(dot(c, TG_R), dot(c, TG_G), dot(c, TG_B)) + TG_O;
  c = mix(c, max(tg, 0.0), tight);
  c = mix(c, vec3(1.0), flash);
  c *= 1.0 - fade;
  float n = hash(vUv * res + seed * 113.7) + hash(vUv * res * 1.37 - seed * 71.3) - 1.0;
  c += n * grain;
  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}`;

export class Post {
  constructor(renderer, W, H) {
    this.r = renderer; this.W = W; this.H = H;
    const rt = (depth) => {
      const t = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
      if (depth) { t.depthTexture = new THREE.DepthTexture(W, H); t.depthTexture.type = THREE.UnsignedIntType; }
      return t;
    };
    this.rtCol = rt(false); this.rtDep = rt(true); this.rtLens = rt(false);
    this.bl = [4, 8, 16, 32, 64].map(d => { const w = Math.max(2, Math.round(W / d)), h = Math.max(2, Math.round(H / d));
      const t = () => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, depthBuffer: false }); return { w, h, a: t(), b: t() }; });
    this.fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = (frag, uniforms) => {
      const m = new THREE.ShaderMaterial({ vertexShader: FS_VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });
      const s = new THREE.Scene(); s.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m)); return { m, s };
    };
    const res = new THREE.Vector2(W, H);
    this.lens = quad(LENS_FRAG, { tColor: { value: null }, tDepth: { value: null }, res: { value: res }, near: { value: .1 }, far: { value: 600 },
      focus: { value: 5 }, cocMax: { value: 0 }, range: { value: 6 }, nearK: { value: 2 } });
    this.bright = quad(BRIGHT_FRAG, { tColor: { value: null }, texel: { value: new THREE.Vector2(1 / W, 1 / H) }, threshold: { value: .9 }, knee: { value: .15 } });
    this.blur = quad(BLUR_FRAG, { tColor: { value: null }, dir: { value: new THREE.Vector2() } });
    this.final = quad(FINAL_FRAG, {
      tComp: { value: null }, tB0: { value: null }, tB1: { value: null }, tB2: { value: null }, tB3: { value: null }, tB4: { value: null }, res: { value: res },
      bloom: { value: .6 }, sat: { value: 1 }, lift: { value: new THREE.Vector3(0, 0, 0) }, gain: { value: new THREE.Vector3(1, 1, 1) },
      vignette: { value: .45 }, vigSize: { value: 1 }, contrast: { value: 1 }, flash: { value: 0 }, tint: { value: new THREE.Vector3(1, 1, 1) },
      grain: { value: .018 }, seed: { value: 0 }, tight: { value: 0 }, fade: { value: 0 },
    });
  }
  // look: { focus, coc (px at 1080 high), range, nearK, bloom, bloomAt, sat, contrast, lift, gain, tint, vignette, vigSize,
  //         flash, grain, fade, bg (clear colour),
  //         tight (0..1: the bars close and the grade turns cold, see bars.js), tightGrade (the grade alone, default = tight) }
  render(scene, cam, look = {}, t = 0) {
    const r = this.r, sy = this.H / 1080;
    // 1. colour
    r.setClearColor(new THREE.Color(look.bg ?? '#000000'), 1);
    r.setRenderTarget(this.rtCol); r.clear(); r.render(scene, cam);
    // 2. depth: swap every card's material for its depth twin
    const swaps = [];
    scene.traverse(o => { if (o.isMesh && o.userData.depthMat && o.visible) { swaps.push([o, o.material]); o.material = o.userData.depthMat; } });
    r.setRenderTarget(this.rtDep); r.clear(); r.render(scene, cam);
    for (const [o, m] of swaps) o.material = m;
    r.setClearColor(0x000000, 1);
    // 3. lens
    const lu = this.lens.m.uniforms;
    lu.tColor.value = this.rtCol.texture; lu.tDepth.value = this.rtDep.depthTexture; lu.near.value = cam.near; lu.far.value = cam.far;
    lu.focus.value = look.focus ?? 10; lu.cocMax.value = (look.coc ?? 0) * sy; lu.range.value = look.range ?? 8; lu.nearK.value = look.nearK ?? 2;
    r.setRenderTarget(this.rtLens); r.render(this.lens.s, this.fsCam);
    // 4. bloom
    const bu = this.bright.m.uniforms, ku = this.blur.m.uniforms, B = this.bl;
    bu.tColor.value = this.rtLens.texture; bu.threshold.value = look.bloomAt ?? .9;
    r.setRenderTarget(B[0].b); r.render(this.bright.s, this.fsCam);
    ku.tColor.value = B[0].b.texture; ku.dir.value.set(1 / B[0].w, 0); r.setRenderTarget(B[0].a); r.render(this.blur.s, this.fsCam);
    ku.tColor.value = B[0].a.texture; ku.dir.value.set(0, 1 / B[0].h); r.setRenderTarget(B[0].b); r.render(this.blur.s, this.fsCam);
    ku.tColor.value = B[0].b.texture; ku.dir.value.set(1 / B[0].w, 0); r.setRenderTarget(B[0].a); r.render(this.blur.s, this.fsCam);
    for (let i = 1; i < B.length; i++) {
      ku.tColor.value = B[i - 1].a.texture; ku.dir.value.set(1 / B[i].w, 0); r.setRenderTarget(B[i].b); r.render(this.blur.s, this.fsCam);
      ku.tColor.value = B[i].b.texture; ku.dir.value.set(0, 1 / B[i].h); r.setRenderTarget(B[i].a); r.render(this.blur.s, this.fsCam);
    }
    // 5. final
    const fu = this.final.m.uniforms;
    fu.tComp.value = this.rtLens.texture; fu.tB0.value = B[0].a.texture; fu.tB1.value = B[1].a.texture; fu.tB2.value = B[2].a.texture; fu.tB3.value = B[3].a.texture; fu.tB4.value = B[4].a.texture;
    fu.bloom.value = look.bloom ?? .6; fu.sat.value = look.sat ?? 1; fu.contrast.value = look.contrast ?? 1;
    fu.vignette.value = look.vignette ?? .45; fu.vigSize.value = look.vigSize ?? 1; fu.flash.value = look.flash ?? 0;
    fu.grain.value = look.grain ?? .018; fu.seed.value = Math.round(t * 24) % 997; fu.tight.value = look.tightGrade ?? look.tight ?? 0; fu.fade.value = look.fade ?? 0;
    fu.lift.value.set(...(look.lift ?? [0, 0, 0])); fu.gain.value.set(...(look.gain ?? [1, 1, 1])); fu.tint.value.set(...(look.tint ?? [1, 1, 1]));
    r.setRenderTarget(null); r.render(this.final.s, this.fsCam);
  }
}
