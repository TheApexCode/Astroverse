import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Compass, Crosshair, Eye, RefreshCw, Sparkles, CheckCircle2, BookmarkPlus } from 'lucide-react';
import { CONSTELLATIONS, CELESTIAL_OBJECTS } from '../../data/celestialData';
import { addLogEntry } from '../../utils/storage';

interface ARTarget {
  name: string;
  category: 'star' | 'planet' | 'constellation';
  azimuthDeg: number;
  altitudeDeg: number;
  apparentMagnitude?: number;
  constellation?: string;
  distanceLightYears?: number;
}

// Pre-defined celestial targets in the sky (module-level constant to prevent re-creation on render)
const CELESTIAL_TARGETS: ARTarget[] = [
  { name: 'Betelgeuse', category: 'star', azimuthDeg: 195, altitudeDeg: 52, apparentMagnitude: 0.5, constellation: 'Orion', distanceLightYears: 642.5 },
  { name: 'Rigel', category: 'star', azimuthDeg: 205, altitudeDeg: 38, apparentMagnitude: 0.13, constellation: 'Orion', distanceLightYears: 863 },
  { name: 'Sirius (Dog Star)', category: 'star', azimuthDeg: 165, altitudeDeg: 32, apparentMagnitude: -1.46, constellation: 'Canis Major', distanceLightYears: 8.6 },
  { name: 'Jupiter', category: 'planet', azimuthDeg: 125, altitudeDeg: 62, apparentMagnitude: -2.8, constellation: 'Taurus' },
  { name: 'Saturn', category: 'planet', azimuthDeg: 235, altitudeDeg: 28, apparentMagnitude: 0.6, constellation: 'Aquarius' },
  { name: 'Vega', category: 'star', azimuthDeg: 290, altitudeDeg: 65, apparentMagnitude: 0.03, constellation: 'Lyra', distanceLightYears: 25 },
  { name: 'Polaris (North Star)', category: 'star', azimuthDeg: 0, altitudeDeg: 40, apparentMagnitude: 1.98, constellation: 'Ursa Minor', distanceLightYears: 433 },
  { name: 'Orion (The Hunter)', category: 'constellation', azimuthDeg: 200, altitudeDeg: 46 },
  { name: 'Ursa Major (Big Dipper)', category: 'constellation', azimuthDeg: 45, altitudeDeg: 35 },
  { name: 'Cassiopeia', category: 'constellation', azimuthDeg: 340, altitudeDeg: 55 },
];

export const ARNightSky: React.FC<{ onLogObservation?: (targetName: string) => void }> = ({ onLogObservation }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasOverlayRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(180); // Azimuth
  const [devicePitch, setDevicePitch] = useState<number>(45); // Altitude
  const [activeTarget, setActiveTarget] = useState<ARTarget | null>(null);
  const [logSuccessToast, setLogSuccessToast] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Interactive Drag for Desktop / Sensor-less testing
  const isDraggingRef = useRef(false);
  const prevMouseXRef = useRef(0);
  const prevMouseYRef = useRef(0);

  // Request & Start Camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        'Camera permission was denied or unavailable. You can still aim and explore using mouse drag or touch!'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Device orientation / Gyroscope listener
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null && e.beta !== null) {
        // alpha: 0 to 360 (compass heading)
        const heading = (360 - e.alpha) % 360;
        // beta: -180 to 180 (pitch / tilt)
        const pitch = Math.max(0, Math.min(90, e.beta));
        setDeviceHeading(Math.round(heading));
        setDevicePitch(Math.round(pitch));
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // Toggle Camera
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  // Render AR Overlay onto Canvas
  useEffect(() => {
    const canvas = canvasOverlayRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Field of view in degrees (approx 60 deg horizontal, 45 deg vertical)
    const fovH = 65;
    const fovV = 45;

    let nearestTarget: ARTarget | null = null;
    let minTargetDist = Infinity;

    // Draw HUD Horizon Line & Compass Tick Marks
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;

    // Pitch altitude reference lines
    for (let alt = 0; alt <= 90; alt += 15) {
      const deltaAlt = alt - devicePitch;
      const y = cy - (deltaAlt / (fovV / 2)) * cy;
      if (y >= 0 && y <= height) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.beginPath();
        ctx.moveTo(cx - 60, y);
        ctx.lineTo(cx + 60, y);
        ctx.stroke();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`${alt}°`, cx + 65, y + 3);
      }
    }

    // Project Celestial Targets into Camera Viewport
    CELESTIAL_TARGETS.forEach((target) => {
      // Calculate angular difference in Azimuth (-180 to +180)
      let diffAz = target.azimuthDeg - deviceHeading;
      while (diffAz > 180) diffAz -= 360;
      while (diffAz < -180) diffAz += 360;

      // Difference in Pitch
      const diffAlt = target.altitudeDeg - devicePitch;

      // Check if within Camera FOV
      if (Math.abs(diffAz) < fovH / 2 && Math.abs(diffAlt) < fovV / 2) {
        const x = cx + (diffAz / (fovH / 2)) * cx;
        const y = cy - (diffAlt / (fovV / 2)) * cy;

        const distFromCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (distFromCenter < 120 && distFromCenter < minTargetDist) {
          minTargetDist = distFromCenter;
          nearestTarget = target;
        }

        // Draw AR Marker Icon & Reticle
        ctx.save();
        if (target.category === 'planet') {
          // Planet glowing marker
          ctx.strokeStyle = '#f59e0b';
          ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 14, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fill();

          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
        } else if (target.category === 'star') {
          // Star cross flare
          ctx.strokeStyle = '#38bdf8';
          ctx.fillStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x - 12, y);
          ctx.lineTo(x + 12, y);
          ctx.moveTo(x, y - 12);
          ctx.lineTo(x, y + 12);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Constellation asterism box
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x - 22, y - 22, 44, 44);
        }

        // Target label tag
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Space Grotesk", sans-serif';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(target.name, x + 16, y - 4);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(
          `${target.azimuthDeg}° Az / ${target.altitudeDeg}° Alt${
            target.apparentMagnitude !== undefined ? ` • Mag ${target.apparentMagnitude}` : ''
          }`,
          x + 16,
          y + 11
        );
        ctx.restore();
      }
    });

    setActiveTarget((prev) => {
      if (!prev && !nearestTarget) return null;
      if (prev && nearestTarget && prev.name === nearestTarget.name) return prev;
      return nearestTarget;
    });

    // Center Crosshairs Reticle
    ctx.strokeStyle = nearestTarget ? '#38bdf8' : 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 40, cy);
    ctx.lineTo(cx - 15, cy);
    ctx.moveTo(cx + 15, cy);
    ctx.lineTo(cx + 40, cy);
    ctx.moveTo(cx, cy - 40);
    ctx.lineTo(cx, cy - 15);
    ctx.moveTo(cx, cy + 15);
    ctx.lineTo(cx, cy + 40);
    ctx.stroke();
  }, [deviceHeading, devicePitch]);

  // Mouse drag handlers for desktop camera aiming
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevMouseXRef.current = e.clientX;
    prevMouseYRef.current = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevMouseXRef.current;
    const dy = e.clientY - prevMouseYRef.current;
    prevMouseXRef.current = e.clientX;
    prevMouseYRef.current = e.clientY;

    setDeviceHeading((h) => (h - dx * 0.25 + 360) % 360);
    setDevicePitch((p) => Math.max(5, Math.min(85, p + dy * 0.25)));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Instant Log Sighting from AR reticle
  const handleLogActiveTarget = () => {
    if (!activeTarget) return;

    addLogEntry({
      targetName: activeTarget.name,
      targetCategory: activeTarget.category === 'planet' ? 'planet' : activeTarget.category === 'star' ? 'star' : 'constellation',
      constellation: activeTarget.constellation,
      equipment: 'Naked Eye',
      bortleScale: 4,
      seeingCondition: 'Very Good (4/5)',
      transparency: 'High',
      notes: `Identified and logged via Astroverse AR Night-Sky Camera at ${deviceHeading.toFixed(0)}° Azimuth, ${devicePitch.toFixed(0)}° Altitude.`,
      rating: 5,
      locationName: 'Live AR Sky Scan',
      sharedToCommunity: true,
      authorName: 'AR Stargazer',
      likes: 1,
    });

    setLogSuccessToast(`Logged sighting of ${activeTarget.name}!`);
    setTimeout(() => setLogSuccessToast(null), 3000);

    if (onLogObservation) {
      onLogObservation(activeTarget.name);
    }
  };

  return (
    <div className="w-full bg-[#030712] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium flex items-center gap-1.5 w-fit">
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            AUGMENTED REALITY (AR) NIGHT SKY VIEWER
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Real-Time Constellation & Star Identifier
          </h2>
          <p className="text-xs text-slate-400">
            Aim phone at the night sky or drag to identify stars and constellations in real-time
          </p>
        </div>

        {/* Camera Control buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            title="Flip Camera"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{facingMode === 'environment' ? 'Back Lens' : 'Front Lens'}</span>
          </button>

          <button
            onClick={cameraActive ? stopCamera : startCamera}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              cameraActive
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            {cameraActive ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
            <span>{cameraActive ? 'Stop Camera' : 'Start Camera'}</span>
          </button>
        </div>
      </div>

      {/* Camera Viewport & AR HUD Overlay */}
      <div
        className="relative w-full h-[520px] rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner cursor-move select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Real Video Stream from phone camera */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            cameraActive ? 'opacity-90' : 'opacity-0'
          }`}
        />

        {/* Fallback Starry Night Sky backdrop when camera is not running */}
        {!cameraActive && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#091224] to-[#020617] flex flex-col items-center justify-center p-6 text-center">
            <Sparkles className="w-12 h-12 text-cyan-400 mb-3 opacity-70 animate-pulse" />
            <h3 className="text-base font-bold text-white mb-1">Interactive AR Sky Simulator</h3>
            <p className="text-xs text-slate-400 max-w-md mb-4">
              {cameraError || 'Camera stream is idle. Click "Start Camera" to overlay on real sky, or drag with your mouse/touch to aim the telescope reticle across the heavens.'}
            </p>
          </div>
        )}

        {/* AR Canvas HUD Overlay */}
        <canvas
          ref={canvasOverlayRef}
          width={800}
          height={520}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Top Floating Telemetry Compass Pill */}
        <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800/90 rounded-xl px-3 py-1.5 backdrop-blur-md flex items-center gap-3 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Compass className="w-4 h-4" />
            <span>AZ: {Math.round(deviceHeading)}°</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-emerald-400">
            <span>ALT: {Math.round(devicePitch)}°</span>
          </div>
        </div>

        {/* Target Locked Banner & 1-Tap Log Sighting Action */}
        {activeTarget && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-slate-900/95 border border-cyan-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 uppercase font-semibold">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                Target Identified in Reticle
              </div>
              <h4 className="text-base font-bold text-white mt-0.5">{activeTarget.name}</h4>
              <p className="text-xs text-slate-300">
                {activeTarget.constellation ? `Constellation: ${activeTarget.constellation}` : 'Solar System Body'}
                {activeTarget.distanceLightYears ? ` • ${activeTarget.distanceLightYears} ly` : ''}
              </p>
            </div>

            <button
              onClick={handleLogActiveTarget}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 flex items-center gap-1.5 shrink-0 transition cursor-pointer"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>Log Sighting</span>
            </button>
          </div>
        )}

        {/* Success Toast */}
        {logSuccessToast && (
          <div className="absolute top-4 right-4 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-2 rounded-xl text-xs font-medium shadow-2xl flex items-center gap-2 backdrop-blur-md animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {logSuccessToast}
          </div>
        )}
      </div>
    </div>
  );
};
