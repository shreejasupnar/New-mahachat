import React, { useState } from 'react';
import { Phone, Sparkles, MessageCircle, Megaphone, Check, Copy } from 'lucide-react';

interface DefaultNeonBillboardProps {
  onCall?: () => void;
  onOpenAdmin?: () => void;
  showAdminButton?: boolean;
}

export const DefaultNeonBillboard: React.FC<DefaultNeonBillboardProps> = ({
  onCall,
  onOpenAdmin,
  showAdminButton = true
}) => {
  const phoneNumber = '7620363213';
  const [copied, setCopied] = useState(false);

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCall) {
      onCall();
    } else {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleCopyNumber = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(phoneNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent('नमस्कार! मला MahaChat वर जाहिरात द्यायची आहे.');
    window.open(`https://wa.me/91${phoneNumber}?text=${text}`, '_blank');
  };

  return (
    <div 
      className="relative w-full h-full min-h-[165px] sm:min-h-[180px] rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 text-white flex flex-col justify-between p-4 border-2 border-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.25)] select-none group"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(30,58,138,0.5) 0%, rgba(15,23,42,0.95) 100%)'
      }}
    >
      {/* Background Neon Grid / Circuit Pattern */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(6,182,212,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Cyber Neon Ambient Glows */}
      <div className="absolute -top-10 -left-10 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Digital Billboard Status & Live LED Indicator */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Pulsing Neon LED Dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
            प्रायोजित • Sponsored Board
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-[10px] font-bold text-amber-300 flex items-center gap-1 shadow-[0_0_8px_rgba(245,158,11,0.25)]">
            <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-spin" />
            <span>जाहिरात जागा उपलब्ध</span>
          </span>

          {showAdminButton && onOpenAdmin && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAdmin();
              }}
              title="जाहिरात व्यवस्थापन (Admin Control)"
              className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <Megaphone className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Center: Neon Devanagari Title & Contact Box */}
      <div className="relative z-10 my-auto py-1 text-center">
        {/* Neon Glow Headline */}
        <h3 className="text-lg sm:text-xl font-black tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.7)] flex items-center justify-center gap-1.5">
          <span className="text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
            जाहिरातीसाठी
          </span>
          <span className="text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]">
            संपर्क करा
          </span>
        </h3>

        <p className="text-[11px] sm:text-xs text-blue-100/90 font-medium mt-0.5 max-w-xs mx-auto">
          ३६ जिल्ह्यांतील लाखो सक्रिय वापरकर्त्यांपर्यंत आपला व्यवसाय पोहोचवा!
        </p>

        {/* Glowing Contact Banner with Click-to-Copy */}
        <button
          type="button"
          onClick={handleCopyNumber}
          title="नंबर कॉपी करण्यासाठी क्लिक करा"
          className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.35)] backdrop-blur-md transition-all cursor-pointer group active:scale-95"
        >
          <Phone className="w-4 h-4 text-cyan-400 animate-bounce" />
          <span className="text-base sm:text-lg font-black tracking-wider text-white font-mono drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
            {phoneNumber}
          </span>
          {copied ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded-md border border-emerald-500/40">
              <Check className="w-3 h-3 text-emerald-400" /> कॉपी झाले!
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-cyan-300 group-hover:text-cyan-200">
              <Copy className="w-3 h-3 text-cyan-400" /> कॉपी करा
            </span>
          )}
        </button>
      </div>

      {/* Bottom Actions: 1-Tap Call and WhatsApp */}
      <div className="relative z-10 pt-2 border-t border-cyan-500/20 flex items-center justify-between gap-2">
        <div className="text-[10px] text-slate-300 font-medium hidden xs:block">
          किफायतशीर दर • थेट संपर्क
        </div>

        <div className="flex items-center gap-2 w-full xs:w-auto justify-end">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex-1 xs:flex-none px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all cursor-pointer border border-emerald-400/40 active:scale-95"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>व्हॉट्सॲप</span>
          </button>

          <button
            type="button"
            onClick={handleCall}
            className="flex-1 xs:flex-none px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all cursor-pointer border border-amber-200 active:scale-95"
          >
            <Phone className="w-3.5 h-3.5 text-slate-950" />
            <span>कॉल करा</span>
          </button>
        </div>
      </div>
    </div>
  );
};
