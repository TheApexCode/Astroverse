import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Orbit, Play, Pause, RotateCcw, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Body {
  name: string;
  mass: number;
  radius: number;
  color: string;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  mesh?: THREE.Mesh;
  trailLine?: THREE.Line;
  trailHistory: THREE.Vector3[];
}

export const NBodyGravityEngine: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [preset, setPreset] = useState<'figure8' | 'binary' | 'lagrange' | 'chaotic'>('figure8');
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [kineticEnergy, setKineticEnergy] = useState('0.00');

  const animationFrameRef = useRef<number | null>(null);
  const bodiesRef = useRef<Body[]>([]);
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(simulationSpeed);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = simulationSpeed;
  }, [simulationSpeed]);

  const loadPresetBodies = (type: 'figure8' | 'binary' | 'lagrange' | 'chaotic') => {
    const list: Body[] = [];
    if (type === 'figure8') {
      // Classic Moore & Chenciner Three-Body Figure-8 stable solution
      const m = 100;
      const x1 = 0.97000436;
      const y1 = -0.24308753;
      const vx3 = 2 * -0.46620531;
      const vy3 = 2 * -0.43236573;
      const vx1 = -vx3 / 2;
      const vy1 = -vy3 / 2;
      const scale = 14;
      const vScale = 1.35;

      list.push(
        {
          name: 'Star Alpha',
          mass: m,
          radius: 1.2,
          color: '#38bdf8',
          pos: new THREE.Vector3(x1 * scale, 0, y1 * scale),
          vel: new THREE.Vector3(vx1 * vScale, 0, vy1 * vScale),
          trailHistory: [],
        },
        {
          name: 'Star Beta',
          mass: m,
          radius: 1.2,
          color: '#f59e0b',
          pos: new THREE.Vector3(-x1 * scale, 0, -y1 * scale),
          vel: new THREE.Vector3(vx1 * vScale, 0, vy1 * vScale),
          trailHistory: [],
        },
        {
          name: 'Star Gamma',
          mass: m,
          radius: 1.2,
          color: '#ec4899',
          pos: new THREE.Vector3(0, 0, 0),
          vel: new THREE.Vector3(vx3 * vScale, 0, vy3 * vScale),
          trailHistory: [],
        }
      );
    } else if (type === 'binary') {
      // Binary Star with circumbinary planet
      list.push(
        {
          name: 'Primary Sun',
          mass: 250,
          radius: 1.5,
          color: '#fbbf24',
          pos: new THREE.Vector3(-6, 0, 0),
          vel: new THREE.Vector3(0, 0, 1.8),
          trailHistory: [],
        },
        {
          name: 'Secondary Sun',
          mass: 180,
          radius: 1.2,
          color: '#f97316',
          pos: new THREE.Vector3(6, 0, 0),
          vel: new THREE.Vector3(0, 0, -2.5),
          trailHistory: [],
        },
        {
          name: 'Tatooine Planet',
          mass: 1,
          radius: 0.6,
          color: '#10b981',
          pos: new THREE.Vector3(26, 0, 0),
          vel: new THREE.Vector3(0, 0, -3.2),
          trailHistory: [],
        }
      );
    } else if (type === 'lagrange') {
      // Heavy Star, Planet, and test particle near L4/L5 Trojan point
      list.push(
        {
          name: 'Host Star',
          mass: 500,
          radius: 2.2,
          color: '#fef08a',
          pos: new THREE.Vector3(0, 0, 0),
          vel: new THREE.Vector3(0, 0, 0),
          trailHistory: [],
        },
        {
          name: 'Gas Giant',
          mass: 15,
          radius: 1.0,
          color: '#d97706',
          pos: new THREE.Vector3(18, 0, 0),
          vel: new THREE.Vector3(0, 0, -4.8),
          trailHistory: [],
        },
        {
          name: 'Trojan Asteroid (L4)',
          mass: 0.1,
          radius: 0.4,
          color: '#38bdf8',
          pos: new THREE.Vector3(9, 0, 15.58), // equilateral triangle
          vel: new THREE.Vector3(4.15, 0, -2.4),
          trailHistory: [],
        }
      );
    } else {
      // Chaotic 3-body
      list.push(
        {
          name: 'Body 1',
          mass: 120,
          radius: 1.1,
          color: '#38bdf8',
          pos: new THREE.Vector3(-10, 0, 5),
          vel: new THREE.Vector3(1.2, 0, 1.0),
          trailHistory: [],
        },
        {
          name: 'Body 2',
          mass: 100,
          radius: 1.0,
          color: '#f43f5e',
          pos: new THREE.Vector3(8, 0, -6),
          vel: new THREE.Vector3(-0.9, 0, -1.2),
          trailHistory: [],
        },
        {
          name: 'Body 3',
          mass: 90,
          radius: 0.9,
          color: '#eab308',
          pos: new THREE.Vector3(2, 0, 12),
          vel: new THREE.Vector3(-0.5, 0, 0.4),
          trailHistory: [],
        }
      );
    }
    return list;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 45, 55);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Deep space stars
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(1500 * 3);
    for (let i = 0; i < 1500; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 500;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 500;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 500;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ size: 1.5, color: 0x94a3b8 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Orbital Plane Reference Grid
    const gridHelper = new THREE.GridHelper(60, 30, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -0.2;
    scene.add(gridHelper);

    // Ambient & Point light
    scene.add(new THREE.AmbientLight(0x334155, 0.9));
    const pointLight = new THREE.PointLight(0xffffff, 2, 200);
    scene.add(pointLight);

    // Initialize Bodies
    const bodies = loadPresetBodies(preset);
    bodies.forEach((b) => {
      const geo = new THREE.SphereGeometry(b.radius, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: b.color,
        emissive: b.color,
        emissiveIntensity: 0.35,
        roughness: 0.4,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(b.pos);
      scene.add(mesh);
      b.mesh = mesh;

      // Trajectory line trail
      const trailGeo = new THREE.BufferGeometry();
      const trailMat = new THREE.LineBasicMaterial({
        color: b.color,
        transparent: true,
        opacity: 0.5,
      });
      const trailLine = new THREE.Line(trailGeo, trailMat);
      scene.add(trailLine);
      b.trailLine = trailLine;
    });

    bodiesRef.current = bodies;

    // Drag orbit controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = { radius: 70, theta: Math.PI / 4, phi: Math.PI / 3.5 };

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

      spherical.theta -= dx * 0.006;
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi + dy * 0.006));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      spherical.radius = Math.max(20, Math.min(180, spherical.radius + e.deltaY * 0.08));
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

    // Physics Engine loop: Symplectic Verlet / Euler integration
    const G = 1.0;
    const softening = 0.8; // gravitational softening to avoid infinite slingshots

    let lastTime = performance.now();
    let lastEnergyUpdate = 0;

    const animate = () => {
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (isPlayingRef.current) {
        const dt = delta * speedRef.current * 1.8;
        const currentBodies = bodiesRef.current;

        // Calculate mutual pairwise Newtonian gravities F = G * m1 * m2 / r^2
        const forces: THREE.Vector3[] = currentBodies.map(() => new THREE.Vector3(0, 0, 0));

        for (let i = 0; i < currentBodies.length; i++) {
          for (let j = i + 1; j < currentBodies.length; j++) {
            const b1 = currentBodies[i];
            const b2 = currentBodies[j];

            const diff = new THREE.Vector3().subVectors(b2.pos, b1.pos);
            const distSq = diff.lengthSq() + softening * softening;
            const dist = Math.sqrt(distSq);

            const forceMagnitude = (G * b1.mass * b2.mass) / distSq;
            const forceDir = diff.normalize();

            forces[i].addScaledVector(forceDir, forceMagnitude);
            forces[j].addScaledVector(forceDir, -forceMagnitude);
          }
        }

        let totalKinetic = 0;

        // Update velocities and positions
        for (let i = 0; i < currentBodies.length; i++) {
          const b = currentBodies[i];
          const accel = forces[i].divideScalar(b.mass);
          b.vel.addScaledVector(accel, dt);
          b.pos.addScaledVector(b.vel, dt);

          if (b.mesh) {
            b.mesh.position.copy(b.pos);
          }

          totalKinetic += 0.5 * b.mass * b.vel.lengthSq();

          // Trail tracking
          b.trailHistory.push(b.pos.clone());
          if (b.trailHistory.length > 140) {
            b.trailHistory.shift();
          }

          if (b.trailLine && b.trailHistory.length > 2) {
            b.trailLine.geometry.setFromPoints(b.trailHistory);
          }
        }

        if (now - lastEnergyUpdate > 400) {
          lastEnergyUpdate = now;
          const val = totalKinetic.toFixed(1);
          setKineticEnergy((prev) => (prev !== val ? val : prev));
        }
      }

      // Camera update
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 0, 0);

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
  }, [preset]);

  return (
    <div className="relative w-full h-[650px] lg:h-[720px] rounded-2xl overflow-hidden bg-[#030712] border border-slate-800 shadow-2xl flex flex-col justify-between select-none">
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top Header Badge */}
      <div className="relative z-10 p-4 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-medium flex items-center gap-1.5">
            <Orbit className="w-3.5 h-3.5 text-emerald-400" />
            N-BODY GRAVITATIONAL PHYSICS ENGINE
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 text-xs font-mono">
            $E_k$: {kineticEnergy} J
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 drop-shadow-md">
          {preset === 'figure8' && 'Figure-8 Choreography (Moore & Chenciner)'}
          {preset === 'binary' && 'Binary Stars with Circumbinary Exoplanet'}
          {preset === 'lagrange' && 'Lagrange Equilibrium & Trojan Orbit (L4)'}
          {preset === 'chaotic' && 'Chaotic 3-Body Gravitational Slingshot'}
        </h2>
        <p className="text-xs text-slate-300 drop-shadow">
          Symplectic integration of F = G·(m₁·m₂)/r² with real-time trajectory trails
        </p>
      </div>

      {/* Unified Bottom Controls Dock */}
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
            {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-emerald-400" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />}
            {isDockCollapsed ? 'Show Gravity Controls' : 'Hide Controls'}
          </button>
        </div>

        <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] font-mono text-slate-400 mr-1">Presets:</span>
            {[
              { id: 'figure8', label: 'Figure-8 Stable' },
              { id: 'binary', label: 'Binary Tatooine' },
              { id: 'lagrange', label: 'Lagrange L4' },
              { id: 'chaotic', label: 'Chaotic 3-Body' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPreset(p.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  preset === p.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Speed & Playback */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5">
              <span className="text-[11px] font-mono text-slate-400">Rate:</span>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.2"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                className="w-16 accent-emerald-500 cursor-pointer"
              />
              <span className="font-mono text-emerald-300 w-8">{simulationSpeed.toFixed(1)}x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
