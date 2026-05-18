import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CommonClass, MouseClass, WebGLManager } from './simulation';

// ============================================================
// GLSL Shaders for ASCIIText
// ============================================================
const asciiVertexShader = `
uniform float uTime;
uniform float mouse;
uniform float uEnableWaves;
varying vec2 vUv;
void main() {
  vUv = uv;
  float waveFactor = uEnableWaves;
  vec3 pos = position;
  pos.x += sin(uTime * 5.0 + position.y * 2.0) * 0.15 * waveFactor;
  pos.y += cos(uTime * 5.0 + position.x * 2.0) * 0.15 * waveFactor;
  pos.z += sin(uTime * 5.0 + position.x * 2.0) * cos(uTime * 5.0 + position.y * 2.0) * 0.3 * waveFactor;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`;

const asciiFragmentShader = `
uniform sampler2D uTexture;
uniform float uTime;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  float r = texture2D(uTexture, uv + vec2(sin(uTime) * 0.002, 0.0)).r;
  float g = texture2D(uTexture, uv + vec2(0.0, cos(uTime) * 0.002)).g;
  float b = texture2D(uTexture, uv + vec2(tan(uTime * 0.5) * 0.002, 0.0)).b;
  float a = texture2D(uTexture, uv).a;
  gl_FragColor = vec4(r, g, b, a);
}`;

// ============================================================
// Utilities for ASCIIText
// ============================================================
if (!Math.map) {
  Math.map = function(n, start, stop, start2, stop2) {
    return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
  };
}
const PX_RATIO = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

// ============================================================
// AsciiFilter class
// ============================================================
class AsciiFilter {
  constructor(container, fontSize) {
    this.container = container;
    this.fontSize = fontSize || 10;
    this.pre = null;
    this.canvas = null;
    this.ctx = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this._onMouse = this._handleMouse.bind(this);
    this._onTouch = this._handleTouch.bind(this);
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', this._onMouse);
      window.addEventListener('touchmove', this._onTouch, { passive: true });
    }
  }
  _handleMouse(e) { this.mouseX = e.clientX; this.mouseY = e.clientY; }
  _handleTouch(e) { if (e.touches.length > 0) { this.mouseX = e.touches[0].clientX; this.mouseY = e.touches[0].clientY; } }

  reset() {
    if (this.pre) { try { this.pre.remove(); } catch(e) {} }
    if (this.canvas) { try { this.canvas.remove(); } catch(e) {} }

    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;opacity:0;pointer-events:none;';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    this.pre = document.createElement('pre');
    this.pre.style.cssText = `
      position:absolute;top:0;left:0;width:100%;height:100%;margin:0;padding:0;
      font-family:"IBM Plex Mono",monospace;font-size:${this.fontSize}px;font-weight:500;
      line-height:1;letter-spacing:0;white-space:pre;overflow:hidden;
      display:flex;align-items:center;justify-content:center;
      color:transparent;
      background-image:radial-gradient(circle, #00ffff 0%, #00bfff 50%, #ffffff 100%);
      -webkit-background-clip:text;background-clip:text;
      -webkit-text-fill-color:transparent;
      mix-blend-mode:difference;
      pointer-events:none;
      transition:filter 0.3s ease;
    `;
    this.container.appendChild(this.pre);
  }

  asciify(renderer, scene, camera) {
    if (!this.canvas || !this.ctx || !this.pre) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;

    this.canvas.width = w;
    this.canvas.height = h;

    renderer.render(scene, camera);
    this.ctx.drawImage(renderer.domElement, 0, 0, w, h);

    const cols = Math.floor(w / (this.fontSize * 0.6));
    const rows = Math.floor(h / this.fontSize);
    if (cols <= 0 || rows <= 0) return;

    const imgData = this.ctx.getImageData(0, 0, w, h);
    const chars = ' .:-=+*#%@';
    let result = '';
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const sx = Math.floor((x / cols) * w);
        const sy = Math.floor((y / rows) * h);
        const idx = (sy * w + sx) * 4;
        const r = imgData.data[idx];
        const g = imgData.data[idx + 1];
        const b = imgData.data[idx + 2];
        const bright = (r + g + b) / 3;
        const ci = Math.floor(Math.map(bright, 0, 255, 0, chars.length - 1));
        result += chars[Math.min(ci, chars.length - 1)];
      }
      result += '\n';
    }
    this.pre.textContent = result;

    // Hue rotation based on mouse
    if (typeof window !== 'undefined') {
      const hue = Math.map(this.mouseX, 0, window.innerWidth, -15, 15);
      this.pre.style.filter = `hue-rotate(${hue}deg)`;
    }
  }

  dispose() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this._onMouse);
      window.removeEventListener('touchmove', this._onTouch);
    }
    if (this.pre) try { this.pre.remove(); } catch(e) {}
    if (this.canvas) try { this.canvas.remove(); } catch(e) {}
  }
}

// ============================================================
// CanvasTxt class
// ============================================================
class CanvasTxt {
  constructor(text, fontSize, color) {
    this.text = text || 'Hello';
    this.fontSize = fontSize || 200;
    this.color = color || '#ffffff';
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }
  render(w, h) {
    // Use a high-res canvas (min 4096 wide) so text renders large & crisp.
    // The texture is mapped onto the 3D plane, so canvas size != screen size.
    const aspect = w / h;
    const canvasW = Math.max(4096, w * PX_RATIO);
    const canvasH = Math.round(canvasW / aspect);
    this.canvas.width = canvasW;
    this.canvas.height = canvasH;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.fillStyle = this.color;

    // Start with a large font, then scale down only if needed to fit width
    let fsize = this.fontSize * (canvasW / (w || 1));
    const maxW = canvasW * 0.95;
    const maxH = canvasH * 0.85;
    ctx.font = `600 ${fsize}px "IBM Plex Mono", monospace`;
    let measured = ctx.measureText(this.text).width;
    if (measured > maxW) {
      fsize = fsize * (maxW / measured);
    }
    if (fsize > maxH) {
      fsize = maxH;
    }
    ctx.font = `600 ${fsize}px "IBM Plex Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, canvasW / 2, canvasH / 2);
    return this.canvas;
  }
  getTexture(w, h) {
    this.render(w, h);
    const tex = new THREE.CanvasTexture(this.canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }
}

// ============================================================
// CanvAscii class
// ============================================================
class CanvAscii {
  constructor(container, opts) {
    this.container = container;
    this.text = opts.text || 'Hello';
    this.textFontSize = opts.textFontSize || 200;
    this.asciiFontSize = opts.asciiFontSize || 8;
    this.textColor = opts.textColor || '#ffffff';
    this.enableWaves = opts.enableWaves !== false;
    this.planeBaseHeight = opts.planeBaseHeight || 10;

    this.scene = null; this.camera = null; this.renderer = null;
    this.mesh = null; this.material = null; this.geometry = null;
    this.filter = null; this.texture = null; this.canvasTxt = null;
    this.rafId = null; this.mouseX = 0; this.mouseY = 0;
    this._onMouse = (e) => { this.mouseX = e.clientX; this.mouseY = e.clientY; };
    this._onTouch = (e) => { if (e.touches.length > 0) { this.mouseX = e.touches[0].clientX; this.mouseY = e.touches[0].clientY; } };
  }

  async init() {
    // Load fonts
    try {
      await document.fonts.load('600 200px "IBM Plex Mono"');
      await document.fonts.load('500 12px "IBM Plex Mono"');
      await document.fonts.ready;
    } catch(e) { /* continue with fallback */ }

    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setPixelRatio(PX_RATIO);
    this.renderer.setSize(w, h);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;opacity:0;pointer-events:none;';
    this.container.appendChild(this.renderer.domElement);

    // Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, w / h, 1, 1000);
    this.camera.position.z = 30;

    // Text texture
    this.canvasTxt = new CanvasTxt(this.text, this.textFontSize, this.textColor);
    this.texture = this.canvasTxt.getTexture(w, h);

    // Plane
    const aspect = w / h;
    const planeH = this.planeBaseHeight;
    const planeW = planeH * aspect;
    this.geometry = new THREE.PlaneGeometry(planeW, planeH, 128, 128);
    this.material = new THREE.ShaderMaterial({
      vertexShader: asciiVertexShader,
      fragmentShader: asciiFragmentShader,
      transparent: true,
      uniforms: {
        uTexture: { value: this.texture },
        uTime: { value: 0 },
        mouse: { value: 0 },
        uEnableWaves: { value: this.enableWaves ? 1.0 : 0.0 }
      }
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    // ASCII filter
    this.filter = new AsciiFilter(this.container, this.asciiFontSize);
    this.filter.reset();

    // Mouse listeners
    window.addEventListener('mousemove', this._onMouse);
    window.addEventListener('touchmove', this._onTouch, { passive: true });

    // Start loop
    this.animate();
  }

  updateRotation() {
    if (!this.mesh) return;
    const targetX = Math.map(this.mouseY, 0, window.innerHeight, 0.3, -0.3);
    const targetY = Math.map(this.mouseX, 0, window.innerWidth, -0.3, 0.3);
    this.mesh.rotation.x += (targetX - this.mesh.rotation.x) * 0.05;
    this.mesh.rotation.y += (targetY - this.mesh.rotation.y) * 0.05;
  }

  animate() {
    this.rafId = requestAnimationFrame(() => this.animate());
    if (!this.material || !this.renderer || !this.scene || !this.camera) return;
    this.material.uniforms.uTime.value = performance.now() * 0.001;
    this.updateRotation();
    this.filter.asciify(this.renderer, this.scene, this.camera);
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;

    if (this.camera) { this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }
    if (this.renderer) this.renderer.setSize(w, h);

    // Rebuild texture & geometry
    if (this.canvasTxt) {
      if (this.texture) this.texture.dispose();
      this.texture = this.canvasTxt.getTexture(w, h);
      if (this.material) this.material.uniforms.uTexture.value = this.texture;
    }
    if (this.geometry) {
      this.geometry.dispose();
      const aspect = w / h;
      const planeH = this.planeBaseHeight;
      this.geometry = new THREE.PlaneGeometry(planeH * aspect, planeH, 128, 128);
      if (this.mesh) this.mesh.geometry = this.geometry;
    }
    if (this.filter) this.filter.reset();
  }

  dispose() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener('mousemove', this._onMouse);
    window.removeEventListener('touchmove', this._onTouch);
    if (this.filter) this.filter.dispose();
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
    if (this.texture) this.texture.dispose();
    if (this.renderer) {
      this.renderer.forceContextLoss();
      try { this.renderer.domElement.remove(); } catch(e) {}
      this.renderer.dispose();
    }
  }
}

// ============================================================
// ASCIIText React Component
// ============================================================
function ASCIIText({
  text = 'Deep_Scan',
  enableWaves = true,
  asciiFontSize = 6,
  textFontSize = 200,
  planeBaseHeight = 10,
  textColor = '#ffffff',
}) {
  const containerRef = useRef(null);
  const asciiRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cancelled = false;
    let resizeObs = null;
    let interObs = null;

    const setup = async () => {
      const inst = new CanvAscii(el, { text, textFontSize, asciiFontSize, textColor, enableWaves, planeBaseHeight });
      if (cancelled) return;
      asciiRef.current = inst;
      await inst.init();

      // ResizeObserver
      resizeObs = new ResizeObserver(() => { if (asciiRef.current) asciiRef.current.resize(); });
      resizeObs.observe(el);
    };
    setup();

    return () => {
      cancelled = true;
      if (resizeObs) try { resizeObs.disconnect(); } catch(e) {}
      if (interObs) try { interObs.disconnect(); } catch(e) {}
      if (asciiRef.current) { asciiRef.current.dispose(); asciiRef.current = null; }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&display=swap');`}</style>
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }} />
    </>
  );
}

// ============================================================
// Palette texture helper for LiquidEther
// ============================================================
function makePaletteTexture(stops) {
  let arr;
  if (Array.isArray(stops) && stops.length > 0) {
    arr = stops.length === 1 ? [stops[0], stops[0]] : stops;
  } else {
    arr = ['#ffffff', '#ffffff'];
  }
  const w = arr.length;
  const data = new Uint8Array(w * 4);
  for (let i = 0; i < w; i++) {
    const c = new THREE.Color(arr[i]);
    data[i * 4 + 0] = Math.round(c.r * 255);
    data[i * 4 + 1] = Math.round(c.g * 255);
    data[i * 4 + 2] = Math.round(c.b * 255);
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, w, 1, THREE.RGBAFormat);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

// ============================================================
// LiquidEther Component (unchanged)
// ============================================================
function LiquidEther({
  colors = ['#5227FF', '#FF9FFC', '#B497CF'],
  mouseForce = 35,
  cursorSize = 130,
  isViscous = true,
  viscous = 18,
  iterationsViscous = 32,
  iterationsPoisson = 32,
  resolution = 0.5,
  isBounce = false,
  autoDemo = true,
  autoSpeed = 0.5,
  autoIntensity = 2.2,
  takeoverDuration = 0.12,
  autoResumeDelay = 2500,
  autoRampDuration = 0.6,
  dt = 0.016,
  BFECC = true,
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const paletteTex = makePaletteTexture(colors);
    const bgVec4 = new THREE.Vector4(0, 0, 0, 0);
    const Common = new CommonClass();
    const Mouse = new MouseClass();

    const config = {
      mouseForce, cursorSize, isViscous, viscous,
      iterationsViscous, iterationsPoisson, dt, BFECC,
      resolution, isBounce,
    };

    let webgl = new WebGLManager({
      $wrapper: container,
      config,
      autoDemo, autoSpeed, autoIntensity, takeoverDuration,
      autoResumeDelay, autoRampDuration, paletteTex, bgVec4,
    }, Common, Mouse);

    let resizeRafId = null;
    let resizeObserver = null;
    let intersectionObserver = null;
    let isVisible = true;
    let firstIntersectionCallback = true;

    webgl.start();

    const ioTimeout = setTimeout(() => {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          if (firstIntersectionCallback) { firstIntersectionCallback = false; return; }
          const entry = entries[0];
          isVisible = entry.isIntersecting && entry.intersectionRatio > 0;
          if (!webgl) return;
          if (isVisible && !document.hidden) webgl.start(); else webgl.pause();
        },
        { threshold: [0, 0.01, 0.1] }
      );
      intersectionObserver.observe(container);
    }, 500);

    resizeObserver = new ResizeObserver(() => {
      if (!webgl) return;
      if (resizeRafId) cancelAnimationFrame(resizeRafId);
      resizeRafId = requestAnimationFrame(() => { if (webgl) webgl.resize(); });
    });
    resizeObserver.observe(container);

    return () => {
      clearTimeout(ioTimeout);
      if (webgl && webgl.rafId) cancelAnimationFrame(webgl.rafId);
      if (resizeRafId) cancelAnimationFrame(resizeRafId);
      if (resizeObserver) { try { resizeObserver.disconnect(); } catch (e) { void 0; } }
      if (intersectionObserver) { try { intersectionObserver.disconnect(); } catch (e) { void 0; } }
      if (webgl) { webgl.pause(); webgl.dispose(); webgl = null; }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={mountRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        touchAction: 'none',
      }}
    />
  );
}

// ============================================================
// LandingPage — Default Export
// ============================================================
export default function LandingPage() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#000000',
        overflow: 'hidden',
      }}
    >
      {/* LiquidEther fills entire background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <LiquidEther
          colors={['#5227FF', '#FF9FFC', '#B497CF']}
          mouseForce={35}
          cursorSize={85}
          isViscous={true}
          viscous={18}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.12}
          autoResumeDelay={2500}
          autoRampDuration={0.6}
          dt={0.016}
          BFECC={true}
        />
      </div>

      {/* Deep Scan ASCII Title — centered overlay */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100vw',
          height: '60vh',
          zIndex: 10,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <ASCIIText
          text='Deep_Scan'
          enableWaves={true}
          asciiFontSize={8}
          textFontSize={420}
          planeBaseHeight={24}
          textColor='#ffffff'
        />
      </div>
    </div>
  );
}
