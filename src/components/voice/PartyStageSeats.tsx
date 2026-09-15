import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { VoiceParticipant, UserProfile } from '../../lib/firebase';
import { 
  getSeatFrameById, 
  getBadgeById, 
  getNameEffectById 
} from '../../premium';
import { AvatarFrameOverlay } from '../../effects';
import { VipSeatFrameOverlay } from '../vip/VipSeatFrameOverlay';
import { VipBadge } from '../vip/VipBadge';

interface PartyStageSeatsProps {
  seats: (VoiceParticipant | null)[];
  currentUserProfile: UserProfile | null;
  isSpeaking: boolean;
  isMuted: boolean;
  speakerVolumes?: Record<string, number>;
  onSeatClick: (seatIndex: number) => void;
  onOpenRules?: () => void;
  onQuickPickSeat?: () => void;
}

export const PartyStageSeats: React.FC<PartyStageSeatsProps> = ({
  seats,
  currentUserProfile,
  isSpeaking,
  isMuted,
  speakerVolumes = {},
  onSeatClick
}) => {
  // Render an individual seat matching the 5+5 structure in the screenshot
  const renderSeatItem = (seatNumber: number, seatIdx: number) => {
    const occupant = seats[seatIdx];
    const isMe = occupant?.uid === currentUserProfile?.uid;
    const remoteVolume = occupant ? (speakerVolumes[occupant.uid] || 0) : 0;
    const activelySpeaking = isMe 
      ? (isSpeaking || (speakerVolumes[currentUserProfile?.uid || ''] || 0) > 15) 
      : (occupant?.isSpeaking || remoteVolume > 15);
    const muted = isMe ? isMuted : occupant?.isMuted;

    const frameId = occupant ? (occupant.equippedSeatFrame || (isMe ? currentUserProfile?.equippedSeatFrame : undefined)) : undefined;
    const seatFrame = frameId ? getSeatFrameById(frameId) : null;
    const badgeId = occupant ? (occupant.equippedBadge || (isMe ? currentUserProfile?.equippedBadge : undefined)) : undefined;
    const badge = badgeId ? getBadgeById(badgeId) : null;
    const nameEffectId = occupant ? (occupant.equippedNameEffect || (isMe ? currentUserProfile?.equippedNameEffect : undefined)) : undefined;
    const nameEffect = nameEffectId ? getNameEffectById(nameEffectId) : null;
    const occupantVipLevel = occupant ? (occupant.vipLevel || (isMe ? currentUserProfile?.vipLevel : 0) || 0) : 0;

    // Number tag colors: Seats 6 and 7 use pink, others use blue (exact match with screenshot)
    const numberBgColor = (seatNumber === 6 || seatNumber === 7) ? 'bg-pink-500' : 'bg-blue-500';

    if (occupant) {
      return (
        <div
          id={`voice-stage-seat-${seatIdx}`}
          key={`seat-${seatIdx}-${occupant.uid}`}
          data-seat-index={seatIdx}
          data-user-id={occupant.uid}
          onClick={() => onSeatClick(seatIdx)}
          className="flex flex-col items-center text-center cursor-pointer group relative transition-transform active:scale-95 select-none"
        >
          {/* Avatar Container with glowing speaking ring & mic status */}
          <div className="relative w-13 h-13 sm:w-15 sm:h-15 flex items-center justify-center">
            <AvatarFrameOverlay
              frameId={frameId}
              size="md"
              showCrown={Boolean(seatFrame?.crownBadge)}
            >
              <div
                className={`w-full h-full rounded-full overflow-hidden p-0.5 transition-all duration-200 ${
                  activelySpeaking
                    ? 'ring-2 ring-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)] scale-105'
                    : seatFrame
                    ? `${seatFrame.seatRingClass}`
                    : 'ring-1 ring-white/20'
                }`}
              >
                {occupant.photoURL ? (
                  <img
                    src={occupant.photoURL}
                    alt={occupant.displayName}
                    className="w-full h-full rounded-full object-cover shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-700 to-purple-900 flex items-center justify-center font-bold text-sm text-white">
                    {occupant.displayName?.slice(0, 1) || 'U'}
                  </div>
                )}
              </div>
            </AvatarFrameOverlay>

            {/* VIP Luxury Seat Frame Overlay */}
            {occupantVipLevel > 0 && (
              <VipSeatFrameOverlay vipLevel={occupantVipLevel} isSpeaking={activelySpeaking} />
            )}

            {/* Mic Status Indicator Badge at bottom-right (matching screenshot: green mic for open/talking, dark/red for muted) */}
            {muted ? (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-slate-900/90 border border-white/60 flex items-center justify-center text-white shadow-md z-20">
                <MicOff className="w-2.5 h-2.5" />
              </div>
            ) : activelySpeaking || !muted ? (
              <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-emerald-500 border border-slate-900 flex items-center justify-center text-white shadow-md z-20 animate-pulse">
                <Mic className="w-2.5 h-2.5 stroke-[2.5]" />
              </div>
            ) : null}
          </div>

          {/* Seat Number Circle + Display Name (matching screenshot) */}
          <div className="mt-1 flex items-center justify-center gap-1 max-w-[68px] sm:max-w-[76px]">
            <span className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full ${numberBgColor} text-white text-[9px] font-black flex items-center justify-center shrink-0 shadow-xs`}>
              {seatNumber}
            </span>
            <span
              className={`text-[10px] sm:text-[11px] font-semibold truncate text-white drop-shadow-xs ${
                nameEffect ? nameEffect.gradientStyle : ''
              }`}
              title={occupant.displayName}
            >
              {occupant.displayName}
            </span>
            {occupantVipLevel > 0 ? (
              <VipBadge level={occupantVipLevel} size="xs" showText={false} />
            ) : badge ? (
              <span className="text-[10px] shrink-0" title={badge.nameMr}>
                {badge.icon}
              </span>
            ) : null}
          </div>
        </div>
      );
    }

    // Empty Seat (matching screenshot Seats 5 and 10)
    return (
      <div
        id={`voice-stage-seat-${seatIdx}`}
        key={`empty-seat-${seatIdx}`}
        data-seat-index={seatIdx}
        onClick={() => onSeatClick(seatIdx)}
        className="flex flex-col items-center text-center cursor-pointer group relative transition-transform active:scale-95 select-none"
      >
        {/* Circular mic placeholder */}
        <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-slate-900/40 border border-slate-700/50 backdrop-blur-xs flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-slate-800/60 group-hover:border-slate-500 transition-all shadow-inner">
          <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400/80" />
        </div>

        {/* Clean Seat Number Below */}
        <span className="mt-1 text-xs sm:text-sm font-semibold text-slate-300 group-hover:text-white">
          {seatNumber}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto px-2 pt-1 pb-2">
      {/* LINE 1: Seats 1 to 5 */}
      <div className="grid grid-cols-5 gap-x-1.5 sm:gap-x-3 mb-3 text-center items-start">
        {Array.from({ length: 5 }).map((_, idx) => renderSeatItem(idx + 1, idx))}
      </div>

      {/* LINE 2: Seats 6 to 10 */}
      <div className="grid grid-cols-5 gap-x-1.5 sm:gap-x-3 text-center items-start">
        {Array.from({ length: 5 }).map((_, idx) => renderSeatItem(idx + 6, idx + 5))}
      </div>
    </div>
  );
};
