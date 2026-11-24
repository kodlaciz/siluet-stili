// camera.js : the camera grammar of the style (numbers in analiz/kamera.md).
//   * shots are mostly HELD with a slow push (or a slow pull); a quarter to a third of frames move
//   * between keys: smootherstep glides; 'cut' = a hard cut
//   * shake(t, amp) = an impact kick that decays over a few frames
import * as THREE from 'three';
import { smoother } from './layer.js';

// keys: [{ t, pos:[x,y,z], look:[x,y,z], fov, move?:'glide'|'cut', dur?, push? (fov % per second while holding), drift? ([dx,dy,dz] per s) }]
export class CamPath {
  constructor(keys, { fps = 24 } = {}) { this.k = keys; this.fps = fps; this.kicks = []; }
  kick(t, amp = 1) { this.kicks.push({ t, amp }); return this; }
  _hold(a, t) {
    const dt = Math.max(0, t - a.t), d = a.drift || [0, 0, 0];
    return { pos: new THREE.Vector3(...a.pos).add(new THREE.Vector3(...d).multiplyScalar(dt)), look: new THREE.Vector3(...a.look).add(new THREE.Vector3(...d).multiplyScalar(dt)),
      fov: a.fov * Math.pow(1 - (a.push ?? 0) / 100, dt) };
  }
  at(t) {
    const K = this.k; let i = 0; while (i + 1 < K.length && K[i + 1].t <= t) i++;
    const a = K[i], b = K[i + 1];
    let s = this._hold(a, t);
    if (b && b.move !== 'cut') {
      const dur = b.dur ?? 1, t0 = b.t - dur;
      if (t >= t0) {
        const s0 = this._hold(a, t0), e = smoother((t - t0) / dur);
        s = { pos: s0.pos.lerp(new THREE.Vector3(...b.pos), e), look: s0.look.lerp(new THREE.Vector3(...b.look), e), fov: s0.fov + (b.fov - s0.fov) * e };
      }
    }
    let sx = 0, sy = 0;
    for (const k of this.kicks) { const f = Math.round((t - k.t) * this.fps); if (f >= 0 && f < 8) { const d = (1 - f / 8) * k.amp * .04 * (f % 2 ? -1 : 1); sx += d; sy += d * .7; } }
    s.shake = [sx, sy]; s.key = i;
    return s;
  }
  apply(cam, t) {
    const s = this.at(t);
    cam.position.copy(s.pos); cam.position.x += s.shake[0]; cam.position.y += s.shake[1];
    cam.up.set(0, 1, 0); cam.lookAt(s.look); cam.fov = s.fov; cam.updateProjectionMatrix();
    return s;
  }
}
