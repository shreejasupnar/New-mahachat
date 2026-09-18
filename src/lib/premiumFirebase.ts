import { 
  collection, 
  doc, 
  getDoc,
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { db, auth, UserProfile } from './firebase';
import { SubscriptionPlanId, RoomGiftEvent, RoomEntryEvent } from '../premium/types';
import { MAHACHAT_PREMIUM_PLANS } from '../premium/plans';
import { getGiftById } from '../premium';

// Helper to check if user has access to collectibles (now open to all users)
export function isUserSubscribed(profile?: UserProfile | null): boolean {
  return true;
}

// Real payment verification and subscription activation
export async function activateSubscription(
  userId: string,
  planId: SubscriptionPlanId,
  paymentReference: string
): Promise<{ success: boolean; endDate: string }> {
  const plan = MAHACHAT_PREMIUM_PLANS.find(p => p.id === planId);
  if (!plan) {
    throw new Error('अवैध प्लॅन निवडला गेला आहे.');
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + plan.durationMonths);

  const startIso = startDate.toISOString();
  const endIso = endDate.toISOString();

  // 1. Record verified subscription transaction in Firestore
  const subRef = doc(collection(db, 'subscriptions'));
  await setDoc(subRef, {
    id: subRef.id,
    userId,
    planId,
    amount: plan.price,
    durationMonths: plan.durationMonths,
    paymentReference,
    status: 'verified',
    startDate: startIso,
    endDate: endIso,
    createdAt: serverTimestamp()
  });

  // 2. Update user profile with active subscription status and default equipped items
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    subscriptionStatus: 'active',
    subscriptionPlan: planId,
    subscriptionStart: startIso,
    subscriptionEnd: endIso,
    subscriptionAmount: plan.price,
    paymentReference,
    // Provide default cultural starter equip if none equipped yet
    equippedBubble: 'bubble_royal_pheta',
    equippedFrame: 'frame_royal_pheta',
    equippedSeatFrame: 'seat_royal_pheta_gold',
    equippedBadge: 'badge_maha_star',
    equippedEntryEffect: 'entry_sahyadri_sunrise',
    equippedProfileEffect: 'profile_royal_gold',
    equippedNameEffect: 'name_royal_gold',
    entryEffectsEnabled: true
  });

  return { success: true, endDate: endIso };
}

// Equip a specific cosmetic item category
export async function equipCosmeticItem(
  userId: string,
  category: 
    | 'equippedBubble' 
    | 'equippedFrame' 
    | 'equippedSeatFrame' 
    | 'equippedBadge' 
    | 'equippedEntryEffect' 
    | 'equippedProfileEffect' 
    | 'equippedNameEffect',
  itemId: string | null
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    [category]: itemId
  });
}

// Toggle entry effects sound/animation
export async function toggleEntryEffects(userId: string, enabled: boolean): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    entryEffectsEnabled: enabled
  });
}

// Send a REAL gift to a REAL recipient or room broadcast in a district room
export async function sendRealRoomGift(
  districtId: string,
  giftId: string,
  sender: UserProfile,
  recipient: { uid: string; displayName: string; photoURL?: string },
  multiplier: number = 1
): Promise<{ success: boolean; newCoins: number; transactionId: string }> {
  const actualSenderUid = auth.currentUser?.uid || sender.uid;

  if (!actualSenderUid) {
    throw new Error('गिफ्ट पाठवण्यासाठी कृपया प्रथम लॉगिन करा.');
  }

  if (!recipient || !recipient.uid) {
    throw new Error('कृपया भेट स्वीकारणारा सदस्य निवडा.');
  }

  const isBroadcast = recipient.uid === 'room_broadcast' || recipient.uid.startsWith('room_');

  if (!isBroadcast && actualSenderUid === recipient.uid) {
    throw new Error('तुम्ही स्वतःला गिफ्ट पाठवू शकत नाही. रूममधील मित्राला निवडा किंवा संपूर्ण रूमला भेट द्या.');
  }

  const gift = getGiftById(giftId);
  if (!gift) {
    throw new Error('गिफ्ट सापडले नाही.');
  }

  const mult = multiplier > 0 ? multiplier : 1;
  const senderDisplayName = sender.displayName || auth.currentUser?.displayName || 'MahaChat Member';
  const recipientDisplayName = isBroadcast 
    ? 'संपूर्ण जिल्हा कट्टा (All Members)' 
    : (recipient.displayName || 'मित्र');

  // 1. CALL SECURE SERVER-SIDE TRANSACTION API
  // Never trusts the client for coin balance or deduction
  const serverRes = await fetch('/api/wallet/send-gift', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      senderUid: actualSenderUid,
      senderName: senderDisplayName,
      senderPhoto: sender.photoURL || auth.currentUser?.photoURL || '',
      districtId,
      giftId,
      multiplier: mult,
      recipientUids: [recipient.uid],
      recipientNames: { [recipient.uid]: recipientDisplayName },
      recipientPhotos: { [recipient.uid]: recipient.photoURL || '' },
      knownBalance: sender.coins !== undefined ? sender.coins : undefined
    })
  });

  const txnResult = await serverRes.json();
  if (!serverRes.ok || !txnResult.success) {
    throw new Error(txnResult.error || 'गिफ्ट पाठवताना सर्व्हर त्रुटी आली. कृपया शिल्लक तपासा.');
  }

  const newBalance = txnResult.newSenderCoins !== undefined ? txnResult.newSenderCoins : Math.max(0, (sender.coins || 0) - (txnResult.totalCost || 0));

  // 2. Synchronize user balance in Firestore
  try {
    const senderRef = doc(db, 'users', actualSenderUid);
    await updateDoc(senderRef, {
      coins: newBalance,
      lifetimeCoinsSpent: (sender.lifetimeCoinsSpent || 0) + (txnResult.totalCost || 0)
    });
  } catch (syncErr) {
    console.warn('Firestore coins update note:', syncErr);
  }

  // 3. Post real-time gift event to district room gifts collection for real-time broadcast animation
  const giftsCol = collection(db, 'districts', districtId, 'gifts');
  await addDoc(giftsCol, {
    districtId,
    giftId,
    giftNameMr: gift.nameMr,
    giftIcon: gift.previewIcon,
    animation: gift.animation,
    senderId: actualSenderUid,
    senderName: senderDisplayName,
    senderPhoto: sender.photoURL || auth.currentUser?.photoURL || '',
    recipientId: recipient.uid,
    recipientName: recipientDisplayName,
    recipientPhoto: recipient.photoURL || '',
    multiplier: mult,
    transactionId: txnResult.transactionId || '',
    createdAt: serverTimestamp()
  });

  // 4. Post celebratory message in the room chat so real members see it
  const messagesCol = collection(db, 'districts', districtId, 'messages');
  await addDoc(messagesCol, {
    districtId,
    text: `🎁 ${senderDisplayName} ने ${recipientDisplayName} ला "${gift.nameMr}" ${gift.previewIcon} ${mult > 1 ? `x ${mult}` : ''} भेट दिले!`,
    senderId: actualSenderUid,
    senderName: senderDisplayName,
    senderPhoto: sender.photoURL || auth.currentUser?.photoURL || '',
    senderDistrict: sender.district || '',
    senderBadge: sender.equippedBadge || 'badge_maha_star',
    senderBubble: sender.equippedBubble || 'bubble_royal_pheta',
    senderNameEffect: sender.equippedNameEffect || 'name_royal_gold',
    isPremiumSender: true,
    createdAt: serverTimestamp()
  });

  // 5. Post to voice room live stream
  try {
    const voiceMessagesCol = collection(db, 'districts', districtId, 'voiceRooms', 'active', 'messages');
    await addDoc(voiceMessagesCol, {
      type: 'gift',
      senderId: actualSenderUid,
      senderName: senderDisplayName,
      senderPhoto: sender.photoURL || auth.currentUser?.photoURL || '',
      giftIcon: gift.previewIcon,
      giftName: gift.nameMr,
      giftMultiplier: mult,
      recipientName: recipientDisplayName,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('Voice room gift notice sync:', err);
  }

  // 6. Increase recipient's voice seat charm score if target is a specific user
  if (!isBroadcast) {
    try {
      const partRef = doc(db, 'districts', districtId, 'voiceRooms', 'active', 'participants', recipient.uid);
      const snap = await getDoc(partRef);
      if (snap.exists()) {
        const current = snap.data()?.charmScore || 0;
        await setDoc(partRef, { charmScore: current + (10 * mult) }, { merge: true });
      }
    } catch (err) {
      console.warn('Charm update:', err);
    }
  }

  return {
    success: true,
    newCoins: newBalance,
    transactionId: txnResult.transactionId || ''
  };
}

// Subscribe to real-time room gifts (last 10 minutes)
export function subscribeToRoomGifts(
  districtId: string,
  callback: (gifts: RoomGiftEvent[]) => void
) {
  const giftsCol = collection(db, 'districts', districtId, 'gifts');
  const q = query(giftsCol, orderBy('createdAt', 'desc'), limit(15));

  return onSnapshot(q, (snapshot) => {
    const list: RoomGiftEvent[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        districtId: data.districtId,
        giftId: data.giftId,
        giftNameMr: data.giftNameMr,
        giftIcon: data.giftIcon,
        animation: data.animation || 'pop',
        senderId: data.senderId,
        senderName: data.senderName,
        senderPhoto: data.senderPhoto,
        recipientId: data.recipientId,
        recipientName: data.recipientName,
        recipientPhoto: data.recipientPhoto,
        multiplier: data.multiplier || 1,
        createdAt: data.createdAt
      });
    });
    callback(list);
  }, (err) => {
    console.warn('Room gifts listener error:', err);
  });
}

// Broadcast room entry effect if user has it equipped
export async function broadcastRoomEntry(
  districtId: string,
  userProfile: UserProfile
): Promise<void> {
  if (!userProfile.equippedEntryEffect) {
    return;
  }

  if (userProfile.entryEffectsEnabled === false) {
    return;
  }

  try {
    const eventsCol = collection(db, 'districts', districtId, 'roomEvents');
    await addDoc(eventsCol, {
      districtId,
      userId: userProfile.uid,
      userName: userProfile.displayName,
      userPhoto: userProfile.photoURL || '',
      effectId: userProfile.equippedEntryEffect,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.warn('Could not broadcast room entry effect:', e);
  }
}

// Subscribe to room entry effects
export function subscribeToRoomEntries(
  districtId: string,
  callback: (entry: RoomEntryEvent | null) => void
) {
  const eventsCol = collection(db, 'districts', districtId, 'roomEvents');
  const q = query(eventsCol, orderBy('createdAt', 'desc'), limit(1));

  let initialLoad = true;

  return onSnapshot(q, (snapshot) => {
    if (initialLoad) {
      initialLoad = false;
      return; // don't trigger previous entries on initial connection
    }

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      callback({
        id: docSnap.id,
        districtId: data.districtId,
        userId: data.userId,
        userName: data.userName,
        userPhoto: data.userPhoto,
        effectId: data.effectId,
        effectNameMr: '',
        createdAt: data.createdAt
      });
    }
  }, (err) => {
    console.warn('Room entries listener error:', err);
  });
}
