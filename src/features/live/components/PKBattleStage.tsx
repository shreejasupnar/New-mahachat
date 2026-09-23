import React, { useState, useEffect } from 'react';
import { Swords, Flame, Sparkles, Trophy, Zap, Shield, Heart } from 'lucide-react';
import { PKBattle, addPKScore, endPKBattle } from '../services/pkService';
import { VideoTile } from './VideoTile';

interface PKBattleStageProps {
  battle: PKBattle;
  localStream: MediaStream | null;
  currentUserId?: string;
  isHostA: boolean;
  isHostB: boolean;
  onPKEnd?: (winnerUid: string | 'draw') => void;
}

export const PKBattleStage: React.FC<PKBattleStageProps> = ({
  battle,
  localStream,
  currentUserId,
  isHostA,
  isHostB,
  onPKEnd,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(300);
  const [isBoosting, setIsBoosting] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (battle.status !== 'active') return;

    const interval = setInterval(() => {
      let secondsLeft = 0;
      if (battle.endsAt) {
        const endTime = typeof battle.endsAt.toMillis === 'function'
          ? battle.endsAt.toMillis()
          : (battle.endsAt?.seconds ? battle.endsAt.seconds * 1000 : Date.now() + 300000);
        secondsLeft = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      } else {
        secondsLeft = 300;
      }

      setRemainingSeconds(secondsLeft);

      // Conclude PK when timer expires (only one host triggers to avoid duplicate writes)
      if (secondsLeft <= 0) {
        clearInterval(interval);
        if (isHostA) {
          let winner: string | 'draw' = 'draw';
          if (battle.hostAScore > battle.hostBScore) {
            winner = battle.hostAUid;
          } else if (battle.hostBScore > battle.hostAScore) {
            winner = battle.hostBUid;
          }
          endPKBattle(battle.id, winner);
          onPKEnd?.(winner);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [battle.status, battle.endsAt, battle.hostAScore, battle.hostBScore, isHostA, onPKEnd]);

  // Calculate percentages for tug-of-war score bar
  const totalScore = battle.hostAScore + battle.hostBScore;
  let scorePercentA = 50;
  let scorePercentB = 50;

  if (totalScore > 0) {
    scorePercentA = Math.round((battle.hostAScore / totalScore) * 100);
    // Keep clamp between 10% and 90% so neither bar vanishes completely
    scorePercentA = Math.max(10, Math.min(90, scorePercentA));
    scorePercentB = 100 - scorePercentA;
  }

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCheer = async (side: 'A' | 'B') => {
    setIsBoosting(true);
    await addPKScore(battle.id, side, 10);
    setTimeout(() => setIsBoosting(false), 300);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden select-none">
      {/* Top PK Battle Progress & Timer Bar */}
      <div className="relative z-20 px-3 pt-1 pb-2 bg-gradient-to-b from-black/90 via-black/60 to-transparent">
        {/* Timer & Central VS Badge */}
        <div className="flex items-center justify-between max-w-md mx-auto mb-1.5 px-2">
          {/* Host A Info */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-7 h-7 rounded-full border-2 border-rose-500 overflow-hidden bg-rose-950">
              {battle.hostAPhotoURL ? (
                <img src={battle.hostAPhotoURL} alt={battle.hostAName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white">
                  {battle.hostAName.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-rose-400 truncate max-w-[80px]">
                {battle.hostAName}
              </span>
              <span className="text-[10px] font-extrabold text-white">
                {battle.hostAScore} pts
              </span>
            </div>
          </div>

          {/* Central Animated VS & Timer */}
          <div className="flex flex-col items-center">
            <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-600 via-amber-500 to-indigo-600 text-white font-black text-[11px] tracking-wider shadow-lg flex items-center gap-1 animate-pulse">
              <Swords className="w-3.5 h-3.5" />
              <span>PK BATTLE</span>
            </div>
            <div className="text-xs font-mono font-black text-amber-300 drop-shadow mt-0.5">
              {formatTimer(remainingSeconds)}
            </div>
          </div>

          {/* Host B Info */}
          <div className="flex items-center gap-1.5 min-w-0 justify-end">
            <div className="flex flex-col text-right">
              <span className="text-[11px] font-black text-sky-400 truncate max-w-[80px]">
                {battle.hostBName}
              </span>
              <span className="text-[10px] font-extrabold text-white">
                {battle.hostBScore} pts
              </span>
            </div>
            <div className="w-7 h-7 rounded-full border-2 border-sky-500 overflow-hidden bg-sky-950">
              {battle.hostBPhotoURL ? (
                <img src={battle.hostBPhotoURL} alt={battle.hostBName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white">
                  {battle.hostBName.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tug-of-War Score Bar */}
        <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden flex shadow-inner border border-white/10">
          {/* Team A (Red) */}
          <div
            className="h-full bg-gradient-to-r from-rose-600 to-pink-500 transition-all duration-500 flex items-center justify-start pl-2"
            style={{ width: `${scorePercentA}%` }}
          >
            <span className="text-[9px] font-extrabold text-white drop-shadow">
              {scorePercentA}%
            </span>
          </div>

          {/* Center Dividing Flame */}
          <div className="w-1 h-full bg-white z-10 shadow-md" />

          {/* Team B (Blue) */}
          <div
            className="h-full bg-gradient-to-l from-indigo-600 to-sky-500 transition-all duration-500 flex items-center justify-end pr-2"
            style={{ width: `${scorePercentB}%` }}
          >
            <span className="text-[9px] font-extrabold text-white drop-shadow">
              {scorePercentB}%
            </span>
          </div>
        </div>
      </div>

      {/* Dual Video Stage Grid */}
      <div className="relative flex-1 grid grid-cols-2 gap-1 p-1">
        {/* Host A Box */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-rose-600/60 shadow-lg shadow-rose-950/30">
          <VideoTile
            stream={isHostA ? localStream : null}
            participantName={battle.hostAName}
            photoURL={battle.hostAPhotoURL}
            isHost={true}
            isLocal={isHostA}
            badgeText={`🔴 ${battle.hostADistrict || 'महाराष्ट्र'}`}
            fit="cover"
          />

          {/* Cheer Button for Host A */}
          <button
            onClick={() => handleCheer('A')}
            id="btn-pk-cheer-a"
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-[11px] shadow-lg shadow-rose-600/50 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>सपोर्ट (+10)</span>
          </button>
        </div>

        {/* Host B Box */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-sky-500/60 shadow-lg shadow-sky-950/30">
          <VideoTile
            stream={isHostB ? localStream : null}
            participantName={battle.hostBName}
            photoURL={battle.hostBPhotoURL}
            isHost={true}
            isLocal={isHostB}
            badgeText={`🔵 ${battle.hostBDistrict || 'महाराष्ट्र'}`}
            fit="cover"
          />

          {/* Cheer Button for Host B */}
          <button
            onClick={() => handleCheer('B')}
            id="btn-pk-cheer-b"
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-extrabold text-[11px] shadow-lg shadow-sky-600/50 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>सपोर्ट (+10)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
