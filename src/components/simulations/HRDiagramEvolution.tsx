import React, { useState } from 'react';
import { Flame, Play, RotateCcw, Info, Sparkles, Zap, Award } from 'lucide-react';

interface StellarPhase {
  name: string;
  durationMyr: number;
  tempK: number;
  luminositySolar: number;
  radiusSolar: number;
  spectralClass: string;
  description: string;
  coreProcess: string;
}

export const HRDiagramEvolution: React.FC = () => {
  const [starMass, setStarMass] = useState<number>(1.0); // in Solar Masses (0.1 to 40)
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(1);
  const [isSimulatingTrack, setIsSimulatingTrack] = useState<boolean>(false);

  // Calculate evolutionary lifecycle tracks based on stellar mass
  const calculateLifecyclePhases = (mass: number): StellarPhase[] => {
    if (mass < 0.45) {
      // Very low mass Red Dwarf (convective, burns slowly for trillions of years)
      return [
        {
          name: 'Protostellar Collapse',
          durationMyr: 100,
          tempK: 2900,
          luminositySolar: 0.05,
          radiusSolar: 1.2,
          spectralClass: 'M',
          description: 'Gravitational collapse of interstellar gas cloud fragment into a hydrostatic protostar.',
          coreProcess: 'Gravitational Kelvin-Helmholtz contraction',
        },
        {
          name: 'Main Sequence Red Dwarf',
          durationMyr: 800000,
          tempK: 3100,
          luminositySolar: 0.002,
          radiusSolar: 0.2,
          spectralClass: 'M5V',
          description: 'Fully convective star slowly fusing hydrogen into helium via the p-p chain.',
          coreProcess: 'Hydrogen fusion via Proton-Proton Chain',
        },
        {
          name: 'Blue Dwarf Phase',
          durationMyr: 50000,
          tempK: 5500,
          luminositySolar: 0.01,
          radiusSolar: 0.25,
          spectralClass: 'G-K',
          description: 'Hypothetical late-stage phase when hydrogen is mostly consumed, increasing surface temperature.',
          coreProcess: 'Exhaustion of core hydrogen',
        },
        {
          name: 'Helium White Dwarf Remnant',
          durationMyr: 10000000,
          tempK: 15000,
          luminositySolar: 0.0001,
          radiusSolar: 0.012,
          spectralClass: 'DA',
          description: 'Degenerate electron-supported cooling ember; no supernova, no planetary nebula.',
          coreProcess: 'Inactive degenerate matter cooling',
        },
      ];
    } else if (mass <= 8) {
      // Solar-type to Intermediate star (Sun-like)
      const msLifetime = Math.round(10000 * Math.pow(mass, -2.5));
      return [
        {
          name: 'Pre-Main Sequence T-Tauri',
          durationMyr: 30,
          tempK: 4200,
          luminositySolar: 5.0,
          radiusSolar: 2.8,
          spectralClass: 'K',
          description: 'Young stellar object with powerful stellar winds clearing out the protoplanetary disk.',
          coreProcess: 'Deuterium burning & gravitational compression',
        },
        {
          name: 'Zero-Age Main Sequence (ZAMS)',
          durationMyr: msLifetime,
          tempK: mass === 1 ? 5778 : Math.round(5778 * Math.pow(mass, 0.5)),
          luminositySolar: Number(Math.pow(mass, 3.5).toFixed(2)),
          radiusSolar: Number(Math.pow(mass, 0.75).toFixed(2)),
          spectralClass: mass > 3 ? 'B' : mass > 1.4 ? 'A' : mass > 0.8 ? 'G' : 'K',
          description: 'Stable hydrogen fusion in hydrostatic equilibrium balance against gravity.',
          coreProcess: 'Hydrogen fusion (p-p chain / CNO cycle)',
        },
        {
          name: 'Subgiant & Red Giant Branch (RGB)',
          durationMyr: Math.round(msLifetime * 0.1),
          tempK: 3400,
          luminositySolar: 400 * mass,
          radiusSolar: 50 * mass,
          spectralClass: 'M',
          description: 'Inert helium core contracts while hydrogen shell burns furiously, inflating the outer envelope.',
          coreProcess: 'Hydrogen burning in shell around degenerate He core',
        },
        {
          name: 'Horizontal Branch / Helium Flash',
          durationMyr: 100,
          tempK: 4800,
          luminositySolar: 60 * mass,
          radiusSolar: 12 * mass,
          spectralClass: 'K',
          description: 'Core reaches 100 million Kelvin, triggering runaway Triple-Alpha helium ignition.',
          coreProcess: 'Core Helium fusion into Carbon & Oxygen',
        },
        {
          name: 'Planetary Nebula Ejection',
          durationMyr: 0.05,
          tempK: 30000,
          luminositySolar: 1200,
          radiusSolar: 0.1,
          spectralClass: 'O',
          description: 'Thermal pulses violently expel outer gaseous shells into an iridescent glowing nebula.',
          coreProcess: 'Pulsational shell ejection driven by radiation pressure',
        },
        {
          name: 'Carbon-Oxygen White Dwarf',
          durationMyr: 10000000,
          tempK: 22000,
          luminositySolar: 0.0005,
          radiusSolar: 0.009,
          spectralClass: 'DA',
          description: 'Ultra-dense Earth-sized core supported by quantum electron degeneracy pressure.',
          coreProcess: 'Thermal radiation cooling toward Black Dwarf',
        },
      ];
    } else {
      // Massive Star (> 8 M_sun) -> Core collapse Supernova
      return [
        {
          name: 'Massive Blue Supergiant (Main Sequence)',
          durationMyr: 12,
          tempK: 28000,
          luminositySolar: 80000,
          radiusSolar: 16,
          spectralClass: 'O-B',
          description: 'Fiercely luminous giant rapidly burning hydrogen via the catalytic CNO nuclear cycle.',
          coreProcess: 'High-temperature CNO Hydrogen fusion',
        },
        {
          name: 'Red / Yellow Hypergiant',
          durationMyr: 1.2,
          tempK: 3500,
          luminositySolar: 150000,
          radiusSolar: 850,
          spectralClass: 'M1 Ia',
          description: 'Colossal expanded envelope with onion-skin shells of He, C, Ne, O, and Si burning.',
          coreProcess: 'Successive carbon, neon, oxygen, and silicon burning',
        },
        {
          name: 'Silicon Core Burnout & Iron Catastrophe',
          durationMyr: 0.00001, // ~1 day
          tempK: 4000,
          luminositySolar: 200000,
          radiusSolar: 900,
          spectralClass: 'M',
          description: 'Core converts to Iron-56. Fusion of iron is endothermic (steals energy), halting hydrostatic support.',
          coreProcess: 'Exhaustion of nuclear fuel; sudden core collapse',
        },
        {
          name: 'Type II Core-Collapse Supernova',
          durationMyr: 0.000001,
          tempK: 100000,
          luminositySolar: 1000000000,
          radiusSolar: 1000,
          spectralClass: 'Hyper',
          description: 'Shockwave blasts outward with the brightness of an entire galaxy, synthesizing gold and heavy elements via r-process.',
          coreProcess: 'Gravitational bounce shockwave & neutrino deluge',
        },
        {
          name: mass > 25 ? 'Stellar-Mass Black Hole' : 'Neutron Star / Pulsar',
          durationMyr: 10000000,
          tempK: mass > 25 ? 0.00001 : 1000000,
          luminositySolar: mass > 25 ? 0 : 0.00001,
          radiusSolar: mass > 25 ? 0.00005 : 0.00002,
          spectralClass: mass > 25 ? 'Singularity' : 'Pulsar',
          description: mass > 25
            ? 'Gravitational collapse exceeds Tolman-Oppenheimer-Volkoff limit, plunging into an event horizon.'
            : 'City-sized ball of degenerate neutrons spinning hundreds of times per second with intense magnetic beams.',
          coreProcess: mass > 25 ? 'Infinite spacetime curvature' : 'Neutron degeneracy pressure',
        },
      ];
    }
  };

  const phases = calculateLifecyclePhases(starMass);
  const currentPhase = phases[currentPhaseIndex] || phases[0];

  // Helper to map log(Temp) and log(Luminosity) to H-R chart percentages
  const getCoordinatesForPhase = (tempK: number, lum: number) => {
    // Temperature: 40,000 K (left, 5%) to 2,500 K (right, 95%) - inverse axis!
    const logT = Math.log10(Math.max(2000, Math.min(50000, tempK)));
    const minLogT = Math.log10(2500); // ~3.397
    const maxLogT = Math.log10(40000); // ~4.602
    const xPct = 100 - ((logT - minLogT) / (maxLogT - minLogT)) * 90 - 5;

    // Luminosity: 10^-4 (bottom, 95%) to 10^6 (top, 5%)
    const logL = Math.log10(Math.max(0.00005, Math.min(2000000, lum)));
    const minLogL = -4.5;
    const maxLogL = 6.2;
    const yPct = 100 - ((logL - minLogL) / (maxLogL - minLogL)) * 90 - 5;

    return { x: Math.max(5, Math.min(95, xPct)), y: Math.max(5, Math.min(95, yPct)) };
  };

  // Famous benchmark stars on H-R diagram
  const benchmarkStars = [
    { name: 'Sun', temp: 5778, lum: 1.0, color: '#fbbf24', type: 'G2V' },
    { name: 'Sirius A', temp: 9940, lum: 25.4, color: '#93c5fd', type: 'A1V' },
    { name: 'Betelgeuse', temp: 3600, lum: 100000, color: '#ef4444', type: 'M1-2' },
    { name: 'Rigel', temp: 12100, lum: 120000, color: '#60a5fa', type: 'B8Ia' },
    { name: 'Proxima Centauri', temp: 3042, lum: 0.0017, color: '#f87171', type: 'M5.5V' },
    { name: 'Vega', temp: 9602, lum: 40.1, color: '#93c5fd', type: 'A0V' },
    { name: 'Sirius B', temp: 25200, lum: 0.056, color: '#e0e7ff', type: 'DA2 White Dwarf' },
    { name: 'Aldebaran', temp: 3910, lum: 518, color: '#f97316', type: 'K5III Giant' },
  ];

  return (
    <div className="w-full bg-[#030712] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
      {/* Title & Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-medium flex items-center gap-1.5 w-fit">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            STELLAR ASTROPHYSICS & H-R ENGINE
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Hertzsprung-Russell Diagram & Stellar Evolution
          </h2>
          <p className="text-xs text-slate-400">
            Interactive stellar life cycle from molecular cloud to degenerate supernova remnant
          </p>
        </div>

        {/* Mass Slider */}
        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 flex items-center gap-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
              Initial Star Mass
            </span>
            <span className="text-base font-bold text-amber-400 font-mono">
              {starMass} M☉ {starMass === 1 ? '(1 Solar Mass)' : ''}
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="30"
            step={starMass < 2 ? '0.1' : '0.5'}
            value={starMass}
            onChange={(e) => {
              setStarMass(parseFloat(e.target.value));
              setCurrentPhaseIndex(1); // Reset to main sequence on mass change
            }}
            className="w-32 accent-amber-500 cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive H-R Diagram SVG / 2D Canvas View (7 cols) */}
        <div className="lg:col-span-7 bg-[#060a17] border border-slate-800 rounded-xl p-4 relative min-h-[420px] flex flex-col justify-between overflow-hidden">
          {/* Spectral classification header strip */}
          <div className="grid grid-cols-7 text-center text-xs font-mono font-bold pb-2 border-b border-slate-800">
            <span className="text-blue-400">O (&gt;30k K)</span>
            <span className="text-cyan-300">B (10-30k)</span>
            <span className="text-slate-200">A (7.5-10k)</span>
            <span className="text-yellow-100">F (6-7.5k)</span>
            <span className="text-yellow-300">G (5-6k)</span>
            <span className="text-amber-400">K (3.5-5k)</span>
            <span className="text-rose-400">M (&lt;3.5k)</span>
          </div>

          {/* H-R Plot Area */}
          <div className="relative w-full h-[320px] my-auto">
            {/* Background region overlays */}
            {/* Supergiants Region */}
            <div className="absolute top-[8%] left-[20%] right-[5%] h-[20%] rounded-xl bg-red-950/15 border border-red-500/20 pointer-events-none flex items-center justify-center">
              <span className="text-[11px] font-mono text-red-400/50 uppercase tracking-widest font-semibold">Supergiants Region (Ia, Ib)</span>
            </div>
            {/* Main Sequence diagonal belt */}
            <div
              className="absolute pointer-events-none rounded-2xl bg-cyan-500/5 border border-cyan-400/20"
              style={{
                top: '15%',
                left: '12%',
                width: '78%',
                height: '70%',
                transform: 'rotate(-25deg)',
                transformOrigin: 'top left',
              }}
            >
              <span className="absolute top-2 left-10 text-[10px] font-mono text-cyan-400/40 uppercase tracking-widest font-bold">
                Main Sequence (V)
              </span>
            </div>
            {/* White Dwarfs Region */}
            <div className="absolute bottom-[8%] left-[10%] w-[32%] h-[25%] rounded-xl bg-indigo-950/20 border border-indigo-400/20 pointer-events-none flex items-center justify-center">
              <span className="text-[10px] font-mono text-indigo-300/50 uppercase tracking-widest font-semibold">White Dwarfs (VII)</span>
            </div>

            {/* Benchmark Stars plotted */}
            {benchmarkStars.map((bStar) => {
              const coords = getCoordinatesForPhase(bStar.temp, bStar.lum);
              return (
                <div
                  key={bStar.name}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white/30"
                    style={{ backgroundColor: bStar.color }}
                  />
                  <span className="text-[9px] font-mono text-slate-300 whitespace-nowrap absolute left-3.5 -top-1 pointer-events-none group-hover:text-cyan-300 group-hover:scale-110 transition">
                    {bStar.name}
                  </span>
                </div>
              );
            })}

            {/* Active Star Evolutionary Position Marker */}
            {(() => {
              const markerCoords = getCoordinatesForPhase(currentPhase.tempK, currentPhase.luminositySolar);
              return (
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-700 ease-out"
                  style={{ left: `${markerCoords.x}%`, top: `${markerCoords.y}%` }}
                >
                  <div className="relative">
                    <div className="w-5 h-5 rounded-full bg-amber-400 ring-4 ring-amber-500/50 shadow-lg shadow-amber-500/80 animate-pulse" />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-mono font-bold whitespace-nowrap shadow-md">
                      Current: {currentPhase.name.split(' ')[0]}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Axes labels */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            <span>Hot (40,000 K) ← Surface Temperature → Cool (2,500 K)</span>
            <span>$L/L_\odot$: 10⁻⁴ to 10⁶</span>
          </div>
        </div>

        {/* Phase Timeline & Stellar Core Physics (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
              Phase {currentPhaseIndex + 1} of {phases.length}
            </span>
            <h3 className="text-lg font-bold text-white mb-1">{currentPhase.name}</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">{currentPhase.description}</p>

            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-xs font-mono space-y-1.5 mb-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Core Nucleosynthesis:</span>
                <span className="text-amber-300 font-semibold text-right">{currentPhase.coreProcess}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Surface Temp (T_eff):</span>
                <span className="text-white font-semibold">{currentPhase.tempK.toLocaleString()} K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Luminosity ($L/L_\odot$):</span>
                <span className="text-white font-semibold">{currentPhase.luminositySolar.toLocaleString()} L☉</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Radius ($R/R_\odot$):</span>
                <span className="text-white font-semibold">{currentPhase.radiusSolar.toLocaleString()} R☉</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Duration:</span>
                <span className="text-cyan-300 font-semibold">
                  {currentPhase.durationMyr >= 1000
                    ? `${(currentPhase.durationMyr / 1000).toFixed(1)} Billion yrs`
                    : `${currentPhase.durationMyr} Million yrs`}
                </span>
              </div>
            </div>
          </div>

          {/* Phase selector step pills */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-mono text-slate-400">Select Evolutionary Stage:</span>
            <div className="flex flex-wrap gap-1.5">
              {phases.map((p, idx) => (
                <button
                  key={p.name}
                  onClick={() => setCurrentPhaseIndex(idx)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer text-left ${
                    currentPhaseIndex === idx
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {idx + 1}. {p.name.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
