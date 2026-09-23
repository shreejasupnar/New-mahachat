import React from 'react';
import { GameItem } from '../types';
import { X, Play, Coins, Clock, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { gameSound } from '../services/gameSoundService';

interface Props {
  game: GameItem | null;
  onClose: () => void;
  onStartMatch: (game: GameItem) => void;
  userCoins: number;
  onRechargeCoins: () => void;
}

export const GameDetailsModal: React.FC<Props> = ({
  game,
  onClose,
  onStartMatch,
  userCoins,
  onRechargeCoins
}) => {
  if (!game) return null;

  const hasEnoughCoins = userCoins >= game.entryFeeCoins;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className={`relative p-6 bg-gradient-to-br ${game.bannerGradient} border-b border-slate-800 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-950/80 border-2 border-white/20 flex items-center justify-center text-3xl shadow-xl">
              {game.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {game.difficulty}
                </span>
                <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> {game.playTimeMinutes} मि.
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">{game.nameMr}</h2>
              <p className="text-xs text-slate-300 font-medium">{game.nameEn}</p>
            </div>
          </div>
          <button
            id="game-details-close-btn"
            onClick={() => {
              gameSound.playTap();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-slate-950/60 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Description */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">खेळाविषयी माहिती</h4>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              {game.descriptionMr}
            </p>
          </div>

          {/* Entry Fee Box */}
          <div className="bg-slate-950/70 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-bold">१ विरुद्ध १ प्रवेश शुल्क</span>
                <span className="text-base font-black text-amber-400">{game.entryFeeCoins} नाणी (Coins)</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-bold">तुमचे बॅलन्स</span>
              <span className={`text-xs font-black ${hasEnoughCoins ? 'text-emerald-400' : 'text-rose-400'}`}>
                {userCoins} नाणी
              </span>
            </div>
          </div>

          {/* How to Play */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">कसे खेळावे? (Rules)</h4>
            <div className="space-y-2">
              {game.howToPlayMr.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex gap-3">
          <button
            id="game-details-cancel-btn"
            onClick={() => {
              gameSound.playTap();
              onClose();
            }}
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            रद्द करा
          </button>

          {hasEnoughCoins ? (
            <button
              id="game-details-start-btn"
              onClick={() => {
                gameSound.playCoin();
                onStartMatch(game);
              }}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>१v१ सामना सुरू करा (३० नाणी)</span>
            </button>
          ) : (
            <button
              id="game-details-recharge-btn"
              onClick={() => {
                gameSound.playTap();
                onRechargeCoins();
              }}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>नाणी कमी आहेत • रिचार्ज करा</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
