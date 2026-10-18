import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { SolarSystemOrrery } from './components/simulations/SolarSystemOrrery';
import { PlanetExplorer3D } from './components/simulations/PlanetExplorer3D';
import { BlackHole3D } from './components/simulations/BlackHole3D';
import { NBodyGravityEngine } from './components/simulations/NBodyGravityEngine';
import { HRDiagramEvolution } from './components/simulations/HRDiagramEvolution';
import { StarChart } from './components/starchart/StarChart';
import { ARNightSky } from './components/ar/ARNightSky';
import { Encyclopedia } from './components/encyclopedia/Encyclopedia';
import { AstroEngines } from './components/engines/AstroEngines';
import { CelestialAlerts } from './components/events/CelestialAlerts';
import { CosmicDashboard } from './components/dashboard/CosmicDashboard';
import { CommunityFeed } from './components/social/CommunityFeed';
import { AchievementsModal } from './components/gamification/AchievementsModal';
import { SocialShareModal } from './components/social/SocialShareModal';
import { ObservationLog, CelestialCategory } from './types/astronomy';
import { loadProfile, saveProfile } from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('orrery');
  const [nightVisionActive, setNightVisionActive] = useState<boolean>(() => {
    return loadProfile().nightVisionActive || false;
  });

  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [shareModalLog, setShareModalLog] = useState<ObservationLog | null>(null);

  // Apply or remove Night Vision Red Mode class on root html tag
  useEffect(() => {
    const root = document.documentElement;
    if (nightVisionActive) {
      root.classList.add('night-vision-red');
    } else {
      root.classList.remove('night-vision-red');
    }
    const profile = loadProfile();
    profile.nightVisionActive = nightVisionActive;
    saveProfile(profile);
  }, [nightVisionActive]);

  const handleSelectTargetForLog = (targetName: string, category: CelestialCategory) => {
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 relative">
      {/* Navbar with PWA & Night Vision controls */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        nightVisionActive={nightVisionActive}
        setNightVisionActive={setNightVisionActive}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 pb-12">
        {activeTab === 'orrery' && <SolarSystemOrrery />}
        {activeTab === 'planet_3d' && <PlanetExplorer3D />}
        {activeTab === 'black_hole' && <BlackHole3D />}
        {activeTab === 'gravity' && <NBodyGravityEngine />}
        {activeTab === 'hr_diagram' && <HRDiagramEvolution />}
        {activeTab === 'star_chart' && <StarChart />}
        {activeTab === 'ar_sky' && (
          <ARNightSky onLogObservation={() => setActiveTab('dashboard')} />
        )}
        {activeTab === 'encyclopedia' && (
          <Encyclopedia onSelectTargetForLog={handleSelectTargetForLog} />
        )}
        {activeTab === 'engines' && <AstroEngines />}
        {activeTab === 'alerts' && <CelestialAlerts />}
        {activeTab === 'dashboard' && (
          <CosmicDashboard
            onOpenAchievements={() => setIsAchievementsOpen(true)}
            onOpenShareModal={(log) => setShareModalLog(log)}
          />
        )}
        {activeTab === 'community' && (
          <CommunityFeed onOpenShareModal={(log) => setShareModalLog(log)} />
        )}
      </main>

      {/* Footer */}
      <Footer onSelectTab={(tab) => setActiveTab(tab)} />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Gamified Achievements Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
      />

      {/* Social Sighting Card Share Modal */}
      <SocialShareModal
        log={shareModalLog}
        isOpen={!!shareModalLog}
        onClose={() => setShareModalLog(null)}
      />
    </div>
  );
}
