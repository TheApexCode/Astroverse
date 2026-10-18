import React, { useEffect, useRef, useState } from 'react';
import { Compass, Download, MapPin, Eye, Clock, Moon, Layers, RotateCcw, Sparkles } from 'lucide-react';
import { CONSTELLATIONS, CELESTIAL_OBJECTS } from '../../data/celestialData';
import { raDecToAltAz, getMoonPhase } from '../../utils/astroMath';

interface ObservatoryLocation {
  name: string;
  lat: number;
  lon: number;
}

const OBSERVATORIES: ObservatoryLocation[] = [
  { name: 'Mauna Kea Observatories (Hawaii)', lat: 19.82, lon: -155.46 },
  { name: 'Atacama ALMA / Paranal (Chile)', lat: -23.02, lon: -67.75 },
  { name: 'Roque de los Muchachos (La Palma)', lat: 28.75, lon: -17.88 },
  { name: 'Royal Observatory Greenwich (UK)', lat: 51.48, lon: -0.00 },
  { name: 'Kitt Peak National Observatory (AZ, USA)', lat: 31.95, lon: -111.60 },
  { name: 'Sutherland SAAO (South Africa)', lat: -32.38, lon: 20.81 },
  { name: 'Tokyo National Astronomical Obs (Japan)', lat: 35.67, lon: 139.54 },
];

export const StarChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedObs, setSelectedObs] = useState<ObservatoryLocation>(OBSERVATORIES[0]);
  const [showConstellationLines, setShowConstellationLines] = useState(true);
  const [showConstellationNames, setShowConstellationNames] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showDSO, setShowDSO] = useState(true);
  const [limitingMag, setLimitingMag] = useState<number>(5.5);
  const [timeOffsetHours, setTimeOffsetHours] = useState<number>(0);
  const [selectedStarInfo, setSelectedStarInfo] = useState<string | null>(null);

  const moonPhase = getMoonPhase();

  // Simulated Star Catalog (Bright stars across the celestial sphere)
  const allStars = React.useMemo(() => {
    const list: { name: string; ra: number; dec: number; mag: number; color: string; constName?: string }[] = [];
    CONSTELLATIONS.forEach((c) => {
      c.majorStars.forEach((s) => {
        list.push({ ...s, constName: c.name });
      });
    });

    // Add other famous bright stars
    const famousExtras = [
      { name: 'Polaris', ra: 2.52, dec: 89.26, mag: 1.98, color: '#fef3c7', constName: 'Ursa Minor' },
      { name: 'Vega', ra: 18.61, dec: 38.78, mag: 0.03, color: '#93c5fd', constName: 'Lyra' },
      { name: 'Arcturus', ra: 14.26, dec: 19.18, mag: -0.05, color: '#f97316', constName: 'Boötes' },
      { name: 'Capella', ra: 5.28, dec: 45.99, mag: 0.08, color: '#fef08a', constName: 'Auriga' },
      { name: 'Procyon', ra: 7.65, dec: 5.22, mag: 0.38, color: '#fef3c7', constName: 'Canis Minor' },
      { name: 'Achernar', ra: 1.63, dec: -57.24, mag: 0.45, color: '#93c5fd', constName: 'Eridanus' },
      { name: 'Canopus', ra: 6.40, dec: -52.70, mag: -0.74, color: '#e0e7ff', constName: 'Carina' },
      { name: 'Rigil Kentaurus', ra: 14.66, dec: -60.83, mag: -0.01, color: '#fef08a', constName: 'Centaurus' },
      { name: 'Hadar', ra: 14.06, dec: -60.37, mag: 0.61, color: '#93c5fd', constName: 'Centaurus' },
      { name: 'Acrux', ra: 12.44, dec: -63.10, mag: 0.77, color: '#93c5fd', constName: 'Crux' },
      { name: 'Spica', ra: 13.42, dec: -11.16, mag: 0.98, color: '#93c5fd', constName: 'Virgo' },
      { name: 'Pollux', ra: 7.76, dec: 28.02, mag: 1.14, color: '#f59e0b', constName: 'Gemini' },
      { name: 'Castor', ra: 7.58, dec: 31.89, mag: 1.58, color: '#e0e7ff', constName: 'Gemini' },
      { name: 'Fomalhaut', ra: 22.96, dec: -29.62, mag: 1.17, color: '#93c5fd', constName: 'Piscis Austrinus' },
    ];
    list.push(...famousExtras);

    // Procedural background field stars (approx ~1200 faint stars)
    for (let i = 0; i < 900; i++) {
      list.push({
        name: `TYC-${1000 + i}`,
        ra: Math.random() * 24,
        dec: (Math.random() * 180) - 90,
        mag: 2.8 + Math.random() * 3.6,
        color: Math.random() > 0.4 ? '#e2e8f0' : Math.random() > 0.5 ? '#93c5fd' : '#fed7aa',
      });
    }

    return list;
  }, []);

  // Render Star Map onto Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const rOuter = Math.min(width, height) * 0.46;

    // Clear background (Deep Void of Space)
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    // Current observation timestamp
    const now = new Date();
    const obsDate = new Date(now.getTime() + timeOffsetHours * 3600 * 1000);

    // Draw Horizon Circular Boundary & Gradients
    const skyGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, rOuter);
    skyGrad.addColorStop(0, '#0a1024');
    skyGrad.addColorStop(0.7, '#060a17');
    skyGrad.addColorStop(1, '#02040a');
    ctx.fillStyle = skyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
    ctx.fill();

    // Horizon Ring
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Azimuthal Cardinal Direction Markers (N, E, S, W)
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N (0°)', cx, cy - rOuter - 14);
    ctx.fillText('S (180°)', cx, cy + rOuter + 14);
    ctx.fillText('E (90°)', cx + rOuter + 22, cy);
    ctx.fillText('W (270°)', cx - rOuter - 22, cy);

    // Coordinate Alt/Az rings (Zenith = center, Horizon = rOuter)
    if (showGrid) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;
      [30, 60].forEach((alt) => {
        const ringRadius = rOuter * (1 - alt / 90);
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.fillText(`${alt}° Alt`, cx + ringRadius - 18, cy - 4);
      });

      // Crosshairs through Zenith
      ctx.beginPath();
      ctx.moveTo(cx, cy - rOuter);
      ctx.lineTo(cx, cy + rOuter);
      ctx.moveTo(cx - rOuter, cy);
      ctx.lineTo(cx + rOuter, cy);
      ctx.stroke();
    }

    // Coordinate conversion helper: Alt/Az -> Canvas (x, y) Stereographic / Zenithal
    const altAzToCanvas = (altDeg: number, azDeg: number): { x: number; y: number } | null => {
      if (altDeg <= 0) return null; // Below horizon
      // r is proportional to (90 - alt)
      const r = rOuter * ((90 - altDeg) / 90);
      // North is Top (-Y), East is Right (+X), South is Bottom (+Y), West is Left (-X)
      const azRad = ((azDeg - 90) * Math.PI) / 180;
      return {
        x: cx + r * Math.cos(azRad),
        y: cy + r * Math.sin(azRad),
      };
    };

    // Draw Constellation Lines & Names
    if (showConstellationLines) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.2;

      CONSTELLATIONS.forEach((c) => {
        const projectedStars = c.majorStars.map((s) => {
          const { altitudeDeg, azimuthDeg, isVisible } = raDecToAltAz(
            s.ra,
            s.dec,
            selectedObs.lat,
            selectedObs.lon,
            obsDate
          );
          if (!isVisible) return null;
          return altAzToCanvas(altitudeDeg, azimuthDeg);
        });

        // Draw connecting stick figure lines
        c.lines.forEach(([i1, i2]) => {
          const p1 = projectedStars[i1];
          const p2 = projectedStars[i2];
          if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });

        // Constellation Name label at center of visible stars
        if (showConstellationNames) {
          const validPoints = projectedStars.filter((p): p is { x: number; y: number } => p !== null);
          if (validPoints.length >= 2) {
            const avgX = validPoints.reduce((acc, p) => acc + p.x, 0) / validPoints.length;
            const avgY = validPoints.reduce((acc, p) => acc + p.y, 0) / validPoints.length;
            ctx.font = '10px "Space Grotesk", sans-serif';
            ctx.fillStyle = 'rgba(147, 197, 253, 0.7)';
            ctx.textAlign = 'center';
            ctx.fillText(c.name.toUpperCase(), avgX, avgY);
          }
        }
      });
    }

    // Draw Stars
    allStars.forEach((star) => {
      if (star.mag > limitingMag) return;

      const { altitudeDeg, azimuthDeg, isVisible } = raDecToAltAz(
        star.ra,
        star.dec,
        selectedObs.lat,
        selectedObs.lon,
        obsDate
      );
      if (!isVisible) return;

      const pos = altAzToCanvas(altitudeDeg, azimuthDeg);
      if (!pos) return;

      // Magnitude to pixel radius (lower magnitude = brighter = larger dot)
      const radius = Math.max(1.0, 4.5 - star.mag * 0.7);

      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Bright star names
      if (star.mag <= 1.8 && star.name && !star.name.startsWith('TYC-')) {
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'left';
        ctx.fillText(star.name, pos.x + radius + 3, pos.y + 2);
      }
    });

    // Draw Deep Sky Objects (M31 Andromeda, M42 Orion Nebula, M45 Pleiades)
    if (showDSO) {
      const dsoList = [
        { name: 'M31 Andromeda', ra: 0.71, dec: 41.27, color: '#c084fc' },
        { name: 'M42 Orion Nebula', ra: 5.59, dec: -5.39, color: '#f472b6' },
        { name: 'M45 Pleiades', ra: 3.79, dec: 24.11, color: '#67e8f9' },
      ];

      dsoList.forEach((dso) => {
        const { altitudeDeg, azimuthDeg, isVisible } = raDecToAltAz(
          dso.ra,
          dso.dec,
          selectedObs.lat,
          selectedObs.lon,
          obsDate
        );
        if (!isVisible) return;
        const pos = altAzToCanvas(altitudeDeg, azimuthDeg);
        if (!pos) return;

        // Dotted DSO ellipse
        ctx.strokeStyle = dso.color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillStyle = dso.color;
        ctx.fillText(dso.name, pos.x + 9, pos.y + 3);
      });
    }
  }, [allStars, selectedObs, showConstellationLines, showConstellationNames, showGrid, showDSO, limitingMag, timeOffsetHours]);

  // Export Star Chart as high-res PNG for remote offline field sessions
  const handleDownloadChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create high-res offscreen canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1600;
    exportCanvas.height = 1600;
    const expCtx = exportCanvas.getContext('2d')!;

    // Draw watermark & header
    expCtx.drawImage(canvas, 0, 0, 1600, 1600);
    expCtx.fillStyle = '#ffffff';
    expCtx.font = 'bold 24px "Space Grotesk", sans-serif';
    expCtx.fillText(`ASTROVERSE STAR CHART — ${selectedObs.name.toUpperCase()}`, 60, 80);
    expCtx.font = '16px "JetBrains Mono", monospace';
    expCtx.fillStyle = '#38bdf8';
    expCtx.fillText(`UTC: ${new Date().toISOString()} | Limiting Mag: ${limitingMag} | Moon: ${moonPhase.phaseName} (${moonPhase.illumination}%)`, 60, 115);

    const link = document.createElement('a');
    link.download = `Astroverse-StarChart-${selectedObs.name.replace(/\s+/g, '_')}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="w-full bg-[#030712] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
      {/* Header & Location Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium flex items-center gap-1.5 w-fit">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            LIVE CELESTIAL SPHERE & STAR CHART
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Real-Time Night Sky Map
          </h2>
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <span>Location: {selectedObs.name}</span>
            <span>•</span>
            <span className="text-amber-300 flex items-center gap-1">
              <Moon className="w-3 h-3" /> {moonPhase.phaseName} ({moonPhase.illumination}%)
            </span>
          </p>
        </div>

        {/* Download Offline Chart Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadChart}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Offline Field Chart</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Canvas Display (8 cols) */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center bg-[#02050e] border border-slate-800/80 rounded-2xl p-3 sm:p-5 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            width={720}
            height={720}
            className="w-full max-w-[620px] aspect-square rounded-full shadow-2xl shadow-cyan-950/40"
          />

          {/* Time Offset Indicator */}
          {timeOffsetHours !== 0 && (
            <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-mono text-cyan-300">
              Offset: {timeOffsetHours > 0 ? `+${timeOffsetHours}h` : `${timeOffsetHours}h`}
            </div>
          )}
        </div>

        {/* Observation Controls & Toggles (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Observatory Preset Selector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Observation Location
            </label>
            <select
              value={selectedObs.name}
              onChange={(e) => {
                const found = OBSERVATORIES.find((o) => o.name === e.target.value);
                if (found) setSelectedObs(found);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-medium focus:border-cyan-500 focus:outline-none"
            >
              {OBSERVATORIES.map((o) => (
                <option key={o.name} value={o.name}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time Scrub Slider */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Time Travel
              </label>
              <button
                onClick={() => setTimeOffsetHours(0)}
                className="text-[10px] text-cyan-400 hover:underline cursor-pointer font-mono"
              >
                Reset to Live
              </button>
            </div>
            <input
              type="range"
              min="-12"
              max="12"
              step="0.5"
              value={timeOffsetHours}
              onChange={(e) => setTimeOffsetHours(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>-12h</span>
              <span className="text-cyan-300 font-bold">{timeOffsetHours === 0 ? 'Now' : `${timeOffsetHours}h`}</span>
              <span>+12h</span>
            </div>
          </div>

          {/* Limiting Magnitude Filter */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              <span>Limiting Magnitude</span>
              <span className="text-cyan-300 font-bold">Mag {limitingMag.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="6.5"
              step="0.5"
              value={limitingMag}
              onChange={(e) => setLimitingMag(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              {limitingMag <= 2.5
                ? 'City Sky / High Light Pollution (Bortle 8-9)'
                : limitingMag <= 4.5
                ? 'Suburban Sky (Bortle 5-6)'
                : 'Pristine Dark Sky Reserve (Bortle 1-3)'}
            </p>
          </div>

          {/* Visual Layer Toggles */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Display Layers
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setShowConstellationLines(!showConstellationLines)}
                className={`px-2.5 py-1.5 rounded-lg border text-left transition cursor-pointer ${
                  showConstellationLines
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Lines: {showConstellationLines ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setShowConstellationNames(!showConstellationNames)}
                className={`px-2.5 py-1.5 rounded-lg border text-left transition cursor-pointer ${
                  showConstellationNames
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Names: {showConstellationNames ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-2.5 py-1.5 rounded-lg border text-left transition cursor-pointer ${
                  showGrid
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Alt/Az Grid: {showGrid ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setShowDSO(!showDSO)}
                className={`px-2.5 py-1.5 rounded-lg border text-left transition cursor-pointer ${
                  showDSO
                    ? 'bg-pink-500/20 border-pink-400 text-pink-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Messier DSOs: {showDSO ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
