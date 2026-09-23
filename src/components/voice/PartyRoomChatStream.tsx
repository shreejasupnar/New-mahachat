import React, { useRef, useEffect } from 'react';
import { VoiceRoomStreamMessage } from '../../lib/firebase';
import { Award, MessageCircle, Crown, Sparkles } from 'lucide-react';
import { VipBadge } from '../vip/VipBadge';
import { getVipTier } from '../../data/vipData';

interface PartyRoomChatStreamProps {
  messages: VoiceRoomStreamMessage[];
  onOpenChatInput: () => void;
  onClapUser?: (userName: string) => void;
}

export const PartyRoomChatStream: React.FC<PartyRoomChatStreamProps> = ({
  messages,
  onOpenChatInput,
  onClapUser
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleClap = (e: React.MouseEvent, userName: string) => {
    e.stopPropagation();
    if (onClapUser) {
      onClapUser(userName);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-end overflow-hidden relative select-none">
      {/* Scrollable live feed area */}
      <div
        ref={containerRef}
        className="w-full max-h-[46vh] sm:max-h-[50vh] overflow-y-auto space-y-2.5 scrollbar-none px-2 py-1"
      >
        {messages.map((msg) => {
          // 1. Room Entry Card (exact match with screenshot)
          if (msg.type === 'entry') {
            return (
              <div
                key={msg.id}
                className="w-full bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-2 sm:p-2.5 flex items-center justify-between gap-2 shadow-lg transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* User Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/20 bg-slate-800">
                    {msg.senderPhoto ? (
                      <img
                        src={msg.senderPhoto}
                        alt={msg.senderName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs bg-gradient-to-br from-indigo-600 to-purple-800">
                        {msg.senderName?.slice(0, 1)}
                      </div>
                    )}
                  </div>

                  {/* Name and "entered the room" text */}
                  <div className="min-w-0 leading-tight">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-white text-xs sm:text-sm truncate">
                        {msg.senderName}
                      </span>
                      {msg.level ? (
                        <VipBadge level={msg.level} size="xs" />
                      ) : null}
                    </div>
                    <div className="text-amber-400 text-xs font-semibold mt-0.5 tracking-wide">
                      {msg.text || (msg.level ? (getVipTier(msg.level)?.entryBannerTextMr || 'कट्ट्यावर आगमन') : 'entered the room')}
                    </div>
                  </div>
                </div>

                {/* Clapping Hands Action Button on right */}
                <button
                  type="button"
                  onClick={(e) => handleClap(e, msg.senderName)}
                  className="px-4 py-1.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md active:scale-90 transition-transform flex items-center justify-center cursor-pointer shrink-0"
                  title="टाळ्या वाजवून स्वागत करा"
                >
                  <span className="text-lg leading-none">👏</span>
                </button>
              </div>
            );
          }

          // 2. System / Moderation Banner
          if (msg.type === 'system') {
            return (
              <div
                key={msg.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/75 backdrop-blur-md border border-pink-500/30 text-xs font-semibold text-pink-300 shadow-md"
              >
                <span>🔥</span>
                <span>{msg.text || `${msg.senderName} cleaned the chat`}</span>
              </div>
            );
          }

          // 3. Gift In-Room Announcement
          if (msg.type === 'gift') {
            return (
              <div
                key={msg.id}
                className="w-full bg-gradient-to-r from-pink-950/70 via-purple-950/70 to-slate-950/70 backdrop-blur-md border border-pink-500/40 rounded-2xl p-2 flex items-center justify-between gap-2 shadow-lg"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-2xl animate-bounce">{msg.giftIcon || '🎁'}</span>
                  <div className="text-xs truncate">
                    <span className="font-bold text-pink-300">{msg.senderName}</span>
                    <span className="text-slate-300 mx-1">sent</span>
                    <span className="font-bold text-yellow-300">{msg.recipientName}</span>
                  </div>
                </div>
                <span className="font-black text-amber-400 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 shrink-0">
                  x{msg.giftMultiplier || 1}
                </span>
              </div>
            );
          }

          // 4. Regular Chat Message
          const vipTier = msg.level ? getVipTier(msg.level) : null;
          return (
            <div
              key={msg.id}
              onClick={onOpenChatInput}
              className={`w-full backdrop-blur-md rounded-2xl p-2 sm:p-2.5 flex items-start gap-2.5 shadow-md cursor-pointer transition-all ${
                vipTier 
                  ? `${vipTier.bubbleClass} border hover:brightness-110` 
                  : 'bg-slate-900/60 border border-white/10 hover:border-white/20'
              }`}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/20 bg-slate-800 mt-0.5">
                {msg.senderPhoto ? (
                  <img
                    src={msg.senderPhoto}
                    alt={msg.senderName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-white text-[11px] bg-indigo-700">
                    {msg.senderName?.slice(0, 1)}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`font-bold text-xs ${vipTier ? 'text-white font-black' : 'text-pink-300'}`}>
                    {msg.senderName}
                  </span>
                  {msg.level && msg.level > 0 ? (
                    <VipBadge level={msg.level} size="xs" />
                  ) : null}
                </div>
                <p className="text-slate-200 text-xs sm:text-sm mt-0.5 break-words leading-relaxed flex flex-wrap items-baseline gap-1">
                  {msg.level && msg.level > 0 ? (
                    <span className="inline-flex items-center align-middle mr-1 select-none shrink-0" title={`VIP ${msg.level}`}>
                      <VipBadge level={msg.level} size="xs" />
                    </span>
                  ) : null}
                  <span>{msg.text}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating unread/chat button on bottom-right matching screenshot (blue button with red '29' badge) */}
      <div className="absolute right-3 bottom-1 z-20 pointer-events-auto">
        <button
          type="button"
          onClick={onOpenChatInput}
          className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white flex items-center justify-center shadow-[0_4px_16px_rgba(14,165,233,0.5)] active:scale-90 transition-all cursor-pointer border border-sky-300/40"
          title="लाईव्ह चॅट उघडा"
        >
          <MessageCircle className="w-6 h-6 fill-white/20 text-white" />
          {messages.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full border-2 border-slate-900 shadow-md">
              {messages.length > 99 ? '99+' : messages.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
