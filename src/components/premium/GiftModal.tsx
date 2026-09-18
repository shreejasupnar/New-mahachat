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
  Loader2,
  Coins,
  History,
  PlusCircle,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp,
  Flame,
  Tag
} from 'lucide-react';
import { PREMIUM_GIFTS } from '../../premium/data/gifts';
import { PremiumGift, GiftCategoryType } from '../../premium/types';
import { UserProfile } from '../../lib/firebase';
import { sendRealRoomGift } from '../../lib/premiumFirebase';
import { celebrationAudio } from '../../lib/celebrationAudio';
import { seatGiftFlightManager } from '../voice/SeatGiftFlightAnimation';
import { getVipTier } from '../../data/vipData';
import { RechargeModal } from '../vip/RechargeModal';
import { TransactionHistoryModal } from '../wallet/TransactionHistoryModal';
import { AdminGiftManagerModal } from '../admin/AdminGiftManagerModal';
import { fetchLiveGiftCatalog, fetchLiveMarketRates } from '../../services/giftCatalogService';
import { MarketCategoryRate } from '../../types/wallet';

export interface RoomRecipientOption {
  uid: string;
  displayName: string;
  photoURL?: string;
  role?: 'host' | 'speaker' | 'listener' | 'audience' | string;
  seatIndex?: number | null;
  seatLabel?: string;
  isSpeaking?: boolean;
}

export const GIFT_MAIN_CATEGORIES: Array<{
  id: 'all' | GiftCategoryType;
  labelMr: string;
  labelEn: string;
  icon: string;
  badge?: string;
  badgeType?: 'surge' | 'discount' | 'stable';
  popularExamplesMr: string;
}> = [
  { 
    id: 'all', 
    labelMr: 'सर्व भेटवस्तू', 
    labelEn: 'All Gifts', 
    icon: '🎁', 
    popularExamplesMr: 'संपूर्ण कॅटलॉग' 
  },
  { 
    id: 'love', 
    labelMr: 'प्रेम भेटवस्तू', 
    labelEn: 'Love & Romance', 
    icon: '💖', 
    badge: '+10% तेजी 🔥',
    badgeType: 'surge',
    popularExamplesMr: 'गुलाब, गुच्छ, प्रपोजल रिंग, सोन्याचे पेंडंट, चॉकलेट, टेडी' 
  },
  { 
    id: 'friendship', 
    labelMr: 'मैत्री व कट्टा', 
    labelEn: 'Friendship', 
    icon: '🤝', 
    badge: '-8% सवलत 🏷️',
    badgeType: 'discount',
    popularExamplesMr: 'कटिंग चहा, हाय फाईव्ह, फिस्ट बम्प, ट्रॉफी, फ्रेंडशिप बँड' 
  },
  { 
    id: 'festival', 
    labelMr: 'सण व उत्सव', 
    labelEn: 'Festivals', 
    icon: '🪔', 
    badge: '+15% तेजी 📈',
    badgeType: 'surge',
    popularExamplesMr: 'मोदक, समई, पुरणपोळी, गुढी, आकाशकंदील, रांगोळी, राखी, पतंग' 
  },
  { 
    id: 'heritage', 
    labelMr: 'संस्कृती व वारसा', 
    labelEn: 'Heritage', 
    icon: '🚩', 
    badge: 'प्रमाणित',
    badgeType: 'stable',
    popularExamplesMr: 'फेटा, नथ, पैठणी, ढोल ताशा, ऐतिहासिक किल्ले' 
  }
];

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
  const [selectedMainCategory, setSelectedMainCategory] = useState<'all' | GiftCategoryType>('all');
  const [selectedThemeSubfilter, setSelectedThemeSubfilter] = useState<string>('सर्व');
  const [giftSearchQuery, setGiftSearchQuery] = useState('');
  const [showGiftSearch, setShowGiftSearch] = useState(false);
  const [liveCatalog, setLiveCatalog] = useState<PremiumGift[]>(PREMIUM_GIFTS);
  const [marketRates, setMarketRates] = useState<{ mode: string; headlineMr: string; categories: MarketCategoryRate[] } | null>(null);
  const [showMarketDetails, setShowMarketDetails] = useState(false);
  const [selectedGift, setSelectedGift] = useState<PremiumGift>(PREMIUM_GIFTS[0]);
  const [multiplier, setMultiplier] = useState<number>(6);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User live coins & modals
  const [userCoins, setUserCoins] = useState<number>(currentUser.coins || 0);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Fetch live gifts with authoritative market prices & market rates
  useEffect(() => {
    let isMounted = true;

    async function loadCatalogAndRates() {
      try {
        const [gifts, rates] = await Promise.all([
          fetchLiveGiftCatalog(),
          fetchLiveMarketRates()
        ]);
        if (!isMounted) return;

        if (Array.isArray(gifts) && gifts.length > 0) {
          const mapped: PremiumGift[] = gifts.map((g: any) => ({
            id: g.id,
            nameMr: g.nameMr,
            nameEn: g.nameEn || g.nameMr,
            category: 'gifts' as const,
            premiumRequired: false,
            culturalTheme: g.culturalTheme,
            giftCategory: g.giftCategory,
            previewIcon: g.previewIcon || '🎁',
            descriptionMr: g.descriptionMr || '',
            animation: g.animation || 'spin-slow',
            accentColor: g.accentColor || '#fbbf24',
            tagMr: g.tagMr || 'भेट',
            coinPrice: g.marketPrice || g.coinPrice || 25,
            basePrice: g.basePrice || g.coinPrice || 25,
            marketPrice: g.marketPrice || g.coinPrice || 25,
            priceChangePercent: g.priceChangePercent || 0,
            marketTrend: g.marketTrend || 'STABLE'
          }));
          setLiveCatalog(mapped);
          
          // Keep current selected gift synchronized with latest price
          setSelectedGift((prev) => {
            const fresh = mapped.find((item) => item.id === prev.id);
            return fresh || mapped[0];
          });
        }

        if (rates) {
          setMarketRates(rates);
        }
      } catch (err) {
        console.warn('[GiftModal] Failed loading live gifts/rates:', err);
      }
    }

    loadCatalogAndRates();
    const interval = setInterval(loadCatalogAndRates, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (currentUser?.coins !== undefined) {
      setUserCoins(currentUser.coins);
    }
  }, [currentUser?.coins]);

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

  // Theme sub-filters based on selected main category
  const availableThemes = useMemo(() => {
    const set = new Set<string>();
    liveCatalog.forEach((g) => {
      const gCat = g.giftCategory || (
        g.culturalTheme?.includes('प्रेम') || g.culturalTheme?.includes('भावना') ? 'love' :
        g.culturalTheme?.includes('मैत्री') || g.culturalTheme?.includes('कट्टा') ? 'friendship' :
        g.culturalTheme?.includes('सण') || g.culturalTheme?.includes('उत्सव') ? 'festival' : 'heritage'
      );
      if (selectedMainCategory === 'all' || gCat === selectedMainCategory) {
        if (g.culturalTheme) set.add(g.culturalTheme);
      }
    });
    return ['सर्व', ...Array.from(set)];
  }, [liveCatalog, selectedMainCategory]);

  const filteredGifts = useMemo(() => {
    return liveCatalog.filter((g) => {
      // 1. Match Main Category
      if (selectedMainCategory !== 'all') {
        const gCat = g.giftCategory || (
          g.culturalTheme?.includes('प्रेम') || g.culturalTheme?.includes('भावना') ? 'love' :
          g.culturalTheme?.includes('मैत्री') || g.culturalTheme?.includes('कट्टा') ? 'friendship' :
          g.culturalTheme?.includes('सण') || g.culturalTheme?.includes('उत्सव') ? 'festival' : 'heritage'
        );
        if (gCat !== selectedMainCategory) return false;
      }

      // 2. Cultural Theme Subfilter
      if (selectedThemeSubfilter !== 'सर्व' && g.culturalTheme !== selectedThemeSubfilter) {
        return false;
      }

      // 3. Search query match
      if (giftSearchQuery.trim()) {
        const q = giftSearchQuery.toLowerCase();
        const matchName = g.nameMr.toLowerCase().includes(q) || g.nameEn.toLowerCase().includes(q);
        const matchTheme = g.culturalTheme?.toLowerCase().includes(q);
        const matchTag = g.tagMr?.toLowerCase().includes(q);
        if (!matchName && !matchTheme && !matchTag) return false;
      }

      return true;
    });
  }, [liveCatalog, selectedMainCategory, selectedThemeSubfilter, giftSearchQuery]);

  // Dynamic Authoritative Unit Price & Cost Calculation
  const targetCount = recipientMode === 'all' ? 1 : Math.max(1, selectedRecipientUids.length);
  const unitPrice = selectedGift.marketPrice || selectedGift.coinPrice || selectedGift.basePrice || 10;
  const baseUnitPrice = selectedGift.basePrice || unitPrice;
  const totalCost = unitPrice * multiplier * targetCount;
  const baseTotalCost = baseUnitPrice * multiplier * targetCount;
  const priceDifference = totalCost - baseTotalCost;
  const hasEnoughCoins = userCoins >= totalCost;

  // Execute Sending
  const handleSend = async () => {
    setError(null);

    if (recipientMode === 'custom' && selectedRecipientUids.length === 0) {
      setError('कृपया भेट स्वीकारण्यासाठी किमान एक सदस्य निवडा किंवा "सर्व सदस्य" निवडा.');
      return;
    }

    if (!hasEnoughCoins) {
      setError(`अपुरे कॉइन्स! आवश्यक: 🪙 ${totalCost}, तुमच्याकडे उपलब्ध: 🪙 ${userCoins}. कृपया खालील बटणावरून त्वरित रिचार्ज करा.`);
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

        // 1. Persist broadcast gift event via server-side secure validation
        const result = await sendRealRoomGift(
          districtId,
          selectedGift.id,
          { ...currentUser, coins: userCoins },
          broadcastRecipient,
          multiplier
        );

        // Update state with server returned balance
        if (result && result.newCoins !== undefined) {
          setUserCoins(result.newCoins);
          currentUser.coins = result.newCoins;
        }

        // 2. Trigger broadcast flight animation (flies to all occupied stage seats)
        seatGiftFlightManager.triggerFlight({
          giftIcon: selectedGift.previewIcon || '🎁',
          giftName: selectedGift.nameMr,
          multiplier: multiplier,
          recipientUid: undefined,
          recipientName: 'सर्व कट्टा सदस्य',
          senderUid: currentUser.uid,
          isBroadcast: true
        });

        // 3. Play celebratory fanfare audio
        celebrationAudio.playGiftFanfare();

        if (onGiftSent) {
          onGiftSent(selectedGift, broadcastRecipient);
        }

        // Close modal smoothly
        onClose();
      } else {
        // Send to specifically chosen member(s)
        const targetUsers = availableUsers.filter((u) => selectedRecipientUids.includes(u.uid));

        if (targetUsers.length === 0) {
          setError('निवडलेले सदस्य सापडले नाहीत.');
          setSending(false);
          return;
        }

        // Persist gift events in server & Firestore for each recipient
        let finalCoins = userCoins;
        for (const user of targetUsers) {
          const res = await sendRealRoomGift(
            districtId,
            selectedGift.id,
            { ...currentUser, coins: finalCoins },
            {
              uid: user.uid,
              displayName: user.displayName,
              photoURL: user.photoURL
            },
            multiplier
          );
          if (res && res.newCoins !== undefined) {
            finalCoins = res.newCoins;
          }
        }

        setUserCoins(finalCoins);
        currentUser.coins = finalCoins;

        // Trigger seat-targeted flight animation for each selected recipient
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

        // Play celebratory audio chime
        celebrationAudio.playGiftFanfare();

        if (onGiftSent && targetUsers.length > 0) {
          onGiftSent(selectedGift, targetUsers[0]);
        }

        // Close modal smoothly
        onClose();
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
            {/* Wallet Balance Pill */}
            <div className="flex items-center bg-amber-500/15 border border-amber-500/30 rounded-xl px-2 py-0.5 gap-1 shadow-inner">
              <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs font-black text-amber-300">
                {userCoins.toLocaleString()}
              </span>
              <button
                type="button"
                id="btn-quick-recharge"
                onClick={() => setShowRechargeModal(true)}
                className="ml-0.5 px-1.5 py-0.5 rounded-lg bg-linear-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[9px] hover:from-amber-400 hover:to-orange-400 cursor-pointer shadow-xs"
                title="कॉइन रिचार्ज करा"
              >
                + रिचार्ज
              </button>
            </div>

            {/* History Ledger Button */}
            <button
              type="button"
              id="btn-open-wallet-history"
              onClick={() => setShowHistoryModal(true)}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="व्यवहार नोंदवही (Transaction History)"
            >
              <History className="w-3.5 h-3.5" />
            </button>

            {/* Admin Catalog Button */}
            <button
              type="button"
              id="btn-open-admin-gifts"
              onClick={() => setShowAdminModal(true)}
              className="p-1 rounded-full text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
              title="गिफ्ट कॅटलॉग व्यवस्थापन (Admin)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>

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
                          {user?.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.displayName || 'User'}
                              className="w-7 h-7 rounded-full object-cover border border-white/20"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center font-bold text-[10px] text-white">
                              {user?.displayName?.charAt(0) || 'U'}
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

        {/* 3. CATEGORY SELECTOR & LIVE MARKET PRICE FLUCTUATION BANNER */}
        <div className="shrink-0 flex flex-col bg-slate-950 border-b border-white/10">
          {/* Main Category Tabs */}
          <div className="px-2.5 pt-2 pb-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {GIFT_MAIN_CATEGORIES.map((cat) => {
              const isSelected = selectedMainCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  id={`btn-gift-cat-${cat.id}`}
                  onClick={() => {
                    setSelectedMainCategory(cat.id);
                    setSelectedThemeSubfilter('सर्व');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 border shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-300 shadow-md ring-1 ring-amber-400 font-black scale-102'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{cat.labelMr}</span>
                  {cat.badge && (
                    <span 
                      className={`text-[8px] px-1.5 py-0.2 rounded-full font-black tracking-wide ${
                        isSelected 
                          ? 'bg-black/30 text-slate-950' 
                          : cat.badgeType === 'discount'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : cat.badgeType === 'surge'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {cat.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sub-filters (Themes under current category) */}
          {availableThemes.length > 2 && (
            <div className="px-3 py-1 flex items-center gap-1 overflow-x-auto scrollbar-none text-[10px] border-t border-white/5 bg-black/20">
              <span className="text-[9px] text-slate-500 font-semibold shrink-0">थीम:</span>
              {availableThemes.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setSelectedThemeSubfilter(theme)}
                  className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    selectedThemeSubfilter === theme
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          )}

          {/* Live Market Price Fluctuation Marquee / Pill */}
          <div className="px-3 py-1 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-950 border-t border-white/5 flex items-center justify-between text-[10px] gap-2">
            <div className="flex items-center gap-1.5 overflow-hidden truncate">
              <TrendingUp className="w-3 h-3 text-amber-400 shrink-0 animate-pulse" />
              <span className="font-bold text-amber-300 shrink-0">बाजार भाव:</span>
              <span className="text-slate-300 truncate">
                {marketRates?.headlineMr || '💖 प्रेम भेट +10% तेजी | 🤝 मैत्री कट्टा -8% सवलत | 🪔 सण उत्सव +15%'}
              </span>
            </div>
            <button
              type="button"
              id="btn-toggle-market-details"
              onClick={() => setShowMarketDetails(!showMarketDetails)}
              className="text-[9px] font-bold text-amber-400 hover:text-amber-300 shrink-0 flex items-center gap-0.5 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 px-1.5 py-0.5 rounded-md border border-amber-500/20 transition-colors"
            >
              <Info className="w-2.5 h-2.5" />
              <span>{showMarketDetails ? 'लपवा' : 'तपशील'}</span>
              {showMarketDetails ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
            </button>
          </div>

          {/* Expanded Market Fluctuation Details Drawer */}
          {showMarketDetails && (
            <div className="p-2.5 bg-slate-900/95 border-t border-amber-500/20 text-[10px] space-y-1.5 animate-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between text-amber-300 font-bold border-b border-white/10 pb-1">
                <span>📈 कॅटेगरीनुसार लाईव्ह बाजार भाव दर (Dynamic Market Rates):</span>
                <span className="text-[9px] text-slate-400">रिअल-टाइम अपडेट</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="p-1.5 rounded-lg bg-pink-950/40 border border-pink-500/20 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-pink-300">💖 प्रेम भेटवस्तू</span>
                    <span className="font-black text-rose-300 bg-rose-500/20 px-1 rounded-sm">+10% तेजी</span>
                  </div>
                  <span className="text-[8px] text-slate-300 mt-0.5">रोमँटिक संध्याकाळमुळे गुलाब, रिंग, पेंडंटना विशेष मागणी</span>
                </div>
                <div className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300">🤝 मैत्री व कट्टा</span>
                    <span className="font-black text-emerald-300 bg-emerald-500/20 px-1 rounded-sm">-8% सवलत</span>
                  </div>
                  <span className="text-[8px] text-slate-300 mt-0.5">हॅप्पी अवर डिस्काउंट: चहा, ट्रॉफी व टाळीवर खास सूट</span>
                </div>
                <div className="p-1.5 rounded-lg bg-amber-950/40 border border-amber-500/20 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">🪔 सण व उत्सव</span>
                    <span className="font-black text-amber-300 bg-amber-500/20 px-1 rounded-sm">+15% तेजी</span>
                  </div>
                  <span className="text-[8px] text-slate-300 mt-0.5">सणासुदीचा सण-उत्सव हंगाम व सण भेटवस्तूंची मागणी</span>
                </div>
                <div className="p-1.5 rounded-lg bg-orange-950/40 border border-orange-500/20 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-orange-300">🚩 संस्कृती व वारसा</span>
                    <span className="font-black text-slate-300 bg-white/10 px-1 rounded-sm">स्थिर (0%)</span>
                  </div>
                  <span className="text-[8px] text-slate-300 mt-0.5">महाराष्ट्र ऐतिहासिक वारसा मानचिन्हे प्रमाणित स्थिर दरावर</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Compact Gift Grid (Scrollable) */}
        <div className="p-2.5 overflow-y-auto flex-1 grid grid-cols-4 sm:grid-cols-5 gap-1.5 scrollbar-none min-h-[140px]">
          {filteredGifts.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-1">
              <Gift className="w-6 h-6 text-slate-600" />
              <span>या वर्गवारीत कोणतीही भेटवस्तू सापडली नाही.</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedMainCategory('all');
                  setSelectedThemeSubfilter('सर्व');
                  setGiftSearchQuery('');
                }}
                className="mt-1 text-amber-400 underline cursor-pointer text-[10px]"
              >
                सर्व भेटवस्तू दाखवा
              </button>
            </div>
          ) : (
            filteredGifts.map((gift) => {
              const isSelected = selectedGift.id === gift.id;
              const hasFluctuation = gift.priceChangePercent !== undefined && gift.priceChangePercent !== 0;
              const isSurge = (gift.priceChangePercent || 0) > 0;
              const isDiscount = (gift.priceChangePercent || 0) < 0;

              return (
                <button
                  key={gift.id}
                  type="button"
                  id={`btn-select-gift-${gift.id}`}
                  onClick={() => setSelectedGift(gift)}
                  className={`p-1.5 rounded-xl border flex flex-col items-center text-center relative transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-400 bg-gradient-to-b from-amber-500/25 to-orange-500/25 ring-1 ring-amber-400 shadow-md scale-102'
                      : 'border-white/10 bg-white/3 hover:bg-white/7'
                  }`}
                >
                  {/* Fluctuation Tag in corner */}
                  {hasFluctuation && (
                    <div 
                      className={`absolute top-1 left-1 text-[7px] font-black px-1 py-0.2 rounded-full border shadow-xs ${
                        isDiscount 
                          ? 'bg-emerald-600 text-white border-emerald-400' 
                          : 'bg-rose-600 text-white border-rose-400'
                      }`}
                      title={isDiscount ? 'बाजार भाव सवलत' : 'बाजार भाव तेजी'}
                    >
                      {isDiscount ? `${gift.priceChangePercent}%` : `+${gift.priceChangePercent}%`}
                    </div>
                  )}

                  {/* Icon */}
                  <div className="text-2xl mb-0.5 filter drop-shadow-xs transition-transform hover:scale-110">
                    {gift.previewIcon}
                  </div>

                  {/* Name in Marathi */}
                  <span className="text-[10px] font-bold text-slate-200 truncate w-full">
                    {gift.nameMr.split('(')[0]}
                  </span>

                  {/* Category / Theme indicator */}
                  <span className="text-[8px] text-amber-300/80 font-semibold truncate w-full">
                    {gift.culturalTheme}
                  </span>

                  {/* Live Price Pill */}
                  <div className="flex items-center justify-center gap-1 mt-0.5 bg-black/40 px-1.5 py-0.5 rounded-md border border-amber-500/20 w-full">
                    {hasFluctuation && gift.basePrice && (
                      <span className="text-[8px] text-slate-500 line-through">
                        {gift.basePrice}
                      </span>
                    )}
                    <span className="text-[9px] font-black text-amber-300">
                      🪙 {gift.marketPrice || gift.coinPrice || 10}
                    </span>
                  </div>

                  {/* Selected Tick */}
                  {isSelected && (
                    <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] font-black">
                      ✓
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* 5. Footer: Multipliers + Dynamic Send Button */}
        <div className="px-3 py-2 border-t border-white/10 bg-slate-900/95 shrink-0 flex flex-col gap-1.5">
          {/* Insufficient Coins or Error Banner */}
          {error && (
            <div className="px-2.5 py-1 rounded-xl bg-red-950/90 text-red-300 text-[10px] border border-red-500/30 flex items-center justify-between gap-2">
              <span className="truncate">{error}</span>
              <button
                type="button"
                onClick={() => setShowRechargeModal(true)}
                className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[9px] shrink-0 cursor-pointer shadow-xs"
              >
                + रिचार्ज करा
              </button>
            </div>
          )}

          {/* Fluctuation Info Line in Footer if applicable */}
          {priceDifference !== 0 && (
            <div className="flex items-center justify-between px-2 py-0.5 rounded-lg bg-black/30 text-[9px]">
              <div className="flex items-center gap-1">
                {priceDifference < 0 ? (
                  <Tag className="w-2.5 h-2.5 text-emerald-400" />
                ) : (
                  <Flame className="w-2.5 h-2.5 text-rose-400" />
                )}
                <span className={priceDifference < 0 ? 'text-emerald-300' : 'text-rose-300'}>
                  {priceDifference < 0 
                    ? `हॅप्पी अवर सवलत: मूळ किंमतीपेक्षा 🪙 ${Math.abs(priceDifference)} कॉइन्स बचत!` 
                    : `लाईव्ह बाजार भाव तेजी (+${selectedGift.priceChangePercent}%): +🪙 ${priceDifference} कॉइन्स`}
                </span>
              </div>
              <span className="text-slate-400 font-mono">
                मूळ: 🪙 {baseTotalCost}
              </span>
            </div>
          )}

          {/* Combo Multipliers & Cost Breakdown */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              <span className="text-[9px] font-bold text-slate-400 shrink-0">कॉम्बो:</span>
              {[1, 6, 7, 10, 66, 100, 520].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMultiplier(m)}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black transition-all cursor-pointer ${
                    multiplier === m
                      ? 'bg-linear-to-r from-pink-500 to-amber-400 text-slate-950 shadow-xs ring-1 ring-amber-300 scale-105'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  x{m}
                </button>
              ))}
            </div>

            {/* Total Cost Badge */}
            <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-lg border border-amber-500/30 text-[10px] shrink-0 font-bold">
              <span className="text-slate-400">एकूण:</span>
              <span className={`font-black ${hasEnoughCoins ? 'text-amber-300' : 'text-rose-400'}`}>
                🪙 {totalCost.toLocaleString()}
              </span>
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

            {!hasEnoughCoins ? (
              <button
                type="button"
                id="btn-recharge-shortcut"
                onClick={() => setShowRechargeModal(true)}
                className="px-3.5 py-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0 border border-amber-300/40"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>🪙 रिचार्ज करा</span>
              </button>
            ) : (
              <button
                type="button"
                id="btn-send-room-gift"
                onClick={handleSend}
                disabled={sending || (recipientMode === 'custom' && selectedRecipientUids.length === 0)}
                className="px-4 py-2 bg-linear-to-r from-amber-500 via-orange-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-95 shrink-0 border border-amber-300/40"
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
            )}
          </div>
        </div>
      </div>

      {/* Recharge Modal Sub-view */}
      {showRechargeModal && (
        <RechargeModal
          isOpen={showRechargeModal}
          currentUser={{ ...currentUser, coins: userCoins }}
          onClose={() => setShowRechargeModal(false)}
          onSuccess={() => {
            setShowRechargeModal(false);
            // Refresh coins balance
            fetch(`/api/wallet/balance?userId=${currentUser.uid}`)
              .then((r) => r.json())
              .then((data) => {
                if (data.wallet?.coinBalance !== undefined) {
                  setUserCoins(data.wallet.coinBalance);
                  currentUser.coins = data.wallet.coinBalance;
                }
              })
              .catch(() => {});
          }}
        />
      )}

      {/* Transaction History Ledger Modal */}
      {showHistoryModal && (
        <TransactionHistoryModal
          isOpen={showHistoryModal}
          currentUser={{ ...currentUser, coins: userCoins }}
          onClose={() => setShowHistoryModal(false)}
          onOpenRecharge={() => {
            setShowHistoryModal(false);
            setShowRechargeModal(true);
          }}
        />
      )}

      {/* Admin Gift Catalog & System-Wide Ledger Modal */}
      {showAdminModal && (
        <AdminGiftManagerModal
          isOpen={showAdminModal}
          currentUserUid={currentUser.uid}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </div>
  );
};
