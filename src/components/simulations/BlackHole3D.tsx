import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Atom, ChevronDown, ChevronUp, Clock, Gauge, Sparkles } from 'lucide-react';
import { calculateRelativity } from '../../utils/astroMath';

export const BlackHole3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [bhMass, setBhMass] = useState(10); // Solar masses
  const [spinA, setSpinA] = useState(0.85); // 0 to 0.99
  const [observerDistanceKm, setObserverDistanceKm] = useState(150);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [showSpacetimeGrid, setShowSpacetimeGrid] = useState(true);

  const animationFrameRef = useRef<number | null>(null);
  const accretionMeshRef = useRef<THREE.Mesh | null>(null);
  const spacetimeGridRef = useRef<THREE.LineSegments | null>(null);

  const relativityStats = calculateRelativity(0.8, bhMass, observerDistanceKm * 1000);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.005);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 18, 38);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Deep space background stars
    const starCount = 2000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 250 + Math.random() * 200;
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ size: 1.5, color: 0xe2e8f0, transparent: true, opacity: 0.8 });
    scene.add(new THREE.Points(starGeo, starMat));

    // EVENT HORIZON (Pure Black Sphere)
    const horizonRadius = 3.2;
    const horizonGeo = new THREE.SphereGeometry(horizonRadius, 64, 64);
    const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
    scene.add(horizonMesh);

    // PHOTON SPHERE GLOW RING (r = 1.5 r_s)
    const photonSphereGeo = new THREE.SphereGeometry(horizonRadius * 1.5, 64, 64);
    const photonSphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(photonSphereGeo, photonSphereMat));

    // RELATIVISTIC ACCRETION DISK (Procedural texture with Doppler beaming)
    const diskCanvas = document.createElement('canvas');
    diskCanvas.width = 1024;
    diskCanvas.height = 256;
    const ctx = diskCanvas.getContext('2d')!;

    // Radial gradient representing temperature gradient (Inner ISCO hottest ~10^7 K blue-white, outer cooler orange-red)
    const diskGrad = ctx.createLinearGradient(0, 0, 1024, 0);
    diskGrad.addColorStop(0, '#ffffff'); // Inner ISCO
    diskGrad.addColorStop(0.15, '#67e8f9'); // High energy cyan
    diskGrad.addColorStop(0.4, '#f59e0b'); // Intermediate gold
    diskGrad.addColorStop(0.7, '#ea580c'); // Outer orange
    diskGrad.addColorStop(1, 'rgba(185, 28, 28, 0)'); // Outer edge fade
    ctx.fillStyle = diskGrad;
    ctx.fillRect(0, 0, 1024, 256);

    // Turbulent spiral magnetic striations
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(Math.random() * 1024, 0, 8 + Math.random() * 15, 256);
    }

    const diskTex = new THREE.CanvasTexture(diskCanvas);
    diskTex.wrapS = THREE.RepeatWrapping;
    diskTex.wrapT = THREE.ClampToEdgeWrapping;
    diskTex.repeat.set(4, 1);

    const accretionGeo = new THREE.RingGeometry(horizonRadius * 1.6, horizonRadius * 5.8, 128);
    const accretionMat = new THREE.MeshBasicMaterial({
      map: diskTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
    });
    const accretionMesh = new THREE.Mesh(accretionGeo, accretionMat);
    accretionMesh.rotation.x = Math.PI / 2 + 0.18;
    scene.add(accretionMesh);
    accretionMeshRef.current = accretionMesh;

    // GRAVITATIONAL LENSING HALO RING (Simulated Einstein Ring overhead)
    const lensRingGeo = new THREE.RingGeometry(horizonRadius * 1.52, horizonRadius * 4.2, 96);
    const lensRingMat = new THREE.MeshBasicMaterial({
      map: diskTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const lensRingMesh = new THREE.Mesh(lensRingGeo, lensRingMat);
    lensRingMesh.rotation.x = 0; // Vertical halo around the shadow
    scene.add(lensRingMesh);

    // RELATIVISTIC SPACETIME CURVATURE GRID (Einstein's metric funnel)
    const gridSize = 40;
    const gridDivisions = 40;
    const gridPoints: THREE.Vector3[] = [];

    for (let i = -gridSize / 2; i <= gridSize / 2; i += gridSize / gridDivisions) {
      for (let j = -gridSize / 2; j <= gridSize / 2; j += gridSize / gridDivisions) {
        const dist = Math.sqrt(i * i + j * j);
        // Funnel deformation ~ -1 / dist
        const dip = dist < 2.5 ? -14 : -12 / Math.pow(dist, 0.85);

        // Grid lines parallel to X
        if (i + gridSize / gridDivisions <= gridSize / 2) {
          const nextDist = Math.sqrt((i + gridSize / gridDivisions) ** 2 + j * j);
          const nextDip = nextDist < 2.5 ? -14 : -12 / Math.pow(nextDist, 0.85);
          gridPoints.push(new THREE.Vector3(i, dip - 5, j));
          gridPoints.push(new THREE.Vector3(i + gridSize / gridDivisions, nextDip - 5, j));
        }

        // Grid lines parallel to Z
        if (j + gridSize / gridDivisions <= gridSize / 2) {
          const nextDist = Math.sqrt(i * i + (j + gridSize / gridDivisions) ** 2);
          const nextDip = nextDist < 2.5 ? -14 : -12 / Math.pow(nextDist, 0.85);
          gridPoints.push(new THREE.Vector3(i, dip - 5, j));
          gridPoints.push(new THREE.Vector3(i, nextDip - 5, j + gridSize / gridDivisions));
        }
      }
    }

    const gridGeo = new THREE.BufferGeometry().setFromPoints(gridPoints);
    const gridMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28 });
    const spacetimeGrid = new THREE.LineSegments(gridGeo, gridMat);
    scene.add(spacetimeGrid);
    spacetimeGridRef.current = spacetimeGrid;

    // Interactive Drag Orbit
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = { radius: 42, theta: 0.3, phi: 1.1 };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      spherical.theta -= dx * 0.007;
      spherical.phi = Math.max(0.15, Math.min(Math.PI / 2 + 0.3, spherical.phi + dy * 0.007));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      spherical.radius = Math.max(16, Math.min(90, spherical.radius + e.deltaY * 0.05));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domEl.addEventListener('wheel', onWheel, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      // Rotate accretion disk
      if (accretionMeshRef.current) {
        accretionMeshRef.current.rotation.z += 0.008;
      }
      lensRingMesh.rotation.z += 0.005;

      // Update camera position
      const cx = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      const cy = spherical.radius * Math.cos(spherical.phi);
      const cz = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);

      camera.position.set(cx, cy, cz);
      camera.lookAt(0, -1, 0);

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (domEl.parentNode) domEl.parentNode.removeChild(domEl);
    };
  }, []);

  useEffect(() => {
    if (spacetimeGridRef.current) {
      spacetimeGridRef.current.visible = showSpacetimeGrid;
    }
  }, [showSpacetimeGrid]);

  return (
    <div className="relative w-full h-[650px] lg:h-[720px] rounded-2xl overflow-hidden bg-[#030712] border border-slate-800 shadow-2xl flex flex-col justify-between select-none">
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top Header Badge */}
      <div className="relative z-10 p-4 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-medium flex items-center gap-1.5">
            <Atom className="w-3.5 h-3.5 text-purple-400" />
            GENERAL RELATIVITY & BLACK HOLE METRIC
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 drop-shadow-md">
          Kerr Black Hole & Gravitational Lensing
        </h2>
        <p className="text-xs text-slate-300 drop-shadow">
          Photon Sphere • Ergosphere • Spacetime Curvature Metric Dip
        </p>
      </div>

      {/* Unified Collapsible Bottom Dock */}
      <div
        className={`relative z-20 mx-auto w-[94%] max-w-4xl pb-4 transition-all duration-300 ${
          isDockCollapsed ? 'translate-y-[calc(100%-42px)]' : 'translate-y-0'
        }`}
      >
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 hover:bg-slate-800 border border-b-0 border-slate-700/80 rounded-t-lg text-[11px] font-mono text-slate-300 transition cursor-pointer shadow-lg"
          >
            {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-purple-400" /> : <ChevronDown className="w-3.5 h-3.5 text-purple-400" />}
            {isDockCollapsed ? 'Show Relativistic Controls' : 'Hide Controls'}
          </button>
        </div>

        <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
          {/* Relativistic Readouts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5 text-xs font-mono">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Gauge className="w-3 h-3 text-purple-400" /> Schwarzschild Radius ($r_s$)
              </span>
              <p className="text-purple-300 font-bold mt-0.5">{relativityStats.schwarzschildRadiusKm} km</p>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" /> Grav. Time Dilation
              </span>
              <p className="text-cyan-300 font-bold mt-0.5">{relativityStats.gravitationalDilationRatio}x Slower</p>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Photon Sphere
              </span>
              <p className="text-amber-300 font-bold mt-0.5">{(relativityStats.schwarzschildRadiusKm * 1.5).toFixed(1)} km</p>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Atom className="w-3 h-3 text-emerald-400" /> Spin Parameter ($a$)
              </span>
              <p className="text-emerald-300 font-bold mt-0.5">{spinA} c</p>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-1 border-t border-slate-800">
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">Mass:</span>
                <input
                  type="range"
                  min="3"
                  max="50"
                  step="1"
                  value={bhMass}
                  onChange={(e) => setBhMass(parseFloat(e.target.value))}
                  className="w-24 accent-purple-500 cursor-pointer"
                />
                <span className="font-mono text-purple-300 w-12">{bhMass} M☉</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">Spin $a$:</span>
                <input
                  type="range"
                  min="0.0"
                  max="0.99"
                  step="0.05"
                  value={spinA}
                  onChange={(e) => setSpinA(parseFloat(e.target.value))}
                  className="w-20 accent-emerald-500 cursor-pointer"
                />
                <span className="font-mono text-emerald-300 w-10">{spinA}</span>
              </div>

              <button
                onClick={() => setShowSpacetimeGrid(!showSpacetimeGrid)}
                className={`px-3 py-1 rounded-lg border text-xs font-medium transition cursor-pointer ${
                  showSpacetimeGrid
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                Spacetime Grid: {showSpacetimeGrid ? 'ON' : 'OFF'}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 hidden lg:block">
              1 hour at event horizon corresponds to {relativityStats.gravitationalDilationRatio} hours for distant observers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
