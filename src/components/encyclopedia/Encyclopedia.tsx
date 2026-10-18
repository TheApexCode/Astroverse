import React, { useState, useMemo } from 'react';
import { Search, Filter, Star, Globe, Compass, Telescope, Bookmark, X, Sparkles, Check, ChevronRight } from 'lucide-react';
import { CELESTIAL_OBJECTS, CONSTELLATIONS } from '../../data/celestialData';
import { CelestialObject, Constellation, CelestialCategory } from '../../types/astronomy';
import { loadProfile, saveProfile } from '../../utils/storage';

export const Encyclopedia: React.FC<{
  onSelectTargetForLog?: (target: string, category: CelestialCategory) => void;
}> = ({ onSelectTargetForLog }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxMagnitude, setMaxMagnitude] = useState<number>(15.0);
  const [selectedObject, setSelectedObject] = useState<CelestialObject | null>(null);
  const [selectedConstellation, setSelectedConstellation] = useState<Constellation | null>(null);

  const [profile, setProfile] = useState(() => loadProfile());

  const toggleFavorite = (id: string) => {
    const isFav = profile.favoriteObjectIds.includes(id);
    const updatedFavs = isFav
      ? profile.favoriteObjectIds.filter((fId) => fId !== id)
      : [...profile.favoriteObjectIds, id];

    const updatedProfile = { ...profile, favoriteObjectIds: updatedFavs };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
  };

  // Filtered celestial objects
  const filteredObjects = useMemo(() => {
    return CELESTIAL_OBJECTS.filter((obj) => {
      // Category filter
      if (selectedCategory !== 'all' && selectedCategory !== 'constellation') {
        if (obj.category !== selectedCategory) return false;
      }
      if (selectedCategory === 'constellation') {
        return false; // Show constellations below
      }

      // Magnitude filter
      if (obj.apparentMagnitude > maxMagnitude) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = obj.name.toLowerCase().includes(q);
        const matchesSub = obj.subtitle.toLowerCase().includes(q);
        const matchesConst = obj.constellation?.toLowerCase().includes(q);
        const matchesDesc = obj.description.toLowerCase().includes(q);
        if (!matchesName && !matchesSub && !matchesConst && !matchesDesc) return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, maxMagnitude]);

  // Filtered constellations
  const filteredConstellations = useMemo(() => {
    if (selectedCategory !== 'all' && selectedCategory !== 'constellation') {
      return [];
    }
    return CONSTELLATIONS.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.latinName.toLowerCase().includes(q) ||
          c.brightestStar.toLowerCase().includes(q) ||
          c.mythology.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="w-full bg-[#030712] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
      {/* Header & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium flex items-center gap-1.5 w-fit">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            UNIVERSAL ASTRONOMICAL ENCYCLOPEDIA
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Cosmic Database & Stellar Catalog
          </h2>
          <p className="text-xs text-slate-400">
            Filter every known planet, star, constellation, nebula, galaxy, and exoplanet
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, constellation, class..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Catalog' },
            { id: 'planet', label: 'Planets' },
            { id: 'star', label: 'Stars' },
            { id: 'constellation', label: 'Constellations' },
            { id: 'dso', label: 'Deep Sky (Messier)' },
            { id: 'exoplanet', label: 'Exoplanets' },
            { id: 'spacecraft', label: 'Spacecraft' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Magnitude Filter Slider */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono">
          <span className="text-slate-400 text-[11px]">Max Mag:</span>
          <input
            type="range"
            min="-2"
            max="18"
            step="1"
            value={maxMagnitude}
            onChange={(e) => setMaxMagnitude(parseFloat(e.target.value))}
            className="w-20 accent-cyan-500 cursor-pointer"
          />
          <span className="text-cyan-300 font-bold w-12 text-right">≤ {maxMagnitude}</span>
        </div>
      </div>

      {/* Grid of Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Celestial Objects */}
        {filteredObjects.map((obj) => {
          const isFav = profile.favoriteObjectIds.includes(obj.id);
          return (
            <div
              key={obj.id}
              onClick={() => setSelectedObject(obj)}
              className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span
                      className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${obj.colorHex}20`,
                        color: obj.colorHex,
                        border: `1px solid ${obj.colorHex}40`,
                      }}
                    >
                      {obj.category.toUpperCase()}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5 group-hover:text-cyan-300 transition">
                      {obj.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{obj.subtitle}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(obj.id);
                    }}
                    className={`p-1.5 rounded-lg border transition ${
                      isFav
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title={isFav ? 'Remove from favorites' : 'Add to cosmic favorites'}
                  >
                    <Bookmark className="w-3.5 h-3.5" fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                  {obj.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                <span>Mag: <strong className="text-cyan-300">{obj.apparentMagnitude}</strong></span>
                <span>
                  {obj.distanceAU
                    ? `${obj.distanceAU} AU`
                    : obj.distanceLightYears
                    ? `${obj.distanceLightYears.toLocaleString()} ly`
                    : 'Orbit'}
                </span>
                <span className="text-cyan-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  Inspect <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}

        {/* Constellations */}
        {filteredConstellations.map((constellation) => {
          const isFav = profile.favoriteObjectIds.includes(constellation.id);
          return (
            <div
              key={constellation.id}
              onClick={() => setSelectedConstellation(constellation)}
              className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-xl p-4 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      CONSTELLATION ({constellation.abbreviation})
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5 group-hover:text-purple-300 transition">
                      {constellation.name}
                    </h3>
                    <p className="text-xs text-slate-400">{constellation.latinName}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(constellation.id);
                    }}
                    className={`p-1.5 rounded-lg border transition ${
                      isFav
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                  {constellation.mythology}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                <span>Brightest: <strong className="text-purple-300">{constellation.brightestStar.split(' (')[0]}</strong></span>
                <span>{constellation.season}</span>
                <span className="text-purple-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  View Map <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Detail Card for Celestial Object */}
      {selectedObject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedObject(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <span
              className="text-xs uppercase font-mono font-bold tracking-wider px-2.5 py-1 rounded inline-block"
              style={{
                backgroundColor: `${selectedObject.colorHex}20`,
                color: selectedObject.colorHex,
                border: `1px solid ${selectedObject.colorHex}40`,
              }}
            >
              {selectedObject.category.toUpperCase()}
            </span>

            <h3 className="text-2xl font-bold text-white mt-2">{selectedObject.name}</h3>
            <p className="text-xs text-slate-400 mb-4">{selectedObject.subtitle}</p>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
              {selectedObject.description}
            </p>

            {/* Astrophysical Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Apparent Mag</span>
                <p className="text-cyan-300 font-bold mt-0.5">{selectedObject.apparentMagnitude}</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Distance</span>
                <p className="text-white font-bold mt-0.5">
                  {selectedObject.distanceAU
                    ? `${selectedObject.distanceAU} AU`
                    : selectedObject.distanceLightYears
                    ? `${selectedObject.distanceLightYears.toLocaleString()} ly`
                    : 'N/A'}
                </p>
              </div>
              {selectedObject.surfaceTemperature && (
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Surface Temp</span>
                  <p className="text-amber-300 font-bold mt-0.5">{selectedObject.surfaceTemperature}</p>
                </div>
              )}
              {selectedObject.mass && (
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Mass</span>
                  <p className="text-emerald-300 font-bold mt-0.5">{selectedObject.mass}</p>
                </div>
              )}
              {selectedObject.radius && (
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Radius</span>
                  <p className="text-purple-300 font-bold mt-0.5">{selectedObject.radius}</p>
                </div>
              )}
              {selectedObject.constellation && (
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Constellation</span>
                  <p className="text-cyan-400 font-bold mt-0.5">{selectedObject.constellation}</p>
                </div>
              )}
            </div>

            {/* Key Astrophysical Facts */}
            <div className="mb-5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-2">
                Astrophysical Key Facts:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {selectedObject.keyFacts.map((fact, idx) => (
                  <li key={idx} className="leading-relaxed">{fact}</li>
                ))}
              </ul>
            </div>

            {/* Mythology / History */}
            {selectedObject.mythologyOrHistory && (
              <div className="mb-5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-amber-300 block mb-1">Mythological / Historical Context:</span>
                {selectedObject.mythologyOrHistory}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => toggleFavorite(selectedObject.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  profile.favoriteObjectIds.includes(selectedObject.id)
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>
                  {profile.favoriteObjectIds.includes(selectedObject.id)
                    ? 'Bookmarked in Favorites'
                    : 'Add to Favorites'}
                </span>
              </button>

              {onSelectTargetForLog && (
                <button
                  onClick={() => {
                    onSelectTargetForLog(selectedObject.name, selectedObject.category);
                    setSelectedObject(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition cursor-pointer"
                >
                  Log Observation Session
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Card for Constellation */}
      {selectedConstellation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedConstellation(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs uppercase font-mono font-bold tracking-wider px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 inline-block">
              CONSTELLATION ({selectedConstellation.abbreviation})
            </span>

            <h3 className="text-2xl font-bold text-white mt-2">{selectedConstellation.name}</h3>
            <p className="text-xs text-slate-400 mb-4">{selectedConstellation.latinName}</p>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
              {selectedConstellation.mythology}
            </p>

            <div className="grid grid-cols-2 gap-2.5 mb-4 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400">Brightest Star</span>
                <p className="text-purple-300 font-bold mt-0.5">{selectedConstellation.brightestStar}</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400">Sky Area</span>
                <p className="text-white font-bold mt-0.5">{selectedConstellation.areaSqDeg} sq deg</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400">Viewing Season</span>
                <p className="text-cyan-300 font-bold mt-0.5">{selectedConstellation.season}</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400">Coordinates (RA / Dec)</span>
                <p className="text-amber-300 font-bold mt-0.5">{selectedConstellation.declinationRange}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedConstellation(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
