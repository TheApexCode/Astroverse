import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, Users, Sparkles, MapPin, Eye, Compass } from 'lucide-react';
import { loadCommunitySightings, likeCommunitySighting } from '../../utils/storage';
import { ObservationLog } from '../../types/astronomy';

export const CommunityFeed: React.FC<{
  onOpenShareModal: (log: ObservationLog) => void;
}> = ({ onOpenShareModal }) => {
  const [sightings, setSightings] = useState<ObservationLog[]>(() => loadCommunitySightings());

  const handleLike = (id: string) => {
    const updated = likeCommunitySighting(id);
    setSightings(updated);
  };

  return (
    <div className="w-full bg-[#030712] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium flex items-center gap-1.5 w-fit">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            GLOBAL STARGAZER COMMUNITY
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Community Observations Feed
          </h2>
          <p className="text-xs text-slate-400">
            Compare celestial sightings, dark-sky locations, and telescope optics with observers worldwide
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {sightings.map((sighting) => (
          <div
            key={sighting.id}
            className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-slate-950 text-xs font-mono">
                  {(sighting.authorName || 'Astronaut').charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{sighting.authorName || 'Stargazer'}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400" /> {sighting.locationName}
                    </span>
                    <span>•</span>
                    <span>{new Date(sighting.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                {sighting.targetCategory}
              </span>
            </div>

            <h3 className="text-base font-bold text-cyan-300 mt-2 mb-1">
              Target: {sighting.targetName}
            </h3>

            <p className="text-xs text-slate-200 leading-relaxed mb-3">
              "{sighting.notes}"
            </p>

            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs font-mono text-slate-300 flex flex-wrap gap-x-4 gap-y-1 mb-3">
              <span>Optics: <strong className="text-white">{sighting.equipment}</strong></span>
              <span>Bortle: <strong className="text-cyan-300">Class {sighting.bortleScale}</strong></span>
              <span>Atmospheric Seeing: <strong className="text-emerald-300">{sighting.seeingCondition}</strong></span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleLike(sighting.id)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />
                  <span className="font-mono text-slate-300">{sighting.likes || 1} Applauds</span>
                </button>
              </div>

              <button
                onClick={() => onOpenShareModal(sighting)}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono text-xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Export Sighting Card</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
