import React, { useState, useEffect } from 'react';
import { MAHARASHTRA_DISTRICTS, District } from '../data/districts';
import { DistrictIcon } from './DistrictIcon';
import { MahaChatLogo } from './MahaChatLogo';
import { db, UserProfile } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { AdvertisementSlot, AdminAdsManagerModal } from '../ads';
import { 
  Bell, 
  Search, 
  ChevronRight, 
  Sparkles, 
  Mic, 
  Radio, 
  MessageSquare,
  ArrowRight,
  Coins,
  Crown
} from 'lucide-react';
import { VipBadge } from './vip/VipBadge';
import { RechargeModal } from './vip/RechargeModal';
import { calculateVipStatus } from '../data/vipData';

interface HomeScreenProps {
  currentUserProfile: UserProfile | null;
  onSelectDistrict: (districtId: string) => void;
  onNavigateTab: (tab: any) => void;
  onOpenNotifications: () => void;
  onOpenVoiceRoom: (districtId: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentUserProfile,
  onSelectDistrict,
  onNavigateTab,
  onOpenNotifications,
  onOpenVoiceRoom
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [districtOnlineCounts, setDistrictOnlineCounts] = useState<Record<string, number>>({});
  const [showAdsAdmin, setShowAdsAdmin] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const vipStatus = calculateVipStatus(
    currentUserProfile?.vipExp || 0,
    currentUserProfile?.coins || 0,
    currentUserProfile?.subscriptionAmount || 0
  );

  // Real-time listener for actual active users count per district
  // STRICT RULE: No fake numbers! Honest counts from real database query.
  useEffect(() => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('isOnline', '==', true));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const counts: Record<string, number> = {};
        const now = Date.now();

        snapshot.forEach((doc) => {
          const data = doc.data() as UserProfile;
          if (data.district) {
            const lastActiveMs = data.lastActive?.toMillis 
              ? data.lastActive.toMillis() 
              : (data.lastActive?.seconds ? data.lastActive.seconds * 1000 : 0);
            
            // Only count if active within the last 5 minutes (real presence)
            if (!lastActiveMs || (now - lastActiveMs) < 300000) {
              counts[data.district] = (counts[data.district] || 0) + 1;
            }
          }
        });
        setDistrictOnlineCounts(counts);
      }, (err) => {
        console.warn('Presence listener notice:', err);
      });

      return () => unsubscribe();
    } catch (e) {
      // Fallback
    }
  }, []);

  const userDistrictObj = MAHARASHTRA_DISTRICTS.find(
    (d) => d.id === currentUserProfile?.district
  );

  // Featured 8 key districts for home screen grid matching mockup
  const featuredDistricts = MAHARASHTRA_DISTRICTS.filter((d) => 
    ['pune', 'mumbai_city', 'nagpur', 'chhatrapati_sambhajinagar', 'nashik', 'kolhapur', 'thane', 'solapur'].includes(d.id)
  );

  return (
    <div id="home-screen" className="flex-1 flex flex-col bg-slate-100/80 min-h-screen pb-24 select-none">
      {/* App Bar matching Mockup Screen 3 */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-[0_2px_12px_rgba(15,23,42,0.03)] glossy-top-edge">
        {/* Brand with authentic MahaChat visual */}
        <div className="flex items-center gap-2.5">
          <MahaChatLogo size={36} showText={false} />
          <div>
            <span className="text-xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent tracking-tight leading-none block">
              MahaChat
            </span>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wide">
              महाराष्ट्र चॅट
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Direct shortcut to Voice Rooms */}
          <button
            id="header-voice-shortcut-button"
            type="button"
            onClick={() => onNavigateTab('voice')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-blue-200/80 shadow-[0_2px_8px_-2px_rgba(37,99,235,0.15)] active:scale-95"
            title="लाईव्ह व्हॉईस कट्टा (Live Voice Rooms)"
          >
            <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span className="hidden xs:inline">व्हॉईस कट्टा</span>
          </button>

          <button
            id="notifications-button"
            type="button"
            onClick={onOpenNotifications}
            className="w-9 h-9 rounded-full bg-slate-100/90 hover:bg-slate-200/90 text-slate-600 flex items-center justify-center transition-all relative cursor-pointer border border-slate-200/60 shadow-xs active:scale-95"
          >
            <Bell className="w-4 h-4" />
            <span className="sr-only">Notifications</span>
          </button>

          {/* Coins Wallet & Recharge shortcut */}
          <button
            id="header-coins-recharge-button"
            type="button"
            onClick={() => setShowRechargeModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 text-amber-900 border border-amber-300/80 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
            title="नाणी रिचार्ज करा (Coin Recharge)"
          >
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>{(currentUserProfile?.coins || 0).toLocaleString()}</span>
            <span className="text-[10px] text-amber-800 bg-amber-200/80 px-1 rounded font-bold">+</span>
          </button>

          <button
            id="header-profile-button"
            type="button"
            onClick={() => onNavigateTab('profile')}
            className="w-9 h-9 rounded-full ring-2 ring-blue-500/80 ring-offset-2 ring-offset-white overflow-hidden bg-blue-100 shrink-0 cursor-pointer shadow-sm active:scale-95 transition-transform"
            title="माझा प्रोफाइल / My Profile"
          >
            {currentUserProfile?.photoURL ? (
              <img
                src={currentUserProfile.photoURL}
                alt={currentUserProfile.displayName || 'Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-blue-600 text-xs">
                {currentUserProfile?.displayName?.slice(0, 1) || 'M'}
              </div>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-4 max-w-lg mx-auto w-full space-y-4">
        {/* User's Home District Shortcut Card */}
        {userDistrictObj && (
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-3xl p-4 text-white shadow-[0_10px_25px_-5px_rgba(29,78,216,0.35)] border border-blue-400/30 glossy-top-edge">
            <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-inner shrink-0">
                <DistrictIcon type={userDistrictObj.iconType} size={28} color="#FFFFFF" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-blue-200 font-semibold tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>तुमचा स्वतःचा जिल्हा • Your District</span>
                </div>
                <div className="text-base sm:text-lg font-black truncate drop-shadow-xs">{userDistrictObj.nameMr}</div>
                <div className="text-xs text-blue-100 truncate flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  <span>
                    {districtOnlineCounts[userDistrictObj.id] 
                      ? `${districtOnlineCounts[userDistrictObj.id]} ऑनलाइन वापरकर्ते`
                      : 'अजून कोणी ऑनलाइन नाही • पहिले व्हा'}
                  </span>
                </div>
              </div>
            </div>

            {/* TWO DIRECT 1-TAP ACTION BUTTONS: Text Chat & Voice Room */}
            <div className="relative z-10 mt-3 pt-3 border-t border-white/20 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onSelectDistrict(userDistrictObj.id)}
                className="py-2.5 px-3 bg-white/15 hover:bg-white/25 active:scale-[0.97] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer backdrop-blur-md border border-white/25 shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-200" />
                <span>चॅट रूम</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenVoiceRoom(userDistrictObj.id)}
                className="py-2.5 px-3 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 active:scale-[0.97] text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(245,158,11,0.3)] transition-all cursor-pointer border border-amber-300/60"
              >
                <Radio className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
                <span>व्हॉईस रूम (८ सीट्स)</span>
              </button>
            </div>
          </div>
        )}

        {/* HIGH-VISIBILITY VOICE ROOMS PROMINENT DISCOVERY BANNER */}
        <div
          onClick={() => onNavigateTab('voice')}
          className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-4 text-white border border-indigo-500/30 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.6)] cursor-pointer hover:border-indigo-400/60 transition-all duration-300 group glossy-dark-top-edge"
        >
          <div className="absolute top-0 right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                ८ सीट्स व्हॉईस कट्टा
              </span>
            </div>
            <span className="text-[11px] bg-blue-500/20 text-cyan-300 border border-cyan-400/30 px-2.5 py-0.5 rounded-full font-bold shadow-xs">
              थेट ऑडिओ
            </span>
          </div>

          <div className="relative z-10 mt-2.5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                जिल्हा व्हॉईस रूम्स (Live Audio)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 max-w-[240px] leading-relaxed">
                प्रत्येक जिल्ह्यासाठी ८ सीट्सची ऑडिओ रूम • थेट बोला व ऐका!
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-transform shrink-0">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div className="relative z-10 mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">सर्व ३६ जिल्ह्यांचे कट्टे उपलब्ध</span>
            <span className="text-cyan-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>कट्टे पहा</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* VIP CENTER SPOTLIGHT CARD */}
        <div 
          onClick={() => onNavigateTab('vip')}
          className="relative overflow-hidden rounded-3xl p-4 text-white border shadow-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all group"
          style={{
            background: vipStatus.currentTier 
              ? `linear-gradient(135deg, ${vipStatus.currentTier.primaryColor}E6, #0F172A)`
              : 'linear-gradient(135deg, #18122B, #0F0E17)',
            borderColor: vipStatus.currentTier ? vipStatus.currentTier.accentColor : '#D97706'
          }}
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-yellow-300 shadow-inner group-hover:scale-105 transition-transform">
                <Crown className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">
                    VIP केंद्र (VIP Center)
                  </h3>
                  {vipStatus.level > 0 && (
                    <VipBadge level={vipStatus.level} size="xs" />
                  )}
                </div>
                <p className="text-xs text-amber-200/90 mt-0.5 font-medium">
                  {vipStatus.currentTier 
                    ? `सध्याचा स्तर: ${vipStatus.currentTier.nameMr} (${vipStatus.exp.toLocaleString()} EXP)`
                    : 'राजेशाही विशेषाधिकार, सीट फ्रेम्स व चॅट बबल्स'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-black text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>पहा</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* PERMANENT DIGITAL ADVERTISEMENT SLOT / CAROUSEL */}
        <AdvertisementSlot onOpenAdmin={() => setShowAdsAdmin(true)} />

        {/* Section: जिल्हे निवडा (Select District) matching Mockup Screen 3 */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>जिल्हे निवडा</span>
              <span className="text-xs font-normal text-slate-600 bg-slate-200/80 px-2.5 py-0.5 rounded-full border border-slate-300/40">
                प्रमुख जिल्हे
              </span>
            </h2>
            <button
              id="view-all-districts-button"
              type="button"
              onClick={() => onNavigateTab('districts')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer active:scale-95 transition-transform"
            >
              <span>सर्व (All 36)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid of Districts matching Mockup Screen 3 (2 columns) with direct Voice shortcut */}
          <div className="grid grid-cols-2 gap-3">
            {featuredDistricts.map((district) => {
              const count = districtOnlineCounts[district.id] || 0;
              return (
                <div
                  key={district.id}
                  id={`district-card-${district.id}`}
                  className="card-glossy rounded-2xl p-3 flex flex-col justify-between group"
                >
                  <div 
                    onClick={() => onSelectDistrict(district.id)}
                    className="flex items-start gap-2.5 cursor-pointer"
                  >
                    {/* Landmark Icon */}
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-xs border border-white/50"
                      style={{ backgroundColor: `${district.color}18` }}
                    >
                      <DistrictIcon type={district.iconType} color={district.color} size={22} />
                    </div>

                    {/* Name & Online Status */}
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                        {district.nameMr}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate font-medium">
                        {district.nameEn}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${count > 0 ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-slate-400'}`} />
                        <span className={`text-[10px] truncate ${count > 0 ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                          {count > 0 ? `${count} ऑनलाइन` : '० ऑनलाइन'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dual Actions: 💬 Chat & 🎙️ Voice */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectDistrict(district.id)}
                      className="flex-1 py-1.5 px-2 bg-slate-100/80 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer active:scale-95 border border-slate-200/50"
                    >
                      चॅट
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenVoiceRoom(district.id)}
                      className="py-1.5 px-2.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer active:scale-95 border border-blue-200/60 shadow-xs"
                      title="व्हॉईस रूम (८ सीट्स)"
                    >
                      <Radio className="w-3 h-3" />
                      <span>कट्टा</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cultural Trivia & Safety Note */}
        <div className="bg-gradient-to-r from-amber-50/90 to-orange-50/90 backdrop-blur-md border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-3 shadow-xs glossy-top-edge-subtle">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-black text-amber-950">MahaChat नियम:</span> सर्व ३६ जिल्ह्यांतील बांधवांशी आदराने बोला. खरी ओळख आणि अस्सल माहिती हीच आपली संस्कृती आहे.
          </div>
        </div>
      </div>

      {/* Admin Ads Manager Modal */}
      {showAdsAdmin && (
        <AdminAdsManagerModal onClose={() => setShowAdsAdmin(false)} />
      )}

      {/* Recharge Modal */}
      {currentUserProfile && (
        <RechargeModal
          isOpen={showRechargeModal}
          currentUser={currentUserProfile}
          onClose={() => setShowRechargeModal(false)}
          onOpenVipCenter={() => {
            setShowRechargeModal(false);
            onNavigateTab('vip');
          }}
        />
      )}
    </div>
  );
};
