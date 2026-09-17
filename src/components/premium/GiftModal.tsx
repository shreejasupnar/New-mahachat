import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Gift, 
  Search, 
  Send, 
  Check, 
  Sparkles, 
  Users, 
  UserCheck,
  CheckSquare, 
  Square, 
  Mic, 
  Crown, 
  Radio, 
  Loader2 
} from 'lucide-react';
import { PREMIUM_GIFTS } from '../../premium/data/gifts';
import { PremiumGift } from '../../premium/types';
import { UserProfile } from '../../lib/firebase';
import { sendRealRoomGift } from '../../lib/premiumFirebase';
import { celebrationAudio } from '../../lib/celebrationAudio';
import { seatGiftFlightManager } from '../voice/SeatGiftFlightAnimation';
import { getVipTier } from '../../data/vipData';

export interface RoomRecipientOption {
  uid: string;
  displayName: string;
  photoURL?: string;
  role?: 'host' | 'speaker' | 'listener' | 'audience' | string;
  seatIndex?: number | null;
  seatLabel?: string;
  isSpeaking?: boolean;
}

interface GiftModalProps {
  districtId: string;
  districtNameMr: string;
  currentUser: UserProfile;
  realRoomUsers: Array<RoomRecipientOption | { uid: string; displayName: string; photoURL?: string }>;
  initialRecipientUid?: string | null;
  onClose: () => void;
  onGiftSent?: (gift: PremiumGift, recipient: { uid: string; displayName: string }) => void;
}

export const GiftModal: React.FC<GiftModalProps> = ({
  districtId,
  districtNameMr,
  currentUser,
  realRoomUsers,
  initialRecipientUid,
  onClose,
  onGiftSent
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('सर्व');
  const [giftSearchQuery, setGiftSearchQuery] = useState('');
  const [showGiftSearch, setShowGiftSearch] = useState(false);
  const [selectedGift, setSelectedGift] = useState<PremiumGift>(PREMIUM_GIFTS[0]);
  const [multiplier, setMultiplier] = useState<number>(6);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recipient selection mode: 'all' = send to all in room, 'custom' = choose specific user(s)
  const [recipientMode, setRecipientMode] = useState<'all' | 'custom'>(() => {
    if (initialRecipientUid && initialRecipientUid !== 'room_broadcast') {
      return 'custom';
    }
    return 'all';
  });

  // Filter for available users list
  const [userTabFilter, setUserTabFilter] = useState<'all' | 'speakers' | 'audience'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Normalize list of room members excluding current user
  const availableUsers = useMemo(() => {
    const list: RoomRecipientOption[] = [];
    const seenUids = new Set<string>();

    realRoomUsers.forEach((u) => {
      if (u.uid && u.uid !== currentUser.uid && !seenUids.has(u.uid)) {
        seenUids.add(u.uid);
        const opt = u as RoomRecipientOption;
        const isOnStage = opt.seatIndex !== undefined && opt.seatIndex !== null;
        const isHost = opt.seatIndex === 0 || opt.role === 'host';

        let seatLabel = opt.seatLabel;
        if (!seatLabel) {
          if (isHost) {
            seatLabel = '👑 आसन १ (होस्ट)';
          } else if (isOnStage) {
            seatLabel = `🎙️ आसन ${opt.seatIndex! + 1} (वक्ता)`;
          } else {
            seatLabel = '🎧 श्रोता (Audience)';
          }
        }

        list.push({
          uid: u.uid,
          displayName: u.displayName || 'कट्टा सदस्य',
          photoURL: u.photoURL,
          role: opt.role || (isHost ? 'host' : (isOnStage ? 'speaker' : 'audience')),
          seatIndex: opt.seatIndex,
          seatLabel,
          isSpeaking: opt.isSpeaking
        });
      }
    });

    return list;
  }, [realRoomUsers, currentUser.uid]);

  // Selected recipient UIDs when in 'custom' mode
  const [selectedRecipientUids, setSelectedRecipientUids] = useState<string[]>(() => {
    if (initialRecipientUid && initialRecipientUid !== 'room_broadcast') {
      return [initialRecipientUid];
    }
    if (availableUsers.length > 0) {
      return [availableUsers[0].uid];
    }
    return [];
  });

  // Filtered available users based on tab and search
  const filteredUsers = useMemo(() => {
    return availableUsers.filter((u) => {
      const isSpeaker = u.seatIndex !== undefined && u.seatIndex !== null;
      if (userTabFilter === 'speakers' && !isSpeaker) return false;
      if (userTabFilter === 'audience' && isSpeaker) return false;

      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase();
        const matchName = u.displayName.toLowerCase().includes(q);
        const matchSeat = u.seatLabel ? u.seatLabel.toLowerCase().includes(q) : false;
        if (!matchName && !matchSeat) return false;
      }
      return true;
    });
  }, [availableUsers, userTabFilter, userSearchQuery]);

  // Quick select all or deselect all
  const areAllFilteredSelected = filteredUsers.length > 0 && filteredUsers.every((u) => selectedRecipientUids.includes(u.uid));

  const toggleSelectAllFiltered = () => {
    if (areAllFilteredSelected) {
      // Deselect filtered
      const filteredSet = new Set(filteredUsers.map((u) => u.uid));
      setSelectedRecipientUids((prev) => prev.filter((id) => !filteredSet.has(id)));
    } else {
      // Select all filtered
      const newSet = new Set(selectedRecipientUids);
      filteredUsers.forEach((u) => newSet.add(u.uid));
      setSelectedRecipientUids(Array.from(newSet));
    }
  };

  const toggleUserSelection = (uid: string) => {
    setSelectedRecipientUids((prev) => {
      if (prev.includes(uid)) {
        return prev.filter((id) => id !== uid);
      } else {
        return [...prev, uid];
      }
    });
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    PREMIUM_GIFTS.forEach((g) => set.add(g.culturalTheme));
    return ['सर्व', ...Array.from(set)];
  }, []);

  const filteredGifts = useMemo(() => {
    return PREMIUM_GIFTS.filter((g) => {
      const matchCat = selectedCategory === 'सर्व' || g.culturalTheme === selectedCategory;
      const matchSearch =
        !giftSearchQuery ||
        g.nameMr.toLowerCase().includes(giftSearchQuery.toLowerCase()) ||
        g.nameEn.toLowerCase().includes(giftSearchQuery.toLowerCase()) ||
        g.culturalTheme.toLowerCase().includes(giftSearchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, giftSearchQuery]);

  // Execute Sending
  const handleSend = async () => {
    setError(null);

    if (recipientMode === 'custom' && selectedRecipientUids.length === 0) {
      setError('कृपया भेट स्वीकारण्यासाठी किमान एक सदस्य निवडा किंवा "सर्व सदस्य" निवडा.');
      return;
    }

    setSending(true);

    try {
      if (recipientMode === 'all') {
        // Broadcast gift to entire room
        const broadcastRecipient = {
          uid: 'room_broadcast',
          displayName: 'सर्व कट्टा सदस्य (All Members)',
          photoURL: ''
        };

        // 1. Trigger broadcast flight animation (flies to all occupied stage seats)
        seatGiftFlightManager.triggerFlight({
          giftIcon: selectedGift.previewIcon || '🎁',
          giftName: selectedGift.nameMr,
          multiplier: multiplier,
          recipientUid: undefined,
          recipientName: 'सर्व कट्टा सदस्य',
          senderUid: currentUser.uid,
          isBroadcast: true
        });

        // 2. Play celebratory fanfare audio
        celebrationAudio.playGiftFanfare();

        if (onGiftSent) {
          onGiftSent(selectedGift, broadcastRecipient);
        }

        // Close modal smoothly
        onClose();

        // 3. Persist broadcast gift event to Firestore
        await sendRealRoomGift(districtId, selectedGift.id, currentUser, broadcastRecipient, multiplier);
      } else {
        // Send to specifically chosen member(s)
        const targetUsers = availableUsers.filter((u) => selectedRecipientUids.includes(u.uid));

        if (targetUsers.length === 0) {
          setError('निवडलेले सदस्य सापडले नाहीत.');
          setSending(false);
          return;
        }

        // 1. Trigger seat-targeted flight animation for each selected recipient
        targetUsers.forEach((user, idx) => {
          setTimeout(() => {
            seatGiftFlightManager.triggerFlight({
              giftIcon: selectedGift.previewIcon || '🎁',
              giftName: selectedGift.nameMr,
              multiplier: multiplier,
              recipientUid: user.uid,
              recipientName: user.displayName,
              senderUid: currentUser.uid,
              targetSeatIndex: user.seatIndex !== null && user.seatIndex !== undefined ? user.seatIndex : undefined,
              isBroadcast: false
            });
          }, idx * 100);
        });

        // 2. Play celebratory audio chime
        celebrationAudio.playGiftFanfare();

        if (onGiftSent && targetUsers.length > 0) {
          onGiftSent(selectedGift, targetUsers[0]);
        }

        // Close modal smoothly
        onClose();

        // 3. Persist gift events in Firestore for each recipient
        await Promise.all(
          targetUsers.map((user) =>
            sendRealRoomGift(
              districtId,
              selectedGift.id,
              currentUser,
              {
                uid: user.uid,
                displayName: user.displayName,
                photoURL: user.photoURL
              },
              multiplier
            )
          )
        );
      }
    } catch (err: any) {
      console.warn('Gift send error:', err);
      setError(err.message || 'भेट पाठवताना समस्या आली.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* High-fidelity Bottom Sheet Drawer Tray */}
      <div
        className="w-full max-w-lg h-[84vh] max-h-[640px] bg-slate-950/98 backdrop-blur-2xl border-t border-amber-500/40 rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden text-white animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drag Handle */}
        <div className="w-10 h-1 rounded-full bg-white/25 mx-auto mt-2 shrink-0" />

        {/* 1. Modal Header */}
        <div className="px-3.5 py-2 flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 via-orange-500 to-pink-600 flex items-center justify-center shadow-xs">
              <Gift className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-white">भेटवस्तू (Gifts)</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  ५५+ सांस्कृतिक भेटवस्तू
                </span>
                {currentUser.vipLevel && currentUser.vipLevel >= 1 && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-yellow-300 font-black border border-yellow-400/50 flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5 text-yellow-400" />
                    <span>VIP {currentUser.vipLevel} ({getVipTier(currentUser.vipLevel)?.charmMultiplier || 1}x चार्म)</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="btn-toggle-gift-search"
              onClick={() => setShowGiftSearch(!showGiftSearch)}
              className={`p-1 rounded-full transition-colors ${
                showGiftSearch ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="गिफ्ट शोधा"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              id="btn-close-gift-modal"
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional gift quick search bar */}
        {showGiftSearch && (
          <div className="px-3 py-1.5 bg-white/5 border-b border-white/10 shrink-0">
            <input
              type="text"
              id="input-search-gifts"
              placeholder="गिफ्ट शोधा... (उदा. फेटा, पेढा, तुतारी, तलवार, सिंहासन)"
              value={giftSearchQuery}
              onChange={(e) => setGiftSearchQuery(e.target.value)}
              className="w-full px-2.5 py-1 bg-slate-900 border border-white/10 rounded-lg text-xs text-white placeholder-slate-400 outline-hidden focus:border-amber-400"
              autoFocus
            />
          </div>
        )}

        {/* 2. RECIPIENT CHOOSING SECTION */}
        <div className="bg-slate-900/90 border-b border-white/10 shrink-0 flex flex-col">
          {/* Mode Switcher Buttons */}
          <div className="p-2 flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 shrink-0 mr-0.5">भेट कोणाला:</span>

            {/* Option 1: Send to All Users Present in Room */}
            <button
              type="button"
              id="btn-recipient-mode-all"
              onClick={() => setRecipientMode('all')}
              className={`flex-1 py-1.5 px-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all border ${
                recipientMode === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-300 shadow-md ring-1 ring-amber-400/50'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>🚩 सर्व सदस्य (All in Room)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/30 text-amber-200 font-black">
                {availableUsers.length > 0 ? `${availableUsers.length} सदस्य` : 'संपूर्ण रूम'}
              </span>
            </button>

            {/* Option 2: Choose Available Users */}
            <button
              type="button"
              id="btn-recipient-mode-custom"
              onClick={() => {
                setRecipientMode('custom');
                if (selectedRecipientUids.length === 0 && availableUsers.length > 0) {
                  setSelectedRecipientUids([availableUsers[0].uid]);
                }
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all border ${
                recipientMode === 'custom'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-pink-400 shadow-md ring-1 ring-pink-400/50'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-pink-200" />
              <span>👥 उपलब्ध सदस्य निवडा</span>
              {availableUsers.length > 0 && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/30 text-pink-200 font-black">
                  {selectedRecipientUids.length > 0 ? `${selectedRecipientUids.length} निवडले` : `${availableUsers.length}`}
                </span>
              )}
            </button>
          </div>

          {/* Sub-view: When 'ALL in Room' is selected */}
          {recipientMode === 'all' && (
            <div className="px-3 pb-2 pt-0.5 flex items-center justify-between text-[10px] text-amber-200/90 bg-amber-500/10 border-t border-amber-500/20">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🚩</span>
                <span>संपूर्ण कट्टा भेट: स्टेजवरील सर्व वक्ते आणि श्रोत्यांना एकाच वेळी भेट पोहोचेल!</span>
              </div>
              <span className="font-bold text-amber-300 shrink-0">रूम ब्रॉडकास्ट</span>
            </div>
          )}

          {/* Sub-view: When 'Custom Users' is chosen */}
          {recipientMode === 'custom' && (
            <div className="px-2.5 pb-2 pt-1 border-t border-white/10 flex flex-col gap-1.5 bg-black/20">
              {/* Filter tabs & Search row */}
              <div className="flex items-center justify-between gap-1 text-[10px]">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setUserTabFilter('all')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                      userTabFilter === 'all' ? 'bg-pink-500 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    सर्व ({availableUsers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserTabFilter('speakers')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                      userTabFilter === 'speakers' ? 'bg-pink-500 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    🎙️ वक्ते ({availableUsers.filter((u) => u.seatIndex !== null && u.seatIndex !== undefined).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserTabFilter('audience')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                      userTabFilter === 'audience' ? 'bg-pink-500 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    🎧 श्रोते ({availableUsers.filter((u) => u.seatIndex === null || u.seatIndex === undefined).length})
                  </button>
                </div>

                {filteredUsers.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleSelectAllFiltered}
                    className="text-[9px] font-bold text-amber-300 hover:text-amber-200 cursor-pointer flex items-center gap-1"
                  >
                    {areAllFilteredSelected ? (
                      <>
                        <CheckSquare className="w-3 h-3 text-amber-300" />
                        <span>काहीही नको</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-3 h-3 text-amber-300" />
                        <span>सर्व निवडा</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Horizontal Scrollable Room Users Cards */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 min-h-[58px]">
                {filteredUsers.length === 0 ? (
                  <div className="py-2 text-[10px] text-slate-400 text-center w-full">
                    {availableUsers.length === 0
                      ? 'सध्या रूममध्ये इतर सदस्य नाहीत. तुम्ही "सर्व सदस्य" निवडून रूमला भेट देऊ शकता.'
                      : 'या श्रेणीत कोणताही सदस्य सापडला नाही.'}
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedRecipientUids.includes(user.uid);
                    return (
                      <button
                        key={user.uid}
                        type="button"
                        onClick={() => toggleUserSelection(user.uid)}
                        className={`flex items-center gap-2 px-2 py-1 rounded-xl cursor-pointer transition-all shrink-0 border select-none text-left ${
                          isSelected
                            ? 'bg-gradient-to-r from-pink-600/30 to-purple-600/40 border-pink-400 shadow-xs ring-1 ring-pink-400'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="relative shrink-0">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.displayName}
                              className="w-7 h-7 rounded-full object-cover border border-white/20"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center font-bold text-[10px] text-white">
                              {user.displayName.charAt(0)}
                            </div>
                          )}
                          {user.isSpeaking && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900 animate-pulse" />
                          )}
                        </div>

                        <div className="min-w-0 pr-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-bold text-white truncate max-w-[90px]">
                              {user.displayName}
                            </span>
                            {isSelected && <Check className="w-3 h-3 text-pink-300 shrink-0" />}
                          </div>
                          <span className="text-[9px] text-amber-300 font-semibold block truncate">
                            {user.seatLabel || 'सदस्य'}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Category Pills Strip */}
        <div className="px-3 py-1 flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0 border-b border-white/5 text-[10px] bg-slate-950">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 4. Compact Gift Grid (Scrollable) */}
        <div className="p-2.5 overflow-y-auto flex-1 grid grid-cols-4 sm:grid-cols-5 gap-1.5 scrollbar-none min-h-[140px]">
          {filteredGifts.map((gift) => {
            const isSelected = selectedGift.id === gift.id;
            return (
              <button
                key={gift.id}
                type="button"
                onClick={() => setSelectedGift(gift)}
                className={`p-1.5 rounded-xl border flex flex-col items-center text-center relative transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-gradient-to-b from-amber-500/25 to-orange-500/25 ring-1 ring-amber-400 shadow-md scale-102'
                    : 'border-white/10 bg-white/3 hover:bg-white/7'
                }`}
              >
                <div className="text-2xl mb-0.5 filter drop-shadow-xs transition-transform hover:scale-110">
                  {gift.previewIcon}
                </div>
                <span className="text-[10px] font-bold text-slate-200 truncate w-full">
                  {gift.nameMr.split('(')[0]}
                </span>
                <span className="text-[8px] text-amber-300/80 font-semibold truncate w-full">
                  {gift.culturalTheme}
                </span>
                {isSelected && (
                  <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] font-black">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 5. Footer: Multipliers + Dynamic Send Button */}
        <div className="px-3 py-2 border-t border-white/10 bg-slate-900/95 shrink-0 flex flex-col gap-1.5">
          {error && (
            <div className="px-2 py-0.5 rounded bg-red-950/90 text-red-300 text-[10px] border border-red-500/30">
              {error}
            </div>
          )}

          {/* Combo Multipliers */}
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] font-bold text-slate-400 shrink-0">कॉम्बो (Multipliers):</span>
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {[1, 6, 7, 10, 66, 100, 520].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMultiplier(m)}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black transition-all cursor-pointer ${
                    multiplier === m
                      ? 'bg-gradient-to-r from-pink-500 to-amber-400 text-slate-950 shadow-xs ring-1 ring-amber-300 scale-105'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  x{m}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row: Selected Summary + Dynamic Send Button */}
          <div className="flex items-center justify-between pt-0.5 gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-xl shrink-0">{selectedGift.previewIcon}</span>
              <div className="truncate min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-black text-amber-300 truncate">
                    {selectedGift.nameMr}
                  </span>
                  <span className="text-[9px] text-pink-300 font-bold shrink-0">
                    x{multiplier}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-medium block truncate">
                  {recipientMode === 'all'
                    ? '🚩 संपूर्ण कट्टा (All Room)'
                    : (selectedRecipientUids.length === 1
                        ? `👤 ${availableUsers.find((u) => u.uid === selectedRecipientUids[0])?.displayName || 'सदस्य'}`
                        : `👥 ${selectedRecipientUids.length} सदस्य निवडले`)}
                </span>
              </div>
            </div>

            <button
              type="button"
              id="btn-send-room-gift"
              onClick={handleSend}
              disabled={sending || (recipientMode === 'custom' && selectedRecipientUids.length === 0)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-95 shrink-0 border border-amber-300/40"
            >
              {sending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>पाठवत आहे...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {recipientMode === 'all'
                      ? 'सर्व सदस्यांना पाठवा'
                      : (selectedRecipientUids.length === 1
                          ? `${availableUsers.find((u) => u.uid === selectedRecipientUids[0])?.displayName?.split(' ')[0] || 'सदस्या'}ला पाठवा`
                          : `${selectedRecipientUids.length} सदस्यांना पाठवा`)}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
