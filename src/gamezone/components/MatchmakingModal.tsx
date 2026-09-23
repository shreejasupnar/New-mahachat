import React, { useState, useEffect } from 'react';
import { GameItem, GameMatchSession, PlayerMatchInfo } from '../types';
import { gameSound } from '../services/gameSoundService';
import { Loader2, ShieldCheck, X, Swords, MapPin, Award } from 'lucide-react';

interface Props {
  game: GameItem;
  session: GameMatchSession | null;
  onCancelMatchmaking: () => void;
  onStartPlaying: () => void;
  currentUser: any;
}

export const MatchmakingModal: React.FC<Props> = ({
  game,
  session,
  onCancelMatchmaking,
  onStartPlaying,
  currentUser
}) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [searchSeconds, setSearchSeconds] = useState(0);

  // Search timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSearchSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle Match Countdown when opponent is found and status is ready
  useEffect(() => {
    if (session && (session.status === 'opponent_found' || session.status === 'ready')) {
      // Start 3 second countdown
      setCountdown(3);
      gameSound.playCountdown(false);

      const t1 = setTimeout(() => {
        setCountdown(2);
        gameSound.playCountdown(false);
      }, 1000);

      const t2 = setTimeout(() => {
        setCountdown(1);
        gameSound.playCountdown(false);
      }, 2000);

      const t3 = setTimeout(() => {
        setCountdown(0);
        gameSound.playCountdown(true);
        onStartPlaying();
      }, 3000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [session?.status]);

  const opponent: PlayerMatchInfo | undefined =
    session?.player1.uid === currentUser?.uid ? session?.player2 : session?.player1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* Game Title & Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 mb-8">
          <span>{game.icon}</span>
          <span>{game.nameMr}</span>
          <span className="text-amber-400 font-black">• ३० नाणी</span>
        </div>

        {/* Dynamic State Display */}
        {countdown !== null ? (
          /* 3... 2... 1... COUNTDOWN & VS SCREEN */
          <div className="w-full animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-black uppercase tracking-widest text-amber-400 mb-6">
              प्रतिस्पर्धी सापडला! सामना सुरू होत आहे...
            </h3>

            {/* VS Card */}
            <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-5 rounded-3xl mb-8 shadow-2xl">
              {/* Player 1 (You) */}
              <div className="flex flex-col items-center gap-2 w-28">
                <div className="w-16 h-16 rounded-full border-2 border-emerald-500 p-0.5 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  <img
                    src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt="You"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <span className="text-xs font-black text-white truncate max-w-full">
                  {currentUser?.displayName || 'खेळाडू'}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">तयार ✅</span>
              </div>

              {/* VS Logo & Countdown */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-xl animate-pulse">
                  {countdown > 0 ? countdown : 'GO!'}
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase mt-2 tracking-widest">
                  1 VS 1
                </span>
              </div>

              {/* Opponent */}
              <div className="flex flex-col items-center gap-2 w-28">
                <div className="w-16 h-16 rounded-full border-2 border-rose-500 p-0.5 shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                  <img
                    src={opponent?.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                    alt="Opponent"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <span className="text-xs font-black text-white truncate max-w-full">
                  {opponent?.displayName || 'प्रतिस्पर्धी'}
                </span>
                <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" /> {opponent?.district || 'महाराष्ट्र'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* SEARCHING RADAR SCREEN */
          <div className="flex flex-col items-center">
            {/* Pulsing Radar Circle */}
            <div className="relative w-44 h-44 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" />
              <div className="absolute inset-4 rounded-full border border-indigo-500/30 animate-pulse" />
              <div className="w-28 h-28 rounded-full bg-indigo-950/60 border-2 border-indigo-500/50 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-1" />
                <span className="text-[10px] font-black text-indigo-300">{searchSeconds} सेकंद</span>
              </div>
            </div>

            <h3 className="text-base font-black text-white mb-1">
              प्रतिस्पर्धी खेळाडू शोधत आहे...
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mb-8">
              सर्व्हरवर उपलब्ध असलेल्या १v१ खेळाडूला शोधत आहे. सामना तयार झाल्यावर आपोआप सुरू होईल.
            </p>

            {/* Cancel Matchmaking Button (Guaranteed 30 coins refund) */}
            <button
              id="matchmaking-cancel-btn"
              onClick={() => {
                gameSound.playTap();
                onCancelMatchmaking();
              }}
              className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-rose-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2 active:scale-95 transition-all cursor-pointer shadow-lg"
            >
              <X className="w-4 h-4" />
              <span>शोधणे रद्द करा (३० नाणी परत मिळतील)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
