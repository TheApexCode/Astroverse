import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Cloud,
  CheckCircle,
  Download,
  Upload,
  Moon,
  Star,
  Award,
  Sparkles,
  Share2,
  Trash2,
  Bookmark,
  Calendar,
  Layers,
  Check,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { ObservationLog, StargazerProfile, CelestialCategory } from '../../types/astronomy';
import {
  loadProfile,
  saveProfile,
  loadLogs,
  saveLogs,
  addLogEntry,
  simulateCloudSync,
  exportCloudBackupJSON,
  importCloudBackupJSON,
} from '../../utils/storage';
import { getRankByXP } from '../../data/achievementsData';
import { getMoonPhase } from '../../utils/astroMath';
import { CELESTIAL_OBJECTS } from '../../data/celestialData';

export const CosmicDashboard: React.FC<{
  onOpenAchievements: () => void;
  onOpenShareModal: (log: ObservationLog) => void;
}> = ({ onOpenAchievements, onOpenShareModal }) => {
  const [profile, setProfile] = useState<StargazerProfile>(() => loadProfile());
  const [logs, setLogs] = useState<ObservationLog[]>(() => loadLogs());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // New Observation Log Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [targetName, setTargetName] = useState('');
  const [targetCategory, setTargetCategory] = useState<CelestialCategory>('planet');
  const [equipment, setEquipment] = useState<ObservationLog['equipment']>('Dobsonian (6"-8")');
  const [bortleScale, setBortleScale] = useState(4);
  const [seeingCondition, setSeeingCondition] = useState<ObservationLog['seeingCondition']>('Very Good (4/5)');
  const [transparency, setTransparency] = useState<ObservationLog['transparency']>('High');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(5);
  const [locationName, setLocationName] = useState('Local Dark Sky Spot');
  const [shareToCommunity, setShareToCommunity] = useState(true);

  const rankInfo = getRankByXP(profile.xp);
  const moonPhase = getMoonPhase();

  // Cloud Sync Handler
  const handleCloudSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Synchronizing logs with Astroverse Cloud...');
    const res = await simulateCloudSync();
    setIsSyncing(false);
    setProfile(loadProfile());
    setSyncStatus(`Cloud Synchronized at ${new Date(res.timestamp).toLocaleTimeString()}`);
    setTimeout(() => setSyncStatus(null), 4000);
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const jsonStr = exportCloudBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Astroverse-Backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importCloudBackupJSON(content);
      if (success) {
        setProfile(loadProfile());
        setLogs(loadLogs());
        setSyncStatus('Backup imported successfully!');
        setTimeout(() => setSyncStatus(null), 3000);
      } else {
        alert('Failed to parse Astroverse backup file. Please ensure it is a valid Astroverse JSON export.');
      }
    };
    reader.readAsText(file);
  };

  // Save New Observation Log
  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName.trim()) return;

    const newLog = addLogEntry({
      targetName: targetName.trim(),
      targetCategory,
      equipment,
      bortleScale,
      seeingCondition,
      transparency,
      notes: notes.trim() || 'Observed celestial object with pristine clarity.',
      rating,
      locationName: locationName.trim() || 'Field Station',
      sharedToCommunity: shareToCommunity,
      authorName: profile.username,
      likes: 1,
    });

    // Award Stargazer XP
    const newXP = profile.xp + 100;
    const updatedProfile = { ...profile, xp: newXP };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);

    setLogs(loadLogs());
    setIsLogModalOpen(false);

    // Reset Form
    setTargetName('');
    setNotes('');

    // Open share card automatically
    onOpenShareModal(newLog);
  };

  // Delete Log
  const handleDeleteLog = (id: string) => {
    const updated = logs.filter((l) => l.id !== id);
    setLogs(updated);
    saveLogs(updated);
  };

  // Favorites list
  const favoriteObjects = CELESTIAL_OBJECTS.filter((obj) =>
    profile.favoriteObjectIds.includes(obj.id)
  );

  return (
    <div className="w-full bg-[#030712] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Header Profile & Stargazer Rank */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              COSMIC MISSION DASHBOARD
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Observer: {profile.username}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-300">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-semibold">
              Level {rankInfo.level} • {rankInfo.rank}
            </span>
            <span>•</span>
            <span className="font-mono text-amber-300">{profile.xp} XP</span>
          </div>
        </div>

        {/* Sync & Achievement Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAchievements}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Achievements</span>
          </button>

          <button
            onClick={handleCloudSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition cursor-pointer"
          >
            <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Cloud Sync'}</span>
          </button>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Observation</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatus && (
        <div className="bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Level XP Progress Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
        <div className="flex justify-between text-xs font-mono mb-1.5">
          <span className="text-slate-400">Progression to Next Rank</span>
          <span className="text-cyan-300 font-bold">{rankInfo.progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${rankInfo.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stargazing Weather & Sky Quality Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Moon Phase Widget */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-400">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
              Lunar Phase Today
            </span>
            <h4 className="text-sm font-bold text-white mt-0.5">{moonPhase.phaseName}</h4>
            <p className="text-xs text-amber-300 font-mono mt-0.5">
              {moonPhase.illumination}% Illumination • Age {moonPhase.ageDays}d
            </p>
          </div>
        </div>

        {/* Bortle Light Pollution Index */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
              Observation Sky Quality
            </span>
            <h4 className="text-sm font-bold text-white mt-0.5">Bortle Class {profile.bortleLocationPref}</h4>
            <p className="text-xs text-cyan-300 font-mono mt-0.5">
              {profile.bortleLocationPref <= 3 ? 'Dark Sky Reserve' : 'Suburban Rural Transition'}
            </p>
          </div>
        </div>

        {/* Cloud Storage & Backup Actions */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
              Offline Data & Backup
            </span>
            <p className="text-xs text-slate-300 mt-1">Export or restore logs across all devices</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>
            <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Import</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Bookmarked Cosmic Favorites */}
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-amber-400" /> Bookmarked Celestial Objects ({favoriteObjects.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {favoriteObjects.map((obj) => (
            <div
              key={obj.id}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col justify-between"
            >
              <div>
                <span
                  className="text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${obj.colorHex}20`, color: obj.colorHex }}
                >
                  {obj.category}
                </span>
                <h4 className="text-xs font-bold text-white mt-1 truncate">{obj.name}</h4>
                <p className="text-[10px] text-slate-400 truncate">{obj.subtitle}</p>
              </div>
              <div className="mt-2 text-[10px] font-mono text-cyan-300">
                Mag: {obj.apparentMagnitude}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Observation Logbook */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" /> Astronomical Logbook ({logs.length} Sessions)
          </h3>
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="text-xs text-cyan-400 hover:underline font-mono flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Log New Sighting
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400">
            No observations recorded yet. Click "Log Observation" to document your first celestial sighting!
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {log.targetCategory}
                    </span>
                    <h4 className="text-base font-bold text-white">{log.targetName}</h4>
                    {log.constellation && (
                      <span className="text-xs text-slate-400 font-mono">in {log.constellation}</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{log.notes}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
                    <span>Optics: <strong className="text-slate-200">{log.equipment}</strong></span>
                    <span>•</span>
                    <span>Bortle: <strong className="text-cyan-300">Class {log.bortleScale}</strong></span>
                    <span>•</span>
                    <span>Seeing: <strong className="text-emerald-300">{log.seeingCondition}</strong></span>
                    <span>•</span>
                    <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onOpenShareModal(log)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-medium transition cursor-pointer"
                    title="Generate sleek social sharing sighting card"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Sighting</span>
                  </button>

                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                    title="Delete log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Observation Log Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1">Record Astronomical Observation</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add your sighting to your cosmic logbook and earn 100 Stargazer XP!
            </p>

            <form onSubmit={handleCreateLog} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-300 block mb-1">Target Object Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saturn & Cassini Division, M42 Orion Nebula, Jupiter..."
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Category</label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white text-xs"
                  >
                    <option value="planet">Planet</option>
                    <option value="moon">Moon</option>
                    <option value="star">Star</option>
                    <option value="dso">Deep Sky (Messier/NGC)</option>
                    <option value="constellation">Constellation</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Equipment</label>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white text-xs"
                  >
                    <option value="Naked Eye">Naked Eye</option>
                    <option value='Binoculars (7x50)'>Binoculars (7x50)</option>
                    <option value='Binoculars (10x50)'>Binoculars (10x50)</option>
                    <option value='Small Refractor (<90mm)'>Small Refractor (&lt;90mm)</option>
                    <option value='Dobsonian (6"-8")'>Dobsonian (6"-8")</option>
                    <option value='SCT / Cassegrain (8"+)'>SCT / Cassegrain (8"+)</option>
                    <option value="Astrograph / Smart Scope">Astrograph / Smart Scope</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Bortle Scale (1=Dark, 9=City)</label>
                  <input
                    type="range"
                    min="1"
                    max="9"
                    value={bortleScale}
                    onChange={(e) => setBortleScale(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="text-cyan-300 text-[11px] font-bold">Class {bortleScale}</div>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Seeing Condition</label>
                  <select
                    value={seeingCondition}
                    onChange={(e) => setSeeingCondition(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white text-xs"
                  >
                    <option value="Poor (1/5)">Poor (1/5)</option>
                    <option value="Fair (2/5)">Fair (2/5)</option>
                    <option value="Good (3/5)">Good (3/5)</option>
                    <option value="Very Good (4/5)">Very Good (4/5)</option>
                    <option value="Pristine (5/5)">Pristine (5/5)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Observation Notes & Visual Impressions</label>
                <textarea
                  rows={3}
                  placeholder="Atmospheric stability, filter used, resolved details, companions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="shareCheck"
                  checked={shareToCommunity}
                  onChange={(e) => setShareToCommunity(e.target.checked)}
                  className="accent-cyan-500 cursor-pointer"
                />
                <label htmlFor="shareCheck" className="text-slate-300 text-xs cursor-pointer">
                  Publish to Community Sightings Feed
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition cursor-pointer"
                >
                  Save to Logbook (+100 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
