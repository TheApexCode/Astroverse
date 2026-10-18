import React, { useState } from 'react';
import {
  Compass,
  Globe,
  Camera,
  BookOpen,
  Calculator,
  Bell,
  User,
  Users,
  Eye,
  Menu,
  X,
  Sparkles,
  Orbit,
} from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

export interface NavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  nightVisionActive: boolean;
  setNightVisionActive: (active: boolean) => void;
}

export const Navbar: React.FC<NavProps> = ({
  activeTab,
  setActiveTab,
  nightVisionActive,
  setNightVisionActive,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'orrery', label: '3D Orrery', icon: Orbit },
    { id: 'planet_3d', label: '3D Planets', icon: Globe },
    { id: 'black_hole', label: 'Black Hole 3D', icon: Sparkles },
    { id: 'gravity', label: 'N-Body Engine', icon: Compass },
    { id: 'hr_diagram', label: 'H-R Evolution', icon: Sparkles },
    { id: 'star_chart', label: 'Live Star Chart', icon: Compass },
    { id: 'ar_sky', label: 'AR Night Sky', icon: Camera },
    { id: 'encyclopedia', label: 'Encyclopedia', icon: BookOpen },
    { id: 'engines', label: 'Astro Engines', icon: Calculator },
    { id: 'alerts', label: 'Event Alerts', icon: Bell },
    { id: 'dashboard', label: 'Cosmic Logbook', icon: User },
    { id: 'community', label: 'Community', icon: Users },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#030712]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('orrery')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#030712] rounded-[10px] flex items-center justify-center">
              <Orbit className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5 font-serif-celestial">
              ASTROVERSE
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono font-normal">
                v2.5
              </span>
            </span>
            <p className="text-[10px] text-slate-400 font-mono -mt-1 hidden sm:block">
              Open-Source Astronomy & Space Exploration
            </p>
          </div>
        </div>

        {/* Desktop Primary Navigation Items */}
        <nav className="hidden xl:flex items-center gap-1 overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Utility Tools */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Night Vision Red Mode Toggle */}
          <button
            onClick={() => setNightVisionActive(!nightVisionActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
              nightVisionActive
                ? 'bg-red-600 text-white border-red-500 font-bold shadow-lg shadow-red-600/30'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Toggle Monochromatic Red Night Vision to preserve human dark-adaptation during stargazing"
          >
            <Eye className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline font-mono">
              {nightVisionActive ? 'RED VISION ACTIVE' : 'RED NIGHT MODE'}
            </span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Mobile menu hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 space-y-1">
          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
