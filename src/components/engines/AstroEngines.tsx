import React, { useState } from 'react';
import { Calculator, Rocket, Eye, Orbit, Atom, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import {
  calculateTelescopeOptics,
  calculateOrbitalMechanics,
  calculateHohmannTransfer,
  calculateRelativity,
} from '../../utils/astroMath';

export const AstroEngines: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hohmann' | 'optics' | 'kepler' | 'relativity' | 'ai_analyst'>('hohmann');

  // Hohmann state
  const [hDepartureAU, setHDepartureAU] = useState(1.0); // Earth
  const [hArrivalAU, setHArrivalAU] = useState(1.524); // Mars
  const hohmannResult = calculateHohmannTransfer(hDepartureAU, hArrivalAU);

  // Optics state
  const [apertureMm, setApertureMm] = useState(200); // 8-inch telescope
  const [scopeFocalLengthMm, setScopeFocalLengthMm] = useState(1000);
  const [eyepieceFocalLengthMm, setEyepieceFocalLengthMm] = useState(10);
  const opticsResult = calculateTelescopeOptics(apertureMm, scopeFocalLengthMm, eyepieceFocalLengthMm);

  // Kepler state
  const [keplerDistanceAU, setKeplerDistanceAU] = useState(1.0);
  const [centralStarMass, setCentralStarMass] = useState(1.0);
  const keplerResult = calculateOrbitalMechanics(keplerDistanceAU, centralStarMass);

  // Relativity state
  const [relVelocityC, setRelVelocityC] = useState(0.85); // 85% speed of light
  const [bhMass, setBhMass] = useState(10);
  const [distHorizonKm, setDistHorizonKm] = useState(50);
  const relResult = calculateRelativity(relVelocityC, bhMass, distHorizonKm * 1000);

  // AI Analyst state
  const [query, setQuery] = useState('');
  const [analystResponse, setAnalystResponse] = useState<string | null>(
    'Welcome, researcher. Select a preset query or ask any question regarding astrophysics, orbital mechanics, planetary atmospheres, or observational astronomy.'
  );

  const handleRunQuery = (q: string) => {
    setQuery(q);
    const low = q.toLowerCase();

    if (low.includes('hawking') || low.includes('radiation')) {
      setAnalystResponse(
        'Hawking Radiation is theoretical thermal black-body radiation released outside a black hole’s event horizon due to quantum vacuum fluctuations. Virtual particle-antiparticle pairs form near the horizon: one falls in while the other escapes, causing the black hole to slowly lose mass at temperature $T_H = \\frac{\\hbar c^3}{8\\pi G M k_B}$. For a solar-mass black hole, this takes ~10⁶⁷ years.'
      );
    } else if (low.includes('lagrange') || low.includes('points')) {
      setAnalystResponse(
        'Lagrange Points are five equilibrium positions in an orbital configuration where the gravitational pull of two large masses equals the centripetal force required for a small object to orbit with them. L1, L2, and L3 are collinear and unstable; L4 and L5 form equilateral triangles with the two primaries and are stable (Trojan asteroids and James Webb Space Telescope at Sun-Earth L2).'
      );
    } else if (low.includes('james webb') || low.includes('jwst')) {
      setAnalystResponse(
        'JWST operates in a halo orbit around Sun-Earth Lagrange Point 2 (1.5 million km from Earth). Its 6.5-meter gold-coated beryllium mirror detects infrared light between 0.6 and 28.3 microns, piercing cosmic dust to observe the earliest galaxies formed 13.5+ billion years ago and characterizing exoplanet atmospheres.'
      );
    } else if (low.includes('fermi') || low.includes('paradox')) {
      setAnalystResponse(
        'The Fermi Paradox highlights the apparent contradiction between the high probability of extraterrestrial life in our galaxy (~100-400 billion stars, billions of Earth-like planets) and the lack of evidence. Proposed solutions include the Great Filter, the Zoo Hypothesis, interstellar travel energy constraints, or communicative civilizational longevity.'
      );
    } else {
      setAnalystResponse(
        `Astrophysical Analysis for "${q}": In modern observational astronomy, this phenomenon is governed by the interplay of gravitational dynamics, thermodynamics, and radiative transfer. To investigate further, compare the Keplerian orbital periods and spectroscopic emission lines in the Astroverse Celestial Catalog.`
      );
    }
  };

  return (
    <div className="w-full bg-[#030712] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium flex items-center gap-1.5 w-fit">
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            ASTRONOMICAL ENGINES & ASTROPHYSICS LAB
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Universal Phenomenon & Mission Calculators
          </h2>
          <p className="text-xs text-slate-400">
            Precision engineering tools for astronomy students, astrophysicists, and astronauts
          </p>
        </div>

        {/* Engine switcher tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none bg-slate-900 border border-slate-800 p-1 rounded-xl">
          {[
            { id: 'hohmann', label: 'Hohmann Orbit Transfer', icon: Rocket },
            { id: 'optics', label: 'Telescope Optics', icon: Eye },
            { id: 'kepler', label: "Kepler's Orbits", icon: Orbit },
            { id: 'relativity', label: 'Relativistic Dilation', icon: Atom },
            { id: 'ai_analyst', label: 'Deep Sky AI Analyst', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. HOHMANN TRANSFER ENGINE */}
      {activeTab === 'hohmann' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Rocket className="w-4 h-4 text-cyan-400" /> Orbital Parameters
            </h3>

            <div>
              <label className="text-xs text-slate-300 flex justify-between font-mono">
                <span>Departure Orbit ($r_1$):</span>
                <span className="text-cyan-300 font-bold">{hDepartureAU} AU</span>
              </label>
              <input
                type="range"
                min="0.387"
                max="5.2"
                step="0.05"
                value={hDepartureAU}
                onChange={(e) => setHDepartureAU(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Mercury (0.39)</span>
                <span>Earth (1.0)</span>
                <span>Jupiter (5.2)</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 flex justify-between font-mono">
                <span>Arrival Target Orbit ($r_2$):</span>
                <span className="text-cyan-300 font-bold">{hArrivalAU} AU</span>
              </label>
              <input
                type="range"
                min="0.387"
                max="9.58"
                step="0.05"
                value={hArrivalAU}
                onChange={(e) => setHArrivalAU(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Venus (0.72)</span>
                <span>Mars (1.52)</span>
                <span>Saturn (9.58)</span>
              </div>
            </div>

            {/* Quick mission presets */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block mb-1.5">Mission Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => {
                    setHDepartureAU(1.0);
                    setHArrivalAU(1.524);
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono cursor-pointer"
                >
                  Earth → Mars
                </button>
                <button
                  onClick={() => {
                    setHDepartureAU(1.0);
                    setHArrivalAU(5.204);
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono cursor-pointer"
                >
                  Earth → Jupiter
                </button>
                <button
                  onClick={() => {
                    setHDepartureAU(1.0);
                    setHArrivalAU(0.723);
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono cursor-pointer"
                >
                  Earth → Venus
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Interplanetary Delta-V & Transit Telemetry
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Injection $\Delta v_1$</span>
                <span className="text-lg font-bold text-cyan-300">{hohmannResult.deltaV1_kmS} km/s</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Capture $\Delta v_2$</span>
                <span className="text-lg font-bold text-cyan-300">{hohmannResult.deltaV2_kmS} km/s</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Total Mission Δv_tot</span>
                <span className="text-lg font-bold text-amber-300">{hohmannResult.totalDeltaV_kmS} km/s</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Transit Duration</span>
                <span className="text-lg font-bold text-emerald-300">
                  {hohmannResult.transferDays} days ({hohmannResult.transferMonths} mo)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
              <p className="text-cyan-400 font-bold mb-1">Astronaut Flight Mechanics Note:</p>
              A Hohmann transfer ellipse is the most energy-efficient two-impulse orbital maneuver between two circular co-planar orbits. The spacecraft leaves orbit 1 at periapsis and circularizes into orbit 2 at apoapsis.
            </div>
          </div>
        </div>
      )}

      {/* 2. TELESCOPE OPTICS ENGINE */}
      {activeTab === 'optics' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" /> Optical System Specs
            </h3>

            <div>
              <label className="text-xs text-slate-300 flex justify-between font-mono">
                <span>Primary Aperture ($D$):</span>
                <span className="text-cyan-300 font-bold">{apertureMm} mm ({((apertureMm / 25.4).toFixed(1))} in)</span>
              </label>
              <input
                type="range"
                min="50"
                max="400"
                step="10"
                value={apertureMm}
                onChange={(e) => setApertureMm(parseInt(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer mt-1"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 flex justify-between font-mono">
                <span>Telescope Focal Length ($F$):</span>
                <span className="text-cyan-300 font-bold">{scopeFocalLengthMm} mm</span>
              </label>
              <input
                type="range"
                min="300"
                max="2500"
                step="50"
                value={scopeFocalLengthMm}
                onChange={(e) => setScopeFocalLengthMm(parseInt(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer mt-1"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 flex justify-between font-mono">
                <span>Eyepiece Focal Length ($f$):</span>
                <span className="text-cyan-300 font-bold">{eyepieceFocalLengthMm} mm</span>
              </label>
              <input
                type="range"
                min="4"
                max="40"
                step="1"
                value={eyepieceFocalLengthMm}
                onChange={(e) => setEyepieceFocalLengthMm(parseInt(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer mt-1"
              />
            </div>
          </div>

          <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Theoretical Performance Telemetry
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Magnification</span>
                <span className="text-lg font-bold text-cyan-300">{opticsResult.magnification}x</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Focal Ratio</span>
                <span className="text-lg font-bold text-cyan-300">f/{opticsResult.focalRatio}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Dawes' Resolution</span>
                <span className="text-lg font-bold text-emerald-300">{opticsResult.dawesLimitArcsec}" arcsec</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Exit Pupil</span>
                <span className="text-lg font-bold text-amber-300">{opticsResult.exitPupilMm} mm</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Light Grasp vs Eye</span>
                <span className="text-lg font-bold text-purple-300">{opticsResult.lightGatheringVsEye}x</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Max Useful Mag</span>
                <span className="text-lg font-bold text-rose-300">{opticsResult.maxUsefulMagnification}x</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. KEPLER'S ORBITAL LAWS */}
      {activeTab === 'kepler' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Orbit className="w-4 h-4 text-cyan-400" /> Keplerian Inputs
            </h3>

            <div>
              <label className="text-xs text-slate-300 flex justify-between font-mono">
                <span>Semi-Major Axis ($a$):</span>
                <span className="text-cyan-300 font-bold">{keplerDistanceAU} AU</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="30"
                step="0.1"
                value={keplerDistanceAU}
                onChange={(e) => setKeplerDistanceAU(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer mt-1"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 flex justify-between font-mono">
                <span>Central Star Mass ($M$):</span>
                <span className="text-cyan-300 font-bold">{centralStarMass} M☉</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={centralStarMass}
                onChange={(e) => setCentralStarMass(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer mt-1"
              />
            </div>
          </div>

          <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Kepler’s 3rd Law ($P^2 = a^3 / M$) & Velocity Results
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Orbital Period ($P$)</span>
                <span className="text-lg font-bold text-cyan-300">
                  {keplerResult.periodYears} Years ({keplerResult.periodDays} Days)
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Mean Orbital Velocity</span>
                <span className="text-lg font-bold text-emerald-300">{keplerResult.meanOrbitalVelocityKmS} km/s</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Escape Velocity (v_esc)</span>
                <span className="text-lg font-bold text-amber-300">{keplerResult.escapeVelocityKmS} km/s</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Orbital Circumference</span>
                <span className="text-lg font-bold text-purple-300">
                  {(keplerDistanceAU * 9.42e8).toExponential(2)} km
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. RELATIVISTIC DILATION */}
      {activeTab === 'relativity' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Atom className="w-4 h-4 text-cyan-400" /> Relativistic Ship & Black Hole
            </h3>

            <div>
              <label className="text-xs text-slate-300 flex justify-between font-mono">
                <span>Ship Velocity Fraction ($v/c$):</span>
                <span className="text-cyan-300 font-bold">{(relVelocityC * 100).toFixed(1)}% c</span>
              </label>
              <input
                type="range"
                min="0.0"
                max="0.999"
                step="0.01"
                value={relVelocityC}
                onChange={(e) => setRelVelocityC(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer mt-1"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 flex justify-between font-mono">
                <span>Black Hole Mass ($M$):</span>
                <span className="text-cyan-300 font-bold">{bhMass} M☉</span>
              </label>
              <input
                type="range"
                min="3"
                max="50"
                step="1"
                value={bhMass}
                onChange={(e) => setBhMass(parseInt(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer mt-1"
              />
            </div>
          </div>

          <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Lorentz Factor $\gamma$ & Gravitational Warping
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Lorentz Factor ($\gamma$)</span>
                <span className="text-lg font-bold text-purple-300">{relResult.gamma}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Special Rel. Time Dilation</span>
                <span className="text-lg font-bold text-cyan-300">{relResult.velocityDilationRatio}x Slower</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Schwarzschild Radius ($r_s$)</span>
                <span className="text-lg font-bold text-amber-300">{relResult.schwarzschildRadiusKm} km</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Gravitational Dilation</span>
                <span className="text-lg font-bold text-rose-300">{relResult.gravitationalDilationRatio}x</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. DEEP SKY AI ANALYST */}
      {activeTab === 'ai_analyst' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Ask Astroverse Deep Space Intelligence
            </h3>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask an astrophysical question (e.g., Hawking radiation, Lagrange points, JWST, Fermi Paradox)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && query && handleRunQuery(query)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => query && handleRunQuery(query)}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
            >
              Analyze
            </button>
          </div>

          {/* Preset queries */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-mono text-slate-400">Sample Topics:</span>
            {['Hawking Radiation', 'Lagrange Points', 'James Webb Optics', 'Fermi Paradox'].map((topic) => (
              <button
                key={topic}
                onClick={() => handleRunQuery(topic)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-cyan-300 font-mono transition cursor-pointer"
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Response Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono leading-relaxed text-slate-200">
            <span className="text-[10px] text-cyan-400 uppercase tracking-wider block mb-1">
              Astrophysical Intelligence Output:
            </span>
            <p>{analystResponse}</p>
          </div>
        </div>
      )}
    </div>
  );
};
