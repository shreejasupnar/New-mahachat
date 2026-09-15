import React, { useState } from 'react';
import { Trophy, ChevronDown, Award } from 'lucide-react';
import { VoiceParticipant } from '../../lib/firebase';

interface PartyRankingCardProps {
  participants: VoiceParticipant[];
  audienceCount: number;
}

export const PartyRankingCard: React.FC<PartyRankingCardProps> = ({
  participants
}) => {
  const [minimized, setMinimized] = useState<boolean>(false);

  // Derive ranked contributors by charm score (strictly real scores)
  const ranked = [...participants]
    .filter(p => p && p.displayName && (p.charmScore || 0) > 0)
    .sort((a, b) => (b.charmScore || 0) - (a.charmScore || 0));

  const top1 = ranked[0] || null;
  const top2 = ranked[1] || null;
  const activeRankingCount = ranked.length;

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        className="flex items-center gap-1 px-2 py-1 rounded-2xl bg-slate-950/85 backdrop-blur-md text-yellow-300 font-bold text-[10px] shadow-lg border border-yellow-400/40 active:scale-95 transition-all hover:bg-slate-900"
        title="रँकिंग उघडा"
      >
        <Trophy className="w-3 h-3 text-yellow-400" />
        <span>रँकिंग</span>
        {activeRankingCount > 0 && (
          <span className="px-1 rounded-full bg-pink-600 text-[8px] font-bold text-white">
            {activeRankingCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="w-32 sm:w-36 bg-slate-950/90 backdrop-blur-md rounded-2xl border border-yellow-500/40 p-1.5 text-white shadow-2xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[10px]">
        <div className="flex items-center gap-1 font-bold text-yellow-300">
          <Trophy className="w-3 h-3 text-yellow-400" />
          <span className="truncate max-w-[65px]">Ranking</span>
        </div>
        <div className="flex items-center gap-1">
          {activeRankingCount > 0 && (
            <span className="px-1 rounded-full bg-pink-600 text-[8px] font-bold text-white">
              {activeRankingCount}
            </span>
          )}
          <button
            type="button"
            onClick={() => setMinimized(true)}
            className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            title="लपवा"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Ranks list */}
      <div className="pt-1.5 space-y-1.5 text-[11px]">
        {top1 ? (
          <div className="flex items-center justify-between bg-yellow-500/15 rounded-lg px-1.5 py-1 border border-yellow-500/20">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm">🥇</span>
              <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-800 ring-1 ring-yellow-400 shrink-0">
                {top1.photoURL ? (
                  <img src={top1.photoURL} alt={top1.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-[9px] text-yellow-300 bg-slate-800">
                    {top1.displayName.slice(0, 1)}
                  </div>
                )}
              </div>
              <span className="truncate font-semibold text-yellow-200 text-[10px]">
                {top1.displayName}
              </span>
            </div>
            <span className="text-[10px] font-black text-yellow-400 shrink-0">
              ⭐ {top1.charmScore}
            </span>
          </div>
        ) : null}

        {top2 ? (
          <div className="flex items-center justify-between bg-white/5 rounded-lg px-1.5 py-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm">🥈</span>
              <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-800 ring-1 ring-slate-400 shrink-0">
                {top2.photoURL ? (
                  <img src={top2.photoURL} alt={top2.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-[9px] text-slate-300 bg-slate-800">
                    {top2.displayName.slice(0, 1)}
                  </div>
                )}
              </div>
              <span className="truncate font-medium text-slate-300 text-[10px]">
                {top2.displayName}
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 shrink-0">
              ⭐ {top2.charmScore}
            </span>
          </div>
        ) : null}

        {!top1 && !top2 && (
          <div className="py-2 text-center text-[10px] text-slate-400 font-medium">
            अजून रँकिंग सुरू झाले नाही
          </div>
        )}
      </div>
    </div>
  );
};
