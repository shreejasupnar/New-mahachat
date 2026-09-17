import { 
  db, 
  UserProfile, 
  VoiceParticipant, 
  takeVoiceSeat, 
  leaveVoiceSeat,
  updateVoiceState,
  sendVoiceRoomLiveMessage
} from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  runTransaction 
} from 'firebase/firestore';
import { MaharashtraVoiceGift } from '../data/voiceRoomAssets';
import { getVipTier } from '../data/vipData';

export interface SpeakerRequest {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string;
  vipLevel?: number;
  requestedSeat?: number | null;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

export interface VoiceRoomMetadata {
  id: string;
  name: string;
  districtId: string;
  hostUid: string;
  hostName: string;
  hostPhoto: string;
  isLocked: boolean;
  isChatEnabled: boolean;
  isGiftsEnabled: boolean;
  themeId: string;
  maxSeats: number;
  moderators: string[];
  bannedUids: string[];
  createdAt: any;
}

export interface RoomBan {
  uid: string;
  displayName?: string;
  reason: string;
  bannedBy: string;
  bannedAt: any;
}

class VoiceRoomService {
  /**
   * Submit a speaker request (audience raises hand)
   */
  public async requestSpeaker(
    districtId: string,
    profile: UserProfile,
    requestedSeat?: number | null
  ): Promise<{ success: boolean; error?: string }> {
    if (!districtId || !profile || !profile.uid) {
      console.warn('[requestSpeaker] Missing districtId or profile.uid');
      return { success: false, error: 'वापरकर्ता किंवा रूम आयडी उपलब्ध नाही' };
    }

    try {
      const vipLvl = profile.vipLevel || 0;
      const reqRef = doc(db, 'districts', districtId, 'voiceRooms', 'active', 'speakerRequests', profile.uid);
      await setDoc(reqRef, {
        uid: profile.uid,
        displayName: profile.displayName || 'सदस्य',
        photoURL: profile.photoURL || '',
        vipLevel: vipLvl,
        requestedSeat: requestedSeat ?? null,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Send in-room live event announcement with VIP badge if applicable
      const vipLabel = vipLvl > 0 ? ` [VIP ${vipLvl}]` : '';
      await sendVoiceRoomLiveMessage(districtId, {
        type: 'system',
        senderId: profile.uid,
        senderName: profile.displayName || 'सदस्य',
        senderPhoto: profile.photoURL || '',
        text: `✋ @${profile.displayName || 'सदस्य'}${vipLabel} यांनी बोलण्यासाठी हात वर केला (Raised Hand)`
      });

      return { success: true };
    } catch (err: any) {
      console.error('Error requesting speaker:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Subscribe to real-time pending speaker requests (for Host / Moderators)
   * Prioritizes high VIP level members at the top of the queue
   */
  public subscribeSpeakerRequests(
    districtId: string,
    callback: (requests: SpeakerRequest[]) => void
  ) {
    if (!districtId) {
      callback([]);
      return () => {};
    }

    const reqsCol = collection(db, 'districts', districtId, 'voiceRooms', 'active', 'speakerRequests');
    return onSnapshot(reqsCol, (snapshot) => {
      const list: SpeakerRequest[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === 'pending') {
          list.push({
            id: docSnap.id,
            uid: data.uid || docSnap.id,
            displayName: data.displayName || 'सदस्य',
            photoURL: data.photoURL || '',
            vipLevel: Number(data.vipLevel) || 0,
            requestedSeat: data.requestedSeat,
            status: data.status,
            createdAt: data.createdAt
          });
        }
      });

      // VIP Privilege: Higher VIP levels get mic priority at top of queue
      list.sort((a, b) => {
        const vipA = a.vipLevel || 0;
        const vipB = b.vipLevel || 0;
        if (vipB !== vipA) {
          return vipB - vipA;
        }
        return 0;
      });

      callback(list);
    }, (err) => {
      console.warn('Speaker requests listener error:', err);
      callback([]);
    });
  }

  /**
   * Host / Mod accepts speaker request
   */
  public async acceptSpeakerRequest(
    districtId: string,
    request: SpeakerRequest,
    targetSeatIndex: number,
    hostName: string
  ): Promise<boolean> {
    if (!districtId || !request || !request.uid) return false;

    try {
      // 1. Mark request accepted
      const reqRef = doc(db, 'districts', districtId, 'voiceRooms', 'active', 'speakerRequests', request.uid);
      await setDoc(reqRef, { status: 'accepted', seatIndex: targetSeatIndex }, { merge: true });

      // 2. Assign seat
      await takeVoiceSeat(districtId, request.uid, targetSeatIndex, {
        uid: request.uid,
        displayName: request.displayName,
        photoURL: request.photoURL,
        vipLevel: request.vipLevel || 0
      } as any);

      // 3. Broadcast system message
      await sendVoiceRoomLiveMessage(districtId, {
        type: 'system',
        senderId: 'system',
        senderName: hostName,
        text: `🎉 @${hostName} यांनी @${request.displayName} यांना सीट ${targetSeatIndex + 1} वर आमंत्रित केले.`
      });

      // Cleanup request after short delay
      setTimeout(async () => {
        try {
          await deleteDoc(reqRef);
        } catch {}
      }, 5000);

      return true;
    } catch (err) {
      console.error('Error accepting speaker request:', err);
      return false;
    }
  }

  /**
   * Host / Mod rejects speaker request
   */
  public async rejectSpeakerRequest(
    districtId: string,
    requestUid: string
  ): Promise<boolean> {
    if (!districtId || !requestUid) return false;

    try {
      const reqRef = doc(db, 'districts', districtId, 'voiceRooms', 'active', 'speakerRequests', requestUid);
      await setDoc(reqRef, { status: 'rejected' }, { merge: true });
      setTimeout(async () => {
        try {
          await deleteDoc(reqRef);
        } catch {}
      }, 3000);
      return true;
    } catch (err) {
      console.error('Error rejecting speaker request:', err);
      return false;
    }
  }

  /**
   * Host mutes/unmutes speaker remotely
   */
  public async muteSpeaker(
    districtId: string,
    targetUid: string,
    isHostMuted: boolean,
    hostName: string,
    targetName: string
  ): Promise<boolean> {
    if (!districtId || !targetUid) return false;

    try {
      const partRef = doc(db, 'districts', districtId, 'voiceRooms', 'active', 'participants', targetUid);
      await setDoc(partRef, {
        isMuted: isHostMuted,
        isHostMuted: isHostMuted,
        isSpeaking: false
      }, { merge: true });

      if (isHostMuted) {
        await sendVoiceRoomLiveMessage(districtId, {
          type: 'system',
          senderId: 'system',
          senderName: hostName,
          text: `🔇 @${hostName} यांनी @${targetName} यांचा माइक म्यूट केला.`
        });
      }

      return true;
    } catch (err) {
      console.error('Error muting speaker:', err);
      return false;
    }
  }

  /**
   * Kick user from seat back to audience
   */
  public async kickFromSeat(
    districtId: string,
    targetUid: string,
    hostName: string,
    targetName: string
  ): Promise<boolean> {
    if (!districtId || !targetUid) return false;

    try {
      await leaveVoiceSeat(districtId, targetUid);
      await sendVoiceRoomLiveMessage(districtId, {
        type: 'system',
        senderId: 'system',
        senderName: hostName,
        text: `🚪 @${targetName} यांना सीटवरून प्रेक्षक करण्यात आले.`
      });
      return true;
    } catch (err) {
      console.error('Error kicking from seat:', err);
      return false;
    }
  }

  /**
   * Ban user from the voice room
   */
  public async banUser(
    districtId: string,
    targetUid: string,
    reason: string,
    hostName: string,
    targetName: string
  ): Promise<boolean> {
    if (!districtId || !targetUid) return false;

    try {
      const banRef = doc(db, 'districts', districtId, 'voiceRooms', 'active', 'bans', targetUid);
      await setDoc(banRef, {
        uid: targetUid,
        displayName: targetName,
        reason,
        bannedBy: hostName,
        bannedAt: serverTimestamp()
      });

      // Also remove them from participants
      const partRef = doc(db, 'districts', districtId, 'voiceRooms', 'active', 'participants', targetUid);
      await deleteDoc(partRef);

      await sendVoiceRoomLiveMessage(districtId, {
        type: 'system',
        senderId: 'system',
        senderName: hostName,
        text: `⛔ @${targetName} यांना कट्ट्यावरून बॅन करण्यात आले (${reason}).`
      });

      return true;
    } catch (err) {
      console.error('Error banning user:', err);
      return false;
    }
  }

  /**
   * Unban user
   */
  public async unbanUser(districtId: string, targetUid: string): Promise<boolean> {
    if (!districtId || !targetUid) return false;

    try {
      const banRef = doc(db, 'districts', districtId, 'voiceRooms', 'active', 'bans', targetUid);
      await deleteDoc(banRef);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if user is banned
   */
  public async checkIsBanned(districtId: string, uid: string): Promise<boolean> {
    if (!districtId || !uid) return false;

    try {
      const banRef = doc(db, 'districts', districtId, 'voiceRooms', 'active', 'bans', uid);
      const snap = await getDoc(banRef);
      return snap.exists();
    } catch {
      return false;
    }
  }

  /**
   * Send Maharashtra Voice Gift with real coin deduction, atomic transaction, and VIP Charm Multiplier
   */
  public async sendGiftWithCoins(
    districtId: string,
    sender: UserProfile,
    recipientUid: string,
    recipientName: string,
    recipientPhoto: string,
    gift: MaharashtraVoiceGift,
    comboMultiplier: number = 1
  ): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    if (!districtId || !sender?.uid || !recipientUid) {
      return { success: false, error: 'अवैध भेटवस्तू विनंती.' };
    }

    const totalCost = gift.coinCost * comboMultiplier;
    const vipLevel = sender.vipLevel || 0;
    const vipTier = vipLevel > 0 ? getVipTier(vipLevel) : null;
    const charmMultiplier = vipTier ? vipTier.charmMultiplier : 1.0;

    try {
      const userRef = doc(db, 'users', sender.uid);

      // Atomic transaction: verify sufficient coins and deduct
      const result = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const currentCoins = Number(userDoc.data()?.coins) || 0;

        if (currentCoins < totalCost) {
          throw new Error(`कमी कॉईन्स आहेत! (हवे: ${totalCost}, शिल्लक: ${currentCoins})`);
        }

        const newBalance = currentCoins - totalCost;
        transaction.set(userRef, { coins: newBalance }, { merge: true });
        return newBalance;
      });

      // Record room gift event in Firestore
      const giftEventRef = doc(collection(db, 'districts', districtId, 'roomGifts'));
      await setDoc(giftEventRef, {
        id: giftEventRef.id,
        giftId: gift.id,
        giftName: gift.name,
        giftNameMr: gift.nameMr,
        giftIcon: gift.icon,
        senderId: sender.uid,
        senderName: sender.displayName || 'सदस्य',
        senderPhoto: sender.photoURL || '',
        senderVipLevel: vipLevel,
        recipientId: recipientUid,
        recipientName: recipientName,
        recipientPhoto: recipientPhoto,
        cost: totalCost,
        multiplier: comboMultiplier,
        charmMultiplier,
        createdAt: serverTimestamp()
      });

      // Format VIP live message description
      const vipBonusTag = charmMultiplier > 1 ? ` (✨ ${charmMultiplier}x VIP चार्म बोनस)` : '';
      const senderVipTag = vipLevel > 0 ? ` [VIP ${vipLevel}]` : '';

      // Add live room stream message
      await sendVoiceRoomLiveMessage(districtId, {
        type: 'gift',
        senderId: sender.uid,
        senderName: sender.displayName || 'सदस्य',
        senderPhoto: sender.photoURL || '',
        text: `🎁 @${sender.displayName || 'सदस्य'}${senderVipTag} यांनी @${recipientName} यांना ${gift.icon} ${gift.nameMr} ${comboMultiplier > 1 ? `(x${comboMultiplier})` : ''} पाठवले!${vipBonusTag}`,
        giftIcon: gift.icon,
        giftName: gift.nameMr,
        giftMultiplier: comboMultiplier,
        recipientName: recipientName
      });

      return { success: true, newBalance: result };
    } catch (err: any) {
      console.warn('Gift transaction error:', err);
      return { success: false, error: err.message || 'भेटवस्तू पाठवण्यात अडचण आली.' };
    }
  }

  /**
   * Subscribe to room bans list (for Admin / Host dashboard)
   */
  public subscribeBans(districtId: string, callback: (bans: RoomBan[]) => void) {
    const bansCol = collection(db, 'districts', districtId, 'voiceRooms', 'active', 'bans');
    return onSnapshot(bansCol, (snapshot) => {
      const list: RoomBan[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        list.push({
          uid: docSnap.id,
          displayName: data.displayName || 'सदस्य',
          reason: data.reason || 'अयोग्य वर्तन',
          bannedBy: data.bannedBy || 'होस्ट',
          bannedAt: data.bannedAt
        });
      });
      callback(list);
    }, () => callback([]));
  }
}

export const voiceRoomService = new VoiceRoomService();
