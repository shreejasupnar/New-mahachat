import React, { useState, useEffect } from 'react';
import { UserProfile, saveUserProfile, signOutUser, unblockUser, subscribeToFriends, FriendItem } from '../lib/firebase';
import { MAHARASHTRA_DISTRICTS } from '../data/districts';
import { DistrictIcon } from './DistrictIcon';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Bell, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Camera, 
  ShieldCheck, 
  Check, 
  X,
  Loader2,
  Ban,
  Crown,
  Coins,
  Sparkles,
  Users,
  Lock,
  Globe,
  History,
  Gift
} from 'lucide-react';
import { VipBadge } from './vip/VipBadge';
import { RechargeModal } from './vip/RechargeModal';
import { calculateVipStatus } from '../data/vipData';
import { PrivacySettingsModal } from './profile/PrivacySettingsModal';
import { FriendsListModal } from './profile/FriendsListModal';
import { TransactionHistoryModal } from './wallet/TransactionHistoryModal';
import { AdminGiftManagerModal } from './admin/AdminGiftManagerModal';

interface ProfileScreenProps {
  profile: UserProfile | null;
  onBack: () => void;
  onSignOut: () => void;
  onOpenVipCenter?: () => void;
}

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onBack,
  onSignOut,
  onOpenVipCenter
}) => {
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showPrivacySettingsModal, setShowPrivacySettingsModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [showAdminGiftModal, setShowAdminGiftModal] = useState(false);
  const [friends, setFriends] = useState<FriendItem[]>([]);

  useEffect(() => {
    if (!profile?.uid) return;
    const unsub = subscribeToFriends(profile.uid, (list) => {
      setFriends(list);
    });
    return () => unsub();
  }, [profile?.uid]);

  // Edit states
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || AVATARS[0]);
  const [saving, setSaving] = useState(false);

  const vipStatus = calculateVipStatus(
    profile?.vipExp || 0,
    profile?.coins || 0,
    profile?.subscriptionAmount || 0
  );

  const currentDistrict = MAHARASHTRA_DISTRICTS.find(d => d.id === profile?.district);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      await saveUserProfile(profile.uid, {
        displayName: displayName.trim() || profile.displayName,
        bio: bio.trim(),
        photoURL
      });
      setShowEditInfoModal(false);
    } catch (e: any) {
      alert('माहिती सेव्ह करण्यात अडचण आली: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangeDistrict = async (newDistrictId: string) => {
    if (!profile) return;
    setSaving(true);
    try {
      await saveUserProfile(profile.uid, {
        district: newDistrictId
      });
      setShowDistrictModal(false);
    } catch (e: any) {
      alert('जिल्हा बदलताना त्रुटी: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUnblock = async (targetUid: string) => {
    if (!profile) return;
    try {
      await unblockUser(profile.uid, targetUid, profile.blockedUsers || []);
      alert('युझर अनब्लॉक केला गेला आहे.');
    } catch (e: any) {
      alert('त्रुटी: ' + e.message);
    }
  };

  return (
    <div id="profile-screen" className="flex-1 flex flex-col bg-slate-100/80 min-h-screen pb-24 select-none">
      {/* Top Header matching Mockup Screen 7 */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3.5 flex items-center gap-3 shadow-[0_2px_12px_rgba(15,23,42,0.03)] glossy-top-edge">
        <button
          id="profile-back-button"
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer border border-slate-200/60 shadow-xs active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-black text-slate-900 leading-tight">
          माझा प्रोफाइल (My Profile)
        </h1>
      </header>

      {/* Main Profile Area matching Mockup Screen 7 */}
      <div className="flex-1 p-4 max-w-md mx-auto w-full space-y-4">
        {/* User Avatar & Name Center Card */}
        <div className="card-glossy rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Large Avatar with camera icon */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-blue-500/30 shadow-[0_4px_16px_rgba(37,99,235,0.2)] bg-slate-100">
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-black text-blue-600 bg-blue-50">
                  {profile?.displayName?.slice(0, 1) || 'U'}
                </div>
              )}
            </div>

            {/* Camera badge matching Mockup Screen 7 */}
            <button
              type="button"
              onClick={() => setShowEditInfoModal(true)}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md hover:from-blue-500 hover:to-indigo-500 active:scale-90 transition-all border-2 border-white cursor-pointer"
              title="फोटो बदला"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* User Display Name */}
          <h2 className="mt-3 text-xl font-black text-slate-900">
            {profile?.displayName || 'वापरकर्ता'}
          </h2>

          {/* District badge matching Screen 7 */}
          <div className="mt-1.5 flex items-center gap-1.5 px-3.5 py-1 bg-blue-50/90 text-blue-700 rounded-full text-xs font-bold border border-blue-200/80 shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentDistrict ? `${currentDistrict.nameMr} (${currentDistrict.nameEn})` : 'जिल्हा निवडलेला नाही'}</span>
          </div>

          {profile?.bio && (
            <p className="mt-3 text-xs text-slate-600 max-w-xs leading-relaxed italic bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-200/60">
              "{profile.bio}"
            </p>
          )}

          {/* Friends & Privacy Status Quick Bar */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 w-full flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowFriendsModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50/80 hover:bg-blue-100 border border-blue-200/70 text-blue-800 transition-all cursor-pointer active:scale-95 group shadow-2xs"
              title="माझे सर्व मित्र पहा"
            >
              <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                {friends.slice(0, 3).map((f) => (
                  <div key={f.friendId} className="w-5 h-5 rounded-full ring-2 ring-white overflow-hidden bg-slate-200">
                    {f.friendPhoto ? (
                      <img src={f.friendPhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="w-full h-full bg-blue-500 text-[8px] text-white flex items-center justify-center font-black">
                        {f.friendName?.slice(0, 1) || 'U'}
                      </span>
                    )}
                  </div>
                ))}
                {friends.length === 0 && (
                  <div className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center">
                    <Users className="w-3 h-3" />
                  </div>
                )}
              </div>
              <span className="text-xs font-black">
                {friends.length} मित्र (Friends)
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Privacy Setting Badge Button */}
            <button
              type="button"
              onClick={() => setShowPrivacySettingsModal(true)}
              className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
              title="गोपनीयता सेटिंग्ज बदला"
            >
              {profile?.hideFriendsList ? (
                <>
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span className="text-amber-700 font-black">मित्र गुप्त</span>
                </>
              ) : profile?.isProfilePrivate ? (
                <>
                  <Lock className="w-3 h-3 text-purple-600" />
                  <span className="text-purple-700 font-black">खाजगी</span>
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-black">सार्वजनिक</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* VIP Membership & Coins Wallet Card */}
        <div 
          className="rounded-3xl p-4.5 border shadow-xl relative overflow-hidden text-white"
          style={{
            background: vipStatus.currentTier
              ? `linear-gradient(135deg, ${vipStatus.currentTier.primaryColor}E6, #0F172A)`
              : 'linear-gradient(135deg, #1E293B, #0F172A)',
            borderColor: vipStatus.currentTier ? vipStatus.currentTier.accentColor : '#334155'
          }}
        >
          {/* Ambient Glow */}
          <div 
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-40"
            style={{ background: vipStatus.currentTier?.glowColor || '#F59E0B' }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-yellow-300 shadow-inner">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-white">
                      {vipStatus.currentTier ? vipStatus.currentTier.nameMr : 'VIP सदस्यत्व'}
                    </span>
                    {vipStatus.level > 0 ? (
                      <VipBadge level={vipStatus.level} size="xs" />
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 font-bold">
                        Non-VIP
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-amber-300 font-bold mt-0.5">
                    {vipStatus.currentTier ? vipStatus.currentTier.titleMr : 'विशेष दर्जा व सुविधा अनलॉक करा'}
                  </div>
                </div>
              </div>

              {/* VIP Center Button */}
              {onOpenVipCenter && (
                <button
                  type="button"
                  onClick={onOpenVipCenter}
                  className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>VIP सेंटर</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* EXP Progress */}
            <div className="mt-3.5 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-xs mb-1 font-bold">
                <span className="text-slate-300">
                  VIP EXP: <strong className="text-amber-400">{vipStatus.exp.toLocaleString()}</strong>
                </span>
                <span className="text-amber-300 text-[10px]">
                  {vipStatus.nextTier 
                    ? `पुढील ${vipStatus.nextTier.badgeCode} साठी ${vipStatus.nextTier.requiredExp - vipStatus.exp} EXP बाकी`
                    : 'सर्वोच्च VIP स्तर गाठला'}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
                <div 
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300"
                  style={{ width: `${vipStatus.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Coins Balance & Recharge Action */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-slate-300 font-bold">शिल्लक:</span>
                <span className="text-base font-black text-yellow-400">
                  {(profile?.coins || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-yellow-200">Coins</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id="profile-wallet-history-btn"
                  onClick={() => setShowLedgerModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 text-xs font-bold border border-white/15 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                  title="व्यवहार नोंदवही (Ledger)"
                >
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span>इतिहास</span>
                </button>

                <button
                  type="button"
                  id="profile-recharge-btn"
                  onClick={() => setShowRechargeModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>रिचार्ज करा</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Menu List matching Mockup Screen 7 */}
        <div className="card-glossy rounded-3xl p-2 divide-y divide-slate-100">
          {/* माझी माहिती (Personal Info) */}
          <button
            id="profile-info-button"
            type="button"
            onClick={() => setShowEditInfoModal(true)}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/80 active:scale-[0.99] transition-all rounded-2xl cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs border border-blue-100">
                <User className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">माझी माहिती</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* जिल्हा निवड (Change District) */}
          <button
            id="profile-district-button"
            type="button"
            onClick={() => setShowDistrictModal(true)}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/80 active:scale-[0.99] transition-all rounded-2xl cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs border border-amber-100">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition-colors">जिल्हा निवड</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-blue-600">
                {currentDistrict?.nameMr || 'निवडा'}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* माझे मित्र (My Friends) */}
          <button
            id="profile-friends-button"
            type="button"
            onClick={() => setShowFriendsModal(true)}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/80 active:scale-[0.99] transition-all rounded-2xl cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs border border-blue-100">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors block">
                  माझे मित्र (Friends)
                </span>
                <span className="text-[11px] text-slate-400 font-medium block">
                  तुमच्याशी जोडलेले मित्र व यादी
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-blue-700 font-black bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {friends.length} मित्र
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* नोटिफिकेशन्स */}
          <button
            id="profile-notifications-button"
            type="button"
            onClick={() => alert('सूचना: नवीन मेसेज व जिल्ह्यांच्या गप्पांचे नोटिफिकेशन्स सुरू आहेत.')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/80 active:scale-[0.99] transition-all rounded-2xl cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs border border-indigo-100">
                <Bell className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">नोटिफिकेशन्स</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">सुरू</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* सेटिंग्ज व गोपनीयता (Settings & Privacy) */}
          <button
            id="profile-settings-button"
            type="button"
            onClick={() => setShowPrivacySettingsModal(true)}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/80 active:scale-[0.99] transition-all rounded-2xl cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs border border-slate-200">
                <Settings className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-800 text-sm group-hover:text-slate-900 transition-colors block">
                  सेटिंग्ज व गोपनीयता (Settings)
                </span>
                <span className="text-[11px] text-slate-400 font-medium block">
                  {profile?.hideFriendsList ? 'मित्र यादी गुप्त ठेवली आहे' : profile?.isProfilePrivate ? 'खाजगी प्रोफाइल सक्रिय' : 'मित्र गोपनीयता व प्रोफाइल सेटिंग्ज'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile?.hideFriendsList && (
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> गुप्त
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* मदत व समर्थन */}
          <button
            id="profile-help-button"
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/80 active:scale-[0.99] transition-all rounded-2xl cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs border border-sky-100">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 text-sm group-hover:text-sky-600 transition-colors">मदत व समर्थन</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* ब्लॉक केलेले युजर्स */}
          <button
            id="profile-blocked-button"
            type="button"
            onClick={() => setShowBlockedModal(true)}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/80 active:scale-[0.99] transition-all rounded-2xl cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs border border-rose-100">
                <Ban className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 text-sm group-hover:text-rose-600 transition-colors">तक्रार व ब्लॉक केलेले युजर्स</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">
                {profile?.blockedUsers?.length || 0}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* कॉइन वॉलेट व व्यवहार नोंदवही (Coins & Ledger) */}
          <button
            id="profile-wallet-ledger-menu-button"
            type="button"
            onClick={() => setShowLedgerModal(true)}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/80 active:scale-[0.99] transition-all rounded-2xl cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs border border-amber-100">
                <History className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition-colors block">
                  कॉइन पाकीट व व्यवहार नोंदवही
                </span>
                <span className="text-[11px] text-slate-400 font-medium block">
                  सर्व रिचार्ज, गिफ्ट्स व कॉइन शिल्लक इतिहास
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-amber-700 font-black bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                🪙 {(profile?.coins || 0).toLocaleString()}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* गिफ्ट कॅटलॉग व्यवस्थापन (Admin Console) */}
          <button
            id="profile-admin-gift-menu-button"
            type="button"
            onClick={() => setShowAdminGiftModal(true)}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/80 active:scale-[0.99] transition-all rounded-2xl cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs border border-purple-100">
                <Gift className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-800 text-sm group-hover:text-purple-600 transition-colors block">
                  गिफ्ट कॅटलॉग व्यवस्थापन (Admin)
                </span>
                <span className="text-[11px] text-slate-400 font-medium block">
                  कॅटलॉग दर, नवीन भेटवस्तू व ग्लोबल ऑडिट
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                व्यवस्थापक
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* लॉगआउट matching Mockup Screen 7 (Red color) */}
          <button
            id="profile-logout-button"
            type="button"
            onClick={onSignOut}
            className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-red-50/80 text-red-600 font-black text-sm active:scale-[0.99] transition-all rounded-2xl cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs border border-red-100">
              <LogOut className="w-5 h-5" />
            </div>
            <span>लॉगआउट (Sign Out)</span>
          </button>
        </div>
      </div>

      {/* Edit Info Modal */}
      {showEditInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">माहिती संपादित करा</h3>
              <button onClick={() => setShowEditInfoModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInfo} className="space-y-3">
              {/* Avatar choices */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">अवतार निवडा</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoURL(url)}
                      className={`w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 ${
                        photoURL === url ? 'border-blue-600 ring-2 ring-blue-300' : 'border-slate-200'
                      }`}
                    >
                      <img src={url} alt="av" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">नाव</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">बायो</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'जतन करा (Save)'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change District Modal */}
      {showDistrictModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">तुमचा जिल्हा बदला</h3>
              <button onClick={() => setShowDistrictModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {MAHARASHTRA_DISTRICTS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleChangeDistrict(d.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                    profile?.district === d.id
                      ? 'bg-blue-600 text-white font-bold'
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <DistrictIcon type={d.iconType} size={18} color={profile?.district === d.id ? '#ffffff' : d.color} />
                    <span>{d.nameMr} ({d.nameEn})</span>
                  </div>
                  {profile?.district === d.id && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Blocked Users Modal */}
      {showBlockedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">ब्लॉक केलेले वापरकर्ते</h3>
              <button onClick={() => setShowBlockedModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(!profile?.blockedUsers || profile.blockedUsers.length === 0) ? (
              <p className="text-xs text-slate-500 text-center py-6">
                तुम्ही कोणालाही ब्लॉक केलेले नाही.
              </p>
            ) : (
              <div className="space-y-2">
                {profile.blockedUsers.map((uid) => (
                  <div key={uid} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl text-xs">
                    <span className="text-slate-700 truncate font-mono">User: {uid.slice(0, 8)}...</span>
                    <button
                      type="button"
                      onClick={() => handleUnblock(uid)}
                      className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg text-[10px]"
                    >
                      अनब्लॉक करा
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">मदत व MahaChat नियम</h3>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p className="font-bold text-slate-800">
                १. अस्सल डेटा आणि खरी मैत्री:
              </p>
              <p>MahaChat मध्ये कोणतेही फेक युझर्स किंवा बनावट मेसेज नसतात. सर्व संभाषणे महाराष्ट्रातील खऱ्या नागरिकांची असतात.</p>

              <p className="font-bold text-slate-800">
                २. आदरयुक्त संवाद:
              </p>
              <p>कोणत्याही प्रकारचा अपशब्द, असभ्य भाषा किंवा गैरवर्तन आढळल्यास त्वरित ब्लॉक किंवा रिपोर्ट करा.</p>

              <p className="font-bold text-slate-800">
                ३. संपर्क व समर्थन:
              </p>
              <p>काही समस्या असल्यास support@mahachat.online वर संपर्क साधा.</p>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs"
            >
              ठीक आहे
            </button>
          </div>
        </div>
      )}

      {/* Friends List Modal */}
      {showFriendsModal && profile && (
        <FriendsListModal
          isOpen={showFriendsModal}
          targetUser={profile}
          currentUserProfile={profile}
          onClose={() => setShowFriendsModal(false)}
        />
      )}

      {/* Privacy Settings Modal */}
      {showPrivacySettingsModal && profile && (
        <PrivacySettingsModal
          isOpen={showPrivacySettingsModal}
          profile={profile}
          onClose={() => setShowPrivacySettingsModal(false)}
        />
      )}

      {/* Recharge Modal */}
      {profile && (
        <RechargeModal
          isOpen={showRechargeModal}
          currentUser={profile}
          onClose={() => setShowRechargeModal(false)}
          onOpenVipCenter={onOpenVipCenter}
        />
      )}

      {/* Transaction History Ledger Modal */}
      {profile && showLedgerModal && (
        <TransactionHistoryModal
          isOpen={showLedgerModal}
          currentUser={profile}
          onClose={() => setShowLedgerModal(false)}
          onOpenRecharge={() => {
            setShowLedgerModal(false);
            setShowRechargeModal(true);
          }}
        />
      )}

      {/* Admin Gift Catalog Manager Modal */}
      {profile && showAdminGiftModal && (
        <AdminGiftManagerModal
          isOpen={showAdminGiftModal}
          currentUserUid={profile.uid}
          onClose={() => setShowAdminGiftModal(false)}
        />
      )}
    </div>
  );
};
