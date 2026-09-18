import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  subscribeIsFriend, 
  addFriend, 
  removeFriend,
  getUserProfile,
  subscribeToFriends
} from '../../lib/firebase';
import { VipBadge } from '../vip/VipBadge';
import { calculateVipStatus } from '../../data/vipData';
import { MAHARASHTRA_DISTRICTS } from '../../data/districts';
import { 
  X, 
  UserPlus, 
  UserMinus, 
  UserCheck, 
  Users, 
  Lock, 
  MapPin, 
  Gift, 
  MessageCircle, 
  AlertTriangle,
  Loader2,
  Sparkles,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { FriendsListModal } from './FriendsListModal';

interface UserProfileCardModalProps {
  isOpen: boolean;
  targetUserId: string | null;
  targetInitialData?: {
    displayName: string;
    photoURL?: string;
    district?: string;
    vipLevel?: number;
  };
  currentUserProfile: UserProfile | null;
  onClose: () => void;
  onSendGift?: (user: UserProfile) => void;
  onStartChat?: (user: UserProfile) => void;
  onReport?: (user: UserProfile) => void;
}

export const UserProfileCardModal: React.FC<UserProfileCardModalProps> = ({
  isOpen,
  targetUserId,
  targetInitialData,
  currentUserProfile,
  onClose,
  onSendGift,
  onStartChat,
  onReport
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friendsCount, setFriendsCount] = useState<number>(0);

  // Load target user profile
  useEffect(() => {
    if (!isOpen || !targetUserId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    getUserProfile(targetUserId).then((data) => {
      if (!isMounted) return;
      if (data) {
        setProfile(data);
        setFriendsCount(data.friendsCount || 0);
      } else if (targetInitialData) {
        // Fallback to initial provided data
        setProfile({
          uid: targetUserId,
          displayName: targetInitialData.displayName,
          photoURL: targetInitialData.photoURL || '',
          district: targetInitialData.district || '',
          vipLevel: targetInitialData.vipLevel || 0,
          createdAt: null,
          lastActive: null,
          isOnline: true
        });
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, targetUserId, targetInitialData]);

  // Listen to friendship status
  useEffect(() => {
    if (!isOpen || !currentUserProfile || !targetUserId) {
      setIsFriend(false);
      return;
    }

    const unsub = subscribeIsFriend(currentUserProfile.uid, targetUserId, (status) => {
      setIsFriend(status);
    });

    return () => unsub();
  }, [isOpen, currentUserProfile?.uid, targetUserId]);

  // Also listen to target user's friends count if not hidden
  useEffect(() => {
    if (!isOpen || !targetUserId || profile?.hideFriendsList) return;

    const unsub = subscribeToFriends(targetUserId, (friends) => {
      setFriendsCount(friends.length);
    });

    return () => unsub();
  }, [isOpen, targetUserId, profile?.hideFriendsList]);

  if (!isOpen || !targetUserId) return null;

  const isSelf = currentUserProfile?.uid === targetUserId;
  const isPrivate = Boolean(profile?.isProfilePrivate && !isSelf && !isFriend);
  const isFriendsHidden = Boolean(profile?.hideFriendsList && !isSelf);

  const targetDistrict = MAHARASHTRA_DISTRICTS.find((d) => d.id === profile?.district);

  const handleToggleFriend = async () => {
    if (!currentUserProfile || !profile || isSelf) return;

    setActionLoading(true);
    try {
      if (isFriend) {
        await removeFriend(currentUserProfile.uid, profile.uid);
      } else {
        await addFriend(
          currentUserProfile.uid,
          {
            displayName: currentUserProfile.displayName || '',
            photoURL: currentUserProfile.photoURL || '',
            district: currentUserProfile.district || '',
            vipLevel: currentUserProfile.vipLevel || 0
          },
          profile.uid,
          {
            displayName: profile.displayName || '',
            photoURL: profile.photoURL || '',
            district: profile.district || '',
            vipLevel: profile.vipLevel || 0
          }
        );
      }
    } catch (err: any) {
      alert('मैत्री कृतीमध्ये त्रुटी: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in select-none">
        <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-4 text-center text-white relative">
          {/* Close button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              <p className="text-xs text-slate-400">प्रोफाइल लोड होत आहे...</p>
            </div>
          ) : profile ? (
            <>
              {/* Avatar and Badges */}
              <div className="flex flex-col items-center gap-2 -mt-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-400/80 p-0.5 shadow-lg shadow-blue-500/20 bg-slate-800">
                    {profile.photoURL ? (
                      <img
                        src={profile.photoURL}
                        alt={profile.displayName}
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center font-bold text-blue-300 text-2xl">
                        {profile.displayName?.slice(0, 1) || 'U'}
                      </div>
                    )}
                  </div>

                  {profile.vipLevel && profile.vipLevel > 0 ? (
                    <span className="absolute -bottom-1 -right-1 p-0.5 bg-amber-500 rounded-full shadow-md">
                      <VipBadge level={profile.vipLevel} size="xs" />
                    </span>
                  ) : null}
                </div>

                <div>
                  <h3 className="font-bold text-white text-base flex items-center justify-center gap-1.5 flex-wrap">
                    <span>{profile.displayName}</span>
                    {profile.vipLevel && profile.vipLevel > 0 ? (
                      <VipBadge level={profile.vipLevel} size="sm" />
                    ) : null}
                  </h3>

                  {/* District badge */}
                  <div className="mt-1 flex items-center justify-center gap-1 text-xs text-blue-300 font-semibold">
                    <MapPin className="w-3 h-3 text-blue-400" />
                    <span>{targetDistrict ? targetDistrict.nameMr : profile.district || 'महाराष्ट्र'}</span>
                  </div>

                  {/* Private Profile Notice or Bio */}
                  {isPrivate ? (
                    <div className="mt-2.5 px-3 py-1.5 bg-purple-950/40 border border-purple-500/30 rounded-xl flex items-center justify-center gap-1.5 text-xs text-purple-300">
                      <Lock className="w-3.5 h-3.5 text-purple-400" />
                      <span>खाजगी प्रोफाइल (Private Profile)</span>
                    </div>
                  ) : profile.bio ? (
                    <p className="mt-2 text-xs text-slate-300 italic bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 max-w-[240px] mx-auto line-clamp-2">
                      "{profile.bio}"
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Friends Count Badge Button */}
              <div className="pt-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (!isFriendsHidden) {
                      setShowFriendsModal(true);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isFriendsHidden
                      ? 'bg-slate-800 text-slate-400 cursor-default border border-slate-700'
                      : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 cursor-pointer active:scale-95'
                  }`}
                  title={isFriendsHidden ? 'मित्र यादी खाजगी ठेवली आहे' : 'मित्रांची यादी पहा'}
                >
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {isFriendsHidden ? 'मित्र यादी खाजगी' : `${friendsCount} मित्र (Friends)`}
                  </span>
                </button>
              </div>

              {/* Primary Interaction Buttons: Friend / Unfriend */}
              <div className="space-y-2 pt-1">
                {!isSelf && (
                  <button
                    type="button"
                    onClick={handleToggleFriend}
                    disabled={actionLoading}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                      isFriend
                        ? 'bg-emerald-600 hover:bg-rose-600 hover:text-white text-white group shadow-emerald-600/20'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                    }`}
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isFriend ? (
                      <>
                        <UserCheck className="w-4 h-4 group-hover:hidden" />
                        <UserMinus className="w-4 h-4 hidden group-hover:inline-block" />
                        <span className="group-hover:hidden">✓ मित्र आहात (Friends)</span>
                        <span className="hidden group-hover:inline-block">मित्र काढा (Unfriend)</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>मित्र जोडा (Add Friend)</span>
                      </>
                    )}
                  </button>
                )}

                {/* Send Gift Button */}
                {!isSelf && onSendGift && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSendGift(profile);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-pink-600/20 cursor-pointer"
                  >
                    <Gift className="w-4 h-4" />
                    <span>भेटवस्तू पाठवा (Send Gift)</span>
                  </button>
                )}

                {/* Direct Chat Button */}
                {!isSelf && onStartChat && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onStartChat(profile);
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-blue-400" />
                    <span>चॅट करा (Direct Chat)</span>
                  </button>
                )}

                {/* Report User */}
                {!isSelf && onReport && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onReport(profile);
                    }}
                    className="w-full py-1.5 text-slate-400 hover:text-amber-400 text-xs font-medium flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>तक्रार नोंदवा (Report)</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="py-6 text-xs text-slate-400">
              वापरकर्ता सापडला नाही.
            </div>
          )}
        </div>
      </div>

      {/* Friends List Modal for Target User */}
      {showFriendsModal && profile && (
        <FriendsListModal
          isOpen={showFriendsModal}
          targetUser={profile}
          currentUserProfile={currentUserProfile}
          onClose={() => setShowFriendsModal(false)}
        />
      )}
    </>
  );
};
