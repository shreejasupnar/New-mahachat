import React, { useState } from 'react';
import { X, Target, CheckCircle2, Gift, Coins, Sparkles } from 'lucide-react';
import { DailyMission } from '../types';
import { gameSound } from '../services/gameSoundService';

interface Props {
  onClose: () => void;
  onClaimReward: (missionId: string, coins: number, xp: number) => void;
}

export const DailyMissionsModal: React.FC<Props> = ({ onClose, onClaimReward }) => {
  const [missions, setMissions] = useState<DailyMission[]>([
    {
      id: 'm1',
      titleMr: '१ विरुद्ध १ कोणताही सामना खेळा',
      titleEn: 'Play any 1v1 match',
      target: 1,
      current: 1,
      rewardCoins: 10,
      rewardXp: 30,
      completed: true,
      claimed: false
    },
    {
      id: 'm2',
      titleMr: 'कोणतेही २ सामने जिंका',
      titleEn: 'Win any 2 matches',
      target: 2,
      current: 1,
      rewardCoins: 25,
      rewardXp: 60,
      completed: false,
      claimed: false
    },
    {
      id: 'm3',
      titleMr: 'पारंपरिक विटी दांडू किंवा ल्युडो खेळा',
      titleEn: 'Play Viti Dandu or Ludo',
      target: 1,
      current: 1,
      rewardCoins: 15,
      rewardXp: 40,
      completed: true,
      claimed: false
    }
  ]);

  const handleClaim = (m: DailyMission) => {
    gameSound.playCoin();
    setMissions((prev) =>
      prev.map((item) => (item.id === m.id ? { ...item, claimed: true } : item))
    );
    onClaimReward(m.id, m.rewardCoins, m.rewardXp);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-600/30 via-indigo-600/20 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">दैनिक मिशन्स (Daily Missions)</h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">दररोज नवीन रिवॉर्ड्स मिळवा</p>
            </div>
          </div>
          <button
            id="missions-close-btn"
            onClick={() => {
              gameSound.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Missions List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {missions.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between shadow-inner"
            >
              <div className="space-y-1">
                <h4 className="text-xs font-black text-white">{m.titleMr}</h4>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="text-amber-400 flex items-center gap-1">
                    <Coins className="w-3 h-3" /> +{m.rewardCoins} नाणी
                  </span>
                  <span className="text-indigo-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> +{m.rewardXp} XP
                  </span>
                </div>
                <div className="w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                  <div
                    style={{ width: `${Math.min(100, (m.current / m.target) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  />
                </div>
              </div>

              <div>
                {m.claimed ? (
                  <span className="text-xs font-bold text-slate-500">स्वीकारले ✅</span>
                ) : m.completed ? (
                  <button
                    onClick={() => handleClaim(m)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg active:scale-95 cursor-pointer"
                  >
                    रिवॉर्ड घ्या
                  </button>
                ) : (
                  <span className="text-xs font-bold text-slate-400">
                    {m.current} / {m.target}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
