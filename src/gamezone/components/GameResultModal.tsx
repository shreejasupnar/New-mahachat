import React, { useEffect } from 'react';
import { GameItem, GameMatchSession } from '../types';
import { Trophy, Award, RotateCcw, Home, Sparkles } from 'lucide-react';
import { gameSound } from '../services/gameSoundService';

interface Props {
  game: GameItem;
  session: GameMatchSession;
  currentUserId: string;
  onRematch: () => void;
  onReturnHome: () => void;
}

export const GameResultModal: React.FC<Props> = ({
  game,
  session,
  currentUserId,
  onRematch,
  onReturnHome
}) => {
  const isWinner = session.winnerUid === currentUserId;
  const isDraw = Boolean(session.isDraw);
  const isPlayer1 = session.player1.uid === currentUserId;
  const opponent = isPlayer1 ? session.player2 : session.player1;

  useEffect(() => {
    if (isWinner) {
      gameSound.playVictory();
    } else if (!isDraw) {
      gameSound.playDefeat();
    }
  }, [isWinner, isDraw]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl ${
          isWinner ? 'bg-amber-500/30' : isDraw ? 'bg-blue-500/30' : 'bg-rose-500/20'
        }`} />

        {/* Icon & Title */}
        <div className="relative mb-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-950 border-2 border-slate-800 flex items-center justify-center text-4xl shadow-xl mb-3">
            {isWinner ? '🏆' : isDraw ? '🤝' : '🎖️'}
          </div>
          <h2 className={`text-2xl font-black ${
            isWinner ? 'text-amber-400' : isDraw ? 'text-blue-400' : 'text-slate-200'
          }`}>
            {isWinner ? 'भव्य विजय! (VICTORY)' : isDraw ? 'सामना बरोबरीत! (DRAW)' : 'छान खेळलात! (GOOD GAME)'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {session.reason || `${game.nameMr} १v१ सामना संपला`}
          </p>
        </div>

        {/* Scores & Reward Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-6 space-y-3">
          <div className="flex justify-around items-center">
            <div className="text-center">
              <span className="text-[11px] text-slate-400 font-bold block">{session.player1.displayName.slice(0, 10)}</span>
              <span className="text-xl font-black text-white">{session.player1.score || 0} pts</span>
            </div>
            <span className="text-xs font-black text-slate-600">VS</span>
            <div className="text-center">
              <span className="text-[11px] text-slate-400 font-bold block">{session.player2?.displayName.slice(0, 10) || 'P2'}</span>
              <span className="text-xl font-black text-white">{session.player2?.score || 0} pts</span>
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          {/* XP & Rewards */}
          <div className="flex justify-around text-xs font-bold">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{isWinner ? 50 : 15} गेमिंग XP</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-400">
              <Award className="w-3.5 h-3.5" />
              <span>{isWinner ? '+25' : '-10'} रेटिंग</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            id="result-rematch-btn"
            onClick={() => {
              gameSound.playTap();
              onRematch();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>पुन्हा खेळा (Rematch - ३० नाणी)</span>
          </button>

          <button
            id="result-home-btn"
            onClick={() => {
              gameSound.playTap();
              onReturnHome();
            }}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>गेम झोन मुख्यपृष्ठ (Game Zone Home)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
