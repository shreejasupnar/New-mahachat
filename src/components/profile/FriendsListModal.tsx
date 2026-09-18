import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  FriendItem, 
  subscribeToFriends, 
  removeFriend 
} from '../../lib/firebase';
import { VipBadge } from '../vip/VipBadge';
import { 
  X, 
  Users, 
  Search, 
  UserMinus, 
  MessageCircle, 
  ShieldAlert, 
  Lock, 
  UserCheck, 
  Loader2,
  MapPin,
  Sparkles
} from 'lucide-react';

interface FriendsListModalProps {
  isOpen: boolean;
  targetUser: UserProfile | null;
  currentUserProfile: UserProfile | null;
  onClose: () => void;
  onStartChat?: (friend: FriendItem) => void;
  onViewProfile?: (friendId: string) => void;
}

export const FriendsListModal: React.FC<FriendsListModalProps> = ({
  isOpen,
  targetUser,
  currentUserProfile,
  onClose,
  onStartChat,
  onViewProfile
}) => {
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [unfriendingId, setUnfriendingId] = useState<string | null>(null);
  const [confirmUnfriend, setConfirmUnfriend] = useState<FriendItem | null>(null);

  const isOwner = currentUserProfile?.uid === targetUser?.uid;
  const isHidden = !isOwner && Boolean(targetUser?.hideFriendsList);

  useEffect(() => {
    if (!isOpen || !targetUser || isHidden) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToFriends(targetUser.uid, (list) => {
      setFriends(list);
      setLoading(false);
    });

    return () => unsub();
  }, [isOpen, targetUser?.uid, isHidden]);

  if (!isOpen || !targetUser) return null;

  const filteredFriends = friends.filter((f) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      f.friendName.toLowerCase().includes(q) ||
      (f.friendDistrict && f.friendDistrict.toLowerCase().includes(q))
    );
  });

  const handleUnfriend = async (friend: FriendItem) => {
    if (!currentUserProfile) return;
    setUnfriendingId(friend.friendId);
    try {
      await removeFriend(currentUserProfile.uid, friend.friendId);
      setConfirmUnfriend(null);
    } catch (err: any) {
      alert('मित्र काढताना त्रुटी: ' + err.message);
    } finally {
      setUnfriendingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-600/20 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 leading-tight">
                  {isOwner ? 'माझे मित्र (My Friends)' : `${targetUser.displayName} यांचे मित्र`}
                </h2>
                {!isHidden && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-black">
                    {friends.length}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {isOwner ? 'तुमच्याशी जोडलेले मित्र' : 'जोडलेली मैत्री'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          {isHidden ? (
            /* Privacy Screen when friends are hidden by user */
            <div className="my-auto py-10 px-6 flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-base">
                  मित्र यादी खाजगी आहे
                </h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  या वापरकर्त्याने त्यांच्या गोपनीयता सेटिंग्जमधून मित्र यादी लपवली आहे.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              {friends.length > 0 && (
                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="मित्राचे नाव किंवा जिल्हा शोधा..."
                    className="w-full pl-9.5 pr-4 py-2 bg-slate-100/90 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Friends List or Empty State */}
              {loading ? (
                <div className="my-auto py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                  <p className="text-xs font-medium">मित्र लोड होत आहेत...</p>
                </div>
              ) : friends.length === 0 ? (
                <div className="my-auto py-10 px-4 flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-sm">
                      अजून कोणताही मित्र जोडलेला नाही.
                    </h3>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                      जिल्हा चॅट किंवा व्हॉइस कट्ट्यावर इतर युझर्सच्या प्रोफाइलवर टॅप करून 'मित्र जोडा' (Add Friend) निवडा!
                    </p>
                  </div>
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                  "{searchQuery}" या नावाने कोणताही मित्र सापडला नाही.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFriends.map((friend) => (
                    <div
                      key={friend.friendId}
                      className="p-3 bg-slate-50/80 hover:bg-slate-100 border border-slate-200/70 rounded-2xl flex items-center justify-between gap-3 transition-colors"
                    >
                      <div 
                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                        onClick={() => onViewProfile && onViewProfile(friend.friendId)}
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-200 ring-2 ring-white shadow-xs">
                            {friend.friendPhoto ? (
                              <img
                                src={friend.friendPhoto}
                                alt={friend.friendName}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-blue-600 bg-blue-50 text-sm">
                                {friend.friendName?.slice(0, 1) || 'U'}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Name & District */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-800 text-xs truncate max-w-[140px]">
                              {friend.friendName}
                            </span>
                            {friend.friendVipLevel && friend.friendVipLevel > 0 ? (
                              <VipBadge level={friend.friendVipLevel} size="xs" />
                            ) : null}
                          </div>
                          {friend.friendDistrict && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-slate-400" />
                              <span className="truncate">{friend.friendDistrict}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions: Unfriend & Chat */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {onStartChat && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onStartChat(friend);
                            }}
                            className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/80 transition-colors cursor-pointer"
                            title="चॅट करा"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => setConfirmUnfriend(friend)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 transition-colors cursor-pointer"
                            title="मित्र काढा (Unfriend)"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Confirmation Dialog for Unfriend */}
        {confirmUnfriend && (
          <div className="p-4 bg-rose-50/95 border-t border-rose-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-rose-900 text-xs font-bold">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                {confirmUnfriend.friendName} यांना मित्र यादीतून काढायचे आहे का?
              </span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmUnfriend(null)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                रद्द करा
              </button>
              <button
                type="button"
                onClick={() => handleUnfriend(confirmUnfriend)}
                disabled={Boolean(unfriendingId)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center gap-1"
              >
                {unfriendingId ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <UserMinus className="w-3 h-3" />
                )}
                <span>मित्र काढा</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            बंद करा (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
