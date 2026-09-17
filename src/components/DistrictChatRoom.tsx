import React, { useState, useEffect, useRef, useMemo } from 'react';
import { District, MAHARASHTRA_DISTRICTS } from '../data/districts';
import { 
  ChatMessage, 
  UserProfile, 
  sendDistrictMessage, 
  subscribeToDistrictMessages, 
  subscribeToDistrictOnlineUsers,
  submitReport,
  blockUser
} from '../lib/firebase';
import { 
  isUserSubscribed, 
  subscribeToRoomGifts, 
  subscribeToRoomEntries, 
  broadcastRoomEntry 
} from '../lib/premiumFirebase';
import { 
  getBubbleById, 
  getFrameById, 
  getBadgeById, 
  getNameEffectById 
} from '../premium';
import { RoomGiftEvent, RoomEntryEvent } from '../premium/types';
import { GiftModal } from './premium/GiftModal';
import { GiftOverlay } from './premium/GiftOverlay';
import { EntryEffectOverlay } from './premium/EntryEffectOverlay';
import { DistrictIcon } from './DistrictIcon';
import { 
  ArrowLeft, 
  Send, 
  Smile, 
  MoreVertical, 
  Volume2, 
  Info, 
  Flag, 
  ShieldAlert, 
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  Radio,
  X,
  Gift,
  Crown
} from 'lucide-react';

interface DistrictChatRoomProps {
  district: District;
  currentUserProfile: UserProfile | null;
  onBack: () => void;
  onOpenVoiceRoom: (districtId: string) => void;
}

// Regional quick phrases popular in Maharashtra
const QUICK_PHRASES = [
  'काय मंडळी, कसे आहात?',
  'जय महाराष्ट्र! 🚩',
  'आज वातावरणात भारी पाऊस आहे 🌧️',
  'कुठे भेटूया आज? ☕',
  'सगळ्यांना शुभ सकाळ! 🙏'
];

const EMOJIS = ['🙏', '🚩', '☕', '🌧️', '🥭', '👍', '🤝', '❤️', '😊', '🔥'];

export const DistrictChatRoom: React.FC<DistrictChatRoomProps> = ({
  district,
  currentUserProfile,
  onBack,
  onOpenVoiceRoom
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showDistrictInfo, setShowDistrictInfo] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [activeGiftOverlay, setActiveGiftOverlay] = useState<RoomGiftEvent | null>(null);
  const [activeEntryOverlay, setActiveEntryOverlay] = useState<RoomEntryEvent | null>(null);
  const entryOverlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedMessageForReport, setSelectedMessageForReport] = useState<ChatMessage | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [lastSentTime, setLastSentTime] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (entryOverlayTimerRef.current) {
        clearTimeout(entryOverlayTimerRef.current);
      }
    };
  }, []);

  // Broadcast entry effect when entering room if user has it equipped
  useEffect(() => {
    if (currentUserProfile && isUserSubscribed(currentUserProfile)) {
      broadcastRoomEntry(district.id, currentUserProfile);
    }
  }, [district.id, currentUserProfile?.uid]);

  // Subscribe to room gift celebrations and room entry alerts
  useEffect(() => {
    const unsubGifts = subscribeToRoomGifts(district.id, (events) => {
      if (events.length > 0) {
        setActiveGiftOverlay(events[0]);
      }
    });

    const unsubEntries = subscribeToRoomEntries(district.id, (entry) => {
      if (entry && entry.userId !== currentUserProfile?.uid) {
        if (entryOverlayTimerRef.current) {
          clearTimeout(entryOverlayTimerRef.current);
        }
        setActiveEntryOverlay(entry);
        entryOverlayTimerRef.current = setTimeout(() => {
          setActiveEntryOverlay(null);
          entryOverlayTimerRef.current = null;
        }, 2700);
      }
    });

    return () => {
      unsubGifts();
      unsubEntries();
    };
  }, [district.id, currentUserProfile?.uid]);

  // Real room members extracted from messages for authentic gift recipient targeting
  const realRoomParticipants = useMemo(() => {
    const map = new Map<string, { uid: string; displayName: string; photoURL?: string }>();
    messages.forEach(m => {
      if (m.senderId && m.senderId !== currentUserProfile?.uid) {
        map.set(m.senderId, {
          uid: m.senderId,
          displayName: m.senderName,
          photoURL: m.senderPhoto
        });
      }
    });
    return Array.from(map.values());
  }, [messages, currentUserProfile?.uid]);

  // Subscribe to real-time messages strictly from Firestore
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToDistrictMessages(
      district.id,
      (newMsgs) => {
        setMessages(newMsgs);
        setLoading(false);
      },
      (err) => {
        console.error('Messages subscription error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [district.id]);

  // Subscribe to real online presence
  useEffect(() => {
    const unsubPresence = subscribeToDistrictOnlineUsers(
      district.id,
      (count) => {
        setOnlineCount(count);
      }
    );

    return () => unsubPresence();
  }, [district.id]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || sending || !currentUserProfile) return;

    // Rate limiting: 1 second between messages
    const now = Date.now();
    if (now - lastSentTime < 1000) {
      return;
    }

    setSending(true);
    try {
      await sendDistrictMessage(district.id, textToSend, {
        uid: currentUserProfile.uid,
        displayName: currentUserProfile.displayName,
        photoURL: currentUserProfile.photoURL,
        district: currentUserProfile.district,
        senderBadge: currentUserProfile.equippedBadge,
        senderBubble: currentUserProfile.equippedBubble,
        senderNameEffect: currentUserProfile.equippedNameEffect,
        isPremiumSender: isUserSubscribed(currentUserProfile)
      });
      setInputText('');
      setLastSentTime(now);
    } catch (err: any) {
      alert(err.message || 'मेसेज पाठवता आला नाही.');
    } finally {
      setSending(false);
    }
  };

  const handleSendQuickPhrase = (phrase: string) => {
    setInputText(phrase);
  };

  const handleAddEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const handleReportMessage = async () => {
    if (!selectedMessageForReport || !currentUserProfile || !reportReason.trim()) return;

    try {
      await submitReport({
        reportedBy: currentUserProfile.uid,
        reportedUser: selectedMessageForReport.senderId,
        reportedMessageId: selectedMessageForReport.id,
        districtId: district.id,
        reason: reportReason.trim()
      });
      setReportSuccess(true);
      setTimeout(() => {
        setSelectedMessageForReport(null);
        setReportReason('');
        setReportSuccess(false);
      }, 1500);
    } catch (e: any) {
      alert('तक्रार नोंदवताना अडचण आली: ' + e.message);
    }
  };

  const handleBlockSender = async (targetUid: string) => {
    if (!currentUserProfile) return;
    if (window.confirm('तुम्हाला या वापरकर्त्याला ब्लॉक करायचे आहे का? त्यांचे मेसेज तुम्हाला दिसणार नाहीत.')) {
      try {
        await blockUser(currentUserProfile.uid, targetUid, currentUserProfile.blockedUsers || []);
        alert('वापरकर्ता ब्लॉक केला गेला आहे.');
      } catch (e: any) {
        alert('त्रुटी: ' + e.message);
      }
    }
  };

  // Filter out blocked users
  const visibleMessages = messages.filter(
    m => !currentUserProfile?.blockedUsers?.includes(m.senderId)
  );

  const userFrame = currentUserProfile?.equippedFrame ? getFrameById(currentUserProfile.equippedFrame) : null;

  return (
    <div 
      id="district-chat-room" 
      className={`flex-1 flex flex-col bg-slate-100 h-screen max-h-screen overflow-hidden relative ${userFrame ? userFrame.borderClass : ''}`}
    >
      {/* Real-time Gift Celebration Overlay */}
      {activeGiftOverlay && (
        <GiftOverlay
          giftEvent={activeGiftOverlay}
          currentUserId={currentUserProfile?.uid}
          onDismiss={() => setActiveGiftOverlay(null)}
          onSendThankYou={(senderId, senderName) => {
            if (currentUserProfile && district.id) {
              sendDistrictMessage(
                district.id,
                `❤️ @${senderName} मनापासून धन्यवाद! खूप सुंदर भेट! 🙏✨`,
                currentUserProfile
              ).catch(() => {});
            }
          }}
        />
      )}

      {/* Real-time Entry Effect Overlay */}
      {activeEntryOverlay && (
        <EntryEffectOverlay
          event={activeEntryOverlay}
          durationMs={2700}
          onDismiss={() => {
            if (entryOverlayTimerRef.current) {
              clearTimeout(entryOverlayTimerRef.current);
              entryOverlayTimerRef.current = null;
            }
            setActiveEntryOverlay(null);
          }}
        />
      )}

      {/* Real User Gift Modal */}
      {showGiftModal && (
        <GiftModal
          districtId={district.id}
          districtNameMr={district.nameMr}
          currentUser={currentUserProfile!}
          realRoomUsers={realRoomParticipants}
          onClose={() => setShowGiftModal(false)}
        />
      )}

      {/* Top Header matching Mockup Screen 5 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-[0_2px_12px_rgba(15,23,42,0.04)] glossy-top-edge">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            id="chat-back-button"
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-90 border border-slate-200/60"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* District Emblem */}
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs border border-slate-200/60"
            style={{ backgroundColor: `${district.color}15` }}
          >
            <DistrictIcon type={district.iconType} color={district.color} size={22} />
          </div>

          {/* District Name & Real Online Count matching Mockup Screen 5 */}
          <div className="min-w-0">
            <h1 className="font-black text-slate-900 text-sm leading-tight truncate">
              {district.nameMr} जिल्हा चॅट
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${onlineCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className={`text-[11px] font-bold ${onlineCount > 0 ? 'text-emerald-700' : 'text-slate-600'}`}>
                {onlineCount > 0 ? `${onlineCount} ऑनलाइन` : 'अजून कोणी नाही'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions: Send Gift, Voice Room shortcut & 3-dots Menu */}
        <div className="flex items-center gap-1.5">
          {/* Send Gift Button */}
          <button
            id="open-gift-modal-button"
            type="button"
            onClick={() => setShowGiftModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-90 text-white rounded-xl text-xs font-black transition-all shadow-[0_2px_8px_rgba(245,158,11,0.35)] border border-amber-300/40 cursor-pointer btn-glossy"
            title="महाराष्ट्र भेटवस्तू पाठवा (Send Gift)"
          >
            <Gift className="w-3.5 h-3.5 text-yellow-200 animate-bounce" />
            <span className="hidden xs:inline">भेटवस्तू</span>
          </button>

          {/* Voice Room Shortcut */}
          <button
            id="open-voice-kattha-button"
            type="button"
            onClick={() => onOpenVoiceRoom(district.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-90 text-white rounded-xl text-xs font-black transition-all shadow-[0_2px_8px_rgba(37,99,235,0.35)] border border-blue-400/40 cursor-pointer btn-glossy"
            title="जिल्हा व्हॉईस कट्टा (८ सीट्स)"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-300" />
            <span className="hidden xs:inline">व्हॉईस (८)</span>
          </button>

          {/* 3-dots menu button */}
          <div className="relative">
            <button
              id="chat-menu-button"
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full hover:bg-slate-100/90 text-slate-600 flex items-center justify-center cursor-pointer active:scale-90 transition-all border border-transparent hover:border-slate-200/60"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 card-glossy rounded-2xl py-1.5 z-40 text-xs text-slate-700 shadow-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setShowDistrictInfo(true); setShowMenu(false); }}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50/90 flex items-center gap-2 font-bold transition-colors"
                >
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>जिल्हा माहिती</span>
                </button>
                <button
                  type="button"
                  onClick={() => { onOpenVoiceRoom(district.id); setShowMenu(false); }}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50/90 flex items-center gap-2 font-bold transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>जिल्हा व्हॉईस रूम</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('सूचना: अयोग्य भाषा वापरणाऱ्या युजर्सना रिपोर्ट करण्यासाठी मेसेजवर क्लिक करा.');
                    setShowMenu(false);
                  }}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-red-50/80 flex items-center gap-2 text-red-600 font-bold transition-colors"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>नियम व सुरक्षा</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* District Info Banner Modal */}
      {showDistrictInfo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DistrictIcon type={district.iconType} color={district.color} size={28} />
                <h3 className="font-bold text-slate-900 text-base">{district.nameMr} ({district.nameEn})</h3>
              </div>
              <button onClick={() => setShowDistrictInfo(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-1.5 pt-1">
              <p><span className="font-semibold text-slate-800">विभाग:</span> {district.divisionMr} ({district.divisionEn})</p>
              <p><span className="font-semibold text-slate-800">प्रमुख ओळख व वारसा:</span> {district.landmarkMr}</p>
              <p className="text-slate-500 pt-1 leading-relaxed">
                हा {district.nameMr} जिल्ह्यातील नागरिकांचा स्वतंत्र अधिकृत संवाद कक्ष आहे. येथे केवळ खरी चर्चा आणि मित्रभाव जोपासा.
              </p>
            </div>
            <button
              onClick={() => setShowDistrictInfo(false)}
              className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              समजले
            </button>
          </div>
        </div>
      )}

      {/* Message Reporting Modal */}
      {selectedMessageForReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <Flag className="w-4 h-4" />
                <span>मेसेजची तक्रार करा (Report)</span>
              </div>
              <button onClick={() => setSelectedMessageForReport(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-800 text-center flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <p className="text-xs font-bold">तुमची तक्रार नोंदवली गेली आहे. धन्यवाद!</p>
              </div>
            ) : (
              <>
                <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 italic border border-slate-200">
                  "{selectedMessageForReport.text}"
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    तक्रारीचे कारण सांगा:
                  </label>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="उदा. असभ्य भाषा, स्पॅम किंवा आक्षेपार्ह मजकूर..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-400 focus:outline-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleBlockSender(selectedMessageForReport.senderId)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    वापरकर्ता ब्लॉक करा
                  </button>
                  <button
                    type="button"
                    onClick={handleReportMessage}
                    disabled={!reportReason.trim()}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold"
                  >
                    तक्रार पाठवा
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-xs">संदेश लोड होत आहेत...</p>
          </div>
        ) : visibleMessages.length === 0 ? (
          /* Honest Empty State - STRICT PROMPT REQUIREMENT */
          <div className="flex flex-col items-center justify-center h-full text-center px-4 max-w-xs mx-auto space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs border border-blue-100">
              <DistrictIcon type={district.iconType} color={district.color} size={36} />
            </div>
            <div className="space-y-1">
              {/* Exact Marathi empty state string specified by user prompt */}
              <h3 className="font-bold text-slate-800 text-base">
                या चॅटमध्ये अजून संदेश नाहीत.
              </h3>
              <p className="text-xs text-slate-500">
                {district.nameMr} जिल्ह्यातील पहिली गप्पा तुम्ही सुरू करा! आपले विचार किंवा अनुभव शेअर करा.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-1.5 w-full">
              <button
                type="button"
                onClick={() => handleSendQuickPhrase(`नमस्कार ${district.nameMr}करांनो! 🙏`)}
                className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-xl transition-all shadow-xs"
              >
                "नमस्कार {district.nameMr}करांनो! 🙏" पाठवा
              </button>
            </div>
          </div>
        ) : (
          /* Actual Real-time Messages */
          visibleMessages.map((msg) => {
            const isMe = msg.senderId === currentUserProfile?.uid;
            const timeFormatted = msg.createdAt?.toDate
              ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'आत्ताच';
            const senderDistrictObj = MAHARASHTRA_DISTRICTS.find(d => d.id === msg.senderDistrict);
            const senderDisplayName = msg.senderName || (isMe ? currentUserProfile?.displayName : 'वापरकर्ता') || 'वापरकर्ता';

            const bubbleStyle = msg.senderBubble ? getBubbleById(msg.senderBubble) : null;
            const badgeStyle = msg.senderBadge ? getBadgeById(msg.senderBadge) : null;
            const nameEffectStyle = msg.senderNameEffect ? getNameEffectById(msg.senderNameEffect) : null;

            return (
              <div
                key={msg.id}
                className={`flex gap-2 items-end ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {/* Other User Avatar */}
                {!isMe && (
                  <div 
                    onClick={() => handleBlockSender(msg.senderId)}
                    title={`${senderDisplayName} (क्लिक करून पर्याय पहा)`}
                    className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0 mb-1 ring-1 ring-slate-300 cursor-pointer shadow-2xs"
                  >
                    {msg.senderPhoto ? (
                      <img src={msg.senderPhoto} alt={senderDisplayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs text-blue-700 bg-blue-100">
                        {senderDisplayName.slice(0, 1)}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Bubble with prominent Sender Name & Custom Theme if equipped */}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-xs relative group ${
                    bubbleStyle
                      ? `bg-gradient-to-r ${bubbleStyle.bgGradient} ${bubbleStyle.borderColor} ${bubbleStyle.textColor} border ${
                          isMe ? 'rounded-br-xs' : 'rounded-bl-xs'
                        }`
                      : isMe
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-xs border border-blue-400/30 shadow-[0_2px_8px_rgba(37,99,235,0.25)]'
                      : 'card-glossy text-slate-800 rounded-bl-xs'
                  }`}
                >
                  {/* SENDER NAME HEADER: Explicitly displays who sent the message */}
                  <div
                    className={`flex items-center justify-between gap-2 mb-1.5 pb-1 border-b ${
                      bubbleStyle
                        ? 'border-white/20'
                        : isMe ? 'border-blue-500/50' : 'border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <span
                        className={`font-black text-xs truncate ${
                          nameEffectStyle 
                            ? nameEffectStyle.gradientStyle 
                            : isMe ? 'text-amber-300' : 'text-blue-700'
                        }`}
                      >
                        {senderDisplayName}
                      </span>

                      {/* Maharashtra Culturally Authentic Badge */}
                      {badgeStyle && (
                        <span 
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black shrink-0 border bg-white/90 text-slate-900 shadow-2xs"
                          title={badgeStyle.nameMr}
                        >
                          <span>{badgeStyle.icon}</span>
                          <span className="text-[8px] font-bold hidden xs:inline">{badgeStyle.nameMr.split(' ')[0]}</span>
                        </span>
                      )}

                      {isMe ? (
                        <span className="text-[9px] bg-blue-700/80 text-blue-200 border border-blue-400/40 px-1.5 py-0.5 rounded-md font-bold shrink-0">
                          तुम्ही
                        </span>
                      ) : senderDistrictObj ? (
                        <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-200/60 px-1.5 py-0.5 rounded-md font-semibold shrink-0">
                          {senderDistrictObj.nameMr}
                        </span>
                      ) : null}
                    </div>

                    {!isMe && (
                      <button
                        type="button"
                        onClick={() => setSelectedMessageForReport(msg)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5 shrink-0"
                        title="तक्रार करा (Report)"
                      >
                        <Flag className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Message Body */}
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    bubbleStyle
                      ? bubbleStyle.textColor
                      : isMe ? 'text-white font-normal' : 'text-slate-800'
                  }`}>
                    {msg.text}
                  </p>

                  {/* Timestamp matching Mockup Screen 5 */}
                  <div
                    className={`text-[10px] text-right mt-1 font-medium ${
                      bubbleStyle
                        ? 'opacity-70'
                        : isMe ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {timeFormatted}
                  </div>
                </div>

                {/* Current User Avatar for my own sent messages */}
                {isMe && (
                  <div 
                    title={`${senderDisplayName} (तुम्ही)`}
                    className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 shrink-0 mb-1 ring-1 ring-blue-400 shadow-2xs"
                  >
                    {currentUserProfile?.photoURL || msg.senderPhoto ? (
                      <img 
                        src={currentUserProfile?.photoURL || msg.senderPhoto} 
                        alt="तुम्ही" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs text-blue-700 bg-blue-100">
                        {senderDisplayName.slice(0, 1) || 'मी'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Regional Phrases Pill Scroll */}
      <div className="bg-white/80 backdrop-blur-md border-t border-slate-200/80 px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">
          झटपट:
        </span>
        {QUICK_PHRASES.map((phrase, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendQuickPhrase(phrase)}
            className="whitespace-nowrap px-3 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-full text-xs font-bold transition-all cursor-pointer border border-slate-200/80 shadow-2xs active:scale-95"
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* Emoji Picker Popup if toggled */}
      {showEmojiPicker && (
        <div className="bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center gap-3 overflow-x-auto no-scrollbar">
          {EMOJIS.map((emoji, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              className="text-xl hover:scale-125 transition-transform p-1 cursor-pointer active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Message Input Bar matching Mockup Screen 5 */}
      <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200/80 p-2.5 flex items-center gap-2 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        {/* Emoji Button */}
        <button
          id="toggle-emoji-button"
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer shrink-0 active:scale-90"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Quick Gift Button */}
        <button
          id="chat-input-gift-button"
          type="button"
          onClick={() => setShowGiftModal(true)}
          className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-all cursor-pointer shrink-0 active:scale-90"
          title="भेटवस्तू पाठवा (Send Gift)"
        >
          <Gift className="w-5 h-5" />
        </button>

        {/* Input Field with exact placeholder from Screen 5: "मेसेज टाइप करा..." */}
        <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
          <input
            id="chat-message-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="मेसेज टाइप करा..."
            maxLength={1000}
            className="flex-1 py-2 px-3.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200/70 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 rounded-2xl text-xs sm:text-sm focus:outline-none transition-all"
          />

          {/* Send Button: Blue Circle with Paper Airplane matching Mockup Screen 5 */}
          <button
            id="send-message-button"
            type="submit"
            disabled={!inputText.trim() || sending}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-90 disabled:opacity-40 text-white flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,0.3)] transition-all shrink-0 cursor-pointer border border-blue-400/40 btn-glossy"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 translate-x-0.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
