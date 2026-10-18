import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, ChevronDown, ChevronUp, ZoomIn, Eye, Sparkles } from 'lucide-react';

interface PlanetConfig {
  name: string;
  radius: number;
  distance: number;
  speed: number;
  color: string;
  orbitalInclination: number; // deg
  hasRings?: boolean;
  hasAtmosphere?: boolean;
  ringsRadiusInner?: number;
  ringsRadiusOuter?: number;
}

const PLANETS_CONFIG: PlanetConfig[] = [
  { name: 'Mercury', radius: 0.6, distance: 9, speed: 4.15, color: '#94a3b8', orbitalInclination: 7.0 },
  { name: 'Venus', radius: 1.1, distance: 13, speed: 1.62, color: '#f59e0b', orbitalInclination: 3.4 },
  { name: 'Earth', radius: 1.2, distance: 18, speed: 1.0, color: '#38bdf8', orbitalInclination: 0.0, hasAtmosphere: true },
  { name: 'Mars', radius: 0.8, distance: 24, speed: 0.53, color: '#ef4444', orbitalInclination: 1.85 },
  { name: 'Jupiter', radius: 3.2, distance: 34, speed: 0.084, color: '#d97706', orbitalInclination: 1.3 },
  { name: 'Saturn', radius: 2.7, distance: 45, speed: 0.034, color: '#fef08a', orbitalInclination: 2.49, hasRings: true, ringsRadiusInner: 3.4, ringsRadiusOuter: 6.2 },
  { name: 'Uranus', radius: 1.8, distance: 56, speed: 0.012, color: '#67e8f9', orbitalInclination: 0.77 },
  { name: 'Neptune', radius: 1.7, distance: 67, speed: 0.006, color: '#3b82f6', orbitalInclination: 1.77 },
  { name: 'Pluto', radius: 0.4, distance: 78, speed: 0.004, color: '#cbd5e1', orbitalInclination: 17.15 },
];

// Helper to create procedural planet texture canvas
function createPlanetTexture(type: string, baseColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (type === 'sun') {
    const grad = ctx.createRadialGradient(256, 128, 10, 256, 128, 256);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.2, '#fef08a');
    grad.addColorStop(0.6, '#f97316');
    grad.addColorStop(1, '#ea580c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Sunspots
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = 'rgba(120, 20, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 256, 2 + Math.random() * 6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'earth') {
    // Oceans already baseColor #38bdf8
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, 512, 256);
    // Continents
    ctx.fillStyle = '#16a34a';
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.ellipse(Math.random() * 512, Math.random() * 256, 15 + Math.random() * 30, 10 + Math.random() * 20, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // Swirling white clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 25; i++) {
      ctx.beginPath();
      ctx.ellipse(Math.random() * 512, Math.random() * 256, 40 + Math.random() * 60, 5 + Math.random() * 15, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'jupiter') {
    // Cloud bands
    const bands = ['#b45309', '#d97706', '#f59e0b', '#78350f', '#fde68a', '#d97706', '#92400e'];
    for (let y = 0; y < 256; y += 12) {
      ctx.fillStyle = bands[Math.floor((y / 256) * bands.length)];
      ctx.fillRect(0, y, 512, 12);
    }
    // Great Red Spot
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.ellipse(320, 170, 34, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Noise bands for other planets
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 30; i++) {
      ctx.fillRect(0, Math.random() * 256, 512, 2 + Math.random() * 6);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let i = 0; i < 20; i++) {
      ctx.fillRect(0, Math.random() * 256, 512, 1 + Math.random() * 5);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export const SolarSystemOrrery: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [focusedBody, setFocusedBody] = useState<string>('Sun');
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [simulatedDays, setSimulatedDays] = useState(0);

  // Mutable refs for Three.js render loop without state recreation
  const animationFrameRef = useRef<number | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const timeSpeedRef = useRef(timeSpeed);
  const focusedBodyRef = useRef(focusedBody);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    timeSpeedRef.current = timeSpeed;
  }, [timeSpeed]);

  useEffect(() => {
    focusedBodyRef.current = focusedBody;
  }, [focusedBody]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.0035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 55, 85);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Deep space starry background field
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 500 + Math.random() * 400;

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const color = new THREE.Color().setHSL(0.55 + Math.random() * 0.15, 0.3, 0.6 + Math.random() * 0.4);
      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 1.6, vertexColors: true, transparent: true, opacity: 0.85 });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Lighting
    const sunLight = new THREE.PointLight(0xfffbeb, 3.5, 300, 0.5);
    scene.add(sunLight);
    const ambientLight = new THREE.AmbientLight(0x1e293b, 0.6);
    scene.add(ambientLight);

    // THE SUN (3-part procedural model)
    const sunGroup = new THREE.Group();
    const sunTex = createPlanetTexture('sun', '#f59e0b');
    const sunGeo = new THREE.SphereGeometry(4.5, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTex });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sunMesh);

    // Sun corona glow
    const coronaGeo = new THREE.SphereGeometry(5.2, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    sunGroup.add(coronaMesh);
    scene.add(sunGroup);

    // Asteroid belt particles between Mars & Jupiter (distance 27 to 30)
    const asteroidCount = 1200;
    const asteroidGeo = new THREE.BufferGeometry();
    const asteroidPos = new Float32Array(asteroidCount * 3);
    for (let i = 0; i < asteroidCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 27 + Math.random() * 4;
      const height = (Math.random() - 0.5) * 1.8;
      asteroidPos[i * 3] = Math.cos(angle) * dist;
      asteroidPos[i * 3 + 1] = height;
      asteroidPos[i * 3 + 2] = Math.sin(angle) * dist;
    }
    asteroidGeo.setAttribute('position', new THREE.BufferAttribute(asteroidPos, 3));
    const asteroidMat = new THREE.PointsMaterial({ size: 0.7, color: 0x94a3b8, transparent: true, opacity: 0.6 });
    const asteroidBelt = new THREE.Points(asteroidGeo, asteroidMat);
    scene.add(asteroidBelt);

    // Planetary Bodies & Orbits
    interface PlanetMeshItem {
      config: PlanetConfig;
      group: THREE.Group;
      mesh: THREE.Mesh;
      currentAngle: number;
      orbitLine: THREE.Line;
    }

    const planetMeshes: PlanetMeshItem[] = [];

    PLANETS_CONFIG.forEach((cfg) => {
      const pGroup = new THREE.Group();

      // Planet Sphere
      const texType = cfg.name.toLowerCase();
      const pTex = createPlanetTexture(texType, cfg.color);
      const pGeo = new THREE.SphereGeometry(cfg.radius, 32, 32);
      const pMat = new THREE.MeshStandardMaterial({
        map: pTex,
        roughness: 0.7,
        metalness: 0.1,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pGroup.add(pMesh);

      // Earth atmosphere
      if (cfg.hasAtmosphere) {
        const atmoGeo = new THREE.SphereGeometry(cfg.radius * 1.08, 32, 32);
        const atmoMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.25,
          side: THREE.BackSide,
        });
        pGroup.add(new THREE.Mesh(atmoGeo, atmoMat));
      }

      // Saturn Rings
      if (cfg.hasRings && cfg.ringsRadiusInner && cfg.ringsRadiusOuter) {
        const ringGeo = new THREE.RingGeometry(cfg.ringsRadiusInner, cfg.ringsRadiusOuter, 64);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0xfde68a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
          roughness: 0.6,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2 + 0.35;
        pGroup.add(ringMesh);
      }

      scene.add(pGroup);

      // Orbit Line
      const orbitPoints: THREE.Vector3[] = [];
      const segments = 128;
      const incRad = (cfg.orbitalInclination * Math.PI) / 180;
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        const x = Math.cos(theta) * cfg.distance;
        const z = Math.sin(theta) * cfg.distance;
        const y = Math.sin(theta) * cfg.distance * Math.tan(incRad) * 0.4;
        orbitPoints.push(new THREE.Vector3(x, y, z));
      }
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(cfg.color).multiplyScalar(0.7),
        transparent: true,
        opacity: 0.35,
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      scene.add(orbitLine);

      planetMeshes.push({
        config: cfg,
        group: pGroup,
        mesh: pMesh,
        currentAngle: Math.random() * Math.PI * 2,
        orbitLine,
      });
    });

    // Orbit Controls / Mouse Drag interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = { radius: 100, theta: Math.PI / 4, phi: Math.PI / 3 };
    const targetLookAt = new THREE.Vector3(0, 0, 0);

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      spherical.theta -= deltaX * 0.006;
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi + deltaY * 0.006));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      spherical.radius = Math.max(15, Math.min(250, spherical.radius + e.deltaY * 0.08));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domEl.addEventListener('wheel', onWheel, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let lastTime = performance.now();
    let accumulatedDays = 0;

    const animate = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Sun rotation
      sunMesh.rotation.y += 0.003;

      if (isPlayingRef.current) {
        const speedMultiplier = timeSpeedRef.current;
        accumulatedDays += delta * 15 * speedMultiplier;
        const currentDay = Math.floor(accumulatedDays);
        setSimulatedDays((prev) => (prev !== currentDay ? currentDay : prev));

        planetMeshes.forEach((item) => {
          // Angular orbital step
          const orbitalStep = (item.config.speed * delta * 0.4 * speedMultiplier);
          item.currentAngle += orbitalStep;

          const incRad = (item.config.orbitalInclination * Math.PI) / 180;
          const x = Math.cos(item.currentAngle) * item.config.distance;
          const z = Math.sin(item.currentAngle) * item.config.distance;
          const y = Math.sin(item.currentAngle) * item.config.distance * Math.tan(incRad) * 0.4;

          item.group.position.set(x, y, z);
          // Axial spin
          item.mesh.rotation.y += 0.015;
        });
      }

      // Camera Positioning & Focus tracking
      const focusName = focusedBodyRef.current;
      const desiredLookAt = new THREE.Vector3(0, 0, 0);

      if (focusName !== 'Sun') {
        const targetPlanet = planetMeshes.find((p) => p.config.name === focusName);
        if (targetPlanet) {
          desiredLookAt.copy(targetPlanet.group.position);
        }
      }

      targetLookAt.lerp(desiredLookAt, 0.05);

      const targetCamX = targetLookAt.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      const targetCamY = targetLookAt.y + spherical.radius * Math.cos(spherical.phi);
      const targetCamZ = targetLookAt.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 6, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 6, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 6, delta);
      camera.lookAt(targetLookAt);

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

  return (
    <div className="relative w-full h-[650px] lg:h-[720px] rounded-2xl overflow-hidden bg-[#030712] border border-slate-800 shadow-2xl select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Spec Badge */}
      <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            KEPLER ORRERY v3.2
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900/80 text-slate-400 text-xs font-mono">
            T+ {simulatedDays} Days
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-mono">Drag to rotate • Scroll to zoom • Select body to track</p>
      </div>

      {/* Collapsible Unified Bottom Control Dock (Three.js Skill directive) */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-4xl transition-all duration-300 z-20 ${
          isDockCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
        }`}
      >
        {/* Toggle Button */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 hover:bg-slate-800 border border-b-0 border-slate-700/80 rounded-t-lg text-[11px] font-mono text-slate-300 transition cursor-pointer"
          >
            {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />}
            {isDockCollapsed ? 'Show Orbital Controls' : 'Hide Controls'}
          </button>
        </div>

        {/* Dock Surface */}
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition cursor-pointer"
              title={isPlaying ? 'Pause Simulation' : 'Run Simulation'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Speed slider */}
            <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5">
              <span className="text-[11px] font-mono text-slate-400">Warp:</span>
              <input
                type="range"
                min="0.2"
                max="10"
                step="0.2"
                value={timeSpeed}
                onChange={(e) => setTimeSpeed(parseFloat(e.target.value))}
                className="w-20 accent-cyan-500 cursor-pointer"
              />
              <span className="font-mono text-cyan-300 w-9 text-right">{timeSpeed.toFixed(1)}x</span>
            </div>
          </div>

          {/* Planet Focus Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" /> Target:
            </span>
            {['Sun', 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'].map((name) => (
              <button
                key={name}
                onClick={() => setFocusedBody(name)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  focusedBody === name
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                    : 'bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
