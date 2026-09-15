import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Crown, Award, X, Send } from 'lucide-react';
import { RoomGiftEvent } from '../../premium/types';
import { celebrationAudio } from '../../lib/celebrationAudio';

interface GiftOverlayProps {
  giftEvent?: RoomGiftEvent | null;
  event?: RoomGiftEvent | null; // alias for backward compatibility
  currentUserId?: string;
  onDismiss: () => void;
  onSendThankYou?: (senderId: string, senderName: string) => void;
}

export const GiftOverlay: React.FC<GiftOverlayProps> = ({
  giftEvent: propGiftEvent,
  event: aliasEvent,
  currentUserId,
  onDismiss,
  onSendThankYou
}) => {
  const currentEvent = propGiftEvent || aliasEvent || null;
  const [visible, setVisible] = useState(false);
  const [thanked, setThanked] = useState(false);

  // Check if the current user is the intended recipient of this gift
  const isRecipient = Boolean(
    currentEvent &&
    currentUserId &&
    (currentEvent.recipientId === currentUserId || currentEvent.recipientId === 'room_broadcast')
  );

  // Trigger high-quality confetti explosion
  const fireCelebrationConfetti = useCallback(() => {
    try {
      // Center multi-color explosion
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.55 },
        colors: ['#f59e0b', '#ea580c', '#ec4899', '#3b82f6', '#10b981', '#fbbf24']
      });

      // Left cannon
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 70,
          origin: { x: 0.1, y: 0.6 },
          colors: ['#f59e0b', '#ea580c', '#ffd700']
        });
      }, 200);

      // Right cannon
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 70,
          origin: { x: 0.9, y: 0.6 },
          colors: ['#ec4899', '#f43f5e', '#ffd700']
        });
      }, 350);
    } catch {
      // Confetti fallback
    }
  }, []);

  useEffect(() => {
    if (currentEvent) {
      setVisible(true);
      setThanked(false);

      // If user is recipient, play musical chime and trigger confetti
      if (isRecipient) {
        celebrationAudio.playGiftFanfare();
        fireCelebrationConfetti();
      } else {
        celebrationAudio.playGiftSentSound();
      }

      // Auto dismiss timer (longer for recipient so they can read and say thanks)
      const dismissDuration = isRecipient ? 7500 : 5000;
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, dismissDuration);

      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [currentEvent, isRecipient, onDismiss, fireCelebrationConfetti]);

  const handleThankYouClick = () => {
    if (!currentEvent) return;
    setThanked(true);
    celebrationAudio.playGiftSentSound();

    if (onSendThankYou && currentEvent.senderId) {
      onSendThankYou(currentEvent.senderId, currentEvent.senderName);
    }

    // Small heart burst
    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ec4899', '#f43f5e', '#ffffff']
      });
    } catch {}

    setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 1200);
  };

  if (!currentEvent || !visible) return null;

  return (
    <AnimatePresence>
      {isRecipient ? (
        /* ============================================================ */
        /* HIGHEST QUALITY FULLSCREEN RECIPIENT CELEBRATION MODAL      */
        /* ============================================================ */
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden">
          
          {/* Rotating Sunburst Light Rays in Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 overflow-hidden">
            <div className="w-[700px] h-[700px] sm:w-[900px] sm:h-[900px] animate-spin [animation-duration:25s]">
              <svg viewBox="0 0 100 100" className="w-full h-full text-amber-400">
                <defs>
                  <radialGradient id="sunburst-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="60%" stopColor="#ea580c" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {Array.from({ length: 18 }).map((_, i) => (
                  <path
                    key={i}
                    d="M 50 50 L 45 0 L 55 0 Z"
                    fill="url(#sunburst-grad)"
                    transform={`rotate(${i * 20} 50 50)`}
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Ambient Glowing Halos */}
          <div className="absolute w-72 h-72 rounded-full bg-amber-500/20 blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute w-60 h-60 rounded-full bg-pink-500/20 blur-2xl pointer-events-none" />

          {/* Main Animated Card */}
          <motion.div
            initial={{ scale: 0.3, y: 70, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-amber-950/90 rounded-3xl p-6 text-center border-2 border-amber-400/80 shadow-[0_0_60px_rgba(245,158,11,0.5)] backdrop-blur-xl flex flex-col items-center"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                setVisible(false);
                onDismiss();
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Recipient Badge Pill */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black shadow-lg uppercase tracking-wider mb-3"
            >
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>तुम्हाला खास भेटवस्तू मिळाली आहे!</span>
            </motion.div>

            {/* 3D Animated Gift Box Centerpiece */}
            <div className="relative my-2">
              {/* Outer Pulsing Aura */}
              <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl scale-125 animate-ping [animation-duration:3s]" />

              <motion.div
                animate={{
                  y: [-6, 6, -6],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: 'easeInOut'
                }}
                className="relative text-7xl sm:text-8xl drop-shadow-[0_0_35px_rgba(245,158,11,0.95)] select-none filter"
              >
                {currentEvent.giftIcon || '🎁'}
              </motion.div>

              {/* Orbiting Sparkles */}
              <div className="absolute -top-2 -right-3 text-2xl animate-bounce">✨</div>
              <div className="absolute -bottom-1 -left-3 text-2xl animate-pulse">🌟</div>
            </div>

            {/* Gift Title & Description */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-1 mb-4"
            >
              <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
                {currentEvent.giftNameMr}
              </h2>
              <p className="text-xs font-semibold text-amber-200/90">
                महाराष्ट्राची डिजिटल आपुलकी आणि मनःपूर्वक सन्मान ✨
              </p>
            </motion.div>

            {/* Sender ➔ Recipient Profile Bridge */}
            <div className="w-full bg-white/5 border border-amber-300/30 rounded-2xl p-3 flex items-center justify-between gap-2 mb-4 backdrop-blur-xs">
              {/* Sender */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 rounded-full ring-2 ring-amber-400 bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                  {currentEvent.senderPhoto ? (
                    <img src={currentEvent.senderPhoto} alt={currentEvent.senderName} className="w-full h-full object-cover" />
                  ) : (
                    currentEvent.senderName?.charAt(0) || 'U'
                  )}
                </div>
                <div className="text-left min-w-0">
                  <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">भेट देणारे:</div>
                  <div className="text-xs font-bold text-white truncate max-w-[90px] sm:max-w-[110px]">
                    {currentEvent.senderName}
                  </div>
                </div>
              </div>

              {/* Animated Connection Beam */}
              <div className="flex flex-col items-center shrink-0 px-1">
                <motion.div
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="text-pink-400 text-lg"
                >
                  💖
                </motion.div>
                <div className="text-[9px] font-black text-amber-300">
                  ➔ सस्नेह भेट ➔
                </div>
              </div>

              {/* Recipient (You) */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-right min-w-0">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">स्वीकारणारे:</div>
                  <div className="text-xs font-bold text-white truncate max-w-[90px] sm:max-w-[110px]">
                    {currentEvent.recipientId === 'room_broadcast' ? 'सर्व सदस्य' : 'तुम्ही (You) ✨'}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full ring-2 ring-emerald-400 bg-emerald-700/60 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs">
                  👑
                </div>
              </div>
            </div>

            {/* Multiplier Combo Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-pink-500/20 border border-amber-400/40 text-xs font-bold text-amber-200 mb-5 shadow-inner">
              <span className="text-base animate-bounce">🔥</span>
              <span className="font-black text-amber-300 text-sm">
                COMBO x {currentEvent.multiplier || 1}
              </span>
              <span>•</span>
              <span className="text-emerald-300 flex items-center gap-1 font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>+{(currentEvent.multiplier || 1) * 10} चार्म पॉईंट्स!</span>
              </span>
            </div>

            {/* Interactive Response Buttons */}
            <div className="w-full flex items-center gap-2.5">
              <button
                type="button"
                id="btn-gift-say-thanks"
                onClick={handleThankYouClick}
                disabled={thanked}
                className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                  thanked
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-pink-500/30'
                }`}
              >
                <Heart className={`w-4 h-4 ${thanked ? 'fill-white' : 'fill-white/40'}`} />
                <span>{thanked ? 'धन्यवाद पाठवले! ❤️' : 'मनापासून धन्यवाद म्हणा (Say Thanks)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setVisible(false);
                  onDismiss();
                }}
                className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                स्वीकारा
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        /* ============================================================ */
        /* HIGH QUALITY FLOATING VIP COMBO BANNER FOR OTHER MEMBERS     */
        /* ============================================================ */
        <motion.div
          initial={{ x: -60, opacity: 0, scale: 0.85 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: -60, opacity: 0, scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="fixed top-20 left-3 sm:left-6 z-40 pointer-events-auto"
        >
          <div className="relative flex items-center bg-gradient-to-r from-purple-950/95 via-pink-950/95 to-amber-950/90 backdrop-blur-xl px-4 py-2.5 rounded-full border-2 border-pink-400/50 shadow-[0_8px_30px_rgba(236,72,153,0.45)]">
            
            {/* Sender Avatar with Golden Glow Ring */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-pink-400 shadow-md shrink-0 bg-slate-800">
              {currentEvent.senderPhoto ? (
                <img
                  src={currentEvent.senderPhoto}
                  alt={currentEvent.senderName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs bg-gradient-to-tr from-pink-600 to-amber-600">
                  {currentEvent.senderName?.charAt(0) || 'U'}
                </div>
              )}
            </div>

            {/* Sender & Recipient Information */}
            <div className="ml-3 mr-3 max-w-[130px] sm:max-w-[170px] text-left">
              <div className="text-[11px] font-bold text-pink-200 truncate flex items-center gap-1">
                <span className="text-pink-400">❤️</span>
                <span className="truncate">{currentEvent.senderName}</span>
              </div>
              <div className="text-[10px] text-amber-200 truncate font-semibold">
                ➔ {currentEvent.recipientName}
              </div>
              <div className="text-[9px] text-yellow-300/80 truncate font-medium">
                {currentEvent.giftNameMr}
              </div>
            </div>

            {/* 3D Animated Gift Icon */}
            <div className="relative -ml-1 mr-1.5 text-3xl sm:text-4xl animate-bounce drop-shadow-[0_0_15px_rgba(244,63,94,0.9)] select-none">
              {currentEvent.giftIcon || '🎁'}
            </div>

            {/* Golden Combo Fire Count */}
            <div className="pl-1 pr-2 flex items-baseline">
              <span className="text-xl sm:text-2xl font-black italic bg-gradient-to-b from-yellow-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-tight animate-pulse">
                x {currentEvent.multiplier || 1}
              </span>
            </div>

            {/* Glowing Corner Sparkle */}
            <div className="absolute -right-2 -top-1 text-sm animate-ping">
              ✨
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
