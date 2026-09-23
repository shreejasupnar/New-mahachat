import React, { useRef, useEffect } from 'react';
import { User, Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import { LiveFilter } from '../config/filters';
import { FaceFilterOverlay } from './FaceFilterOverlay';

interface VideoTileProps {
  stream: MediaStream | null;
  participantName?: string;
  photoURL?: string;
  isHost?: boolean;
  isMuted?: boolean;
  isLocal?: boolean;
  mirror?: boolean;
  fit?: 'cover' | 'contain';
  badgeText?: string;
  filter?: LiveFilter;
  className?: string;
  onClick?: () => void;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  stream,
  participantName = 'वापरकर्ता',
  photoURL,
  isHost = false,
  isMuted = false,
  isLocal = false,
  mirror = false,
  fit = 'cover',
  badgeText,
  filter,
  className = '',
  onClick,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.warn('Auto-play blocked or failed:', err);
        });
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  const hasVideoTrack = stream && stream.getVideoTracks().some(t => t.enabled && t.readyState === 'live');

  return (
    <div 
      onClick={onClick}
      className={`relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center select-none ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Avoid local audio feedback echo
        style={{ filter: filter?.cssFilter || 'none' }}
        className={`w-full h-full object-${fit} ${mirror ? 'scale-x-[-1]' : ''} ${!hasVideoTrack ? 'hidden' : 'block'} transition-[filter] duration-300`}
      />

      {/* AR / Face Filter Overlay */}
      {filter && <FaceFilterOverlay filter={filter} />}

      {/* Avatar Fallback if camera is off or not yet loaded */}
      {!hasVideoTrack && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-black p-4 text-center">
          <div className="relative mb-3">
            {photoURL ? (
              <img
                src={photoURL}
                alt={participantName}
                className="w-24 h-24 rounded-full object-cover border-2 border-rose-500/40 shadow-xl shadow-rose-950/40"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border-2 border-slate-600 flex items-center justify-center shadow-lg">
                <User className="w-12 h-12 text-slate-400" />
              </div>
            )}
            {isHost && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-md">
                यजमान (HOST)
              </span>
            )}
          </div>
          <span className="font-semibold text-sm text-slate-200">{participantName}</span>
          <span className="text-[11px] text-slate-400 mt-1">कॅमेरा बंद आहे किंवा लोड होत आहे...</span>
        </div>
      )}

      {/* Top Overlay Badge */}
      {badgeText && (
        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium flex items-center gap-1">
          {badgeText}
        </div>
      )}

      {/* Bottom Status bar for Mute state */}
      <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
        <span className="px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-[10px] text-white/90 font-medium truncate max-w-[130px]">
          {participantName} {isLocal && '(तुम्ही)'}
        </span>
        {isMuted && (
          <span className="p-1 rounded-md bg-rose-600/80 text-white shadow-sm">
            <VolumeX className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </div>
  );
};
