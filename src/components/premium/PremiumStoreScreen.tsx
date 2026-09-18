import React, { useState, useMemo } from 'react';
import { 
  Gift, 
  MessageSquare, 
  Layout, 
  Armchair, 
  Award, 
  Sparkles, 
  UserCheck, 
  Check, 
  Search, 
  ShieldCheck, 
  Calendar,
  Volume2,
  VolumeX,
  Eye,
  Sliders,
  Coins
} from 'lucide-react';
import { UserProfile } from '../../lib/firebase';
import { equipCosmeticItem, toggleEntryEffects } from '../../lib/premiumFirebase';
import { PREMIUM_GIFTS } from '../../premium/data/gifts';
import { PREMIUM_CHAT_BUBBLES } from '../../premium/data/chatBubbles';
import { PREMIUM_SCREEN_FRAMES } from '../../premium/data/screenFrames';
import { PREMIUM_SEAT_FRAMES } from '../../premium/data/seatFrames';
import { PREMIUM_BADGES } from '../../premium/data/badges';
import { PREMIUM_ENTRY_EFFECTS } from '../../premium/data/entryEffects';
import { PREMIUM_PROFILE_EFFECTS } from '../../premium/data/profileEffects';
import { PREMIUM_NAME_EFFECTS } from '../../premium/data/nameEffects';
import { AdminAssetManagerModal } from './AdminAssetManagerModal';

interface PremiumStoreScreenProps {
  currentUser: UserProfile;
  onBack?: () => void;
}

type TabType = 'gifts' | 'bubbles' | 'frames' | 'seatFrames' | 'badges' | 'entry' | 'profileEffects' | 'nameEffects';

export const PremiumStoreScreen: React.FC<PremiumStoreScreenProps> = ({
  currentUser,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('gifts');
  const [searchQuery, setSearchQuery] = useState('');
  const [equippingId, setEquippingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Handle equipping items freely
  const handleEquip = async (
    category: 
      | 'equippedBubble' 
      | 'equippedFrame' 
      | 'equippedSeatFrame' 
      | 'equippedBadge' 
      | 'equippedEntryEffect' 
      | 'equippedProfileEffect' 
      | 'equippedNameEffect',
    itemId: string
  ) => {
    try {
      setEquippingId(itemId);
      await equipCosmeticItem(currentUser.uid, category, itemId);
    } catch (err) {
      console.error('Failed to equip item:', err);
    } finally {
      setEquippingId(null);
    }
  };

  const tabs: Array<{ id: TabType; labelMr: string; count: number; icon: any }> = [
    { id: 'gifts', labelMr: 'गिफ्ट्स', count: PREMIUM_GIFTS.length, icon: Gift },
    { id: 'bubbles', labelMr: 'चॅट बबल्स', count: PREMIUM_CHAT_BUBBLES.length, icon: MessageSquare },
    { id: 'frames', labelMr: 'स्क्रीन फ्रेम्स', count: PREMIUM_SCREEN_FRAMES.length, icon: Layout },
    { id: 'seatFrames', labelMr: 'सीट फ्रेम्स', count: PREMIUM_SEAT_FRAMES.length, icon: Armchair },
    { id: 'badges', labelMr: 'बॅजेस', count: PREMIUM_BADGES.length, icon: Award },
    { id: 'entry', labelMr: 'एंट्री इफेक्ट्स', count: PREMIUM_ENTRY_EFFECTS.length, icon: Sparkles },
    { id: 'profileEffects', labelMr: 'प्रोफाइल ऑरा', count: PREMIUM_PROFILE_EFFECTS.length, icon: UserCheck },
    { id: 'nameEffects', labelMr: 'नाव स्टाईल', count: PREMIUM_NAME_EFFECTS.length, icon: Sliders },
  ];

  return (
    <div className="min-h-full pb-28 bg-slate-50">
      
      {/* Banner Header */}
      <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white p-5 sm:p-6 shadow-md relative overflow-hidden">
        {/* Background Subtle Motif */}
        <div className="absolute right-2 -bottom-6 text-9xl text-white/5 pointer-events-none select-none font-black">
          🎪
        </div>

        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-yellow-200">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>MahaChat कलेक्टिबल्स स्टोअर</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              महाराष्ट्राची डिजिटल संस्कृती व रुबाब
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 max-w-xl mt-1">
              सह्याद्री, गडकोट, पैठणी, वारली आणि सण-उत्सवांची भव्य ३००+ अस्सल मराठमोळी कलेक्टिबल्स सर्वांसाठी उपलब्ध.
            </p>
          </div>

          {/* User Coin Balance & Entry Effect Controls */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 sm:min-w-[240px] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-sm">
                  🪙
                </div>
                <div>
                  <div className="text-[10px] text-yellow-200 font-bold uppercase tracking-wider">नाणी (Coins)</div>
                  <div className="text-sm font-black text-white">{(currentUser.coins || 0).toLocaleString()} कॉइन्स</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 font-bold">
                सक्रिय
              </span>
            </div>

            <div className="pt-2 border-t border-white/15 flex items-center justify-between">
              <button
                type="button"
                onClick={() => toggleEntryEffects(currentUser.uid, !(currentUser.entryEffectsEnabled ?? true))}
                className="text-[11px] text-amber-100 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                {(currentUser.entryEffectsEnabled ?? true) ? <Volume2 className="w-3.5 h-3.5 text-emerald-300" /> : <VolumeX className="w-3.5 h-3.5 text-rose-300" />}
                <span>एंट्री इफेक्ट्स {(currentUser.entryEffectsEnabled ?? true) ? 'चालू' : 'बंद'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Admin Manager Button */}
        {currentUser.isAdmin && (
          <div className="max-w-4xl mx-auto mt-4 pt-3 border-t border-white/10 flex justify-end">
            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              className="text-xs bg-black/30 hover:bg-black/40 text-yellow-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer font-bold"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>अ‍ॅडमिन अ‍ॅसेट मॅनेजमेंट (Admin Control)</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto p-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.labelMr}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">

        {/* 1. GIFTS PREVIEW TAB */}
        {activeTab === 'gifts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-900">महाराष्ट्रीयन भेटवस्तू गॅलरी (Gifts - {PREMIUM_GIFTS.length})</h2>
              <div className="relative w-48 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="गिफ्ट शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <p className="text-xs text-slate-600">
              टीप: ही सर्व गिफ्ट्स कोणत्याही जिल्हा कट्टा किंवा व्हॉईस रूममध्ये थेट पाठवण्यासाठी उपलब्ध आहेत.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {PREMIUM_GIFTS.filter(g => 
                g.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                g.culturalTheme.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((gift) => (
                <div
                  key={gift.id}
                  className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col items-center text-center justify-between gap-2 hover:border-amber-400 transition-colors"
                >
                  <div className="text-4xl my-2">{gift.previewIcon}</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{gift.nameMr}</h4>
                    <p className="text-[10px] text-amber-700 font-semibold">{gift.culturalTheme}</p>
                  </div>
                  <div className="w-full pt-1">
                    <span className="w-full py-1 bg-amber-50 text-amber-800 text-[10px] font-bold rounded-xl block">
                      रूममध्ये पाठवा
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. CHAT BUBBLES TAB */}
        {activeTab === 'bubbles' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-900">महाराष्ट्रीयन चॅट बबल्स ({PREMIUM_CHAT_BUBBLES.length})</h2>
              <div className="relative w-48 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="बबल शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PREMIUM_CHAT_BUBBLES.filter(b => 
                b.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                b.culturalTheme.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((bubble) => {
                const isEquipped = currentUser.equippedBubble === bubble.id;
                return (
                  <div
                    key={bubble.id}
                    className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-slate-900">{bubble.nameMr}</span>
                        <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                          {bubble.culturalTheme}
                        </span>
                      </div>

                      {/* Live Bubble Preview */}
                      <div className={`p-3 rounded-2xl bg-gradient-to-r ${bubble.bgGradient} ${bubble.borderColor} ${bubble.textColor} border text-xs shadow-xs relative`}>
                        <div className="flex items-center gap-1.5 font-bold mb-1 opacity-90 text-[11px]">
                          <span>{bubble.previewIcon}</span>
                          <span>{currentUser.displayName}</span>
                        </div>
                        <p className="font-medium">
                          नमस्कार! हा आमचा {bubble.nameMr.split('(')[0]} चॅट मेसेज आहे.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500">चॅट रूममध्ये दिसेल</span>
                      {isEquipped ? (
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>लागू आहे</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={equippingId === bubble.id}
                          onClick={() => handleEquip('equippedBubble', bubble.id)}
                          className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
                        >
                          निवडा
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. SCREEN FRAMES TAB */}
        {activeTab === 'frames' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-900">स्क्रीन व अवतार फ्रेम्स ({PREMIUM_SCREEN_FRAMES.length})</h2>
              <div className="relative w-48 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="फ्रेम शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PREMIUM_SCREEN_FRAMES.filter(f => 
                f.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                f.culturalTheme.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((frame) => {
                const isEquipped = currentUser.equippedFrame === frame.id;
                return (
                  <div
                    key={frame.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center p-1 relative border-2 ${frame.borderClass} ${frame.glowColor ? 'shadow-md' : ''}`}>
                        <div className="w-full h-full rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 font-black text-base overflow-hidden">
                          {currentUser?.photoURL ? (
                            <img src={currentUser.photoURL} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            currentUser?.displayName?.charAt(0) || 'U'
                          )}
                        </div>
                        {frame.cornerMotif && (
                          <div className="absolute -top-2 -right-2 text-base filter drop-shadow-xs">
                            {frame.cornerMotif}
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{frame.nameMr}</h4>
                        <p className="text-[10px] text-amber-700 font-semibold">{frame.culturalTheme}</p>
                      </div>
                    </div>

                    <div>
                      {isEquipped ? (
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>लागू</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={equippingId === frame.id}
                          onClick={() => handleEquip('equippedFrame', frame.id)}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                          निवडा
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. SEAT FRAMES TAB */}
        {activeTab === 'seatFrames' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-900">व्हॉईस रूम सीट फ्रेम्स ({PREMIUM_SEAT_FRAMES.length})</h2>
              <div className="relative w-48 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="सीट फ्रेम शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PREMIUM_SEAT_FRAMES.filter(sf => 
                sf.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                sf.culturalTheme.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((sf) => {
                const isEquipped = currentUser.equippedSeatFrame === sf.id;
                return (
                  <div
                    key={sf.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex flex-col items-center">
                        <div className="text-sm absolute -top-3 z-10">{sf.crownBadge}</div>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center p-1 bg-slate-900 border-2 ${sf.seatRingClass}`}>
                          <div className="w-full h-full rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                            {currentUser?.photoURL ? (
                              <img
                                src={currentUser.photoURL}
                                alt={currentUser.displayName || 'User'}
                                className="w-full h-full rounded-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              currentUser?.displayName?.charAt(0) || 'U'
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{sf.nameMr}</h4>
                        <p className="text-[10px] text-amber-700 font-semibold">{sf.culturalTheme}</p>
                      </div>
                    </div>

                    <div>
                      {isEquipped ? (
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>लागू</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={equippingId === sf.id}
                          onClick={() => handleEquip('equippedSeatFrame', sf.id)}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                          निवडा
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. BADGES TAB */}
        {activeTab === 'badges' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-900">महाराष्ट्रीयन सांस्कृतिक सन्मान बॅजेस ({PREMIUM_BADGES.length})</h2>
              <div className="relative w-48 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="बॅज शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PREMIUM_BADGES.filter(b => 
                b.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                b.culturalTheme.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((badge) => {
                const isEquipped = currentUser.equippedBadge === badge.id;
                return (
                  <div
                    key={badge.id}
                    className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex flex-col justify-between gap-3 hover:border-amber-400 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl filter drop-shadow-xs">{badge.icon}</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{badge.nameMr}</h4>
                        <span className="text-[10px] text-amber-700 font-semibold">{badge.culturalTheme}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 line-clamp-1">{badge.descriptionMr}</span>
                      {isEquipped ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>लागू</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={equippingId === badge.id}
                          onClick={() => handleEquip('equippedBadge', badge.id)}
                          className="px-3.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                          निवडा
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. ENTRY EFFECTS TAB */}
        {activeTab === 'entry' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-900">भव्य शाही एंट्री इफेक्ट्स ({PREMIUM_ENTRY_EFFECTS.length})</h2>
              <div className="relative w-48 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="इफेक्ट शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PREMIUM_ENTRY_EFFECTS.filter(e => 
                e.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                e.culturalTheme.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((entry) => {
                const isEquipped = currentUser.equippedEntryEffect === entry.id;
                return (
                  <div
                    key={entry.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{entry.previewIcon || entry.icon}</span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{entry.nameMr}</h4>
                            <span className="text-[10px] text-amber-700 font-semibold">{entry.culturalTheme}</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                          {entry.culturalTheme}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between">
                        <span className="text-yellow-300 font-medium">प्रवेश घोषणा:</span>
                        <span className="font-bold text-right truncate max-w-[200px]">{entry.bannerTextMr}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">व्हॉईस रूममध्ये शाही आगमन</span>
                      {isEquipped ? (
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>लागू आहे</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={equippingId === entry.id}
                          onClick={() => handleEquip('equippedEntryEffect', entry.id)}
                          className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                          निवडा
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. PROFILE EFFECTS TAB */}
        {activeTab === 'profileEffects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-900">प्रोफाइल ऑरा व बॅकग्राउंड्स ({PREMIUM_PROFILE_EFFECTS.length})</h2>
              <div className="relative w-48 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ऑरा शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PREMIUM_PROFILE_EFFECTS.filter(pe => 
                pe.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                pe.culturalTheme.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((pe) => {
                const isEquipped = currentUser.equippedProfileEffect === pe.id;
                return (
                  <div
                    key={pe.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-2xl p-1 bg-gradient-to-br ${pe.auraClass} shadow-md flex items-center justify-center text-white text-xl`}>
                        {pe.previewIcon || pe.particleIcon}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{pe.nameMr}</h4>
                        <p className="text-[10px] text-amber-700 font-semibold">{pe.culturalTheme}</p>
                      </div>
                    </div>

                    <div>
                      {isEquipped ? (
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>लागू</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={equippingId === pe.id}
                          onClick={() => handleEquip('equippedProfileEffect', pe.id)}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                          निवडा
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 8. NAME EFFECTS TAB */}
        {activeTab === 'nameEffects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-900">नाव रंगछटा व फॉन्ट इफेक्ट्स ({PREMIUM_NAME_EFFECTS.length})</h2>
              <div className="relative w-48 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="स्टाईल शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PREMIUM_NAME_EFFECTS.filter(ne => 
                ne.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                ne.culturalTheme.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((nameEff) => {
                const isEquipped = currentUser.equippedNameEffect === nameEff.id;
                return (
                  <div
                    key={nameEff.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold mb-1">{nameEff.culturalTheme}</div>
                      {/* Live Name Effect Preview */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{nameEff.badgeSymbol}</span>
                        <span className={`text-base bg-gradient-to-r ${nameEff.gradientStyle} ${nameEff.textShadow}`}>
                          {currentUser.displayName}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isEquipped ? (
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>लागू</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={equippingId === nameEff.id}
                          onClick={() => handleEquip('equippedNameEffect', nameEff.id)}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                          निवडा
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Admin Asset Manager Modal */}
      {showAdminModal && (
        <AdminAssetManagerModal
          onClose={() => setShowAdminModal(false)}
        />
      )}

    </div>
  );
};
