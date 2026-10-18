import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CELESTIAL_OBJECTS } from '../../data/celestialData';
import { CelestialObject } from '../../types/astronomy';
import { Compass, RotateCw, Layers, ShieldCheck, Thermometer, Weight, Radio, ChevronDown, ChevronUp } from 'lucide-react';

export const PlanetExplorer3D: React.FC = () => {
  const planetsList = CELESTIAL_OBJECTS.filter(
    (o) => o.category === 'planet' || o.id === 'sun' || o.id === 'moon'
  );

  const [selectedPlanet, setSelectedPlanet] = useState<CelestialObject>(
    planetsList.find((p) => p.id === 'earth') || planetsList[0]
  );
  const [wireframeMode, setWireframeMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const ringsGroupRef = useRef<THREE.Group | null>(null);

  const autoRotateRef = useRef(autoRotate);
  const rotationSpeedRef = useRef(rotationSpeed);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    rotationSpeedRef.current = rotationSpeed;
  }, [rotationSpeed]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // Directional Key Light & Soft Ambient Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(5, 3, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    fillLight.position.set(-5, -2, -3);
    scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.8);
    scene.add(ambientLight);

    // Generate procedural surface texture for selected planet
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const pId = selectedPlanet.id;
    ctx.fillStyle = selectedPlanet.colorHex;
    ctx.fillRect(0, 0, 1024, 512);

    if (pId === 'sun') {
      const grad = ctx.createLinearGradient(0, 0, 1024, 512);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(0.5, '#ea580c');
      grad.addColorStop(1, '#ef4444');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);
      // Granulation cells
      for (let i = 0; i < 400; i++) {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
        ctx.beginPath();
        ctx.arc(Math.random() * 1024, Math.random() * 512, 1 + Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (pId === 'earth') {
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(0, 0, 1024, 512);
      // Continents
      ctx.fillStyle = '#15803d';
      for (let i = 0; i < 70; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * 1024, Math.random() * 512, 30 + Math.random() * 50, 20 + Math.random() * 40, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      // Desert patches
      ctx.fillStyle = '#ca8a04';
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 1024, 200 + Math.random() * 100, 15 + Math.random() * 25, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (pId === 'jupiter') {
      const colors = ['#b45309', '#78350f', '#f59e0b', '#d97706', '#fef3c7', '#92400e'];
      for (let y = 0; y < 512; y += 16) {
        ctx.fillStyle = colors[Math.floor((y / 512) * colors.length)];
        ctx.fillRect(0, y, 1024, 16);
      }
      // Great Red Spot
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.ellipse(650, 320, 60, 35, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (pId === 'mars') {
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(0, 0, 1024, 512);
      // Darker basaltic maria
      ctx.fillStyle = '#7f1d1d';
      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * 1024, Math.random() * 512, 40 + Math.random() * 60, 20 + Math.random() * 30, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // Polar Ice Caps
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 1024, 30);
      ctx.fillRect(0, 482, 1024, 30);
    } else {
      // General banded noise for Venus/Mercury/Uranus/Neptune
      for (let y = 0; y < 512; y += 8) {
        ctx.fillStyle = y % 16 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, y, 1024, 8);
      }
    }

    const surfaceTex = new THREE.CanvasTexture(canvas);
    surfaceTex.colorSpace = THREE.SRGBColorSpace;

    // Main Planet Geometry
    const planetGeo = new THREE.SphereGeometry(2.2, 64, 64);
    const planetMat = new THREE.MeshStandardMaterial({
      map: surfaceTex,
      roughness: pId === 'earth' ? 0.5 : 0.75,
      metalness: 0.1,
      wireframe: wireframeMode,
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    scene.add(planetMesh);
    currentMeshRef.current = planetMesh;

    // Atmospheric or Corona Glow
    if (pId === 'earth' || pId === 'venus') {
      // Cloud layer for Earth
      const cloudCanvas = document.createElement('canvas');
      cloudCanvas.width = 1024;
      cloudCanvas.height = 512;
      const cCtx = cloudCanvas.getContext('2d')!;
      cCtx.fillStyle = 'rgba(0,0,0,0)';
      cCtx.fillRect(0, 0, 1024, 512);
      cCtx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      for (let i = 0; i < 60; i++) {
        cCtx.beginPath();
        cCtx.ellipse(Math.random() * 1024, Math.random() * 512, 60 + Math.random() * 100, 12 + Math.random() * 25, 0.2, 0, Math.PI * 2);
        cCtx.fill();
      }
      const cloudTex = new THREE.CanvasTexture(cloudCanvas);
      const cloudGeo = new THREE.SphereGeometry(2.24, 64, 64);
      const cloudMat = new THREE.MeshStandardMaterial({
        map: cloudTex,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      });
      const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
      scene.add(cloudMesh);
      cloudsMeshRef.current = cloudMesh;
    }

    // Saturn Rings
    if (pId === 'saturn') {
      const ringGroup = new THREE.Group();
      const ringGeo = new THREE.RingGeometry(3.0, 5.2, 80);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xfde68a,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        roughness: 0.5,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2 + 0.35;
      ringGroup.add(ringMesh);
      scene.add(ringGroup);
      ringsGroupRef.current = ringGroup;
    }

    // Interactive Drag rotation
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !currentMeshRef.current) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      currentMeshRef.current.rotation.y += dx * 0.007;
      currentMeshRef.current.rotation.x += dy * 0.007;
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += dx * 0.007;
        cloudsMeshRef.current.rotation.x += dy * 0.007;
      }
      if (ringsGroupRef.current) {
        ringsGroupRef.current.rotation.z += dx * 0.007;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

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
      if (autoRotateRef.current && currentMeshRef.current) {
        const speed = 0.004 * rotationSpeedRef.current;
        currentMeshRef.current.rotation.y += speed;
        if (cloudsMeshRef.current) {
          cloudsMeshRef.current.rotation.y += speed * 1.25;
        }
      }
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (domEl.parentNode) domEl.parentNode.removeChild(domEl);
    };
  }, [selectedPlanet, wireframeMode]);

  return (
    <div className="relative w-full h-[650px] lg:h-[720px] rounded-2xl overflow-hidden bg-[#030712] border border-slate-800 shadow-2xl flex flex-col justify-between">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top Header & Planet Switcher */}
      <div className="relative z-10 p-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              PLANETARY ATLAS 3D
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 drop-shadow-md">
            {selectedPlanet.name}
          </h2>
          <p className="text-xs text-slate-300 drop-shadow">{selectedPlanet.subtitle}</p>
        </div>

        {/* Planet quick pills */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none bg-slate-900/80 border border-slate-800 p-1.5 rounded-xl backdrop-blur-md">
          {planetsList.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlanet(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                selectedPlanet.id === p.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {p.name.replace(/ \(.*\)/, '')}
            </button>
          ))}
        </div>
      </div>

      {/* Collapsible Unified Bottom Controls & Telemetry Dock */}
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
            {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />}
            {isDockCollapsed ? 'Show Physical Telemetry' : 'Hide Telemetry'}
          </button>
        </div>

        <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
          {/* Telemetry Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5 text-xs font-mono">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Weight className="w-3 h-3 text-cyan-400" /> Mass
              </span>
              <p className="text-white font-semibold mt-0.5 truncate">{selectedPlanet.mass || 'N/A'}</p>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" /> Radius
              </span>
              <p className="text-white font-semibold mt-0.5 truncate">{selectedPlanet.radius || 'N/A'}</p>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-amber-400" /> Surface Temp
              </span>
              <p className="text-amber-300 font-semibold mt-0.5 truncate">{selectedPlanet.surfaceTemperature || 'N/A'}</p>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400" /> Orbit Period
              </span>
              <p className="text-white font-semibold mt-0.5 truncate">{selectedPlanet.orbitalPeriod || 'N/A'}</p>
            </div>
          </div>

          {/* Interactive controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                  autoRotate ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Spin: {autoRotate ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => setWireframeMode(!wireframeMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                  wireframeMode ? 'bg-purple-500/20 border-purple-400 text-purple-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Wireframe Geology</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 hidden sm:block">
              {selectedPlanet.keyFacts[0]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
