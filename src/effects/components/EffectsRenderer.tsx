import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Crown, Sparkles, Heart, Award, X, Flame } from 'lucide-react';
import { QueuedGiftEffect } from '../types';
import { effectQueue } from '../queue/EffectQueue';
import { effectsSettings } from '../settings/EffectsSettingsManager';

interface EffectsRendererProps {
  currentUserId?: string;
  onSendThankYou?: (senderId: string, senderName: string) => void;
}

export const EffectsRenderer: React.FC<EffectsRendererProps> = ({
  currentUserId,
  onSendThankYou
}) => {
  const [activeEffect, setActiveEffect] = useState<QueuedGiftEffect | null>(null);
  const [queueLength, setQueueLength] = useState<number>(0);
  const [thanked, setThanked] = useState(false);

  useEffect(() => {
    const unsub = effectQueue.subscribe((effect, qLen) => {
      setActiveEffect(effect);
      setQueueLength(qLen);
      setThanked(false);

      // Trigger confetti on legendary items if full animations enabled
      if (effect && effect.effect.tier === 3) {
        const settings = effectsSettings.getSettings();
        if (settings.giftAnimationLevel === 'full') {
          try {
            confetti({
              particleCount: 60,
              spread: 90,
              origin: { y: 0.5 },
              colors: ['#ffd700', '#f59e0b', '#ea580c', '#ec4899']
            });
          } catch {}
        }
      }
    });

    return unsub;
  }, []);

  if (!activeEffect) return null;

  const isRecipient = Boolean(
    currentUserId &&
    (activeEffect.recipientId === currentUserId || activeEffect.recipientId === 'room_broadcast')
  );

  const isTier1 = activeEffect.effect.tier === 1;
  const isTier2 = activeEffect.effect.tier === 2;
  const isTier3 = activeEffect.effect.tier === 3;

  const handleDismiss = () => {
    effectQueue.finishCurrent();
  };

  const handleThankYou = () => {
    setThanked(true);
    if (onSendThankYou && activeEffect.senderId) {
      onSendThankYou(activeEffect.senderId, activeEffect.senderName);
    }
    setTimeout(() => {
      handleDismiss();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden select-none flex items-center justify-center">
      <AnimatePresence mode="wait">
        {/* ============================================================ */}
        {/* TIER 1: SIMPLE GIFTS (Avatar/Seat floating burst, non-blocking) */}
        {/* ============================================================ */}
        {isTier1 && (
          <motion.div
            key={activeEffect.id}
            initial={{ scale: 0.2, opacity: 0, y: 30 }}
            animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 1], y: 0 }}
            exit={{ scale: 1.4, opacity: 0, y: -40 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute top-1/3 z-50 flex flex-col items-center pointer-events-none"
          >
            <div className="relative">
              {/* Radial glow */}
              <div 
                className="absolute inset-0 rounded-full blur-xl scale-150 animate-ping opacity-60"
                style={{ backgroundColor: activeEffect.effect.accentColor || '#f43f5e' }}
              />
              <div className="text-6xl sm:text-7xl drop-shadow-[0_0_20px_rgba(244,63,94,0.9)] animate-bounce">
                {activeEffect.effect.previewIcon}
              </div>
            </div>
            <div className="mt-2 px-3 py-1 rounded-full bg-black/75 border border-white/20 backdrop-blur-xs text-xs font-bold text-white shadow-md flex items-center gap-1.5">
              <span>{activeEffect.senderName}</span>
              <span className="text-pink-400">➔</span>
              <span>{activeEffect.recipientName}</span>
              {activeEffect.comboCount > 1 && (
                <span className="text-amber-300 font-black">x{activeEffect.comboCount}</span>
              )}
            </div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* TIER 2: PREMIUM GIFTS (Top Animated VIP Banner)             */}
        {/* ============================================================ */}
        {isTier2 && (
          <motion.div
            key={activeEffect.id}
            initial={{ y: -80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -70, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="absolute top-16 left-3 right-3 sm:left-auto sm:right-auto sm:w-[420px] mx-auto z-50 pointer-events-auto"
          >
            <div className="relative flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-slate-950/95 via-purple-950/90 to-amber-950/95 border-2 border-amber-400/70 shadow-[0_10px_35px_rgba(245,158,11,0.4)] backdrop-blur-xl">
              {/* Sender Avatar */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-10 h-10 rounded-full ring-2 ring-amber-400 overflow-hidden bg-slate-800 shrink-0 shadow-md">
                  {activeEffect.senderPhoto ? (
                    <img src={activeEffect.senderPhoto} alt={activeEffect.senderName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs bg-amber-600">
                      {activeEffect.senderName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-[11px] font-bold text-amber-200 truncate">
                    {activeEffect.senderName}
                  </div>
                  <div className="text-[10px] text-pink-300 truncate">
                    भेट: <span className="text-white font-semibold">{activeEffect.effect.nameMr}</span>
                  </div>
                </div>
              </div>

              {/* Bouncing Gift Icon */}
              <div className="text-4xl animate-bounce drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] select-none mx-2">
                {activeEffect.effect.previewIcon}
              </div>

              {/* Combo & Recipient */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">स्वीकारणारे</div>
                  <div className="text-xs font-bold text-amber-300 truncate max-w-[85px]">
                    {activeEffect.recipientName}
                  </div>
                </div>
                {/* Fire Combo Pill */}
                <div className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black text-sm shadow-md flex items-center gap-0.5">
                  <Flame className="w-3.5 h-3.5 fill-white" />
                  <span>x{activeEffect.comboCount}</span>
                </div>
              </div>

              {/* Queue indicator if more items waiting */}
              {queueLength > 0 && (
                <div className="absolute -bottom-2 right-4 px-2 py-0.5 rounded-full bg-pink-600 text-[9px] font-bold text-white shadow-xs">
                  +{queueLength} पुढील भेट
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* TIER 3: LEGENDARY CINEMATIC FULLSCREEN EFFECT                */}
        {/* ============================================================ */}
        {isTier3 && (
          <div
            key={activeEffect.id}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md pointer-events-auto"
          >
            {/* Ambient Sunburst & Radial Rays */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 overflow-hidden">
              <div className="w-[850px] h-[850px] animate-spin [animation-duration:22s]">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-400">
                  <defs>
                    <radialGradient id="cinematic-sunburst" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffd700" stopOpacity="0.8" />
                      <stop offset="60%" stopColor="#ea580c" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  {Array.from({ length: 18 }).map((_, i) => (
                    <path
                      key={i}
                      d="M 50 50 L 45 0 L 55 0 Z"
                      fill="url(#cinematic-sunburst)"
                      transform={`rotate(${i * 20} 50 50)`}
                    />
                  ))}
                </svg>
              </div>
            </div>

            {/* Glowing Center Card */}
            <motion.div
              initial={{ scale: 0.3, y: 70, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0, y: -40 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-amber-950/90 rounded-3xl p-6 text-center border-2 border-amber-400/80 shadow-[0_0_60px_rgba(245,158,11,0.5)] backdrop-blur-xl flex flex-col items-center"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Rarity & Cultural Banner */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black shadow-lg uppercase tracking-wider mb-2">
                <Crown className="w-3.5 h-3.5 fill-slate-950" />
                <span>महा-गौरवशाली भेट • {activeEffect.effect.culturalTheme || 'राजेशाही सन्मान'}</span>
              </div>

              {/* Giant 3D Centerpiece Icon */}
              <div className="relative my-3">
                <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-2xl scale-150 animate-ping [animation-duration:3s]" />
                <motion.div
                  animate={{ y: [-8, 8, -8], rotate: [0, 2, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                  className="relative text-8xl drop-shadow-[0_0_40px_rgba(255,215,0,0.95)] select-none"
                >
                  {activeEffect.effect.previewIcon}
                </motion.div>
                <div className="absolute -top-3 -right-3 text-2xl animate-bounce">✨</div>
                <div className="absolute -bottom-2 -left-3 text-2xl animate-pulse">🌟</div>
              </div>

              {/* Gift Title */}
              <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-400 bg-clip-text text-transparent drop-shadow-sm mb-1">
                {activeEffect.effect.nameMr}
              </h2>
              <p className="text-xs font-medium text-amber-200/90 mb-4">
                महाराष्ट्राची अस्मिता व मनःपूर्वक आपुलकी 🚩
              </p>

              {/* Sender ➔ Recipient Bridge */}
              <div className="w-full bg-white/5 border border-amber-300/30 rounded-2xl p-3 flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-full ring-2 ring-amber-400 overflow-hidden bg-slate-800 shrink-0">
                    {activeEffect.senderPhoto ? (
                      <img src={activeEffect.senderPhoto} alt={activeEffect.senderName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs bg-amber-600">
                        {activeEffect.senderName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-[10px] text-amber-400 font-bold uppercase">भेट देणारे</div>
                    <div className="text-xs font-bold text-white truncate max-w-[90px]">{activeEffect.senderName}</div>
                  </div>
                </div>

                <div className="text-pink-400 font-bold text-sm animate-pulse">
                  ➔ 💖 ➔
                </div>

                <div className="flex items-center gap-2 min-w-0">
                  <div className="text-right min-w-0">
                    <div className="text-[10px] text-emerald-400 font-bold uppercase">स्वीकारणारे</div>
                    <div className="text-xs font-bold text-white truncate max-w-[90px]">
                      {isRecipient ? 'तुम्ही (You) ✨' : activeEffect.recipientName}
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full ring-2 ring-emerald-400 bg-emerald-700/60 flex items-center justify-center text-xs text-white shrink-0">
                    👑
                  </div>
                </div>
              </div>

              {/* Combo Multiplier Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-pink-500/20 border border-amber-400/40 text-xs font-bold text-amber-200 mb-4">
                <span className="text-base animate-bounce">🔥</span>
                <span className="font-black text-amber-300 text-sm">COMBO x{activeEffect.comboCount}</span>
                <span>•</span>
                <span className="text-emerald-300 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>+{activeEffect.comboCount * 10} चार्म पॉईंट्स!</span>
                </span>
              </div>

              {/* Recipient Action Buttons */}
              <div className="w-full flex items-center gap-2.5">
                {isRecipient && (
                  <button
                    type="button"
                    onClick={handleThankYou}
                    disabled={thanked}
                    className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                      thanked
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-pink-500/30'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${thanked ? 'fill-white' : 'fill-white/40'}`} />
                    <span>{thanked ? 'धन्यवाद पाठवले! ❤️' : 'मनापासून धन्यवाद म्हणा'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  स्वीकारा
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
