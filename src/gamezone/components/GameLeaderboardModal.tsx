import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Award, Flame, Crown } from 'lucide-react';
import { GameUserStats } from '../types';
import { fetchGameLeaderboard } from '../services/gameZoneBackendService';
import { gameSound } from '../services/gameSoundService';

interface Props {
  onClose: () => void;
  currentUserStats: GameUserStats | null;
}

export const GameLeaderboardModal: React.FC<Props> = ({
  onClose,
  currentUserStats
}) => {
  const [activeTab, setActiveTab] = useState<'global' | 'weekly'>('global');
  const [leaderboard, setLeaderboard] = useState<GameUserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGameLeaderboard().then((data) => {
      setLeaderboard(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-600/30 via-orange-600/20 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">गेम झोन लीडरबोर्ड</h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Top 1v1 Champions</p>
            </div>
          </div>
          <button
            id="leaderboard-close-btn"
            onClick={() => {
              gameSound.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-5 pt-2">
          <button
            onClick={() => setActiveTab('global')}
            className={`pb-3 px-4 text-xs font-black transition-colors relative ${
              activeTab === 'global' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            ग्लोबल रँक (Global)
            {activeTab === 'global' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />}
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`pb-3 px-4 text-xs font-black transition-colors relative ${
              activeTab === 'weekly' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            साप्ताहिक (Weekly)
            {activeTab === 'weekly' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />}
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400">लीडरबोर्ड लोड होत आहे...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-400 text-xs space-y-2">
              <div className="text-3xl">🏆</div>
              <p className="font-bold text-slate-300">अद्याप लीडरबोर्ड सुरू झाला नाही.</p>
              <p className="text-slate-500">पहिला सामना खेळा आणि महाराष्ट्र गेम झोनच्या नंबर १ रँकवर या!</p>
            </div>
          ) : (
            leaderboard.map((player, idx) => {
              const rank = idx + 1;
              return (
                <div
                  key={player.userId}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    rank === 1
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : rank === 2
                      ? 'bg-slate-800/80 border-slate-700'
                      : rank === 3
                      ? 'bg-amber-900/20 border-amber-800/40'
                      : 'bg-slate-950/60 border-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 text-center font-black text-sm">
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block">
                        खेळाडू ID: {player.userId.slice(0, 10)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {player.wins} विजय • {player.gamesPlayed} सामने
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-amber-400 block">{player.xp} XP</span>
                    <span className="text-[10px] text-slate-400 font-medium">{player.rating} Rating</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
