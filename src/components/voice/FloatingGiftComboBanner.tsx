import React, { useEffect, useState } from 'react';
import { RoomGiftEvent } from '../../premium/types';

interface FloatingGiftComboBannerProps {
  giftEvent: RoomGiftEvent | null;
  onFinished?: () => void;
}

export const FloatingGiftComboBanner: React.FC<FloatingGiftComboBannerProps> = ({
  giftEvent,
  onFinished
}) => {
  const [currentEvent, setCurrentEvent] = useState<RoomGiftEvent | null>(null);
  const [comboCount, setComboCount] = useState<number>(1);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (giftEvent) {
      setCurrentEvent(giftEvent);
      setComboCount(giftEvent.multiplier || 6);
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
        if (onFinished) onFinished();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [giftEvent, onFinished]);

  if (!visible || !currentEvent) return null;

  return (
    <div className="fixed top-24 left-3 sm:left-6 z-40 pointer-events-none animate-in slide-in-from-left duration-300">
      <div className="relative flex items-center bg-gradient-to-r from-purple-950/90 via-pink-950/90 to-amber-950/80 backdrop-blur-md px-3.5 py-2 rounded-full border border-pink-400/40 shadow-[0_4px_25px_rgba(236,72,153,0.4)]">
        {/* Sender Avatar */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-pink-400 shrink-0 bg-slate-800">
          {currentEvent.senderPhoto ? (
            <img
              src={currentEvent.senderPhoto}
              alt={currentEvent.senderName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs bg-pink-600">
              {currentEvent.senderName?.slice(0, 1) || 'U'}
            </div>
          )}
        </div>

        {/* Sender & Recipient text */}
        <div className="ml-2.5 mr-3 max-w-[130px] sm:max-w-[160px]">
          <div className="text-[11px] font-bold text-pink-200 truncate flex items-center gap-1">
            <span>❤️</span>
            <span className="truncate">{currentEvent.senderName}</span>
          </div>
          <div className="text-[10px] text-amber-200 truncate font-medium">
            Send {currentEvent.recipientName}
          </div>
        </div>

        {/* 3D Rose/Gift Icon */}
        <div className="relative -ml-1 mr-1 text-3xl sm:text-4xl animate-bounce drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]">
          {currentEvent.giftIcon || '🌹'}
        </div>

        {/* Golden Combo Multiplier: x 6, x 7 */}
        <div className="pl-1.5 pr-1 flex items-baseline">
          <span className="text-xl sm:text-2xl font-black italic bg-gradient-to-b from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight animate-pulse">
            x {comboCount}
          </span>
        </div>

        {/* Glowing trailing sparkles */}
        <div className="absolute -right-2 -top-1 text-xs animate-ping">
          ✨
        </div>
      </div>
    </div>
  );
};
