import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Share2, 
  X, 
  Users, 
  Gift as GiftIcon, 
  Sparkles, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  FlipHorizontal,
  Flame,
  Award,
  PhoneOff,
  Radio,
  Swords,
  UserPlus,
  UserCheck,
  Zap
} from 'lucide-react';
import { UserProfile, db } from '../../../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { LiveMediaProvider } from '../providers';
import { 
  LiveStream, 
  LiveMessage, 
  LiveParticipant,
  subscribeToLiveStream, 
  subscribeToLiveMessages, 
  subscribeToLiveParticipants,
  sendLiveMessage,
  sendStreamLike,
  endLiveStream,
  joinLiveStream,
  leaveLiveStream
} from '../services/streamService';
import { 
  StageGuest, 
  StageRequest,
  subscribeToStageGuests, 
  subscribeToStageRequests,
  requestStageAccess,
  cancelStageRequest,
  acceptStageRequest,
  rejectStageRequest,
  removeGuestFromStage,
  toggleGuestMute
} from '../services/stageService';
import { 
  PKBattle, 
  subscribeToPKBattle, 
  subscribeToIncomingPKInvites,
  createPKInvite,
  endPKBattle
} from '../services/pkService';
import { LIVE_CONFIG } from '../config/liveConfig';
import { MultiGuestGrid } from './MultiGuestGrid';
import { PKBattleStage } from './PKBattleStage';
import { GuestRequestsSheet } from './GuestRequestsSheet';
import { PKInviteModal } from './PKInviteModal';
import { IncomingPKBanner } from './IncomingPKBanner';
import { WinnerCelebration } from './WinnerCelebration';
import { ChatOverlay } from './ChatOverlay';
import { ChatInput } from './ChatInput';
import { FloatingLikes } from './FloatingLikes';
import { ViewerListSheet } from './ViewerListSheet';
import { RoyalEntranceBanner, EntranceEvent } from './RoyalEntranceBanner';
import { LIVE_FILTERS, LiveFilter } from '../config/filters';
import { FilterPickerSheet } from './FilterPickerSheet';
import { AudioOnlyVisualizer } from './AudioOnlyVisualizer';
import { StreamSummaryModal, StreamSummaryData } from './StreamSummaryModal';

interface LiveRoomProps {
  streamId: string;
  initialStream?: LiveStream;
  currentUserProfile: UserProfile | null;
  provider: LiveMediaProvider;
  isHost?: boolean;
  onLeave: () => void;
}

export const LiveRoom: React.FC<LiveRoomProps> = ({
  streamId,
  initialStream,
  currentUserProfile,
  provider,
  isHost = false,
  onLeave,
}) => {
  const [stream, setStream] = useState<LiveStream | null>(initialStream || null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [participants, setParticipants] = useState<LiveParticipant[]>([]);
  const [likeTriggers, setLikeTriggers] = useState(0);
  const [showViewerList, setShowViewerList] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  // Multi-Guest State
  const [stageGuests, setStageGuests] = useState<StageGuest[]>([]);
  const [stageRequests, setStageRequests] = useState<StageRequest[]>([]);
  const [showRequestsSheet, setShowRequestsSheet] = useState(false);
  const [hasRequestedStage, setHasRequestedStage] = useState(false);

  // PK Battle State
  const [activeBattle, setActiveBattle] = useState<PKBattle | null>(null);
  const [incomingPKInvites, setIncomingPKInvites] = useState<PKBattle[]>([]);
  const [showPKModal, setShowPKModal] = useState(false);
  const [winnerCelebration, setWinnerCelebration] = useState<{ battle: PKBattle; winnerUid: string | 'draw' } | null>(null);
  const [activeEntranceEvent, setActiveEntranceEvent] = useState<EntranceEvent | null>(null);
  const seenEntranceMessagesRef = useRef<Set<string>>(new Set());

  // Host media state
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<LiveFilter>(LIVE_FILTERS[0]);
  const [showFilterPicker, setShowFilterPicker] = useState(false);
  const [isDataSaverAudioOnly, setIsDataSaverAudioOnly] = useState(false);
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(provider.getLocalStream());
  const [remoteHostStream, setRemoteHostStream] = useState<MediaStream | null>(null);
  const [summaryData, setSummaryData] = useState<StreamSummaryData | null>(null);
  const streamStartTimeRef = useRef<number>(Date.now());

  // Listen for subscribed remote tracks (from host or other stage participants)
  useEffect(() => {
    provider.onTrackSubscribed((track, participantId) => {
      if (track.kind === 'video') {
        setRemoteHostStream(new MediaStream([track]));
      }
    });

    provider.onTrackUnsubscribed((participantId) => {
      if (!isHost && participantId === stream?.hostUid) {
        setRemoteHostStream(null);
      }
    });
  }, [provider, isHost, stream?.hostUid]);

  const isCurrentUserOnStage = stageGuests.some((g) => g.userId === currentUserProfile?.uid);

  // Listen to Firestore stream changes
  useEffect(() => {
    const unsubStream = subscribeToLiveStream(streamId, (updated) => {
      if (updated) {
        setStream(updated);
        if (updated.status === 'ended' && !isHost) {
          alert('थेट संवाद यजमानांकडून समाप्त करण्यात आला आहे.');
          onLeave();
        }
      }
    });

    const unsubMessages = subscribeToLiveMessages(streamId, (msgs) => {
      setMessages(msgs);
      // Trigger VIP entrance banner when royal entrance arrives
      for (const m of msgs) {
        if (!seenEntranceMessagesRef.current.has(m.id)) {
          seenEntranceMessagesRef.current.add(m.id);
          if (m.type === 'system' && (m.senderIsVip || m.text.includes('शाही'))) {
            setActiveEntranceEvent({
              id: m.id,
              userName: m.senderName || 'VIP सदस्य',
              userPhoto: m.senderPhotoURL,
              district: m.senderDistrict,
              vipLevel: m.senderVipLevel || 1,
              effectType: 'royal_palakhi',
            });
            break;
          }
        }
      }
    });

    const unsubParticipants = subscribeToLiveParticipants(streamId, (parts) => {
      setParticipants(parts);
    });

    // Stage Guests listener
    const unsubGuests = subscribeToStageGuests(streamId, (guests) => {
      setStageGuests(guests);
    });

    // Join live stream with VIP info if viewer
    if (!isHost && currentUserProfile) {
      const isVipUser = currentUserProfile.subscriptionStatus === 'active' || ((currentUserProfile.vipLevel ?? 0) > 0);
      joinLiveStream(streamId, {
        uid: currentUserProfile.uid,
        displayName: currentUserProfile.displayName,
        photoURL: currentUserProfile.photoURL,
        district: currentUserProfile.district,
        isVip: isVipUser,
        vipLevel: currentUserProfile.vipLevel || (isVipUser ? 1 : 0),
      });
    }

    // Refresh local stream ref
    setLocalMediaStream(provider.getLocalStream());

    return () => {
      unsubStream();
      unsubMessages();
      unsubParticipants();
      unsubGuests();
      if (!isHost && currentUserProfile) {
        leaveLiveStream(streamId, currentUserProfile.uid);
      } else if (isHost) {
        endLiveStream(streamId).catch(() => {});
      }
    };
  }, [streamId, isHost, currentUserProfile]);

  // Ensure stream is properly ended if host refreshes, leaves or closes tab
  useEffect(() => {
    if (!isHost) return;
    const handleUnload = () => {
      endLiveStream(streamId).catch(() => {});
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [isHost, streamId]);

  // Host-specific listeners: Guest Requests & PK Invites
  useEffect(() => {
    if (!isHost || !currentUserProfile) return;

    const unsubRequests = subscribeToStageRequests(streamId, (requests) => {
      setStageRequests(requests);
    });

    const unsubPKInvites = subscribeToIncomingPKInvites(currentUserProfile.uid, (invites) => {
      setIncomingPKInvites(invites);
    });

    return () => {
      unsubRequests();
      unsubPKInvites();
    };
  }, [isHost, streamId, currentUserProfile]);

  // PK Battle subscription when activePkId is present
  useEffect(() => {
    if (!stream?.activePkId) {
      setActiveBattle(null);
      return;
    }

    const unsubPK = subscribeToPKBattle(stream.activePkId, (battle) => {
      setActiveBattle(battle);
      if (battle?.status === 'ended' && battle.winnerUid) {
        setWinnerCelebration({ battle, winnerUid: battle.winnerUid });
      }
    });

    return () => unsubPK();
  }, [stream?.activePkId]);

  // Host Toggle handlers
  const handleToggleAudio = async () => {
    const next = !isAudioEnabled;
    await provider.toggleAudio(next);
    setIsAudioEnabled(next);
  };

  const handleToggleVideo = async () => {
    const next = !isVideoEnabled;
    await provider.toggleVideo(next);
    setIsVideoEnabled(next);
    setLocalMediaStream(provider.getLocalStream());
  };

  const handleFlipCamera = async () => {
    await provider.flipCamera();
    setIsFrontCamera(!isFrontCamera);
    setLocalMediaStream(provider.getLocalStream());
  };

  const handleSendMessage = async (text: string) => {
    if (!currentUserProfile) return;
    const isVipUser = currentUserProfile.subscriptionStatus === 'active' || ((currentUserProfile.vipLevel ?? 0) > 0);
    await sendLiveMessage(streamId, {
      uid: currentUserProfile.uid,
      displayName: currentUserProfile.displayName,
      photoURL: currentUserProfile.photoURL,
      district: currentUserProfile.district,
      isVip: isVipUser,
      vipLevel: currentUserProfile.vipLevel || (isVipUser ? 1 : 0),
      equippedBadge: currentUserProfile.equippedBadge,
      equippedBubble: currentUserProfile.equippedBubble,
    }, text, 'chat');
  };

  const handleSendLike = async () => {
    setLikeTriggers((prev) => prev + 1);
    await sendStreamLike(streamId, 1);
  };

  // Stage Guest Operations
  const handleToggleStageRequest = async () => {
    if (!currentUserProfile) return;
    if (hasRequestedStage) {
      await cancelStageRequest(streamId, currentUserProfile.uid);
      setHasRequestedStage(false);
    } else {
      await requestStageAccess(streamId, {
        uid: currentUserProfile.uid,
        displayName: currentUserProfile.displayName,
        photoURL: currentUserProfile.photoURL,
        district: currentUserProfile.district,
      });
      setHasRequestedStage(true);
    }
  };

  const handleAcceptGuest = async (req: StageRequest) => {
    const nextSlot = stageGuests.length + 1;
    await acceptStageRequest(streamId, req, nextSlot);
  };

  const handleRejectGuest = async (userId: string) => {
    await rejectStageRequest(streamId, userId);
  };

  const handleMuteGuest = async (guestId: string, isMuted: boolean) => {
    await toggleGuestMute(streamId, guestId, isMuted);
  };

  const handleKickGuest = async (guestId: string, name: string) => {
    await removeGuestFromStage(streamId, guestId, name);
  };

  const handleLeaveStage = async () => {
    if (!currentUserProfile) return;
    await removeGuestFromStage(streamId, currentUserProfile.uid, currentUserProfile.displayName);
  };

  // PK Battle Operations
  const handleSendPKChallenge = async (targetStream: LiveStream) => {
    if (!currentUserProfile || !stream) return;
    setShowPKModal(false);

    try {
      await createPKInvite(
        {
          streamId: stream.id,
          uid: currentUserProfile.uid,
          name: currentUserProfile.displayName || 'यजमान',
          photoURL: currentUserProfile.photoURL,
          district: currentUserProfile.district,
        },
        {
          streamId: targetStream.id,
          uid: targetStream.hostUid,
          name: targetStream.hostName,
          photoURL: targetStream.hostPhotoURL,
          district: targetStream.hostDistrict,
        }
      );
      alert(`${targetStream.hostName} यांना PK महामुकाबल्याचे आव्हान पाठवले आहे!`);
    } catch (err: any) {
      console.error('Error creating PK invite:', err);
      alert('आव्हान पाठवताना त्रुटी आली: ' + err.message);
    }
  };

  const handleConfirmEndStream = async () => {
    try {
      const streamStart = stream?.createdAt?.toDate?.()?.getTime() || streamStartTimeRef.current;
      const durationSeconds = Math.max(1, Math.floor((Date.now() - streamStart) / 1000));
      const giftMsgs = messages.filter((m) => m.type === 'gift');
      const giftsCount = Math.max(stream?.totalGiftsReceived || 0, giftMsgs.length);

      // Top gifters computation
      const giftersMap = new Map<string, { name: string; photoURL?: string; count: number }>();
      giftMsgs.forEach((m) => {
        const existing = giftersMap.get(m.senderUid) || {
          name: m.senderName || 'मित्र',
          photoURL: m.senderPhotoURL,
          count: 0
        };
        existing.count += 1;
        giftersMap.set(m.senderUid, existing);
      });
      const topGifters = Array.from(giftersMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      const coinsEarned = giftsCount * 50 + Math.max(25, Math.floor(durationSeconds / 60) * 10);

      const summary: StreamSummaryData = {
        streamTitle: stream?.title || 'लाईव्ह संवाद',
        category: stream?.category || 'chitchat',
        isAudioOnly: !!stream?.isAudioOnly,
        durationSeconds,
        viewerCount: Math.max(stream?.viewerCount || 1, participants.length),
        likesCount: stream?.likesCount || 0,
        giftsCount,
        coinsEarned,
        topGifters,
      };

      setSummaryData(summary);
      setShowEndModal(false);

      if (currentUserProfile?.uid && coinsEarned > 0) {
        const userRef = doc(db, 'users', currentUserProfile.uid);
        updateDoc(userRef, {
          coins: increment(coinsEarned),
        }).catch((err) => console.warn('Could not increment host coins:', err));
      }

      await endLiveStream(streamId);
      await provider.disconnect();
    } catch (err) {
      console.error('Error ending live stream:', err);
      onLeave();
    }
  };

  const handleExitViewer = async () => {
    if (currentUserProfile) {
      if (isCurrentUserOnStage) {
        await removeGuestFromStage(streamId, currentUserProfile.uid, currentUserProfile.displayName);
      }
      await leaveLiveStream(streamId, currentUserProfile.uid);
    }
    await provider.disconnect();
    onLeave();
  };

  const isPKActive = activeBattle && activeBattle.status === 'active';

  return (
    <div className="fixed inset-0 z-50 w-full max-w-md mx-auto h-[100dvh] max-h-[100dvh] bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Incoming PK Challenge Banner */}
      {incomingPKInvites.length > 0 && (
        <IncomingPKBanner
          invite={incomingPKInvites[0]}
          onClose={() => setIncomingPKInvites((prev) => prev.slice(1))}
        />
      )}

      {/* VIP Royal Entrance Banner */}
      <RoyalEntranceBanner
        event={activeEntranceEvent}
        onDismiss={() => setActiveEntranceEvent(null)}
      />

      {/* Main Stage: Audio Visualizer OR Video Stage */}
      <div className="absolute inset-0 z-0">
        {(stream?.isAudioOnly || isDataSaverAudioOnly) ? (
          <AudioOnlyVisualizer
            hostName={stream?.hostName || 'यजमान'}
            hostPhotoURL={stream?.hostPhotoURL}
            hostDistrict={stream?.hostDistrict}
            title={stream?.title || 'लाईव्ह संवाद'}
            category={stream?.category}
            stageGuests={stageGuests}
            isHostSpeaking={isAudioEnabled}
          />
        ) : isPKActive ? (
          <PKBattleStage
            battle={activeBattle}
            localStream={isHost ? localMediaStream : (remoteHostStream || localMediaStream)}
            currentUserId={currentUserProfile?.uid}
            isHostA={activeBattle.hostAUid === currentUserProfile?.uid}
            isHostB={activeBattle.hostBUid === currentUserProfile?.uid}
            onPKEnd={(winner) => {
              setWinnerCelebration({ battle: activeBattle, winnerUid: winner });
            }}
          />
        ) : (
          <MultiGuestGrid
            stream={stream}
            hostStream={isHost ? localMediaStream : (remoteHostStream || localMediaStream)}
            stageGuests={stageGuests}
            currentUserId={currentUserProfile?.uid}
            isHost={isHost}
            isFrontCamera={isFrontCamera}
            filter={selectedFilter}
            onMuteGuest={handleMuteGuest}
            onKickGuest={handleKickGuest}
            onLeaveStage={handleLeaveStage}
            onRequestJoinStage={handleToggleStageRequest}
          />
        )}
        {/* Subtle dark gradient for clear readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none" />
      </div>

      {/* Floating Animated Hearts */}
      <FloatingLikes triggerCount={likeTriggers} />

      {/* Top Floating Header */}
      <header className="relative z-20 px-3 pt-4 flex items-center justify-between pointer-events-auto">
        {/* Host Info Capsule */}
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full pl-1 pr-3 py-1 shadow-lg">
          <div className="relative">
            {stream?.hostPhotoURL ? (
              <img
                src={stream.hostPhotoURL}
                alt={stream.hostName}
                className="w-9 h-9 rounded-full object-cover border border-rose-500"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-rose-600 flex items-center justify-center font-bold text-xs text-white">
                {stream?.hostName?.charAt(0) || 'H'}
              </div>
            )}
            <span className="absolute -bottom-0.5 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-xs text-white max-w-[90px] truncate">
                {stream?.hostName || 'यजमान'}
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-600 text-white animate-pulse">
                LIVE
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-amber-300">
              <Flame className="w-3 h-3 text-rose-400" />
              <span>{stream?.likesCount || 0} पसंती</span>
            </div>
          </div>
        </div>

        {/* Action Controls in Top Bar */}
        <div className="flex items-center gap-1.5">
          {/* Data Saver Mode Toggle (for Viewers on video streams) */}
          {!isHost && !stream?.isAudioOnly && (
            <button
              onClick={() => setIsDataSaverAudioOnly(!isDataSaverAudioOnly)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full backdrop-blur-md border text-xs font-semibold active:scale-95 transition-all cursor-pointer ${
                isDataSaverAudioOnly
                  ? 'bg-amber-400 text-black border-amber-300 font-black shadow-md'
                  : 'bg-black/50 border-white/10 text-white hover:bg-black/70'
              }`}
              title={isDataSaverAudioOnly ? "व्हिडिओ सुरू करा" : "डेटा सेव्हर (केवळ ऑडिओ) सुरू करा"}
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isDataSaverAudioOnly ? 'डेटा सेव्हर चालू' : 'डेटा सेव्हर'}</span>
            </button>
          )}

          {/* Host PK Challenge Button (Video streams only) */}
          {isHost && !stream?.isAudioOnly && !stream?.isPkActive && (
            <button
              onClick={() => setShowPKModal(true)}
              id="btn-open-pk-modal"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-black shadow-md shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
              title="PK आव्हान द्या"
            >
              <Swords className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PK आव्हान</span>
            </button>
          )}

          {/* Host Pending Guest Requests Pill */}
          {isHost && (
            <button
              onClick={() => setShowRequestsSheet(true)}
              id="btn-open-guest-requests"
              className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-semibold hover:bg-black/70 cursor-pointer transition-all"
              title="मंचावरील विनंत्या"
            >
              <UserPlus className="w-3.5 h-3.5 text-sky-400" />
              <span>{stageGuests.length}/3</span>
              {stageRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 rounded-full text-[9px] font-black flex items-center justify-center animate-bounce">
                  {stageRequests.length}
                </span>
              )}
            </button>
          )}

          {/* Viewers count pill */}
          <button
            onClick={() => setShowViewerList(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-semibold hover:bg-black/70 cursor-pointer transition-all"
          >
            <Users className="w-3.5 h-3.5 text-rose-400" />
            <span>{stream?.viewerCount || 1}</span>
          </button>

          {/* Close/End Button */}
          {isHost ? (
            <button
              onClick={() => setShowEndModal(true)}
              id="btn-host-end-stream"
              className="p-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
              title="लाईव्ह समाप्त करा"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleExitViewer}
              id="btn-viewer-exit-room"
              className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/70 text-white active:scale-95 transition-all cursor-pointer"
              title="बाहेर पडा"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Stream Category & Title Pill */}
      <div className="relative z-10 px-4 mt-2 pointer-events-none">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[11px] text-white/90">
          <Radio className="w-3 h-3 text-rose-400 animate-pulse" />
          <span className="font-semibold text-rose-300">{stream?.title}</span>
          {stream?.hostDistrict && (
            <span className="text-white/60">• {stream.hostDistrict}</span>
          )}
        </div>
      </div>

      {/* Bottom Area: Chat + Controls */}
      <div 
        className="relative z-20 px-4 pt-0 flex flex-col justify-end space-y-3 pointer-events-none shrink-0"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      >
        {/* Real-time Messages Feed */}
        <ChatOverlay
          messages={messages}
          onUserClick={(uid, name) => console.log('Clicked user:', uid, name)}
        />

        {/* Input Bar & Action Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Chat input */}
          <div className="flex-1">
            <ChatInput onSendMessage={handleSendMessage} />
          </div>

          {/* Host Quick Camera/Mic Controls */}
          {isHost && (
            <div className="flex items-center gap-1.5 shrink-0">
              {!stream?.isAudioOnly ? (
                <>
                  <button
                    onClick={() => setShowFilterPicker(true)}
                    className={`w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center active:scale-95 cursor-pointer ${
                      selectedFilter.id !== 'none'
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-amber-300'
                        : 'bg-black/50 text-white border-white/10 hover:bg-black/70'
                    }`}
                    title="सौंदर्य व फिल्टर्स (Filters)"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </button>

                  <button
                    onClick={handleFlipCamera}
                    className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-95 cursor-pointer"
                    title="कॅमेरा बदला"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] text-amber-300 font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>ऑडिओ थेट</span>
                </div>
              )}

              <button
                onClick={handleToggleAudio}
                className={`w-9 h-9 rounded-full backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-95 cursor-pointer ${
                  isAudioEnabled ? 'bg-black/50 text-white' : 'bg-rose-600 text-white'
                }`}
                title="माईक"
              >
                {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* Viewer: Join Stage Request Button */}
          {!isHost && !isCurrentUserOnStage && (
            <button
              onClick={handleToggleStageRequest}
              id="btn-request-stage"
              className={`px-3 py-2 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 shrink-0 cursor-pointer flex items-center gap-1 ${
                hasRequestedStage
                  ? 'bg-amber-500 text-black'
                  : 'bg-black/50 backdrop-blur-md border border-white/15 text-white hover:bg-black/70'
              }`}
              title={hasRequestedStage ? 'विनंती मागे घ्या' : 'मंचावर या'}
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{hasRequestedStage ? 'विनंती पाठवली' : 'मंच'}</span>
            </button>
          )}

          {/* Viewer Like Heart Button */}
          {!isHost && (
            <button
              onClick={handleSendLike}
              id="btn-stream-like"
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 active:scale-125 transition-transform cursor-pointer shrink-0"
              title="लाईक करा (Heart)"
            >
              <Heart className="w-5 h-5 fill-white" />
            </button>
          )}
        </div>
      </div>

      {/* Guest Requests Management Sheet (Host Only) */}
      {showRequestsSheet && (
        <GuestRequestsSheet
          requests={stageRequests}
          currentGuestCount={stageGuests.length}
          maxGuests={LIVE_CONFIG.MAX_GUESTS}
          onAccept={handleAcceptGuest}
          onReject={handleRejectGuest}
          onClose={() => setShowRequestsSheet(false)}
        />
      )}

      {/* PK Challenge Invite Modal (Host Only) */}
      {showPKModal && currentUserProfile && stream && (
        <PKInviteModal
          currentStreamId={stream.id}
          currentHostUid={currentUserProfile.uid}
          onSendChallenge={handleSendPKChallenge}
          onClose={() => setShowPKModal(false)}
        />
      )}

      {/* PK Winner Celebration Screen */}
      {winnerCelebration && (
        <WinnerCelebration
          battle={winnerCelebration.battle}
          winnerUid={winnerCelebration.winnerUid}
          onClose={() => setWinnerCelebration(null)}
        />
      )}

      {/* Viewers Sheet */}
      {showViewerList && (
        <ViewerListSheet
          participants={participants}
          viewerCount={stream?.viewerCount || 1}
          onClose={() => setShowViewerList(false)}
        />
      )}

      {/* Host End Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <PhoneOff className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white mb-1">
              लाईव्ह समाप्त करायचा आहे का?
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              आपला थेट संवाद सर्व प्रेक्षकांसाठी बंद होईल आणि आकडेवारी जतन केली जाईल.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                onClick={handleConfirmEndStream}
                id="btn-confirm-end-live"
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                हो, समाप्त करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Picker Sheet for Host */}
      <FilterPickerSheet
        isOpen={showFilterPicker}
        selectedFilter={selectedFilter}
        onSelectFilter={(f) => {
          setSelectedFilter(f);
          setShowFilterPicker(false);
        }}
        onClose={() => setShowFilterPicker(false)}
      />

      {/* Host Stream Completion & Earnings Summary Modal */}
      {summaryData && (
        <StreamSummaryModal
          data={summaryData}
          onDone={onLeave}
        />
      )}
    </div>
  );
};

