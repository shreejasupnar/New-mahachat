import React, { useState, useEffect } from 'react';
import { Swords, Check, X, ShieldAlert } from 'lucide-react';
import { PKBattle, respondToPKInvite } from '../services/pkService';

interface IncomingPKBannerProps {
  invite: PKBattle;
  onClose: () => void;
}

export const IncomingPKBanner: React.FC<IncomingPKBannerProps> = ({
  invite,
  onClose,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(20);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          respondToPKInvite(invite.id, false);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [invite.id, onClose]);

  const handleAccept = async () => {
    await respondToPKInvite(invite.id, true);
    onClose();
  };

  const handleDecline = async () => {
    await respondToPKInvite(invite.id, false);
    onClose();
  };

  return (
    <div className="fixed top-16 left-4 right-4 z-50 max-w-sm mx-auto bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 border-2 border-rose-500 rounded-3xl p-3.5 shadow-2xl animate-in slide-in-from-top duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            {invite.hostAPhotoURL ? (
              <img
                src={invite.hostAPhotoURL}
                alt={invite.hostAName}
                className="w-10 h-10 rounded-full object-cover border-2 border-rose-400"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center font-bold text-white text-xs">
                {invite.hostAName.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[9px] font-black text-black">
              ⚔️
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-xs text-white truncate max-w-[120px]">
                {invite.hostAName}
              </span>
              <span className="text-[10px] text-amber-300">
                ({secondsLeft}s)
              </span>
            </div>
            <span className="text-[11px] text-rose-300 font-medium block truncate">
              यांनी PK महामुकाबल्याचे आव्हान दिले आहे!
            </span>
          </div>
        </div>

        {/* Accept / Decline actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleDecline}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
            title="नाकारा (Decline)"
          >
            <X className="w-4 h-4" />
          </button>

          <button
            onClick={handleAccept}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-bold text-xs shadow-md shadow-rose-600/40 active:scale-95 transition-all cursor-pointer"
            title="स्वीकारा (Accept)"
          >
            <Check className="w-4 h-4" />
            <span>स्वीकारा</span>
          </button>
        </div>
      </div>
    </div>
  );
};
