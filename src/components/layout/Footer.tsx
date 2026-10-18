import React from 'react';
import { Orbit, Sparkles, Heart, Compass, Globe, Shield, Terminal } from 'lucide-react';

export const Footer: React.FC<{
  onSelectTab: (tab: string) => void;
}> = ({ onSelectTab }) => {
  return (
    <footer className="border-t border-slate-800 bg-[#02050c] text-slate-400 py-10 px-4 sm:px-6 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold font-serif-celestial text-base">
            <Orbit className="w-5 h-5 text-cyan-400" />
            <span>ASTROVERSE</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Free, open-source astronomy encyclopedia, precision astrophysics engines, and interactive 3D celestial sphere simulator for students, stargazers, and astronauts.
          </p>
          <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-300">
            <Shield className="w-3.5 h-3.5" /> Offline-First Progressive Web App
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3">
            3D Simulations
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onSelectTab('orrery')} className="hover:text-cyan-300 cursor-pointer">
                Keplerian Solar System Orrery
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('planet_3d')} className="hover:text-cyan-300 cursor-pointer">
                3D Planet & Moon Explorer
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('black_hole')} className="hover:text-cyan-300 cursor-pointer">
                Kerr Black Hole & Lensing
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('gravity')} className="hover:text-cyan-300 cursor-pointer">
                N-Body Gravity & Lagrange Points
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('hr_diagram')} className="hover:text-cyan-300 cursor-pointer">
                H-R Diagram Stellar Evolution
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3">
            Observation Tools
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onSelectTab('star_chart')} className="hover:text-cyan-300 cursor-pointer">
                Live Star Chart & Download
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('ar_sky')} className="hover:text-cyan-300 cursor-pointer">
                AR Night Sky Camera Overlay
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('alerts')} className="hover:text-cyan-300 cursor-pointer">
                Meteor Showers & Eclipses
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('dashboard')} className="hover:text-cyan-300 cursor-pointer">
                Cosmic Observation Logbook
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('community')} className="hover:text-cyan-300 cursor-pointer">
                Global Sightings Community
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3">
            Astrophysics Engines
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onSelectTab('engines')} className="hover:text-cyan-300 cursor-pointer">
                Hohmann Interplanetary Transfer
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('engines')} className="hover:text-cyan-300 cursor-pointer">
                Telescope Resolving & Optics
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('engines')} className="hover:text-cyan-300 cursor-pointer">
                Relativistic Time Dilation
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('encyclopedia')} className="hover:text-cyan-300 cursor-pointer">
                Universal Celestial Database
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono">
        <p>Astroverse • Open Source Celestial Navigation System • MIT License</p>
        <p className="text-slate-500">
          Data grounded in NASA JPL Horizons, ESA Gaia, and IAU Celestial Catalogs
        </p>
      </div>
    </footer>
  );
};
