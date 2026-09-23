import React, { useState, useEffect } from 'react';
import { Trophy, Award, Sparkles, X, RotateCcw, Flame } from 'lucide-react';
import { PKBattle } from '../services/pkService';

interface WinnerCelebrationProps {
  battle: PKBattle;
  winnerUid: string | 'draw';
  onClose: () => void;
}

const FUN_PUNISHMENTS = [
  'उपविजेत्याने ५ उठक-बैठक कराव्यात (5 Squats)',
  'उपविजेत्याने एक मजेशीर गाणे म्हणावे (Sing a funny song)',
  'उपविजेत्याने एक मराठी शायरी ऐकवावी (Recite a Marathi Shayari)',
  'विजेत्याच्या कौतुकात २ वाक्ये बोलावीत (Praise the Winner)',
];

export const WinnerCelebration: React.FC<WinnerCelebrationProps> = ({
  battle,
  winnerUid,
  onClose,
}) => {
  const [punishment] = useState(() => 
    FUN_PUNISHMENTS[Math.floor(Math.random() * FUN_PUNISHMENTS.length)]
  );
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isHostAWinner = winnerUid === battle.hostAUid;
  const isHostBWinner = winnerUid === battle.hostBUid;
  const isDraw = winnerUid === 'draw';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 text-center shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Trophy Top Animation */}
        <div className="relative mb-3 inline-block">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/40">
            <Trophy className="w-9 h-9 text-slate-950" />
          </div>
          <Sparkles className="w-6 h-6 text-amber-300 absolute -top-2 -right-2 animate-bounce" />
        </div>

        <h2 className="text-xl font-black text-white tracking-wide mb-1">
          {isDraw ? 'मुकाबला बरोबरीत सुटला!' : 'PK महामुकाबला संपन्न!'}
        </h2>
        <p className="text-xs text-amber-300 font-semibold mb-4">
          {isDraw ? 'दोन्ही यजमानांनी चुरशीची लढत दिली' : 'विजयी यजमानाचे हार्दिक अभिनंदन!'}
        </p>

        {/* Competitors Result Cards */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {/* Host A */}
          <div className={`p-3 rounded-2xl border ${
            isHostAWinner 
              ? 'bg-amber-500/10 border-amber-400 text-amber-300 ring-2 ring-amber-400/30' 
              : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}>
            <div className="relative inline-block mb-1.5">
              <img
                src={battle.hostAPhotoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${battle.hostAName}`}
                alt={battle.hostAName}
                className="w-12 h-12 rounded-full object-cover border-2 border-current mx-auto"
              />
              {isHostAWinner && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-black">
                  ★ १
                </span>
              )}
            </div>
            <div className="font-extrabold text-xs text-white truncate max-w-[110px] mx-auto">
              {battle.hostAName}
            </div>
            <div className="text-[11px] font-mono font-black mt-1">
              {battle.hostAScore} गुण
            </div>
            <span className="text-[10px] font-bold block mt-0.5">
              {isHostAWinner ? '🏆 विजेता' : isDraw ? 'बरोबर' : 'उपविजेता'}
            </span>
          </div>

          {/* Host B */}
          <div className={`p-3 rounded-2xl border ${
            isHostBWinner 
              ? 'bg-amber-500/10 border-amber-400 text-amber-300 ring-2 ring-amber-400/30' 
              : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}>
            <div className="relative inline-block mb-1.5">
              <img
                src={battle.hostBPhotoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${battle.hostBName}`}
                alt={battle.hostBName}
                className="w-12 h-12 rounded-full object-cover border-current mx-auto"
              />
              {isHostBWinner && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-black">
                  ★ १
                </span>
              )}
            </div>
            <div className="font-extrabold text-xs text-white truncate max-w-[110px] mx-auto">
              {battle.hostBName}
            </div>
            <div className="text-[11px] font-mono font-black mt-1">
              {battle.hostBScore} गुण
            </div>
            <span className="text-[10px] font-bold block mt-0.5">
              {isHostBWinner ? '🏆 विजेता' : isDraw ? 'बरोबर' : 'उपविजेता'}
            </span>
          </div>
        </div>

        {/* Fun Punishment Task */}
        {!isDraw && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-2.5 mb-4 text-left">
            <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider block mb-0.5">
              🎭 मजेशीर टास्क (Fun Punishment):
            </span>
            <p className="text-xs font-semibold text-rose-200">
              {punishment}
            </p>
          </div>
        )}

        {/* Bottom Cooldown and Close */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-400">
            थंड कालखंड: {cooldown}s
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            पूर्ण झाले (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
