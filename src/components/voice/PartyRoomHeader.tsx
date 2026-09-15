import React, { useState } from 'react';
import { 
  Share2, 
  MoreVertical, 
  Power, 
  Plus, 
  Check, 
  Trophy 
} from 'lucide-react';
import { VoiceParticipant } from '../../lib/firebase';

interface PartyRoomHeaderProps {
  districtName: string;
  districtId: string;
  roomId?: string;
  audience: VoiceParticipant[];
  hostUser?: VoiceParticipant | null;
  isAgoraLive?: boolean;
  onLeave: () => void;
  onOpenAudienceList: () => void;
  onOpenSettings: () => void;
  onOpenAdminDashboard?: () => void;
}

export const PartyRoomHeader: React.FC<PartyRoomHeaderProps> = ({
  districtName,
  districtId,
  roomId,
  audience,
  hostUser,
  isAgoraLive = false,
  onLeave,
  onOpenAudienceList,
  onOpenSettings,
  onOpenAdminDashboard
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const effectiveRoomId = roomId || districtId;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `MahaChat - ${districtName} व्हॉईस रूम`,
        text: `या आणि ${districtName} च्या व्हॉईस पार्टी रूममध्ये सहभागी व्हा! Room ID: ${effectiveRoomId}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Only real audience members from Firestore - strictly no fake users!
  const displayAudience = audience;
  const audienceCount = displayAudience.length;

  return (
    <div className="w-full px-3 pt-2 pb-1.5 z-30 select-none">
      <div className="flex items-center justify-between text-white max-w-md mx-auto w-full">
        {/* Left Side: Host Avatar, Name, ID & Purple '+' Button */}
        <div className="flex items-center gap-2">
          {/* Host Avatar (real host user or district branding) */}
          <div className="w-10 h-10 rounded-2xl overflow-hidden ring-1 ring-white/30 bg-slate-800 shrink-0 shadow-md flex items-center justify-center">
            {hostUser?.photoURL ? (
              <img
                src={hostUser.photoURL}
                alt={hostUser.displayName || 'Room Host'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : hostUser?.displayName ? (
              <div className="w-full h-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center font-bold text-sm text-white">
                {hostUser.displayName.slice(0, 1)}
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-700 to-indigo-900 flex items-center justify-center font-bold text-sm text-white">
                {districtName.slice(0, 1)}
              </div>
            )}
          </div>

          {/* Room Name & ID */}
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white truncate max-w-[90px]">
                {districtName} कट्टा
              </span>
            </div>
            <div className="text-[10px] text-slate-300 font-mono tracking-wide mt-0.5">
              ID:{effectiveRoomId}
            </div>
          </div>

          {/* Purple Plus (+) Follow Button (exact match with screenshot) */}
          <button
            type="button"
            onClick={() => setIsFollowing(!isFollowing)}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer active:scale-85 shadow-md ml-0.5 ${
              isFollowing
                ? 'bg-purple-800 text-purple-200 ring-1 ring-purple-400'
                : 'bg-gradient-to-tr from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
            }`}
            title={isFollowing ? 'फॉलो केले' : 'फॉलो करा'}
          >
            {isFollowing ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[3]" />}
          </button>
        </div>

        {/* Right Side: Audience Avatars Strip, Share, More, Exit */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Audience Avatars & Count 9 */}
          <div
            onClick={onOpenAudienceList}
            className="flex items-center -space-x-1.5 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
            title="उपस्थित सदस्य"
          >
            {displayAudience.slice(0, 3).map((p, idx) => (
              <div
                key={idx}
                className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/40 bg-slate-800 shadow-xs"
                style={{ zIndex: 10 - idx }}
              >
                {p.photoURL ? (
                  <img src={p.photoURL} alt="Audience" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-[9px] text-white bg-purple-700">
                    {p.displayName?.slice(0, 1) || 'A'}
                  </div>
                )}
              </div>
            ))}
            {/* Number Pill (e.g. 9 in screenshot) */}
            <div
              className="w-6 h-6 rounded-full ring-1 ring-white/40 bg-slate-700/90 text-[10px] font-bold text-white flex items-center justify-center shadow-xs"
              style={{ zIndex: 5 }}
            >
              {audienceCount}
            </div>
          </div>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer active:scale-90 relative"
            title="शेअर करा"
          >
            <Share2 className="w-5 h-5" />
            {copiedLink && (
              <span className="absolute -bottom-6 right-0 bg-black/95 border border-emerald-500/50 text-[9px] text-emerald-300 px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                लिंक कॉपी केली!
              </span>
            )}
          </button>

          {/* More (3 dots) */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer active:scale-90"
            title="सेटिंग्ज"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Power / Exit */}
          <button
            type="button"
            onClick={onLeave}
            className="p-1.5 text-slate-300 hover:text-red-400 transition-colors cursor-pointer active:scale-90"
            title="बाहेर पडा"
          >
            <Power className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Trophy / Level Badge Row + Agora RTC Engine Status */}
      <div className="max-w-md mx-auto w-full px-1 mt-1 flex items-center justify-between">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-xs border border-yellow-500/30 text-yellow-300 text-[10px] font-bold shadow-xs">
          <span>🏆</span>
          <span>8 &gt;</span>
        </div>

        {/* Agora RTC Engine Status Indicator */}
        <button
          type="button"
          onClick={onOpenAdminDashboard}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border transition-all cursor-pointer ${
            isAgoraLive
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
              : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60'
          }`}
          title="कट्टा व्हॉईस नेटवर्क व टेलिमेट्री डॅशबोर्ड"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isAgoraLive ? 'bg-emerald-400 animate-ping' : 'bg-indigo-400'}`} />
          <span>{isAgoraLive ? '⚡ Agora RTC Live' : '🎙️ HD Audio'}</span>
        </button>
      </div>
    </div>
  );
};
