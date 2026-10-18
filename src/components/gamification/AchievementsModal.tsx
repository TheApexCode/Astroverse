import React, { useEffect } from 'react';
import { Award, CheckCircle2, Lock, Sparkles, X, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ACHIEVEMENTS, getRankByXP } from '../../data/achievementsData';
import { loadProfile } from '../../utils/storage';

export const AchievementsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const profile = loadProfile();
  const rankInfo = getRankByXP(profile.xp);

  useEffect(() => {
    if (isOpen) {
      // Gentle cosmic star confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#c084fc', '#f59e0b'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Stargazer Achievements</h3>
            <p className="text-xs text-slate-400 font-mono">
              Observer Rank: <strong className="text-amber-400">{rankInfo.rank}</strong> • {profile.xp} Total XP
            </p>
          </div>
        </div>

        {/* Level Banner */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 mb-5 flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Level {rankInfo.level} Progress</span>
            <div className="text-cyan-300 font-bold mt-0.5">
              {profile.xp} / {rankInfo.nextLevelXP} XP
            </div>
          </div>
          <div className="w-48 bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-amber-400 to-cyan-400 h-full rounded-full"
              style={{ width: `${rankInfo.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Grid of Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = profile.unlockedAchievementIds.includes(ach.id) || profile.xp >= ach.xpReward;
            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-slate-950/90 border-amber-500/40 text-slate-200'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isUnlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-900 text-slate-600'
                      }`}
                    >
                      {isUnlocked ? <Award className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                      <span className="text-[10px] font-mono text-cyan-400">+{ach.xpReward} XP</span>
                    </div>
                  </div>

                  {isUnlocked && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pl-8">
                  {ach.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
