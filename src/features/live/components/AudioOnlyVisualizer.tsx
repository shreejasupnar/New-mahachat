import React from 'react';
import { Radio, Mic, MicOff, Volume2, Sparkles, MapPin } from 'lucide-react';
import { StageGuest } from '../services/stageService';

interface AudioOnlyVisualizerProps {
  hostName: string;
  hostPhotoURL?: string;
  hostDistrict?: string;
  title: string;
  category?: string;
  stageGuests?: StageGuest[];
  isHostSpeaking?: boolean;
  className?: string;
}

export const AudioOnlyVisualizer: React.FC<AudioOnlyVisualizerProps> = ({
  hostName,
  hostPhotoURL,
  hostDistrict,
  title,
  category,
  stageGuests = [],
  isHostSpeaking = true,
  className = '',
}) => {
  return (
    <div className={`relative w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden select-none ${className}`}>
      {/* Background Animated Sound Waves & Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
        <div className="w-[320px] h-[320px] rounded-full border border-rose-500/20 animate-ping duration-1000" />
        <div className="w-[480px] h-[480px] rounded-full border border-amber-500/15 animate-ping duration-700" />
        <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-rose-900/20 via-amber-900/10 to-transparent blur-3xl" />
      </div>

      {/* Top Banner: Audio Podcast Mode */}
      <div className="absolute top-16 z-10 flex flex-col items-center gap-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 backdrop-blur-md shadow-lg">
          <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wide">केवळ ऑडिओ थेट • कमी डेटा मोड</span>
        </div>
        {hostDistrict && (
          <div className="flex items-center gap-1 text-[11px] text-amber-300 font-medium">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>{hostDistrict} मंडळ</span>
          </div>
        )}
      </div>

      {/* Center Stage: Audio Round Table */}
      <div className="relative z-10 flex flex-col items-center my-auto">
        {/* Host Avatar with Sound Ripple Rings */}
        <div className="relative mb-3">
          {/* Animated sound ripple circles */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-rose-500/20 to-amber-500/20 animate-pulse blur-md" />
          <div className="absolute -inset-2 rounded-full border-2 border-rose-500/60 animate-ping opacity-60 duration-1000" />
          
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-amber-400 shadow-2xl shadow-rose-950/80 bg-slate-800">
            {hostPhotoURL ? (
              <img src={hostPhotoURL} alt={hostName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-rose-600 to-amber-600 font-black text-3xl text-white">
                {hostName.charAt(0)}
              </div>
            )}
          </div>

          {/* Host Speaking Indicator Mic */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-lg border-2 border-slate-900">
            <Mic className="w-4 h-4 animate-bounce" />
          </div>
        </div>

        {/* Host Name & Role */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5">
            <h2 className="text-base font-bold text-white drop-shadow">{hostName}</h2>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
              यजमान (HOST)
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-xs truncate mt-0.5">{title}</p>
        </div>

        {/* Audio Frequency Equalizer Waves */}
        <div className="flex items-center justify-center gap-1 h-8 my-2">
          {[16, 28, 12, 32, 20, 24, 30, 18, 26, 14, 22].map((height, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-rose-500 to-amber-400 animate-pulse"
              style={{
                height: `${height}px`,
                animationDuration: `${0.6 + (i % 3) * 0.25}s`,
                animationDelay: `${(i * 0.08)}s`,
              }}
            />
          ))}
        </div>

        {/* Stage Guests (if any guests on stage in audio mode) */}
        {stageGuests.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-4 flex-wrap max-w-xs">
            {stageGuests.map((guest) => (
              <div key={guest.id} className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-rose-400/80 bg-slate-800 shadow-md">
                    {guest.userPhotoURL ? (
                      <img src={guest.userPhotoURL} alt={guest.userName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-700 font-bold text-sm text-white">
                        {guest.userName.charAt(0)}
                      </div>
                    )}
                  </div>
                  {guest.isAudioMuted ? (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] border border-slate-900">
                      <MicOff className="w-2.5 h-2.5" />
                    </div>
                  ) : (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] border border-slate-900 animate-pulse">
                      <Volume2 className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-300 font-medium truncate max-w-[64px] mt-1 text-center">
                  {guest.userName}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Info Tip */}
      <div className="absolute bottom-28 z-10 text-center">
        <p className="text-[11px] text-slate-400/80">
          🎧 थेट ऑडिओ सुरू आहे • तुम्ही चॅट व भेटवस्तू (Gifts) पाठवू शकता
        </p>
      </div>
    </div>
  );
};
