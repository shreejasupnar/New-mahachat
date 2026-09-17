import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { District } from '../data/districts';
import { 
  UserProfile, 
  VoiceParticipant, 
  joinVoiceRoom, 
  leaveVoiceRoom, 
  updateVoiceState, 
  subscribeToVoiceParticipants,
  takeVoiceSeat,
  leaveVoiceSeat,
  VoiceRoomStreamMessage,
  subscribeToVoiceRoomLiveMessages,
  sendVoiceRoomLiveMessage,
  cleanVoiceRoomChatStream
} from '../lib/firebase';
import { 
  isUserSubscribed, 
  subscribeToRoomGifts 
} from '../lib/premiumFirebase';
import { RoomGiftEvent } from '../premium/types';
import { GiftModal } from './premium/GiftModal';
import { GiftOverlay } from './premium/GiftOverlay';
import { PartyRoomHeader } from './voice/PartyRoomHeader';
import { PartyStageSeats } from './voice/PartyStageSeats';
import { FloatingGiftComboBanner } from './voice/FloatingGiftComboBanner';
import { PartyRoomChatStream } from './voice/PartyRoomChatStream';
import { PartyRankingCard } from './voice/PartyRankingCard';
import { PartyRoomControls } from './voice/PartyRoomControls';
import { PartyRoomRulesModal } from './voice/PartyRoomRulesModal';
import { InRoomChatInputModal } from './voice/InRoomChatInputModal';
import { FloatingReactionsOverlay, FloatingReaction } from './voice/FloatingReactionsOverlay';
import { SeatGiftFlightAnimation, seatGiftFlightManager } from './voice/SeatGiftFlightAnimation';
import { agoraVoiceService } from '../services/agoraVoiceService';
import { voiceRoomService, SpeakerRequest } from '../services/voiceRoomService';
import { SpeakerRequestsModal } from './voice/SpeakerRequestsModal';
import { HostControlsBottomSheet } from './voice/HostControlsBottomSheet';
import { UserActionModal } from './voice/UserActionModal';
import { ReportUserModal } from './voice/ReportUserModal';
import { VoiceAdminDashboardModal } from './voice/VoiceAdminDashboardModal';
import { BuyCoinsModal } from './voice/BuyCoinsModal';
import { CULTURAL_ROOM_THEMES } from '../data/voiceRoomAssets';
import { 
  X,
  Users,
  Mic,
  MicOff,
  Sparkles,
  Sliders,
  ShieldCheck,
  Palette
} from 'lucide-react';
import { 
  EffectsRenderer, 
  ParavarchyaGappaTheme, 
  RoomAmbientParticles, 
  EffectsSettingsModal, 
  AdminEffectsConfigModal, 
  effectQueue, 
  giftComboManager, 
  VISUAL_EFFECTS_REGISTRY,
  ROOM_THEMES_REGISTRY,
  getThemeById
} from '../effects';
import { VipEntryNoticeBanner } from './vip/VipEntryNoticeBanner';
import { getVipTier } from '../data/vipData';

function playVipFanfareSound(level: number) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const baseFreqs = level >= 7 
      ? [523.25, 659.25, 783.99, 1046.5] // Imperial royal fanfare
      : level >= 4 
      ? [440.00, 554.37, 659.25] // A major fanfare
      : [523.25, 659.25]; // Warm duo chime

    baseFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = level >= 6 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.7);
    });
  } catch {
    // Non-blocking audio play
  }
}

interface VoiceRoomProps {
  district: District;
  currentUserProfile: UserProfile | null;
  onBack: () => void;
  onOpenChat: () => void;
}

export const VoiceRoom: React.FC<VoiceRoomProps> = ({
  district,
  currentUserProfile,
  onBack,
  onOpenChat
}) => {
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [targetGiftRecipientUid, setTargetGiftRecipientUid] = useState<string | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showChatInputModal, setShowChatInputModal] = useState(false);
  const [activeGiftOverlay, setActiveGiftOverlay] = useState<RoomGiftEvent | null>(null);
  const [showEffectsSettingsModal, setShowEffectsSettingsModal] = useState(false);
  const [showAdminEffectsModal, setShowAdminEffectsModal] = useState(false);
  const [currentThemeId, setCurrentThemeId] = useState<string>('paravarchya_gappa');
  const [selectedSeatAction, setSelectedSeatAction] = useState<number | null>(null);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [speakerVolumes, setSpeakerVolumes] = useState<Record<string, number>>({});
  const [speakerRequests, setSpeakerRequests] = useState<SpeakerRequest[]>([]);
  const [showSpeakerRequestsModal, setShowSpeakerRequestsModal] = useState(false);
  const [showHostControlsSheet, setShowHostControlsSheet] = useState(false);
  const [showUserActionModal, setShowUserActionModal] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] = useState<VoiceParticipant | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [targetReportUser, setTargetReportUser] = useState<VoiceParticipant | null>(null);
  const [showVoiceAdminModal, setShowVoiceAdminModal] = useState(false);
  const [showBuyCoinsModal, setShowBuyCoinsModal] = useState(false);
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isAgoraLive, setIsAgoraLive] = useState(false);
  const [networkStats, setNetworkStats] = useState<{ uplink: number; downlink: number } | null>(null);
  const lastProcessedGiftIdRef = useRef<string>('');
  
  // In-room live rolling messages from real users only
  const [streamMessages, setStreamMessages] = useState<VoiceRoomStreamMessage[]>([]);

  // Active VIP Entry celebration notice banner
  const [activeVipEntry, setActiveVipEntry] = useState<{
    vipLevel: number;
    userName: string;
    userPhoto?: string;
    key?: string;
  } | null>(null);
  const lastProcessedEntryKeyRef = useRef<string>('');
  const vipEntryTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerVipEntry = useCallback((entry: {
    vipLevel: number;
    userName: string;
    userPhoto?: string;
    key?: string;
  }) => {
    if (vipEntryTimerRef.current) {
      clearTimeout(vipEntryTimerRef.current);
    }
    setActiveVipEntry(entry);
    playVipFanfareSound(entry.vipLevel);

    // Guaranteed dismiss from VoiceRoom state after 2.7s
    vipEntryTimerRef.current = setTimeout(() => {
      setActiveVipEntry(null);
      vipEntryTimerRef.current = null;
    }, 2700);
  }, []);

  useEffect(() => {
    return () => {
      if (vipEntryTimerRef.current) {
        clearTimeout(vipEntryTimerRef.current);
      }
    };
  }, []);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const profileRef = useRef(currentUserProfile);
  const isMutedRef = useRef(isMuted);
  const mySeatIndexRef = useRef<number | null>(null);

  useEffect(() => {
    profileRef.current = currentUserProfile;
  });

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const safelyCloseAudioContext = (ctx: AudioContext | null) => {
    if (!ctx) return;
    try {
      if (ctx.state !== 'closed') {
        const p = ctx.close();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {});
        }
      }
    } catch {
      // Ignore: DOMException: Cannot close a closed AudioContext
    }
  };

  const safeCloseAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {
          // Non-blocking
        }
      });
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      const ctx = audioContextRef.current;
      audioContextRef.current = null;
      safelyCloseAudioContext(ctx);
    }
  };

  // Subscribe to real-time room gifts with Priority Queue & Combo
  useEffect(() => {
    const unsubGifts = subscribeToRoomGifts(district.id, (events) => {
      if (events.length > 0) {
        const latest = events[0];
        // Ensure not duplicate trigger
        if (latest.id && latest.id !== lastProcessedGiftIdRef.current) {
          lastProcessedGiftIdRef.current = latest.id;

          const mult = latest.multiplier || 1;
          const combo = giftComboManager.registerGift(latest.senderId, latest.recipientId, latest.giftId);
          const finalCombo = Math.max(mult, combo);

          const matched = VISUAL_EFFECTS_REGISTRY.find(e => e.effectId === latest.giftId || e.nameMr === latest.giftNameMr);
          const isHighValue = latest.giftNameMr.includes('सिंहासन') || latest.giftNameMr.includes('रायगड') || latest.giftNameMr.includes('नकाशा') || latest.giftNameMr.includes('फेटा') || finalCombo >= 10;

          const effectModel = matched || {
            effectId: latest.giftId,
            effectType: 'gift' as const,
            name: latest.giftNameMr,
            nameMr: latest.giftNameMr,
            rarity: isHighValue ? ('legendary' as const) : ('rare' as const),
            tier: isHighValue ? (3 as const) : (finalCombo >= 5 ? (2 as const) : (1 as const)),
            price: 50,
            duration: isHighValue ? 3500 : 2200,
            animationDuration: isHighValue ? 3200 : 2000,
            previewIcon: latest.giftIcon || '🎁',
            soundPreset: isHighValue ? ('fanfare' as const) : ('chime' as const),
            priority: isHighValue ? 95 : 60,
            enabled: true,
            triggerType: 'gift' as const,
            targetType: 'top_banner' as const,
            culturalTheme: 'महाराष्ट्र भेट'
          };

          effectQueue.enqueue(effectModel, {
            senderId: latest.senderId,
            senderName: latest.senderName,
            senderPhoto: latest.senderPhoto,
            recipientId: latest.recipientId,
            recipientName: latest.recipientName,
            recipientPhoto: latest.recipientPhoto,
            comboCount: finalCombo
          });

          // Trigger seat-targeted gift flight animation for all viewers in the room
          seatGiftFlightManager.triggerFlight({
            giftIcon: latest.giftIcon || '🎁',
            giftName: latest.giftNameMr,
            multiplier: finalCombo,
            recipientUid: latest.recipientId === 'room_broadcast' ? undefined : latest.recipientId,
            recipientName: latest.recipientName,
            senderUid: latest.senderId,
            isBroadcast: latest.recipientId === 'room_broadcast'
          });
        }
      }
    });
    return () => unsubGifts();
  }, [district.id]);

  // Subscribe to real-time in-room voice chat messages
  useEffect(() => {
    const unsubMessages = subscribeToVoiceRoomLiveMessages(district.id, (msgs) => {
      if (msgs && msgs.length > 0) {
        setStreamMessages(msgs);

        // Check latest message for VIP entrance event
        const latest = msgs[msgs.length - 1];
        if (latest && latest.type === 'entry' && latest.level && latest.level >= 1) {
          const entryKey = `${latest.id || ''}_${latest.senderId}_${latest.level}`;
          if (entryKey !== lastProcessedEntryKeyRef.current) {
            lastProcessedEntryKeyRef.current = entryKey;
            
            // Only trigger if message is fresh (within last 15s) to avoid playing stale banners on load
            const msgTime = latest.createdAt
              ? (typeof latest.createdAt.toMillis === 'function'
                ? latest.createdAt.toMillis()
                : new Date(latest.createdAt).getTime())
              : Date.now();
            const isFresh = Math.abs(Date.now() - msgTime) < 15000;

            if (isFresh) {
              triggerVipEntry({
                vipLevel: latest.level,
                userName: latest.senderName,
                userPhoto: latest.senderPhoto,
                key: entryKey
              });
            }
          }
        }
      }
    });
    return () => unsubMessages();
  }, [district.id]);

  // Subscribe to real participants in this district's active voice room
  useEffect(() => {
    const unsub = subscribeToVoiceParticipants(district.id, (parts) => {
      setParticipants(parts);
    });

    return () => unsub();
  }, [district.id]);

  // Find my participant data
  const myParticipant = participants.find(p => p.uid === currentUserProfile?.uid);
  const mySeatIndex = myParticipant?.seatIndex !== undefined && myParticipant?.seatIndex !== null
    ? myParticipant.seatIndex
    : null;

  // Determine host and moderator status
  const isHost = mySeatIndex === 0 || myParticipant?.role === 'host' || currentUserProfile?.role === 'admin';
  const isHostOrMod = isHost || myParticipant?.role === 'moderator' || mySeatIndex === 1;

  useEffect(() => {
    mySeatIndexRef.current = mySeatIndex;
  }, [mySeatIndex]);

  // Subscribe to speaker hand-raise requests
  useEffect(() => {
    const unsub = voiceRoomService.subscribeSpeakerRequests(district.id, (reqs) => {
      setSpeakerRequests(reqs);
      if (currentUserProfile) {
        setIsHandRaised(reqs.some(r => r.uid === currentUserProfile.uid));
      }
    });
    return () => unsub();
  }, [district.id, currentUserProfile?.uid]);

  // Listen for Remote Host Mute
  useEffect(() => {
    if (myParticipant?.isHostMuted && !isMuted) {
      setIsMuted(true);
      agoraVoiceService.setMuted(true);
      alert('⚠️ होस्टने तुमचा माइक म्यूट केला आहे.');
    }
  }, [myParticipant?.isHostMuted]);

  // Agora RTC lifecycle: Join channel, register volume indicators & network quality
  useEffect(() => {
    if (!currentUserProfile) return;

    let active = true;

    // Check if banned before joining
    voiceRoomService.checkIsBanned(district.id, currentUserProfile.uid).then((isBanned) => {
      if (isBanned && active) {
        alert('🚫 तुम्हाला या व्हॉईस रूममधून तात्पुरते बॅन करण्यात आले आहे.');
        onBack();
        return;
      }

      // Join Agora voice channel
      agoraVoiceService.joinRoom({
        channelName: district.id,
        uid: currentUserProfile.uid,
        role: mySeatIndex !== null ? 'publisher' : 'subscriber'
      }).then(res => {
        if (active) {
          setIsAgoraLive(res.isLive);
        }
      }).catch(err => {
        console.warn('Agora join non-critical:', err);
      });
    });

    // Volume indicators for active speaking animations
    const unsubVol = agoraVoiceService.onVolumeIndicator((volumes) => {
      if (!active) return;
      const volMap: Record<string, number> = {};
      volumes.forEach(v => {
        volMap[String(v.uid)] = v.level;
      });
      setSpeakerVolumes(volMap);
    });

    // Network stats
    const unsubNet = agoraVoiceService.onNetworkQuality((stats) => {
      if (active) setNetworkStats(stats);
    });

    return () => {
      active = false;
      unsubVol();
      unsubNet();
      agoraVoiceService.leaveRoom();
    };
  }, [district.id, currentUserProfile?.uid]);

  // Switch Agora audio role dynamically when seating state changes
  useEffect(() => {
    if (!hasJoined) return;
    if (mySeatIndex !== null) {
      agoraVoiceService.switchRole('publisher').then(() => {
        agoraVoiceService.setMuted(isMuted);
      });
    } else {
      agoraVoiceService.switchRole('subscriber');
    }
  }, [mySeatIndex !== null, hasJoined]);

  // Auto join as participant when opening
  useEffect(() => {
    const profile = profileRef.current;
    if (!profile) return;

    const doJoin = async () => {
      try {
        // Check if user is banned
        const isBanned = await voiceRoomService.checkIsBanned(district.id, profile.uid);
        if (isBanned) {
          alert('🚫 तुम्हाला या कट्ट्यावरून बॅन केले आहे.');
          onBack();
          return;
        }

        const existing = participants.find(p => p.uid === profile.uid);
        if (existing) {
          setHasJoined(true);
          return;
        }

        // Find first available seat across 10 seats (0 to 9)
        const occupiedSeats = new Set(
          participants
            .map(p => p.seatIndex)
            .filter((s): s is number => s !== null && s !== undefined)
        );
        let assignedSeat: number | null = null;
        for (let i = 0; i < 10; i++) {
          if (!occupiedSeats.has(i)) {
            assignedSeat = i;
            break;
          }
        }

        await joinVoiceRoom(district.id, {
          uid: profile.uid,
          displayName: profile.displayName || 'MahaChat User',
          photoURL: profile.photoURL || '',
          isSpeaking: false,
          isMuted: false,
          role: assignedSeat !== null ? 'speaker' : 'listener',
          seatIndex: assignedSeat,
          equippedSeatFrame: profile.equippedSeatFrame || null,
          equippedBadge: profile.equippedBadge || null,
          equippedNameEffect: profile.equippedNameEffect || null,
          isPremium: isUserSubscribed(profile),
          vipLevel: profile.vipLevel || 0,
          joinedAt: null
        });
        setHasJoined(true);

        // Broadcast and display VIP entry announcement & fanfare if user is VIP 1+
        if (profile.vipLevel && profile.vipLevel >= 1) {
          const tier = getVipTier(profile.vipLevel);
          const entryText = tier ? tier.entryBannerTextMr : `VIP ${profile.vipLevel} यांचे कट्ट्यावर आगमन! 👑`;
          sendVoiceRoomLiveMessage(district.id, {
            type: 'entry',
            senderId: profile.uid,
            senderName: profile.displayName || 'VIP सदस्य',
            senderPhoto: profile.photoURL || '',
            text: entryText,
            level: profile.vipLevel
          }).catch(console.warn);

          triggerVipEntry({
            vipLevel: profile.vipLevel,
            userName: profile.displayName || 'VIP सदस्य',
            userPhoto: profile.photoURL || '',
            key: `join_${profile.uid}_${Date.now()}`
          });
        }
      } catch (err) {
        console.error('Error joining voice room:', err);
      }
    };

    doJoin();

    return () => {
      const current = profileRef.current;
      if (current) {
        leaveVoiceRoom(district.id, current.uid);
      }
      safeCloseAudio();
    };
  }, [district.id, currentUserProfile?.uid]);

  // Handle microphone mute state on track
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => {
        t.enabled = !isMuted;
      });
    }
    if (isMuted) {
      setIsSpeaking(false);
      const current = profileRef.current;
      if (current) {
        updateVoiceState(district.id, current.uid, { isSpeaking: false, isMuted: true });
      }
    }
  }, [isMuted, district.id]);

  // Microphone audio capture setup when seated
  useEffect(() => {
    const isSeated = hasJoined && mySeatIndex !== null;
    if (!isSeated) {
      safeCloseAudio();
      setIsSpeaking(false);
      const current = profileRef.current;
      if (current) {
        updateVoiceState(district.id, current.uid, { isSpeaking: false, isMuted: true });
      }
      return;
    }

    let isMounted = true;
    let lastSpeakingState = false;
    let lastStateChangeTime = 0;

    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isMounted) {
          stream.getTracks().forEach(t => {
            try { t.stop(); } catch {}
          });
          return;
        }

        // Apply current mute state
        stream.getAudioTracks().forEach(t => {
          t.enabled = !isMutedRef.current;
        });

        streamRef.current = stream;
        setAudioStream(stream);

        if (audioContextRef.current) {
          const oldCtx = audioContextRef.current;
          audioContextRef.current = null;
          safelyCloseAudioContext(oldCtx);
        }

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
          if (!isMounted || mySeatIndexRef.current === null) return;

          if (isMutedRef.current) {
            setIsSpeaking(false);
            animationFrameRef.current = requestAnimationFrame(checkVolume);
            return;
          }

          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const speaking = avg > 20;

          setIsSpeaking(speaking);

          const now = Date.now();
          if (speaking !== lastSpeakingState && (now - lastStateChangeTime > 800)) {
            lastSpeakingState = speaking;
            lastStateChangeTime = now;
            const current = profileRef.current;
            if (current) {
              updateVoiceState(district.id, current.uid, {
                isSpeaking: speaking,
                isMuted: false
              });
            }
          }

          animationFrameRef.current = requestAnimationFrame(checkVolume);
        };

        checkVolume();
      } catch (err) {
        console.warn('Microphone access:', err);
      }
    };

    setupAudio();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [hasJoined, mySeatIndex !== null, district.id]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    agoraVoiceService.setMuted(nextMuted);

    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => t.enabled = !nextMuted);
    }
    if (currentUserProfile) {
      updateVoiceState(district.id, currentUserProfile.uid, {
        isMuted: nextMuted,
        isSpeaking: false
      });
    }
  };

  const handleLeave = async () => {
    safeCloseAudio();
    await agoraVoiceService.leaveRoom();
    if (currentUserProfile) {
      await leaveVoiceRoom(district.id, currentUserProfile.uid);
    }
    onBack();
  };

  const handleSeatClick = async (index: number) => {
    if (!currentUserProfile) return;

    const seatedUser = seats[index];

    if (seatedUser) {
      // Tapped a seated user: open interactive User Action Modal (view, gift, mod controls, report)
      setSelectedUserForAction(seatedUser);
      setShowUserActionModal(true);
    } else {
      // Empty seat clicked:
      if (isRoomLocked && !isHostOrMod) {
        alert('🔒 हा कट्टा सध्या होस्टने लॉक केला आहे. कृपया बोलण्यासाठी खालील "हात वर करा" बटण वापरा.');
        return;
      }
      await takeVoiceSeat(district.id, currentUserProfile.uid, index, currentUserProfile);
      setIsMuted(false);
      agoraVoiceService.setMuted(false);
    }
  };

  // Hand raise by audience listener
  const handleRaiseHand = async () => {
    if (!currentUserProfile) return;
    try {
      if (isHandRaised) {
        // Cancel request
        const myReq = speakerRequests.find(r => r.uid === currentUserProfile.uid);
        if (myReq) {
          await voiceRoomService.rejectSpeakerRequest(district.id, myReq.id);
        }
        setIsHandRaised(false);
      } else {
        await voiceRoomService.requestSpeaker(district.id, currentUserProfile);
        setIsHandRaised(true);
        alert('✋ तुमची बोलण्याची विनंती होस्टकडे पाठवली आहे!');
      }
    } catch (err) {
      console.error('Hand raise error:', err);
    }
  };

  // Moderator approves speaker request
  const handleApproveSpeaker = async (request: SpeakerRequest, targetSeat: number) => {
    try {
      await voiceRoomService.acceptSpeakerRequest(
        district.id,
        request,
        targetSeat,
        currentUserProfile?.displayName || 'होस्ट'
      );
      setShowSpeakerRequestsModal(false);
    } catch (err) {
      console.error('Approve speaker error:', err);
    }
  };

  // Moderator rejects speaker request
  const handleRejectSpeaker = async (requestId: string) => {
    try {
      await voiceRoomService.rejectSpeakerRequest(district.id, requestId);
    } catch (err) {
      console.error('Reject speaker error:', err);
    }
  };

  // Moderator Mute All Speakers (with VIP 4+ protection)
  const handleMuteAll = async () => {
    try {
      const seated = participants.filter(p => p.seatIndex !== null && p.seatIndex !== undefined);
      for (const p of seated) {
        if (p.uid !== currentUserProfile?.uid) {
          // VIP 4+ has Anti-Mute Protection unless current user is System Admin
          if ((p.vipLevel || 0) >= 4 && !currentUserProfile?.isAdmin) {
            continue;
          }
          await voiceRoomService.muteSpeaker(
            district.id,
            p.uid,
            true,
            currentUserProfile?.displayName || 'होस्ट',
            p.displayName || 'सदस्य'
          );
        }
      }
      alert('🔇 सर्व स्पीकर्सना म्यूट करण्यात आले आहे (VIP 4+ संरक्षण वगळून).');
    } catch (err) {
      console.error('Mute all error:', err);
    }
  };

  // Moderator remote mute individual (with VIP 4+ Anti-Mute check)
  const handleRemoteMuteUser = async (targetUser: VoiceParticipant) => {
    // Check VIP 4+ Anti-Mute immunity
    if ((targetUser.vipLevel || 0) >= 4 && !currentUserProfile?.isAdmin) {
      alert(`🛡️ @${targetUser.displayName} यांच्याकडे VIP ${targetUser.vipLevel} म्यूट सुरक्षा कवच (Anti-Mute Protection) आहे!`);
      setShowUserActionModal(false);
      return;
    }

    await voiceRoomService.muteSpeaker(
      district.id,
      targetUser.uid,
      !targetUser.isMuted,
      currentUserProfile?.displayName || 'होस्ट',
      targetUser.displayName || 'सदस्य'
    );
    setShowUserActionModal(false);
  };

  // Moderator kick user from seat (with VIP 6+ Anti-Kick check)
  const handleKickUser = async (targetUser: VoiceParticipant) => {
    // Check VIP 6+ Anti-Kick immunity
    if ((targetUser.vipLevel || 0) >= 6 && !currentUserProfile?.isAdmin) {
      alert(`🛡️ @${targetUser.displayName} यांच्याकडे VIP ${targetUser.vipLevel} अजिंक्य सुरक्षा (Anti-Kick Immunity) आहे!`);
      setShowUserActionModal(false);
      return;
    }

    await voiceRoomService.kickFromSeat(
      district.id,
      targetUser.uid,
      currentUserProfile?.displayName || 'होस्ट',
      targetUser.displayName || 'सदस्य'
    );
    setShowUserActionModal(false);
  };

  // Moderator ban user (with VIP 6+ protection)
  const handleBanUser = async (targetUser: VoiceParticipant) => {
    if (!currentUserProfile) return;

    // Check VIP 6+ Supreme Protection
    if ((targetUser.vipLevel || 0) >= 6 && !currentUserProfile?.isAdmin) {
      alert(`👑 @${targetUser.displayName} यांच्याकडे VIP ${targetUser.vipLevel} सर्वोच्च सन्मान सुरक्षा अधिकार आहे!`);
      setShowUserActionModal(false);
      return;
    }

    await voiceRoomService.banUser(
      district.id,
      targetUser.uid,
      'होस्ट किंवा मॉडरेटरने कट्ट्यावरून बॅन केले.',
      currentUserProfile.displayName || 'होस्ट',
      targetUser.displayName || 'सदस्य'
    );
    setShowUserActionModal(false);
    alert('🚫 सदस्याला या कट्ट्यावरून बॅन करण्यात आले आहे.');
  };

  const handleQuickPickSeat = async () => {
    if (!currentUserProfile) return;
    const occupiedSeats = new Set(
      participants
        .map(p => p.seatIndex)
        .filter((s): s is number => s !== null && s !== undefined)
    );
    let assignedSeat: number | null = null;
    for (let i = 0; i < 10; i++) {
      if (!occupiedSeats.has(i)) {
        assignedSeat = i;
        break;
      }
    }
    if (assignedSeat !== null) {
      await takeVoiceSeat(district.id, currentUserProfile.uid, assignedSeat, currentUserProfile);
      setIsMuted(false);
    }
  };

  // Trigger floating animated reaction
  const handleTriggerReaction = (emoji: string) => {
    const newReaction: FloatingReaction = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      leftPercent: 15 + Math.random() * 65
    };
    setReactions(prev => [...prev, newReaction]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 3200);
  };

  // Clapping handler for room entry banners
  const handleClapUser = (userName: string) => {
    handleTriggerReaction('👏');
    if (currentUserProfile) {
      sendVoiceRoomLiveMessage(district.id, {
        type: 'chat',
        senderId: currentUserProfile.uid,
        senderName: currentUserProfile.displayName || 'सदस्य',
        senderPhoto: currentUserProfile.photoURL || '',
        text: `👏 @${userName} यांचे स्वागत असो! ✨`,
        level: 5
      }).catch(() => {});
    }
  };

  // In-room live chat message sending
  const handleSendLiveMessage = async (text: string) => {
    if (!currentUserProfile) return;
    await sendVoiceRoomLiveMessage(district.id, {
      type: 'chat',
      senderId: currentUserProfile.uid,
      senderName: currentUserProfile.displayName || 'सदस्य',
      senderPhoto: currentUserProfile.photoURL || '',
      text,
      level: 11
    });
  };

  // Clean chat moderation action
  const handleCleanChat = async () => {
    const modName = currentUserProfile?.displayName || 'होस्ट';
    await cleanVoiceRoomChatStream(district.id, modName);
  };

  // Organize 10 Stage Seats (Indices 0 to 9: 5 in line 1, 5 in line 2)
  // Only real occupants who joined the stage - strictly NO fake users
  const seats: (VoiceParticipant | null)[] = Array.from({ length: 10 }).map((_, idx) => {
    const realOccupant = participants.find(p => p.seatIndex === idx);
    return realOccupant || null;
  });

  const availableRoomUsers = useMemo(() => {
    const userMap = new Map<string, {
      uid: string;
      displayName: string;
      photoURL?: string;
      seatIndex?: number | null;
      seatLabel?: string;
      role?: 'host' | 'speaker' | 'listener' | 'audience' | string;
      isSpeaking?: boolean;
    }>();

    // 1. Add real participants from Firestore
    participants.forEach((p) => {
      if (p.uid && p.uid !== currentUserProfile?.uid) {
        const isHostUser = p.seatIndex === 0;
        const isOnStage = p.seatIndex !== null && p.seatIndex !== undefined;
        const seatLabel = isHostUser 
          ? '👑 आसन १ (होस्ट)' 
          : (isOnStage ? `🎙️ आसन ${(p.seatIndex ?? 0) + 1} (वक्ता)` : '🎧 श्रोता (Audience)');

        userMap.set(p.uid, {
          uid: p.uid,
          displayName: p.displayName || 'कट्टा सदस्य',
          photoURL: p.photoURL,
          seatIndex: p.seatIndex,
          seatLabel,
          role: isHostUser ? 'host' : (isOnStage ? 'speaker' : 'audience'),
          isSpeaking: p.isSpeaking
        });
      }
    });

    // 2. Add stage seat occupants (including stage speakers)
    seats.forEach((seat, idx) => {
      if (seat && seat.uid && seat.uid !== currentUserProfile?.uid) {
        if (!userMap.has(seat.uid)) {
          const isHostUser = idx === 0;
          userMap.set(seat.uid, {
            uid: seat.uid,
            displayName: seat.displayName || `आसन ${idx + 1}`,
            photoURL: seat.photoURL,
            seatIndex: idx,
            seatLabel: isHostUser ? '👑 आसन १ (होस्ट)' : `🎙️ आसन ${idx + 1} (वक्ता)`,
            role: isHostUser ? 'host' : 'speaker',
            isSpeaking: seat.isSpeaking
          });
        }
      }
    });

    return Array.from(userMap.values());
  }, [participants, seats, currentUserProfile?.uid]);

  const audience = participants.filter(p => p.seatIndex === null || p.seatIndex === undefined);
  const totalCount = participants.length;
  const activeTheme = getThemeById(currentThemeId) || ROOM_THEMES_REGISTRY[0];

  return (
    <div 
      id="voice-room" 
      className="min-h-screen text-white flex flex-col justify-between select-none relative overflow-hidden"
      style={{
        background: currentThemeId === 'paravarchya_gappa' 
          ? undefined 
          : 'linear-gradient(180deg, #442442 0%, #301736 20%, #1e0f27 45%, #15091f 75%, #0b0412 100%)'
      }}
    >
      {/* 1. Cultural Room Theme & Ambient Particles */}
      {currentThemeId === 'paravarchya_gappa' ? (
        <ParavarchyaGappaTheme />
      ) : (
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
          <div className="absolute -top-10 left-1/4 w-72 h-72 bg-pink-600/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -top-10 right-1/4 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        </div>
      )}
      <RoomAmbientParticles type={activeTheme.ambientParticleType} />

      {/* Floating Reaction Emojis Rising */}
      <FloatingReactionsOverlay reactions={reactions} />

      {/* Seat-Targeted Flight Animation (Gift flies from sender to the recipient's stage seat with impact burst) */}
      <SeatGiftFlightAnimation />

      {/* 2. Centralized Production Effects Engine Renderer (Tier 1 bursts, Tier 2 VIP banners, Tier 3 Cinematic) */}
      <EffectsRenderer
        currentUserId={currentUserProfile?.uid}
        onSendThankYou={(senderId, senderName) => {
          sendVoiceRoomLiveMessage(district.id, {
            type: 'chat',
            senderId: currentUserProfile?.uid || '',
            senderName: currentUserProfile?.displayName || 'User',
            senderPhoto: currentUserProfile?.photoURL || '',
            text: `❤️ @${senderName} मनःपूर्वक धन्यवाद! खूप सुंदर भेट! 🙏✨`
          }).catch(() => {});
        }}
      />

      {/* Gift Modal with Combo Multiplier & Recipient Chooser */}
      {showGiftModal && (
        <GiftModal
          districtId={district.id}
          districtNameMr={district.nameMr}
          currentUser={currentUserProfile!}
          realRoomUsers={availableRoomUsers}
          initialRecipientUid={targetGiftRecipientUid}
          onClose={() => {
            setShowGiftModal(false);
            setTargetGiftRecipientUid(null);
          }}
        />
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <PartyRoomRulesModal onClose={() => setShowRulesModal(false)} />
      )}

      {/* Quick In-Room Live Chat Input Modal */}
      {showChatInputModal && currentUserProfile && (
        <InRoomChatInputModal
          currentUser={currentUserProfile}
          onSendMessage={handleSendLiveMessage}
          onCleanChat={handleCleanChat}
          onClose={() => setShowChatInputModal(false)}
        />
      )}

      {/* Real-time VIP Entry Notice Banner (2.7s total duration, fade starts at 2.35s) */}
      {activeVipEntry && (
        <VipEntryNoticeBanner
          key={activeVipEntry.key || `vip_${activeVipEntry.vipLevel}`}
          vipLevel={activeVipEntry.vipLevel}
          userName={activeVipEntry.userName}
          userPhoto={activeVipEntry.userPhoto}
          durationMs={2700}
          onDismiss={() => {
            if (vipEntryTimerRef.current) {
              clearTimeout(vipEntryTimerRef.current);
              vipEntryTimerRef.current = null;
            }
            setActiveVipEntry(null);
          }}
        />
      )}

      {/* 1. TOP HEADER: Host Info, ID, Trophy level, Audience strip, Share, More, Exit */}
      <PartyRoomHeader
        districtName={district.nameMr}
        districtId={district.id}
        roomId={district.id}
        audience={audience}
        hostUser={participants.find(p => p.seatIndex === 0 || p.role === 'host') || null}
        isAgoraLive={isAgoraLive}
        onLeave={handleLeave}
        onOpenAudienceList={() => setShowAudienceModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenAdminDashboard={() => setShowVoiceAdminModal(true)}
      />

      {/* 2. CHAT SEATS: 5 plus 5 in two lines (total 10 seats) */}
      <div className="w-full relative z-10">
        <PartyStageSeats
          seats={seats}
          currentUserProfile={currentUserProfile}
          isSpeaking={isSpeaking}
          isMuted={isMuted}
          speakerVolumes={speakerVolumes}
          onSeatClick={handleSeatClick}
          onOpenRules={() => setShowRulesModal(true)}
          onQuickPickSeat={handleQuickPickSeat}
        />
      </div>

      {/* 3. BELOW EMPTY SPACE FOR TEXT CHAT SHOW SCREEN */}
      <div className="flex-1 w-full max-w-md mx-auto px-2 relative z-10 flex flex-col justify-end overflow-hidden pb-1">
        <PartyRoomChatStream
          messages={streamMessages}
          onOpenChatInput={() => setShowChatInputModal(true)}
          onClapUser={handleClapUser}
        />
      </div>

      {/* 4. BOTTOM CONTROLS: Speaker, Mic, Reaction, Chat, Gifts, Grid Menu */}
      <PartyRoomControls
        isMuted={isMuted}
        isSpeakerOn={isSpeakerOn}
        isSpeaking={isSpeaking}
        isSeated={mySeatIndex !== null}
        totalCount={totalCount}
        isHostOrMod={isHostOrMod}
        hasPendingRequests={speakerRequests.length > 0}
        requestsCount={speakerRequests.length}
        isHandRaised={isHandRaised}
        onToggleMute={toggleMute}
        onToggleSpeaker={() => setIsSpeakerOn(!isSpeakerOn)}
        onOpenChatInput={() => setShowChatInputModal(true)}
        onOpenGiftModal={() => {
          setTargetGiftRecipientUid(null);
          setShowGiftModal(true);
        }}
        onOpenAudienceModal={() => setShowAudienceModal(true)}
        onTriggerReaction={handleTriggerReaction}
        onRaiseHand={handleRaiseHand}
        onOpenHostControls={() => setShowHostControlsSheet(true)}
      />

      {/* Speaker Requests Modal (Host/Moderator reviews hand raises) */}
      {showSpeakerRequestsModal && (
        <SpeakerRequestsModal
          requests={speakerRequests}
          openSeats={seats.map((s, idx) => s === null ? idx : null).filter((s): s is number => s !== null)}
          onApprove={handleApproveSpeaker}
          onReject={handleRejectSpeaker}
          onClose={() => setShowSpeakerRequestsModal(false)}
        />
      )}

      {/* Host Controls Bottom Sheet */}
      {showHostControlsSheet && (
        <HostControlsBottomSheet
          districtId={district.id}
          districtNameMr={district.nameMr}
          isRoomLocked={isRoomLocked}
          activeThemeId={currentThemeId}
          isHost={isHost}
          requestsCount={speakerRequests.length}
          speakerRequestsCount={speakerRequests.length}
          onToggleLock={() => setIsRoomLocked(!isRoomLocked)}
          onToggleLockRoom={(locked) => setIsRoomLocked(locked)}
          onMuteAll={handleMuteAll}
          onMuteAllSpeakers={handleMuteAll}
          onCleanChat={handleCleanChat}
          onSelectTheme={(themeId) => setCurrentThemeId(themeId)}
          onOpenRequests={() => {
            setShowHostControlsSheet(false);
            setShowSpeakerRequestsModal(true);
          }}
          onOpenSpeakerRequests={() => {
            setShowHostControlsSheet(false);
            setShowSpeakerRequestsModal(true);
          }}
          onOpenAdminDashboard={() => {
            setShowHostControlsSheet(false);
            setShowVoiceAdminModal(true);
          }}
          onClose={() => setShowHostControlsSheet(false)}
        />
      )}

      {/* User Action Modal (Interactive profile, gifting, mod controls, reporting) */}
      {showUserActionModal && selectedUserForAction && (
        <UserActionModal
          user={selectedUserForAction}
          isCurrentUserHost={isHost}
          isCurrentUserMod={isHostOrMod}
          isSelf={selectedUserForAction.uid === currentUserProfile?.uid}
          onSendGift={(u) => {
            setTargetGiftRecipientUid(u.uid);
            setShowUserActionModal(false);
            setShowGiftModal(true);
          }}
          onToggleRemoteMute={(u) => handleRemoteMuteUser(u)}
          onKickFromSeat={(u) => handleKickUser(u)}
          onBanUser={(u) => handleBanUser(u)}
          onReportUser={(u) => {
            setTargetReportUser(u);
            setShowUserActionModal(false);
            setShowReportModal(true);
          }}
          onClose={() => {
            setShowUserActionModal(false);
            setSelectedUserForAction(null);
          }}
        />
      )}

      {/* Report User Modal */}
      {showReportModal && targetReportUser && (
        <ReportUserModal
          targetUser={targetReportUser}
          districtId={district.id}
          currentUserId={currentUserProfile?.uid || ''}
          onClose={() => {
            setShowReportModal(false);
            setTargetReportUser(null);
          }}
        />
      )}

      {/* Voice Admin Dashboard Modal */}
      {showVoiceAdminModal && (
        <VoiceAdminDashboardModal
          districtId={district.id}
          districtNameMr={district.nameMr}
          currentUserId={currentUserProfile?.uid || ''}
          isAgoraLive={isAgoraLive}
          onClose={() => setShowVoiceAdminModal(false)}
        />
      )}

      {/* Buy Coins Modal */}
      {showBuyCoinsModal && currentUserProfile && (
        <BuyCoinsModal
          currentUser={currentUserProfile}
          onCoinsUpdated={(newCoins) => {
            if (currentUserProfile) currentUserProfile.coins = newCoins;
          }}
          onClose={() => setShowBuyCoinsModal(false)}
        />
      )}

      {/* Seat Action Modal when tapping own seat */}
      {selectedSeatAction !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-purple-500/40 space-y-3 text-center">
            <h3 className="font-bold text-white text-base">सीट {selectedSeatAction + 1} व्यवस्थापन</h3>
            <p className="text-xs text-slate-400">तुम्ही या सीटवर स्पीकर म्हणून उपस्थित आहात.</p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={toggleMute}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                {isMuted ? 'माइक सुरू करा (Unmute)' : 'माइक म्यूट करा (Mute)'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (currentUserProfile) {
                    await leaveVoiceSeat(district.id, currentUserProfile.uid);
                  }
                  setSelectedSeatAction(null);
                }}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                सीट सोडा व प्रेक्षक व्हा (Leave Seat)
              </button>
              <button
                type="button"
                onClick={() => setSelectedSeatAction(null)}
                className="w-full py-2 text-slate-400 hover:text-white text-xs font-medium"
              >
                रद्द करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audience & Members Drawer Modal */}
      {showAudienceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-800 space-y-3 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-400" />
                <h3 className="font-bold text-white text-sm">व्हॉईस रूममधील सदस्य ({totalCount})</h3>
              </div>
              <button onClick={() => setShowAudienceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">८ सीट्सवरील स्पीकर्स</h4>
              {seats.filter(Boolean).length === 0 ? (
                <p className="text-xs text-slate-500 py-2">कोणत्याही सीटवर स्पीकर नाही.</p>
              ) : (
                seats.map((p, idx) => {
                  if (!p) return null;
                  return (
                    <div key={p.uid} className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-purple-500/20 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700">
                          {p.photoURL ? <img src={p.photoURL} alt={p.displayName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-pink-400">{p.displayName?.slice(0, 1)}</div>}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{p.displayName}</div>
                          <span className="text-[10px] text-pink-400">सीट {idx + 1} • {idx < 2 ? 'Host' : 'Speaker'} • ⭐ {p.charmScore || 0}</span>
                        </div>
                      </div>
                      {p.isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                    </div>
                  );
                })
              )}

              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2">प्रेक्षक (Audience)</h4>
              {audience.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">अजून कोणी प्रेक्षक नाही.</p>
              ) : (
                audience.map((p) => (
                  <div key={p.uid} className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center font-bold text-slate-300 text-[10px]">
                        {p.displayName?.slice(0, 1)}
                      </div>
                      <span className="text-slate-300">{p.displayName}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">श्रोते</span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowAudienceModal(false)}
              className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
            >
              बंद करा
            </button>
          </div>
        </div>
      )}

      {/* Audio & Visual Effects Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm">व्हॉईस रूम व इफेक्ट्स सेटिंग्ज</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowSettingsModal(false)} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Room Theme Selector */}
            <div className="p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>रूम थीम (Room Theme)</span>
                </span>
                <span className="text-[10px] text-amber-300 font-bold">
                  {ROOM_THEMES_REGISTRY.find(t => t.id === currentThemeId)?.nameMr || 'गावचा पार'}
                </span>
              </div>
              <select
                value={currentThemeId}
                onChange={e => setCurrentThemeId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {ROOM_THEMES_REGISTRY.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nameMr} ({t.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Button: Effects Settings */}
            <button
              type="button"
              onClick={() => {
                setShowSettingsModal(false);
                setShowEffectsSettingsModal(true);
              }}
              className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2 text-xs font-bold">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>व्हिज्युअल इफेक्ट्स व आवाज सेटिंग्ज</span>
              </span>
              <span className="text-xs">➔</span>
            </button>

            {/* Quick Button: Admin Effects Engine Control */}
            <button
              type="button"
              onClick={() => {
                setShowSettingsModal(false);
                setShowAdminEffectsModal(true);
              }}
              className="w-full p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ॲडमिन इफेक्ट्स कंट्रोल (Admin Registry)</span>
              </span>
              <span className="text-xs">⚙️</span>
            </button>

            <div className="text-[11px] text-slate-400 space-y-1.5 pt-1">
              <p className="font-semibold text-pink-300">रोमँटिक पार्टी स्टेज रचना:</p>
              <p className="leading-relaxed">
                प्रमुख २ होस्ट व्यासपीठ + मध्यभागी लव्ह स्टेज आणि ८ व्हॉईस सीट्स. प्रेक्षक थेट भेटवस्तू पाठवून रँकिंगमध्ये झळकू शकतात.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:from-pink-500 hover:to-rose-500 transition-all shadow-md"
            >
              ठीक आहे (Close)
            </button>
          </div>
        </div>
      )}

      {/* Visual Effects User Settings Modal */}
      {showEffectsSettingsModal && (
        <EffectsSettingsModal onClose={() => setShowEffectsSettingsModal(false)} />
      )}

      {/* Admin Visual Effects Registry Modal */}
      {showAdminEffectsModal && (
        <AdminEffectsConfigModal onClose={() => setShowAdminEffectsModal(false)} />
      )}
    </div>
  );
};
