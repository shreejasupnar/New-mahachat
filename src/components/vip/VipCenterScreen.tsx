import React, { useState } from 'react';
import { 
  Crown, 
  Sparkles, 
  Coins, 
  ArrowLeft, 
  ShieldCheck, 
  Check, 
  Lock, 
  ArrowRight, 
  ChevronRight,
  Gift,
  Mic,
  MessageSquare,
  Armchair,
  Award
} from 'lucide-react';
import { UserProfile } from '../../lib/firebase';
import { VIP_TIERS, calculateVipStatus, getVipTier } from '../../data/vipData';
import { VipBadge } from './VipBadge';
import { VipSeatFrameOverlay } from './VipSeatFrameOverlay';
import { VipEntryNoticeBanner } from './VipEntryNoticeBanner';
import { RechargeModal } from './RechargeModal';

interface VipCenterScreenProps {
  currentUser: UserProfile;
  onBack: () => void;
  onOpenRecharge?: () => void;
}

type PreviewTab = 'seat' | 'bubble' | 'entry' | 'badge';

export const VipCenterScreen: React.FC<VipCenterScreenProps> = ({
  currentUser,
  onBack,
  onOpenRecharge
}) => {
  const vipStatus = calculateVipStatus(
    currentUser.vipExp || 0,
    currentUser.coins || 0,
    currentUser.subscriptionAmount || 0
  );

  // Selected VIP level to view in carousel / tabs (defaults to user's level or VIP 1)
  const [selectedLevel, setSelectedLevel] = useState<number>(
    vipStatus.level > 0 ? vipStatus.level : 1
  );
  const [previewTab, setPreviewTab] = useState<PreviewTab>('seat');
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const selectedTier = getVipTier(selectedLevel) || VIP_TIERS[0];
  const isUnlocked = vipStatus.level >= selectedLevel;

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-white min-h-screen pb-24 select-none">
      
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            id="vip-back-button"
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-all cursor-pointer border border-slate-700 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white leading-tight flex items-center gap-2">
              <span>VIP केंद्र (VIP Center)</span>
              <Crown className="w-4 h-4 text-yellow-400" />
            </h1>
            <p className="text-[10px] text-amber-300 font-semibold">
              विशेषाधिकार व प्रतिष्ठा मंच
            </p>
          </div>
        </div>

        {/* Quick Wallet Action */}
        <button
          type="button"
          onClick={() => setShowRechargeModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer transition-all"
        >
          <Coins className="w-4 h-4" />
          <span>{(currentUser.coins || 0).toLocaleString()}</span>
          <span className="bg-stone-950 text-amber-300 text-[10px] px-1 rounded font-bold">+</span>
        </button>
      </header>

      {/* Main Scrollable Body */}
      <div className="flex-1 p-4 max-w-md mx-auto w-full space-y-4">
        
        {/* User Current VIP Membership Card */}
        <div 
          className="relative rounded-3xl p-5 overflow-hidden border shadow-2xl"
          style={{
            background: vipStatus.currentTier 
              ? `linear-gradient(135deg, ${vipStatus.currentTier.primaryColor}30, #0F172A 80%)`
              : 'linear-gradient(135deg, #1E293B, #0F172A)',
            borderColor: vipStatus.currentTier ? vipStatus.currentTier.accentColor : '#334155'
          }}
        >
          {/* Subtle Ambient Glow */}
          <div 
            className="absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-30"
            style={{ background: vipStatus.currentTier?.glowColor || '#64748B' }}
          />

          <div className="relative z-10">
            {/* Top row: Avatar + Name + VIP Level */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div 
                    className="w-14 h-14 rounded-full overflow-hidden border-2 shadow-lg bg-slate-800"
                    style={{ borderColor: vipStatus.currentTier?.accentColor || '#64748B' }}
                  >
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt={currentUser.displayName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-300">
                        {currentUser.displayName.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  {vipStatus.level > 0 && (
                    <div className="absolute -bottom-1 -right-1">
                      <VipBadge level={vipStatus.level} size="xs" showText={false} />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base font-black text-white truncate max-w-[140px]">
                      {currentUser.displayName}
                    </h2>
                    {vipStatus.level > 0 && (
                      <VipBadge level={vipStatus.level} size="xs" />
                    )}
                  </div>
                  <div className="text-xs text-amber-300 font-bold mt-0.5">
                    {vipStatus.currentTier ? vipStatus.currentTier.titleMr : 'सामान्य सदस्य (Non-VIP)'}
                  </div>
                </div>
              </div>

              {/* Recharge Shortcut Button */}
              <button
                type="button"
                onClick={() => setShowRechargeModal(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 text-xs font-black shadow-md hover:brightness-110 active:scale-95 cursor-pointer transition-all flex items-center gap-1"
              >
                <span>रिचार्ज</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* EXP Progress Bar Area */}
            <div className="mt-4 pt-3 border-t border-slate-700/60">
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-slate-300">
                  VIP अनुभव गुण (EXP): <strong className="text-amber-400">{vipStatus.exp.toLocaleString()}</strong>
                </span>
                <span className="text-amber-300 text-[11px]">
                  {vipStatus.nextTier 
                    ? `पुढील ${vipStatus.nextTier.badgeCode} साठी ${vipStatus.nextTier.requiredExp - vipStatus.exp} EXP बाकी`
                    : 'सर्वोच्च शिखर साध्य! 🎉'}
                </span>
              </div>

              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700 p-0.5 relative">
                <div 
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300"
                  style={{ width: `${vipStatus.progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                <span>{vipStatus.currentTier?.badgeCode || 'VIP 0'}</span>
                <span>{vipStatus.progressPercent}% पूर्ण</span>
                <span>{vipStatus.nextTier?.badgeCode || 'MAX'}</span>
              </div>
            </div>

            {/* Razorpay Coin Recharge Info Banner */}
            <div className="mt-3 pt-2.5 border-t border-slate-700/40 flex items-center justify-between">
              <div className="text-xs text-amber-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] text-slate-300">
                  सर्व नाणी <strong className="text-amber-300">Razorpay</strong> द्वारे सुरक्षित खरेदी करा
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowRechargeModal(true)}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 text-[11px] font-black cursor-pointer active:scale-95 shadow-xs shadow-amber-500/20"
              >
                नाणी खरेदी करा
              </button>
            </div>
          </div>
        </div>

        {/* VIP Level Carousel / Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              VIP स्तर निवडा (VIP Levels)
            </span>
            <span className="text-[11px] text-amber-400 font-bold">
              VIP 1 ते VIP 8
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {VIP_TIERS.map((tier) => {
              const isCurrent = tier.level === selectedLevel;
              const hasUnlocked = vipStatus.level >= tier.level;

              return (
                <button
                  key={tier.level}
                  type="button"
                  onClick={() => setSelectedLevel(tier.level)}
                  className={`shrink-0 px-3.5 py-2.5 rounded-2xl flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-b from-amber-500/25 to-slate-900 border-amber-400 ring-2 ring-amber-400/40 shadow-lg scale-105'
                      : hasUnlocked
                      ? 'bg-slate-900/90 border-slate-700 text-slate-200 hover:border-slate-500'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <VipBadge level={tier.level} size="xs" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 whitespace-nowrap mt-0.5">
                    {tier.nameMr}
                  </span>
                  <span className="text-[9px] text-amber-300/80 font-mono">
                    {tier.requiredExp.toLocaleString()} EXP
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected VIP Tier Details Card */}
        <div 
          className="rounded-3xl p-5 border shadow-xl relative overflow-hidden"
          style={{
            background: `linear-gradient(145deg, ${selectedTier.primaryColor}20, #0B0F19 70%)`,
            borderColor: selectedTier.cardBorder
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <VipBadge level={selectedTier.level} size="md" />
              <div>
                <h3 className="text-base font-black text-white">
                  {selectedTier.nameMr} ({selectedTier.nameEn})
                </h3>
                <div className="text-xs text-amber-300 font-semibold">
                  अपेक्षित रिचार्ज: <strong>₹{selectedTier.requiredExp.toLocaleString()} / {selectedTier.requiredExp.toLocaleString()} EXP</strong>
                </div>
              </div>
            </div>

            {isUnlocked ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-black flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>अनलॉक</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>लॉक</span>
              </span>
            )}
          </div>

          {/* Interactive Live Preview Box */}
          <div className="mt-4 bg-slate-950/80 rounded-2xl p-4 border border-slate-800">
            {/* Preview Tabs */}
            <div className="flex items-center justify-around border-b border-slate-800 pb-2 mb-3 text-xs font-bold text-slate-400">
              <button
                type="button"
                onClick={() => setPreviewTab('seat')}
                className={`flex items-center gap-1 pb-1 transition-colors cursor-pointer ${
                  previewTab === 'seat' ? 'text-amber-400 border-b-2 border-amber-400' : 'hover:text-slate-200'
                }`}
              >
                <Armchair className="w-3.5 h-3.5" />
                <span>सीट फ्रेम</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewTab('bubble')}
                className={`flex items-center gap-1 pb-1 transition-colors cursor-pointer ${
                  previewTab === 'bubble' ? 'text-amber-400 border-b-2 border-amber-400' : 'hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>चॅट बबल</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewTab('entry')}
                className={`flex items-center gap-1 pb-1 transition-colors cursor-pointer ${
                  previewTab === 'entry' ? 'text-amber-400 border-b-2 border-amber-400' : 'hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>शाही आगमन</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewTab('badge')}
                className={`flex items-center gap-1 pb-1 transition-colors cursor-pointer ${
                  previewTab === 'badge' ? 'text-amber-400 border-b-2 border-amber-400' : 'hover:text-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>बॅज</span>
              </button>
            </div>

            {/* Preview Tab Content */}
            <div className="min-h-[100px] flex items-center justify-center p-2 relative">
              {previewTab === 'seat' && (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-18 h-18 rounded-full bg-slate-900 flex items-center justify-center">
                    <img 
                      src={currentUser.photoURL || '/icon.png'} 
                      alt="Avatar" 
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <VipSeatFrameOverlay vipLevel={selectedLevel} isSpeaking={true} />
                  </div>
                  <span className="text-[11px] text-slate-400 font-bold">
                    व्हॉईस रूम कट्ट्यावरील सीट फ्रेम
                  </span>
                </div>
              )}

              {previewTab === 'bubble' && (
                <div className="w-full max-w-xs space-y-2">
                  <div className={`p-3 rounded-2xl border shadow-md text-xs ${selectedTier.bubbleClass}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-bold text-white text-[11px]">{currentUser.displayName}</span>
                      <VipBadge level={selectedLevel} size="xs" />
                    </div>
                    <p className="leading-relaxed">
                      जय महाराष्ट्र! हे VIP {selectedLevel} चे खास राजेशाही चॅट बबल आहे. 🚩
                    </p>
                  </div>
                </div>
              )}

              {previewTab === 'entry' && (
                <div className="w-full max-w-xs">
                  <VipEntryNoticeBanner
                    vipLevel={selectedLevel}
                    userName={currentUser.displayName}
                    userPhoto={currentUser.photoURL}
                    durationMs={999999}
                  />
                </div>
              )}

              {previewTab === 'badge' && (
                <div className="flex flex-col items-center gap-2">
                  <VipBadge level={selectedLevel} size="lg" />
                  <span className="text-xs text-amber-300 font-black">
                    {selectedTier.titleMr}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    सर्व मेसेज व प्रोफाइलवर कायमस्वरूपी दिसेल
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Privileges Grid for this Level */}
          <div className="mt-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-yellow-400" />
              <span>या स्तराचे सर्व विशेषाधिकार ({selectedTier.privileges.length})</span>
            </h4>

            <div className="space-y-2">
              {selectedTier.privileges.map((priv) => (
                <div 
                  key={priv.id}
                  className={`p-3 rounded-2xl border flex items-start gap-3 transition-all ${
                    isUnlocked
                      ? 'bg-slate-900/90 border-slate-700/80 text-white'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-xs text-xs font-bold"
                    style={{
                      background: isUnlocked ? `${selectedTier.primaryColor}30` : '#1E293B',
                      borderColor: isUnlocked ? selectedTier.accentColor : '#334155',
                      color: isUnlocked ? selectedTier.accentColor : '#94A3B8'
                    }}
                  >
                    {priv.iconName === 'crown' && <Crown className="w-4 h-4" />}
                    {priv.iconName === 'badge' && <Award className="w-4 h-4" />}
                    {priv.iconName === 'seat' && <Armchair className="w-4 h-4" />}
                    {priv.iconName === 'bubble' && <MessageSquare className="w-4 h-4" />}
                    {priv.iconName === 'entry' && <Sparkles className="w-4 h-4" />}
                    {priv.iconName === 'gift' && <Gift className="w-4 h-4" />}
                    {priv.iconName === 'shield' && <ShieldCheck className="w-4 h-4" />}
                    {priv.iconName === 'mic' && <Mic className="w-4 h-4" />}
                    {priv.iconName === 'sparkles' && <Sparkles className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${isUnlocked ? 'text-white' : 'text-slate-300'}`}>
                        {priv.titleMr}
                      </span>
                      {isUnlocked ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      {priv.descMr}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Extra Stats summary: Multiplier + Daily Coins */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">गिफ्ट चार्म मल्टीप्लायर</div>
                <div className="text-sm font-black text-amber-400 mt-0.5">
                  {selectedTier.charmMultiplier}x पॉवर
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">VIP वैधता</div>
                <div className="text-sm font-black text-emerald-400 mt-0.5">
                  कायमस्वरूपी (Lifetime)
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Button */}
          <div className="mt-5">
            {isUnlocked ? (
              <button
                type="button"
                onClick={() => {
                  alert(`अभिनंदन! VIP ${selectedLevel} चे सर्व विशेषाधिकार तुमच्या खात्यावर सक्रिय आहेत.`);
                }}
                className="w-full py-3 px-4 rounded-2xl font-black text-sm tracking-wide bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>विशेषाधिकार सक्रिय आहेत (Active)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowRechargeModal(true)}
                className="w-full py-3 px-4 rounded-2xl font-black text-sm tracking-wide bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Coins className="w-4 h-4" />
                <span>
                  VIP {selectedLevel} मिळवण्यासाठी रिचार्ज करा ({selectedTier.requiredExp - vipStatus.exp} EXP बाकी)
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Recharge Modal */}
      <RechargeModal
        isOpen={showRechargeModal}
        currentUser={currentUser}
        onClose={() => setShowRechargeModal(false)}
        onSuccess={(newLevel) => {
          setSelectedLevel(newLevel > 0 ? newLevel : 1);
        }}
      />
    </div>
  );
};
