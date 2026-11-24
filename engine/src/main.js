// main.js : loads a story and exposes window.render(t) for frame-exact capture (no Remotion, no realtime clock).
// URL: /engine/index.html?story=uykusuz[&scale=0.5]
// Colour: no colour management. A colour painted on a canvas is the colour on screen (the reference is flat vector art,
// what you paint is what you get); blur and bloom run on those values.
import * as THREE from 'three';
import { Post } from './post.js';
import { barPx } from './bars.js';

THREE.ColorManagement.enabled = false;
const q = new URLSearchParams(location.search);
const STORY = q.get('story') || 'uykusuz';
const SCALE = parseFloat(q.get('scale') || '1');
const W = Math.round(1920 * SCALE), H = Math.round(1080 * SCALE);

const glc = document.getElementById('gl'), out = document.getElementById('out');
glc.width = W; glc.height = H; out.width = W; out.height = H;
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
const g = out.getContext('2d');

const base = `/stories/${STORY}/`;
const story = await import(base + 'story.js');
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(35, W / H, .1, 600);
const ctx = { THREE, scene, cam, renderer, W, H, S: SCALE, fps: story.FPS || 24, base };
await story.setup(ctx);
const post = new Post(renderer, W, H);

window.render = (t) => {
  const look = story.frame(t, ctx) || {};
  post.render(scene, cam, look, t);
  g.globalAlpha = 1; g.drawImage(glc, 0, 0);
  if (story.overlay) { g.save(); g.scale(W / 1920, H / 1080); story.overlay(g, t, ctx, look); g.restore(); }
  // letterbox last: nothing is drawn over the bars. look.tight (0..1) closes them from 62 to 128 px (bars.js).
  const bar = barPx(look) * H / 1080;
  if (bar > 0) { g.fillStyle = '#000'; g.fillRect(0, 0, W, bar); g.fillRect(0, H - bar, W, bar); }
};
window.__meta = { DUR: story.DUR, FPS: story.FPS || 24, NAME: story.NAME || STORY, W, H, CUES: story.CUES || [], LINES: story.LINES || [] };
window.__ready = true;
if (!q.has('capture')) { const t0 = performance.now(); const loop = () => { window.render(((performance.now() - t0) / 1000) % story.DUR); requestAnimationFrame(loop); }; loop(); }
