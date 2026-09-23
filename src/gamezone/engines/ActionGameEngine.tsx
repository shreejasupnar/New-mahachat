import React, { useState, useEffect, useRef } from 'react';
import { GameMatchSession } from '../types';
import { gameSound } from '../services/gameSoundService';
import { Zap, Target, Wind, Crosshair, Award } from 'lucide-react';

interface EngineProps {
  session: GameMatchSession;
  currentUserId: string;
  onSendMove: (action: string, data: any, nextTurnUid?: string, newGameState?: any, scoreUpdate?: { player1Score?: number; player2Score?: number }) => void;
  onFinishMatch: (winnerUid?: string, isDraw?: boolean, reason?: string) => void;
}

export const ActionGameEngine: React.FC<EngineProps> = ({
  session,
  currentUserId,
  onSendMove,
  onFinishMatch
}) => {
  const isPlayer1 = session.player1.uid === currentUserId;
  const isMyTurn = session.turnUid === currentUserId;
  const opponent = isPlayer1 ? session.player2 : session.player1;

  // ==========================================
  // 1. VITI DANDU DUEL (Signature Maharashtra Game!)
  // ==========================================
  if (session.gameId === 'viti_dandu') {
    const roundNumber = session.gameState?.roundNumber || 1;
    const p1Distances: number[] = session.gameState?.p1Distances || [];
    const p2Distances: number[] = session.gameState?.p2Distances || [];

    const [swingMeter, setSwingMeter] = useState(0);
    const [swinging, setSwinging] = useState(false);
    const [lastHitDistance, setLastHitDistance] = useState<number | null>(null);
    const [vitiInAir, setVitiInAir] = useState(false);

    // Timing meter oscillation
    useEffect(() => {
      let animId: number;
      let val = 0;
      let forward = true;

      const loop = () => {
        if (forward) {
          val += 3.5;
          if (val >= 100) forward = false;
        } else {
          val -= 3.5;
          if (val <= 0) forward = true;
        }
        setSwingMeter(val);
        animId = requestAnimationFrame(loop);
      };

      if (isMyTurn && !vitiInAir) {
        animId = requestAnimationFrame(loop);
      }
      return () => cancelAnimationFrame(animId);
    }, [isMyTurn, vitiInAir]);

    const handleHitViti = () => {
      if (!isMyTurn || vitiInAir) return;

      setVitiInAir(true);
      gameSound.playVitiDanduHit();

      // Precision sweet spot around 50 (40 to 60 is green)
      const diffFromCenter = Math.abs(swingMeter - 50);
      let distanceMeters = 0;

      if (diffFromCenter <= 10) {
        // Bullseye strike! 70 - 100 meters
        distanceMeters = Math.floor(70 + (10 - diffFromCenter) * 3 + Math.random() * 5);
      } else if (diffFromCenter <= 25) {
        // Good strike! 40 - 69 meters
        distanceMeters = Math.floor(40 + Math.random() * 28);
      } else {
        // Mishit! 10 - 35 meters
        distanceMeters = Math.floor(10 + Math.random() * 25);
      }

      setLastHitDistance(distanceMeters);

      setTimeout(() => {
        setVitiInAir(false);

        const newP1 = isPlayer1 ? [...p1Distances, distanceMeters] : p1Distances;
        const newP2 = !isPlayer1 ? [...p2Distances, distanceMeters] : p2Distances;

        const totalP1 = newP1.reduce((a, b) => a + b, 0);
        const totalP2 = newP2.reduce((a, b) => a + b, 0);

        // Check if 3 rounds completed
        if (newP1.length >= 3 && newP2.length >= 3) {
          gameSound.playVictory();
          const winnerUid =
            totalP1 > totalP2
              ? session.player1.uid
              : totalP2 > totalP1
              ? session.player2?.uid
              : undefined;
          const isDraw = totalP1 === totalP2;
          onFinishMatch(
            winnerUid,
            isDraw,
            `विटी दांडू ३ फेऱ्या पूर्ण! अंतर: ${totalP1}m विरुद्ध ${totalP2}m`
          );
        } else {
          onSendMove(
            'HIT_VITI',
            { distance: distanceMeters, round: roundNumber },
            opponent?.uid,
            {
              roundNumber: Math.max(newP1.length, newP2.length) + 1,
              p1Distances: newP1,
              p2Distances: newP2
            },
            { player1Score: totalP1, player2Score: totalP2 }
          );
        }
      }, 1500);
    };

    const totalP1 = p1Distances.reduce((a, b) => a + b, 0);
    const totalP2 = p2Distances.reduce((a, b) => a + b, 0);

    return (
      <div className="flex flex-col items-center justify-center p-3 w-full max-w-sm mx-auto">
        {/* Distance Scoreboard */}
        <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-2xl mb-4 shadow-lg">
          <div className="text-left">
            <span className="text-[11px] text-amber-400 font-bold block">{session.player1.displayName.slice(0, 10)}</span>
            <span className="text-lg font-black text-white">{totalP1} <span className="text-xs text-slate-400 font-medium">मीटर</span></span>
          </div>
          <div className="text-center px-2 py-1 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <span className="text-[10px] text-amber-300 font-extrabold uppercase">फेरी {Math.min(3, roundNumber)} / ३</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-emerald-400 font-bold block">{session.player2?.displayName.slice(0, 10) || 'P2'}</span>
            <span className="text-lg font-black text-white">{totalP2} <span className="text-xs text-slate-400 font-medium">मीटर</span></span>
          </div>
        </div>

        {/* Traditional Rural Play Area Canvas */}
        <div className="relative w-72 h-56 bg-gradient-to-b from-amber-200 via-amber-100 to-amber-300 rounded-3xl border-4 border-amber-800 shadow-2xl overflow-hidden flex flex-col justify-between p-3">
          {/* Rural Sky & Trees Silhouettes */}
          <div className="w-full flex justify-between items-start opacity-70">
            <span className="text-2xl">🌳</span>
            <span className="text-base font-black text-amber-900/60">महाराष्ट्राचे मैदान</span>
            <span className="text-2xl">🌴</span>
          </div>

          {/* Viti on ground or flying */}
          <div className="flex-1 flex items-center justify-center relative">
            <div
              className={`w-12 h-4 bg-amber-900 rounded-full border-2 border-amber-950 shadow-lg transition-all duration-700 flex items-center justify-center ${
                vitiInAir ? '-translate-y-20 scale-125 rotate-45 animate-bounce' : ''
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-amber-600" />
            </div>

            {/* Dandu Bat */}
            <div className="absolute right-12 bottom-2 w-20 h-3 bg-amber-950 rounded-sm transform rotate-[-25deg] shadow-md border border-amber-800" />
          </div>

          {/* Hit result toast */}
          {lastHitDistance !== null && (
            <div className="w-full text-center py-1 bg-amber-900/90 text-amber-200 text-xs font-black rounded-lg animate-in zoom-in-90 duration-150">
              🚀 फटका! {lastHitDistance} मीटर लांब!
            </div>
          )}
        </div>

        {/* Swing Precision Meter */}
        <div className="w-72 mt-4 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl shadow-xl text-center">
          <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1.5">
            <span>कमी ताकद</span>
            <span className="text-emerald-400 font-extrabold">🎯 स्वीट स्पॉट</span>
            <span>कमी ताकद</span>
          </div>

          {/* Meter Bar */}
          <div className="relative w-full h-5 bg-slate-800 rounded-full overflow-hidden mb-3 border border-slate-700">
            {/* Center green sweet zone */}
            <div className="absolute top-0 left-[40%] w-[20%] h-full bg-emerald-500/50" />
            {/* Moving Indicator */}
            <div
              style={{ left: `${swingMeter}%` }}
              className="absolute top-0 w-2.5 h-full bg-white shadow-[0_0_10px_white] -translate-x-1/2 rounded"
            />
          </div>

          <button
            id="viti-dandu-hit-btn"
            onClick={handleHitViti}
            disabled={!isMyTurn || vitiInAir}
            className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${
              isMyTurn && !vitiInAir
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer active:scale-95 animate-pulse'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isMyTurn ? '🏏 दांडूने फटका मारा! (Strike)' : 'प्रतिस्पर्ध्याची फेरी...'}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. ARCHERY DUEL 1V1
  // ==========================================
  if (session.gameId === 'archery_duel') {
    const p1Score = session.player1.score || 0;
    const p2Score = session.player2?.score || 0;
    const [wind, setWind] = useState(Math.floor(Math.random() * 5) - 2);
    const [reticle, setReticle] = useState({ x: 50, y: 50 });

    const handleShoot = () => {
      if (!isMyTurn) return;
      gameSound.playMove();

      // Land score based on crosshair distance from center (50, 50) + wind
      const landingX = reticle.x + wind * 3;
      const landingY = reticle.y;
      const distFromCenter = Math.hypot(landingX - 50, landingY - 50);

      let pts = 0;
      if (distFromCenter <= 10) pts = 10; // Bullseye
      else if (distFromCenter <= 25) pts = 8;
      else if (distFromCenter <= 40) pts = 6;
      else pts = 4;

      const updatedP1 = isPlayer1 ? p1Score + pts : p1Score;
      const updatedP2 = !isPlayer1 ? p2Score + pts : p2Score;

      if (updatedP1 >= 50) {
        gameSound.playWin();
        onFinishMatch(session.player1.uid, false, 'धनुर्विद्या ५० गुण पूर्ण!');
      } else if (updatedP2 >= 50) {
        gameSound.playWin();
        onFinishMatch(session.player2?.uid, false, 'धनुर्विद्या ५० गुण पूर्ण!');
      } else {
        onSendMove(
          'SHOOT_ARROW',
          { points: pts, wind },
          opponent?.uid,
          {},
          { player1Score: updatedP1, player2Score: updatedP2 }
        );
        setWind(Math.floor(Math.random() * 5) - 2);
      }
    };

    return (
      <div className="flex flex-col items-center justify-center p-3">
        {/* Archery Target Board */}
        <div className="relative w-64 h-64 rounded-full border-4 border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden">
          {/* Outer White 4 */}
          <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center border border-slate-300">
            {/* Black 6 */}
            <div className="w-48 h-48 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700">
              {/* Blue 8 */}
              <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center border border-blue-400">
                {/* Red 10 (Bullseye) */}
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center border-2 border-yellow-400 shadow-lg">
                  <span className="text-[10px] font-black text-white">१०</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aim Crosshair */}
          <div
            style={{ top: `${reticle.y}%`, left: `${reticle.x}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none"
          >
            <Crosshair className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        {/* Wind Indicator */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mt-4 mb-2">
          <Wind className="w-4 h-4 text-cyan-400" />
          <span>वारा (Wind): {wind > 0 ? `+${wind} उजवीकडे` : wind < 0 ? `${wind} डावीकडे` : 'स्थिर'}</span>
        </div>

        <button
          id="shoot-arrow-btn"
          onClick={handleShoot}
          disabled={!isMyTurn}
          className={`w-64 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
            isMyTurn
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg cursor-pointer active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isMyTurn ? '🏹 बाण सोडा! (Shoot)' : 'प्रतिस्पर्ध्याची पाळी...'}
        </button>
      </div>
    );
  }

  // Fallback for Snake / Car Race / Bow Arrow / Block Puzzle
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">⚡</div>
      <h3 className="text-base font-black text-white mb-2">{session.gameId}</h3>
      <p className="text-xs text-slate-400 mb-6">दोन्ही खेळाडू ॲक्शन गेम खेळत आहेत...</p>
      <button
        onClick={() => onFinishMatch(session.player1.uid, false, 'सामना पूर्ण झाला!')}
        className="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs"
      >
        सामना पूर्ण करा
      </button>
    </div>
  );
};
