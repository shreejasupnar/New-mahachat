import React from 'react';
import { Crown, Sparkles, Check, ArrowRight, X } from 'lucide-react';
import { getVipTier } from '../../data/vipData';
import { VipBadge } from './VipBadge';

interface VipLevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  onClose: () => void;
  onOpenVipCenter: () => void;
}

export const VipLevelUpModal: React.FC<VipLevelUpModalProps> = ({
  isOpen,
  newLevel,
  onClose,
  onOpenVipCenter
}) => {
  if (!isOpen || !newLevel) return null;

  const tier = getVipTier(newLevel);
  if (!tier) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-sm rounded-3xl p-6 text-white text-center shadow-2xl overflow-hidden border border-yellow-400/40"
        style={{
          background: 'linear-gradient(180deg, #18122B 0%, #0F0E17 100%)'
        }}
      >
        {/* Background Light Beam effect */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-40 animate-pulse"
          style={{ background: tier.glowColor }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Crown & Badge Celebration Header */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-2">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl ring-4 border-2"
              style={{
                background: `linear-gradient(135deg, ${tier.primaryColor}, #0F172A)`,
                borderColor: tier.accentColor,
                boxShadow: `0 0 30px ${tier.glowColor}`
              }}
            >
              <Crown className="w-10 h-10 text-yellow-300 animate-bounce" />
            </div>
            <span className="absolute -top-1 -right-1 text-2xl animate-spin">
              ✨
            </span>
          </div>

          <span className="text-xs font-black tracking-widest uppercase text-yellow-400">
            अभिनंदन! VIP पदोन्नती
          </span>

          <h2 className="text-2xl font-black mt-1 text-white tracking-tight flex items-center gap-2">
            <span>{tier.nameMr}</span>
            <VipBadge level={newLevel} size="md" />
          </h2>

          <p className="text-xs text-slate-300 mt-1">
            तुम्ही <strong className="text-yellow-300">VIP {newLevel}</strong> स्तरावर यशस्वीरीत्या पोहोचला आहात!
          </p>
        </div>

        {/* Unlocked Privileges Preview */}
        <div className="mt-5 text-left bg-white/5 rounded-2xl p-4 border border-white/10 relative z-10">
          <div className="text-[11px] font-black uppercase tracking-wider text-yellow-400/90 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>नवीन अनलॉक झालेले विशेषाधिकार</span>
          </div>

          <div className="space-y-2">
            {tier.privileges.slice(0, 3).map((priv) => (
              <div key={priv.id} className="flex items-start gap-2 text-xs">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/40">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div>
                  <span className="font-bold text-slate-100">{priv.titleMr}: </span>
                  <span className="text-slate-300 text-[11px]">{priv.descMr}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-200">
            <span>VIP विशेषाधिकार:</span>
            <span className="font-black text-amber-400">कायमस्वरूपी अनलॉक (Lifetime)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2 relative z-10">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenVipCenter();
            }}
            className="w-full py-3 px-4 rounded-2xl font-black text-sm tracking-wide bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
          >
            <span>VIP सेंटर पहा</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            नंतर पहा
          </button>
        </div>
      </div>
    </div>
  );
};
