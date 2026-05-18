import * as THREE from 'three';
import { face_vert, line_vert, mouse_vert, advection_frag, color_frag, divergence_frag, externalForce_frag, poisson_frag, pressure_frag, viscous_frag } from './shaders';

export class CommonClass {
  constructor() {
    this.width = 0; this.height = 0; this.aspect = 1; this.pixelRatio = 1;
    this.fboWidth = null; this.fboHeight = null; this.time = 0; this.delta = 0;
    this.container = null; this.renderer = null; this.clock = null;
  }
  init(container) {
    this.container = container;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.resize();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.autoClear = false;
    this.renderer.setClearColor(new THREE.Color(0x000000), 0);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    this.clock = new THREE.Clock(); this.clock.start();
  }
  resize() {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    this.width = Math.max(1, Math.floor(rect.width));
    this.height = Math.max(1, Math.floor(rect.height));
    this.aspect = this.width / this.height;
    if (this.renderer) this.renderer.setSize(this.width, this.height, false);
  }
  update() { this.delta = this.clock.getDelta(); this.time += this.delta; }
}

export class MouseClass {
  constructor() {
    this.mouseMoved = false; this.coords = new THREE.Vector2(); this.coords_old = new THREE.Vector2();
    this.diff = new THREE.Vector2(); this.timer = null; this.container = null;
    this.docTarget = null; this.listenerTarget = null; this.isHoverInside = false;
    this.hasUserControl = false; this.isAutoActive = false; this.autoIntensity = 2.0;
    this.takeoverActive = false; this.takeoverStartTime = 0; this.takeoverDuration = 0.25;
    this.takeoverFrom = new THREE.Vector2(); this.takeoverTo = new THREE.Vector2();
    this.onInteract = null;
    this._onMouseMove = this.onDocumentMouseMove.bind(this);
    this._onTouchStart = this.onDocumentTouchStart.bind(this);
    this._onTouchMove = this.onDocumentTouchMove.bind(this);
    this._onTouchEnd = this.onTouchEnd.bind(this);
    this._onDocumentLeave = this.onDocumentLeave.bind(this);
  }
  init(container) {
    this.container = container;
    this.docTarget = container.ownerDocument || null;
    const dv = (this.docTarget && this.docTarget.defaultView) || (typeof window !== 'undefined' ? window : null);
    if (!dv) return;
    this.listenerTarget = dv;
    this.listenerTarget.addEventListener('mousemove', this._onMouseMove);
    this.listenerTarget.addEventListener('touchstart', this._onTouchStart, { passive: true });
    this.listenerTarget.addEventListener('touchmove', this._onTouchMove, { passive: true });
    this.listenerTarget.addEventListener('touchend', this._onTouchEnd);
    if (this.docTarget) this.docTarget.addEventListener('mouseleave', this._onDocumentLeave);
  }
  dispose() {
    if (this.listenerTarget) {
      this.listenerTarget.removeEventListener('mousemove', this._onMouseMove);
      this.listenerTarget.removeEventListener('touchstart', this._onTouchStart);
      this.listenerTarget.removeEventListener('touchmove', this._onTouchMove);
      this.listenerTarget.removeEventListener('touchend', this._onTouchEnd);
    }
    if (this.docTarget) this.docTarget.removeEventListener('mouseleave', this._onDocumentLeave);
    this.listenerTarget = null; this.docTarget = null; this.container = null;
  }
  isPointInside(cx, cy) {
    if (!this.container) return false;
    const r = this.container.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    return cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
  }
  updateHoverState(cx, cy) { this.isHoverInside = this.isPointInside(cx, cy); return this.isHoverInside; }
  setCoords(x, y) {
    if (!this.container) return;
    if (this.timer) window.clearTimeout(this.timer);
    const r = this.container.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    this.coords.set((x - r.left) / r.width * 2 - 1, -((y - r.top) / r.height * 2 - 1));
    this.mouseMoved = true;
    this.timer = window.setTimeout(() => { this.mouseMoved = false; }, 100);
  }
  setNormalized(nx, ny) { this.coords.set(nx, ny); this.mouseMoved = true; }
  onDocumentMouseMove(e) {
    if (!this.updateHoverState(e.clientX, e.clientY)) return;
    if (this.onInteract) this.onInteract();
    if (this.isAutoActive && !this.hasUserControl && !this.takeoverActive) {
      if (!this.container) return;
      const r = this.container.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      this.takeoverFrom.copy(this.coords);
      this.takeoverTo.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height * 2 - 1));
      this.takeoverStartTime = performance.now();
      this.takeoverActive = true; this.hasUserControl = true; this.isAutoActive = false;
      return;
    }
    this.setCoords(e.clientX, e.clientY); this.hasUserControl = true;
  }
  onDocumentTouchStart(e) {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    if (!this.updateHoverState(t.clientX, t.clientY)) return;
    if (this.onInteract) this.onInteract();
    this.setCoords(t.clientX, t.clientY); this.hasUserControl = true;
  }
  onDocumentTouchMove(e) {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    if (!this.updateHoverState(t.clientX, t.clientY)) return;
    if (this.onInteract) this.onInteract();
    this.setCoords(t.clientX, t.clientY);
  }
  onTouchEnd() { this.isHoverInside = false; }
  onDocumentLeave() { this.isHoverInside = false; }
  update() {
    if (this.takeoverActive) {
      const t = (performance.now() - this.takeoverStartTime) / (this.takeoverDuration * 1000);
      if (t >= 1) { this.takeoverActive = false; this.coords.copy(this.takeoverTo); this.coords_old.copy(this.coords); this.diff.set(0, 0); }
      else { const k = t * t * (3 - 2 * t); this.coords.copy(this.takeoverFrom).lerp(this.takeoverTo, k); }
    }
    this.diff.subVectors(this.coords, this.coords_old);
    this.coords_old.copy(this.coords);
    if (this.coords_old.x === 0 && this.coords_old.y === 0) this.diff.set(0, 0);
    if (this.isAutoActive && !this.takeoverActive) this.diff.multiplyScalar(this.autoIntensity);
  }
}

export class AutoDriver {
  constructor(mouse, manager, opts) {
    this.mouse = mouse; this.manager = manager; this.enabled = opts.enabled;
    this.speed = opts.speed; this.resumeDelay = opts.resumeDelay || 3000;
    this.rampDurationMs = (opts.rampDuration || 0) * 1000;
    this.active = false; this.current = new THREE.Vector2(0, 0);
    this.target = new THREE.Vector2(); this.lastTime = performance.now();
    this.activationTime = 0; this.margin = 0.2; this._tmpDir = new THREE.Vector2();
    this.pickNewTarget();
  }
  pickNewTarget() { this.target.set((Math.random() * 2 - 1) * (1 - this.margin), (Math.random() * 2 - 1) * (1 - this.margin)); }
  forceStop() { this.active = false; this.mouse.isAutoActive = false; }
  update() {
    if (!this.enabled) return;
    const now = performance.now();
    if (now - this.manager.lastUserInteraction < this.resumeDelay) { if (this.active) this.forceStop(); return; }
    if (this.mouse.isHoverInside) { if (this.active) this.forceStop(); return; }
    if (!this.active) { this.active = true; this.current.copy(this.mouse.coords); this.lastTime = now; this.activationTime = now; }
    if (!this.active) return;
    this.mouse.isAutoActive = true;
    let dtSec = (now - this.lastTime) / 1000; this.lastTime = now;
    if (dtSec > 0.2) dtSec = 0.016;
    const dir = this._tmpDir.subVectors(this.target, this.current);
    const dist = dir.length();
    if (dist < 0.01) { this.pickNewTarget(); return; }
    dir.normalize();
    let ramp = 1;
    if (this.rampDurationMs > 0) { const t = Math.min(1, (now - this.activationTime) / this.rampDurationMs); ramp = t * t * (3 - 2 * t); }
    this.current.addScaledVector(dir, Math.min(this.speed * dtSec * ramp, dist));
    this.mouse.setNormalized(this.current.x, this.current.y);
  }
}

class ShaderPass {
  constructor(props) { this.props = props || {}; this.uniforms = this.props.material?.uniforms; this.scene = null; this.camera = null; this.material = null; this.geometry = null; this.plane = null; }
  init() {
    this.scene = new THREE.Scene(); this.camera = new THREE.Camera();
    if (this.uniforms) {
      this.material = new THREE.RawShaderMaterial(this.props.material);
      this.geometry = new THREE.PlaneGeometry(2.0, 2.0);
      this.plane = new THREE.Mesh(this.geometry, this.material);
      this.scene.add(this.plane);
    }
  }
  update(Common) { Common.renderer.setRenderTarget(this.props.output || null); Common.renderer.render(this.scene, this.camera); Common.renderer.setRenderTarget(null); }
}

class AdvectionPass extends ShaderPass {
  constructor(sp) {
    super({ material: { vertexShader: face_vert, fragmentShader: advection_frag, uniforms: { boundarySpace: { value: sp.cellScale }, px: { value: sp.cellScale }, fboSize: { value: sp.fboSize }, velocity: { value: sp.src.texture }, dt: { value: sp.dt }, isBFECC: { value: true } } }, output: sp.dst });
    this.uniforms = this.props.material.uniforms; this.init(); this.createBoundary();
  }
  createBoundary() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1,-1,0,-1,1,0,-1,1,0,1,1,0,1,1,0,1,-1,0,1,-1,0,-1,-1,0]), 3));
    const m = new THREE.RawShaderMaterial({ vertexShader: line_vert, fragmentShader: advection_frag, uniforms: this.uniforms });
    this.line = new THREE.LineSegments(g, m); this.scene.add(this.line);
  }
  update(Common, { dt, isBounce, BFECC }) { this.uniforms.dt.value = dt; this.line.visible = isBounce; this.uniforms.isBFECC.value = BFECC; super.update(Common); }
}

class ExternalForcePass extends ShaderPass {
  constructor(sp) {
    super({ output: sp.dst }); this.init();
    const g = new THREE.PlaneGeometry(1, 1);
    const m = new THREE.RawShaderMaterial({ vertexShader: mouse_vert, fragmentShader: externalForce_frag, blending: THREE.AdditiveBlending, depthWrite: false, uniforms: { px: { value: sp.cellScale }, force: { value: new THREE.Vector2() }, center: { value: new THREE.Vector2() }, scale: { value: new THREE.Vector2(sp.cursor_size, sp.cursor_size) } } });
    this.mouse = new THREE.Mesh(g, m); this.scene.add(this.mouse);
  }
  update(Common, Mouse, props) {
    const u = this.mouse.material.uniforms;
    u.force.value.set((Mouse.diff.x / 2) * props.mouse_force, (Mouse.diff.y / 2) * props.mouse_force);
    const csx = props.cursor_size * props.cellScale.x, csy = props.cursor_size * props.cellScale.y;
    u.center.value.set(Math.min(Math.max(Mouse.coords.x, -1 + csx + props.cellScale.x * 2), 1 - csx - props.cellScale.x * 2), Math.min(Math.max(Mouse.coords.y, -1 + csy + props.cellScale.y * 2), 1 - csy - props.cellScale.y * 2));
    u.scale.value.set(props.cursor_size, props.cursor_size);
    super.update(Common);
  }
}

class ViscousPass extends ShaderPass {
  constructor(sp) {
    super({ material: { vertexShader: face_vert, fragmentShader: viscous_frag, uniforms: { boundarySpace: { value: sp.boundarySpace }, velocity: { value: sp.src.texture }, velocity_new: { value: sp.dst_.texture }, v: { value: sp.viscous }, px: { value: sp.cellScale }, dt: { value: sp.dt } } }, output: sp.dst, output0: sp.dst_, output1: sp.dst });
    this.init();
  }
  update(Common, { viscous, iterations, dt }) {
    this.uniforms.v.value = viscous;
    let fi, fo;
    for (let i = 0; i < iterations; i++) {
      if (i % 2 === 0) { fi = this.props.output0; fo = this.props.output1; } else { fi = this.props.output1; fo = this.props.output0; }
      this.uniforms.velocity_new.value = fi.texture; this.props.output = fo; this.uniforms.dt.value = dt; super.update(Common);
    }
    return fo;
  }
}

class DivergencePass extends ShaderPass {
  constructor(sp) {
    super({ material: { vertexShader: face_vert, fragmentShader: divergence_frag, uniforms: { boundarySpace: { value: sp.boundarySpace }, velocity: { value: sp.src.texture }, px: { value: sp.cellScale }, dt: { value: sp.dt } } }, output: sp.dst });
    this.init();
  }
  update(Common, { vel }) { this.uniforms.velocity.value = vel.texture; super.update(Common); }
}

class PoissonPass extends ShaderPass {
  constructor(sp) {
    super({ material: { vertexShader: face_vert, fragmentShader: poisson_frag, uniforms: { boundarySpace: { value: sp.boundarySpace }, pressure: { value: sp.dst_.texture }, divergence: { value: sp.src.texture }, px: { value: sp.cellScale } } }, output: sp.dst, output0: sp.dst_, output1: sp.dst });
    this.init();
  }
  update(Common, { iterations }) {
    let pi, po;
    for (let i = 0; i < iterations; i++) {
      if (i % 2 === 0) { pi = this.props.output0; po = this.props.output1; } else { pi = this.props.output1; po = this.props.output0; }
      this.uniforms.pressure.value = pi.texture; this.props.output = po; super.update(Common);
    }
    return po;
  }
}

class PressurePass extends ShaderPass {
  constructor(sp) {
    super({ material: { vertexShader: face_vert, fragmentShader: pressure_frag, uniforms: { boundarySpace: { value: sp.boundarySpace }, pressure: { value: sp.src_p.texture }, velocity: { value: sp.src_v.texture }, px: { value: sp.cellScale }, dt: { value: sp.dt } } }, output: sp.dst });
    this.init();
  }
  update(Common, { vel, pressure }) { this.uniforms.velocity.value = vel.texture; this.uniforms.pressure.value = pressure.texture; super.update(Common); }
}

export class Simulation {
  constructor(options, Common) {
    this.Common = Common;
    this.options = { iterations_poisson: 32, iterations_viscous: 32, mouse_force: 20, resolution: 0.5, cursor_size: 100, viscous: 30, isBounce: false, dt: 0.014, isViscous: false, BFECC: true, ...options };
    this.fbos = { vel_0: null, vel_1: null, vel_viscous0: null, vel_viscous1: null, div: null, pressure_0: null, pressure_1: null };
    this.fboSize = new THREE.Vector2(); this.cellScale = new THREE.Vector2(); this.boundarySpace = new THREE.Vector2();
    this.init();
  }
  init() { this.calcSize(); this.createAllFBO(); this.createShaderPass(); }
  getFloatType() { return /(iPad|iPhone|iPod)/i.test(navigator.userAgent) ? THREE.HalfFloatType : THREE.FloatType; }
  createAllFBO() {
    const type = this.getFloatType();
    const opts = { type, depthBuffer: false, stencilBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping };
    for (let key in this.fbos) this.fbos[key] = new THREE.WebGLRenderTarget(this.fboSize.x, this.fboSize.y, opts);
  }
  createShaderPass() {
    this.advection = new AdvectionPass({ cellScale: this.cellScale, fboSize: this.fboSize, dt: this.options.dt, src: this.fbos.vel_0, dst: this.fbos.vel_1 });
    this.externalForce = new ExternalForcePass({ cellScale: this.cellScale, cursor_size: this.options.cursor_size, dst: this.fbos.vel_1 });
    this.viscous = new ViscousPass({ cellScale: this.cellScale, boundarySpace: this.boundarySpace, viscous: this.options.viscous, src: this.fbos.vel_1, dst: this.fbos.vel_viscous1, dst_: this.fbos.vel_viscous0, dt: this.options.dt });
    this.divergence = new DivergencePass({ cellScale: this.cellScale, boundarySpace: this.boundarySpace, src: this.fbos.vel_viscous0, dst: this.fbos.div, dt: this.options.dt });
    this.poisson = new PoissonPass({ cellScale: this.cellScale, boundarySpace: this.boundarySpace, src: this.fbos.div, dst: this.fbos.pressure_1, dst_: this.fbos.pressure_0 });
    this.pressure = new PressurePass({ cellScale: this.cellScale, boundarySpace: this.boundarySpace, src_p: this.fbos.pressure_0, src_v: this.fbos.vel_viscous0, dst: this.fbos.vel_0, dt: this.options.dt });
  }
  calcSize() {
    const w = Math.max(1, Math.round(this.options.resolution * this.Common.width));
    const h = Math.max(1, Math.round(this.options.resolution * this.Common.height));
    this.cellScale.set(1.0 / w, 1.0 / h); this.fboSize.set(w, h);
  }
  resize() { this.calcSize(); for (let key in this.fbos) this.fbos[key].setSize(this.fboSize.x, this.fboSize.y); }
  update(Mouse) {
    if (this.options.isBounce) this.boundarySpace.set(0, 0); else this.boundarySpace.copy(this.cellScale);
    this.advection.update(this.Common, { dt: this.options.dt, isBounce: this.options.isBounce, BFECC: this.options.BFECC });
    this.externalForce.update(this.Common, Mouse, { cursor_size: this.options.cursor_size, mouse_force: this.options.mouse_force, cellScale: this.cellScale });
    let vel = this.fbos.vel_1;
    if (this.options.isViscous) vel = this.viscous.update(this.Common, { viscous: this.options.viscous, iterations: this.options.iterations_viscous, dt: this.options.dt });
    this.divergence.update(this.Common, { vel });
    const pressure = this.poisson.update(this.Common, { iterations: this.options.iterations_poisson });
    this.pressure.update(this.Common, { vel, pressure });
  }
}

export class Output {
  constructor(config, Common, Mouse, paletteTex, bgVec4) {
    this.Common = Common; this.Mouse = Mouse;
    this.simulation = new Simulation({ mouse_force: config.mouseForce, cursor_size: config.cursorSize, isViscous: config.isViscous, viscous: config.viscous, iterations_viscous: config.iterationsViscous, iterations_poisson: config.iterationsPoisson, dt: config.dt, BFECC: config.BFECC, resolution: config.resolution, isBounce: config.isBounce }, Common);
    this.scene = new THREE.Scene(); this.camera = new THREE.Camera();
    this.output = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.RawShaderMaterial({ vertexShader: face_vert, fragmentShader: color_frag, transparent: true, depthWrite: false, uniforms: { velocity: { value: this.simulation.fbos.vel_0.texture }, boundarySpace: { value: new THREE.Vector2() }, palette: { value: paletteTex }, bgColor: { value: bgVec4 } } }));
    this.scene.add(this.output);
  }
  resize() { this.simulation.resize(); }
  render() { this.Common.renderer.setRenderTarget(null); this.Common.renderer.render(this.scene, this.camera); }
  update() { this.simulation.update(this.Mouse); this.render(); }
}

export class WebGLManager {
  constructor(props, Common, Mouse) {
    this.props = props; this.Common = Common; this.Mouse = Mouse;
    Common.init(props.$wrapper); Mouse.init(props.$wrapper);
    Mouse.autoIntensity = props.autoIntensity; Mouse.takeoverDuration = props.takeoverDuration;
    this.lastUserInteraction = performance.now();
    Mouse.onInteract = () => { this.lastUserInteraction = performance.now(); if (this.autoDriver) this.autoDriver.forceStop(); };
    this.autoDriver = new AutoDriver(Mouse, this, { enabled: props.autoDemo, speed: props.autoSpeed, resumeDelay: props.autoResumeDelay, rampDuration: props.autoRampDuration });
    this.rafId = null; this.running = false; this._initialized = false;
    props.$wrapper.prepend(Common.renderer.domElement);
    this.output = new Output(props.config, Common, Mouse, props.paletteTex, props.bgVec4);
    this._loop = this.loop.bind(this); this._resize = this.resize.bind(this);
    this._onVisibility = () => {
      if (!this._initialized) return;
      if (document.hidden) this.pause();
      else this.start();
    };
    document.addEventListener('visibilitychange', this._onVisibility);
  }
  resize() { this.Common.resize(); this.output.resize(); }
  render() { if (this.autoDriver) this.autoDriver.update(); this.Mouse.update(); this.Common.update(); this.output.update(); }
  loop() { if (!this.running) return; this.render(); this.rafId = requestAnimationFrame(this._loop); }
  start() { if (this.running) return; this.running = true; this._initialized = true; this._loop(); }
  pause() { this.running = false; if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; } }
  dispose() {
    try {
      document.removeEventListener('visibilitychange', this._onVisibility);
      this.Mouse.dispose();
      if (this.Common.renderer) {
        const c = this.Common.renderer.domElement;
        if (c && c.parentNode) c.parentNode.removeChild(c);
        this.Common.renderer.dispose();
        const gl = this.Common.renderer.getContext();
        if (gl) { const ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); }
      }
    } catch (e) { void 0; }
  }
}
