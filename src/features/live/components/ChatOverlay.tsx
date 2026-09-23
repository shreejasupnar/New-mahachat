import React, { useRef, useEffect } from 'react';
import { LiveMessage } from '../services/streamService';
import { User, Gift, Heart, Sparkles, Crown } from 'lucide-react';

interface ChatOverlayProps {
  messages: LiveMessage[];
  onUserClick?: (uid: string, name: string) => void;
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({
  messages,
  onUserClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={containerRef}
      className="w-full max-h-56 overflow-y-auto space-y-1.5 p-2 pr-4 scrollbar-none pointer-events-auto"
      style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 100%)' }}
    >
      {messages.length === 0 ? (
        <div className="text-xs text-white/50 italic px-2 py-1">
          थेट संवादात आपले स्वागत आहे! सकारात्मक आणि मैत्रीपूर्ण संदेश पाठवा.
        </div>
      ) : (
        messages.map((msg) => {
          if (msg.type === 'gift') {
            return (
              <div 
                key={msg.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/30 to-rose-500/30 border border-amber-400/40 backdrop-blur-md shadow-md text-xs text-white animate-in zoom-in-95 duration-200"
              >
                {msg.senderIsVip && (
                  <span className="p-0.5 rounded-full bg-amber-400 text-black">
                    <Crown className="w-2.5 h-2.5 fill-black" />
                  </span>
                )}
                <span className="font-bold text-amber-300">{msg.senderName}</span>
                <span className="text-white/80">यांनी भेट दिली:</span>
                <span className="text-base">{msg.giftIcon || '🎁'}</span>
                <span className="font-semibold text-amber-200">{msg.giftName || 'भेट'}</span>
              </div>
            );
          }

          if (msg.type === 'system') {
            const isEntrance = msg.text.includes('शाही') || msg.text.includes('VIP');
            return (
              <div 
                key={msg.id}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium max-w-fit flex items-center gap-1.5 backdrop-blur-md ${
                  isEntrance 
                    ? 'bg-gradient-to-r from-amber-950/80 to-rose-950/80 text-amber-200 border border-amber-400/40 shadow-sm animate-in slide-in-from-left duration-300' 
                    : 'bg-black/40 text-rose-300 border border-rose-500/20'
                }`}
              >
                {isEntrance && <Crown className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                <span>{msg.text}</span>
              </div>
            );
          }

          const isVip = msg.senderIsVip || (msg.senderVipLevel && msg.senderVipLevel > 0);

          return (
            <div 
              key={msg.id}
              className="flex items-start gap-1.5 text-xs text-white leading-snug drop-shadow-sm max-w-xs"
            >
              <div 
                onClick={() => onUserClick?.(msg.senderUid, msg.senderName)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-md cursor-pointer transition-all shrink-0 ${
                  isVip 
                    ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/50 shadow-sm' 
                    : 'bg-black/50 border border-white/10 hover:border-white/30'
                }`}
              >
                {isVip && (
                  <span className="px-1 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5 fill-black" />
                    V{msg.senderVipLevel || 1}
                  </span>
                )}
                {msg.senderDistrict && (
                  <span className="text-[10px] text-amber-300 font-medium">[{msg.senderDistrict}]</span>
                )}
                <span className={`font-bold max-w-[100px] truncate ${isVip ? 'text-amber-200' : 'text-rose-300'}`}>
                  {msg.senderName}
                </span>
              </div>

              <div className={`px-2.5 py-1 rounded-2xl border text-white/95 break-words backdrop-blur-md ${
                isVip 
                  ? 'bg-amber-950/30 border-amber-400/30 text-amber-50' 
                  : 'bg-black/40 border-white/5'
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
