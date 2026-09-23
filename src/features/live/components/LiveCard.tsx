import React from 'react';
import { Users, Flame, Radio, Sparkles } from 'lucide-react';
import { LiveStream } from '../services/streamService';

interface LiveCardProps {
  stream: LiveStream;
  onSelect: (stream: LiveStream) => void;
}

export const LiveCard: React.FC<LiveCardProps> = ({ stream, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(stream)}
      className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-rose-500/50 transition-all duration-300 cursor-pointer active:scale-98 flex flex-col justify-between aspect-[3/4]"
    >
      {/* Background Graphic / Photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/20 z-0">
        {stream.hostPhotoURL ? (
          <img
            src={stream.hostPhotoURL}
            alt={stream.hostName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-950/40 via-purple-950/30 to-slate-950">
            <Radio className="w-12 h-12 text-rose-500/30" />
          </div>
        )}
      </div>

      {/* Top Badges */}
      <div className="relative z-10 p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {/* Pulsing Live Badge - only if stream is strictly active */}
          {stream.status === 'live' && !stream.endedAt ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-md shadow-rose-600/30">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              LIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700/80 text-slate-300">
              समाप्त
            </span>
          )}

          {/* Audio Only Badge */}
          {stream.isAudioOnly && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-black shadow-md">
              🎙️ ऑडिओ
            </span>
          )}
        </div>

        {/* Viewers Badge */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white border border-white/10">
          <Users className="w-3 h-3 text-rose-400" />
          {stream.viewerCount || 1}
        </span>
      </div>

      {/* Bottom Info Overlay */}
      <div className="relative z-10 p-3 bg-gradient-to-t from-black via-black/80 to-transparent pt-6">
        <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-rose-300 transition-colors">
          {stream.title}
        </h3>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 overflow-hidden">
              {stream.hostPhotoURL ? (
                <img src={stream.hostPhotoURL} alt={stream.hostName} className="w-full h-full object-cover" />
              ) : (
                stream.hostName.charAt(0)
              )}
            </div>
            <span className="text-[11px] text-slate-300 font-medium truncate">
              {stream.hostName}
            </span>
          </div>

          {stream.hostDistrict && (
            <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
              {stream.hostDistrict}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
