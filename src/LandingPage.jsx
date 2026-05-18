import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CommonClass, MouseClass, AutoDriver, Simulation, Output, WebGLManager } from './simulation';

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

function LiquidEther({
  colors = ['#5227FF', '#FF9FFC', '#B497CF'],
  mouseForce = 20,
  cursorSize = 100,
  isViscous = true,
  viscous = 30,
  iterationsViscous = 32,
  iterationsPoisson = 32,
  resolution = 0.5,
  isBounce = false,
  autoDemo = true,
  autoSpeed = 0.5,
  autoIntensity = 2.2,
  takeoverDuration = 0.25,
  autoResumeDelay = 3000,
  autoRampDuration = 0.6,
  dt = 0.014,
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
      autoDemo,
      autoSpeed,
      autoIntensity,
      takeoverDuration,
      autoResumeDelay,
      autoRampDuration,
      paletteTex,
      bgVec4,
    }, Common, Mouse);

    let resizeRafId = null;
    let resizeObserver = null;
    let intersectionObserver = null;
    let isVisible = true;
    let firstIntersectionCallback = true;

    // Start immediately
    webgl.start();

    // Delayed IntersectionObserver
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

    // ResizeObserver
    resizeObserver = new ResizeObserver(() => {
      if (!webgl) return;
      if (resizeRafId) cancelAnimationFrame(resizeRafId);
      resizeRafId = requestAnimationFrame(() => { if (webgl) webgl.resize(); });
    });
    resizeObserver.observe(container);

    // Cleanup
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
        zIndex: 0,
      }}
    >
      <LiquidEther
        colors={['#5227FF', '#FF9FFC', '#B497CF']}
        mouseForce={20}
        cursorSize={100}
        isViscous={true}
        viscous={30}
        iterationsViscous={32}
        iterationsPoisson={32}
        resolution={0.5}
        isBounce={false}
        autoDemo={true}
        autoSpeed={0.5}
        autoIntensity={2.2}
        takeoverDuration={0.25}
        autoResumeDelay={3000}
        autoRampDuration={0.6}
        dt={0.014}
        BFECC={true}
      />

      {/* Centered overlay for future title text */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        {/* Deep Scan title text component will be placed here */}
      </div>
    </div>
  );
}
