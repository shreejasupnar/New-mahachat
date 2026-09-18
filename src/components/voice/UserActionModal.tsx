import React, { useState, useEffect } from 'react';
import { 
  X, 
  Gift, 
  MicOff, 
  Mic, 
  LogOut, 
  Ban, 
  AlertTriangle, 
  Crown, 
  ShieldCheck, 
  Star,
  UserPlus,
  UserMinus,
  UserCheck,
  Users,
  Loader2
} from 'lucide-react';
import { 
  VoiceParticipant, 
  UserProfile, 
  subscribeIsFriend, 
  addFriend, 
  removeFriend 
} from '../../lib/firebase';
import { VipBadge } from '../vip/VipBadge';
import { getVipTier } from '../../data/vipData';

interface UserActionModalProps {
  user: VoiceParticipant;
  currentUserProfile?: UserProfile | null;
  isCurrentUserHost: boolean;
  isCurrentUserMod: boolean;
  isSelf: boolean;
  onSendGift: (user: VoiceParticipant) => void;
  onToggleRemoteMute?: (user: VoiceParticipant) => void;
  onKickFromSeat?: (user: VoiceParticipant) => void;
  onBanUser?: (user: VoiceParticipant) => void;
  onReportUser: (user: VoiceParticipant) => void;
  onViewFullProfile?: (user: VoiceParticipant) => void;
  onClose: () => void;
}

export const UserActionModal: React.FC<UserActionModalProps> = ({
  user,
  currentUserProfile,
  isCurrentUserHost,
  isCurrentUserMod,
  isSelf,
  onSendGift,
  onToggleRemoteMute,
  onKickFromSeat,
  onBanUser,
  onReportUser,
  onViewFullProfile,
  onClose
}) => {
  if (!user) return null;

  const isSpeaker = user.seatIndex !== null && user.seatIndex !== undefined;
  const canModerate = (isCurrentUserHost || isCurrentUserMod) && !isSelf;

  const [isFriend, setIsFriend] = useState(false);
  const [friendActionLoading, setFriendActionLoading] = useState(false);

  useEffect(() => {
    if (!currentUserProfile || isSelf || !user?.uid) {
      setIsFriend(false);
      return;
    }

    const unsub = subscribeIsFriend(currentUserProfile.uid, user.uid, (status) => {
      setIsFriend(status);
    });

    return () => unsub();
  }, [currentUserProfile?.uid, user?.uid, isSelf]);

  const handleToggleFriend = async () => {
    if (!currentUserProfile || isSelf || !user?.uid) return;

    setFriendActionLoading(true);
    try {
      if (isFriend) {
        await removeFriend(currentUserProfile.uid, user.uid);
      } else {
        await addFriend(
          currentUserProfile.uid,
          {
            displayName: currentUserProfile.displayName || '',
            photoURL: currentUserProfile.photoURL || '',
            district: currentUserProfile.district || '',
            vipLevel: currentUserProfile.vipLevel || 0
          },
          user.uid,
          {
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            district: '',
            vipLevel: user.vipLevel || 0
          }
        );
      }
    } catch (err: any) {
      alert('मित्र जोडताना त्रुटी: ' + err.message);
    } finally {
      setFriendActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-4 text-center">
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="flex flex-col items-center gap-2 -mt-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400/80 p-0.5 shadow-lg shadow-amber-500/20">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center font-bold text-amber-300 text-xl">
                  {user?.displayName?.slice(0, 1) || 'U'}
                </div>
              )}
            </div>

            {user.role === 'host' && (
              <span className="absolute -bottom-1 -right-1 p-1 bg-amber-500 text-slate-950 rounded-full shadow-md">
                <Crown className="w-3.5 h-3.5" />
              </span>
            )}
            {user.role === 'moderator' && (
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full shadow-md">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div>
            <h3 className="font-bold text-white text-base flex items-center justify-center gap-1.5 flex-wrap">
              <span>{user.displayName}</span>
              {user.vipLevel && user.vipLevel > 0 ? (
                <VipBadge level={user.vipLevel} size="sm" />
              ) : user.isPremium ? (
                <span className="text-[10px] px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black rounded-md">VIP</span>
              ) : null}
            </h3>
            <p className="text-xs text-pink-400 font-semibold flex items-center justify-center gap-1 mt-0.5">
              <Star className="w-3 h-3 fill-pink-400" />
              <span>आकर्षक पॉईंट्स: {user.charmScore || 0}</span>
            </p>
            {user.vipLevel && user.vipLevel >= 4 && (
              <div className="mt-1.5 flex items-center justify-center gap-1 px-2 py-0.5 bg-amber-500/15 border border-amber-400/40 rounded-full text-[10px] text-amber-300 font-bold">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>VIP {user.vipLevel}: {user.vipLevel >= 6 ? 'अजिंक्य सुरक्षा (Anti-Kick/Mute)' : 'म्यूट सुरक्षा कवच (Anti-Mute)'}</span>
              </div>
            )}
            {isSpeaker && (
              <p className="text-[11px] text-slate-400 mt-1">
                सीट {user.seatIndex! + 1} वर उपस्थित • {user.isMuted ? 'माइक बंद 🔇' : 'माइक सुरू 🎙️'}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {/* Friend / Unfriend Button */}
          {!isSelf && currentUserProfile && (
            <button
              type="button"
              onClick={handleToggleFriend}
              disabled={friendActionLoading}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                isFriend
                  ? 'bg-emerald-600 hover:bg-rose-600 text-white group shadow-emerald-600/20'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
              }`}
            >
              {friendActionLoading ? (
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

          {/* View Profile & Friends Button */}
          {!isSelf && onViewFullProfile && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewFullProfile(user);
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700/80 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>प्रोफाइल व मित्र पहा (Profile & Friends)</span>
            </button>
          )}

          {/* Send Gift Button */}
          {!isSelf && (
            <button
              onClick={() => {
                onClose();
                onSendGift(user);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-pink-600/30"
            >
              <Gift className="w-4 h-4" />
              <span>भेटवस्तू पाठवा (Send Gift)</span>
            </button>
          )}

          {/* Moderator / Host Controls */}
          {canModerate && isSpeaker && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  onToggleRemoteMute?.(user);
                  onClose();
                }}
                className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
              >
                {user.isMuted ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-red-400" />}
                <span>{user.isMuted ? 'अनम्यूट करा' : 'म्यूट करा'}</span>
              </button>

              <button
                onClick={() => {
                  onKickFromSeat?.(user);
                  onClose();
                }}
                className="py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5 text-amber-400" />
                <span>सीट सोडा सांगा</span>
              </button>
            </div>
          )}

          {canModerate && (
            <button
              onClick={() => {
                onBanUser?.(user);
                onClose();
              }}
              className="w-full py-2 bg-red-950/40 border border-red-500/40 hover:bg-red-900/40 text-red-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Ban className="w-3.5 h-3.5 text-red-400" />
              <span>कट्ट्यावरून बॅन करा (Ban User)</span>
            </button>
          )}

          {/* Report Button */}
          {!isSelf && (
            <button
              onClick={() => {
                onClose();
                onReportUser(user);
              }}
              className="w-full py-2 text-slate-400 hover:text-amber-400 text-xs font-medium flex items-center justify-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>तक्रार नोंदवा (Report)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
