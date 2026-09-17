import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp,
  deleteDoc
} from 'firebase/firestore';

// Read config from firebase-applet-config.json
// Note: vite allows importing json directly
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
// Use firestoreDatabaseId if configured
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  district: string;
  bio?: string;
  createdAt: any;
  lastActive: any;
  isOnline: boolean;
  blockedUsers?: string[];
  isAdmin?: boolean;
  // Premium subscription state & equipped assets
  subscriptionStatus?: 'none' | 'active' | 'expired';
  subscriptionPlan?: '1_month' | '3_months' | '6_months';
  subscriptionStart?: string;
  subscriptionEnd?: string;
  subscriptionAmount?: number;
  paymentReference?: string;
  // VIP Level, Coins & Recharge properties
  vipLevel?: number;
  vipExp?: number;
  coins?: number;
  totalRecharged?: number;
  lastRechargedAt?: string;
  lastDailyVipClaimDate?: string;
  equippedBubble?: string;
  equippedFrame?: string;
  equippedSeatFrame?: string;
  equippedBadge?: string;
  equippedEntryEffect?: string;
  equippedProfileEffect?: string;
  equippedNameEffect?: string;
  entryEffectsEnabled?: boolean;
}

export interface ChatMessage {
  id: string;
  districtId: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  senderDistrict?: string;
  senderBadge?: string;
  senderBubble?: string;
  senderNameEffect?: string;
  isPremiumSender?: boolean;
  vipLevel?: number;
  createdAt: Timestamp | null;
  reported?: boolean;
  reportCount?: number;
}

export interface VoiceParticipant {
  uid: string;
  displayName: string;
  photoURL: string;
  isSpeaking: boolean;
  isMuted: boolean;
  role: 'speaker' | 'listener';
  seatIndex?: number | null;
  joinedAt: any;
  isPremium?: boolean;
  vipLevel?: number;
  equippedSeatFrame?: string | null;
  equippedBadge?: string | null;
  equippedNameEffect?: string | null;
  charmScore?: number;
}

export interface VoiceRoomStreamMessage {
  id: string;
  type: 'chat' | 'system' | 'gift' | 'entry';
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text?: string;
  level?: number;
  giftIcon?: string;
  giftName?: string;
  giftMultiplier?: number;
  recipientName?: string;
  createdAt: any;
}

/**
 * Removes any undefined values recursively from an object before saving to Firestore.
 */
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (
        value !== null &&
        typeof value === 'object' &&
        !(value instanceof Timestamp) &&
        !(value instanceof Date) &&
        typeof (value as any)?.toMillis !== 'function'
      ) {
        if (Array.isArray(value)) {
          clean[key] = value.filter(v => v !== undefined);
        } else {
          clean[key] = sanitizeForFirestore(value);
        }
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
}

export interface UserReport {
  reportedBy: string;
  reportedUser?: string;
  reportedMessageId?: string;
  districtId: string;
  reason: string;
  createdAt: any;
}

// Subscribe to auth user changes and profile
export function subscribeToAuthUser(
  callback: (user: User | null, profile: UserProfile | null) => void
) {
  let unsubProfile: (() => void) | null = null;

  return onAuthStateChanged(auth, (user) => {
    if (unsubProfile) {
      unsubProfile();
      unsubProfile = null;
    }

    if (!user) {
      callback(null, null);
      return;
    }

    // Subscribe to real-time user profile in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    unsubProfile = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        callback(user, snap.data() as UserProfile);
      } else {
        // User logged in but profile doc doesn't exist yet
        callback(user, null);
      }
    }, (error) => {
      console.error('Error listening to user profile:', error);
      callback(user, null);
    });
  });
}

// Save or update user profile
export async function saveUserProfile(
  uid: string, 
  data: Partial<UserProfile>
): Promise<void> {
  const userDocRef = doc(db, 'users', uid);
  const snap = await getDoc(userDocRef);
  const cleanData = sanitizeForFirestore(data);

  if (snap.exists()) {
    await updateDoc(userDocRef, {
      ...cleanData,
      lastActive: serverTimestamp()
    });
  } else {
    await setDoc(userDocRef, {
      uid,
      displayName: data.displayName || 'MahaChat User',
      photoURL: data.photoURL || '',
      district: data.district || '',
      bio: data.bio || '',
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      isOnline: true,
      blockedUsers: [],
      ...cleanData
    });
  }

  // Also update Auth profile display name if user is logged in
  if (auth.currentUser && data.displayName) {
    try {
      await fbUpdateProfile(auth.currentUser, {
        displayName: data.displayName,
        photoURL: data.photoURL || auth.currentUser.photoURL
      });
    } catch (e) {
      // Non-blocking
    }
  }
}

// Update presence heartbeat
export async function updateUserPresence(uid: string, isOnline: boolean, district?: string) {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      isOnline,
      lastActive: serverTimestamp(),
      ...(district ? { district } : {})
    }, { merge: true });
  } catch (err) {
    // Graceful error handling for offline/closed
  }
}

// Send real message to district chat room
export async function sendDistrictMessage(
  districtId: string,
  text: string,
  user: { 
    uid: string; 
    displayName: string; 
    photoURL?: string; 
    district?: string;
    senderBadge?: string;
    senderBubble?: string;
    senderNameEffect?: string;
    isPremiumSender?: boolean;
    vipLevel?: number;
  }
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;
  if (trimmed.length > 1000) {
    throw new Error('मेसेज खूप मोठा आहे (कमाल 1000 अक्षरे)');
  }

  const messagesRef = collection(db, 'districts', districtId, 'messages');
  await addDoc(messagesRef, {
    text: trimmed,
    senderId: user.uid,
    senderName: user.displayName || 'वापरकर्ता',
    senderPhoto: user.photoURL || '',
    senderDistrict: user.district || districtId,
    senderBadge: user.senderBadge || null,
    senderBubble: user.senderBubble || null,
    senderNameEffect: user.senderNameEffect || null,
    isPremiumSender: !!user.isPremiumSender,
    vipLevel: user.vipLevel || null,
    createdAt: serverTimestamp(),
    reported: false
  });

  // Also update sender's active presence
  updateUserPresence(user.uid, true, districtId);
}

// Report a message or user
export async function submitReport(report: {
  reportedBy: string;
  reportedUser?: string;
  reportedMessageId?: string;
  districtId: string;
  reason: string;
}): Promise<void> {
  const reportsRef = collection(db, 'reports');
  await addDoc(reportsRef, {
    ...report,
    createdAt: serverTimestamp()
  });

  if (report.reportedMessageId) {
    try {
      const msgRef = doc(db, 'districts', report.districtId, 'messages', report.reportedMessageId);
      await updateDoc(msgRef, {
        reported: true
      });
    } catch (e) {
      // Non-blocking
    }
  }
}

// Block a user
export async function blockUser(currentUid: string, targetUid: string, currentBlocked: string[] = []): Promise<void> {
  if (currentBlocked.includes(targetUid)) return;
  const userRef = doc(db, 'users', currentUid);
  await updateDoc(userRef, {
    blockedUsers: [...currentBlocked, targetUid]
  });
}

// Unblock a user
export async function unblockUser(currentUid: string, targetUid: string, currentBlocked: string[] = []): Promise<void> {
  const updated = currentBlocked.filter(id => id !== targetUid);
  const userRef = doc(db, 'users', currentUid);
  await updateDoc(userRef, {
    blockedUsers: updated
  });
}

// Real-time listener for district messages
export function subscribeToDistrictMessages(
  districtId: string,
  callback: (messages: ChatMessage[]) => void,
  onError?: (err: any) => void
) {
  const messagesRef = collection(db, 'districts', districtId, 'messages');
  // Order by createdAt ascending, max 100 messages
  const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(100));

  return onSnapshot(q, (snapshot) => {
    const msgs: ChatMessage[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      msgs.push({
        id: d.id,
        districtId,
        text: data.text || '',
        senderId: data.senderId || '',
        senderName: data.senderName || 'वापरकर्ता',
        senderPhoto: data.senderPhoto || '',
        senderDistrict: data.senderDistrict || '',
        senderBadge: data.senderBadge,
        senderBubble: data.senderBubble,
        senderNameEffect: data.senderNameEffect,
        isPremiumSender: data.isPremiumSender,
        createdAt: data.createdAt,
        reported: !!data.reported,
        reportCount: data.reportCount || 0
      });
    });
    callback(msgs);
  }, (err) => {
    console.error('Error fetching messages for ' + districtId, err);
    if (onError) onError(err);
  });
}

// Real-time listener for active users in a district
// Strictly calculates real count from users collection!
export function subscribeToDistrictOnlineUsers(
  districtId: string,
  callback: (count: number, users: UserProfile[]) => void
) {
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef, 
    where('district', '==', districtId),
    where('isOnline', '==', true)
  );

  return onSnapshot(q, (snapshot) => {
    const list: UserProfile[] = [];
    const now = Date.now();
    // Filter users whose lastActive was within 5 minutes
    snapshot.forEach(docSnap => {
      const u = docSnap.data() as UserProfile;
      const lastActiveMs = u.lastActive?.toMillis ? u.lastActive.toMillis() : (u.lastActive?.seconds ? u.lastActive.seconds * 1000 : 0);
      // Count if active within the last 5 minutes (300000ms) or newly created
      if (!lastActiveMs || (now - lastActiveMs) < 300000) {
        list.push(u);
      }
    });
    callback(list.length, list);
  }, (err) => {
    console.warn('Presence listener warning:', err);
    callback(0, []);
  });
}

// Voice Room: Join voice room
export async function joinVoiceRoom(
  districtId: string,
  participant: VoiceParticipant
) {
  if (!districtId || !participant || !participant.uid) {
    console.warn('[joinVoiceRoom] Missing districtId or participant.uid');
    return;
  }
  const partRef = doc(db, 'districts', districtId, 'voiceRooms', 'active', 'participants', participant.uid);
  const data = sanitizeForFirestore({
    uid: participant.uid,
    displayName: participant.displayName || 'वापरकर्ता',
    photoURL: participant.photoURL || '',
    isSpeaking: !!participant.isSpeaking,
    isMuted: !!participant.isMuted,
    role: participant.role || 'speaker',
    seatIndex: participant.seatIndex !== undefined ? participant.seatIndex : null,
    isPremium: !!participant.isPremium,
    vipLevel: participant.vipLevel || null,
    equippedSeatFrame: participant.equippedSeatFrame || null,
    equippedBadge: participant.equippedBadge || null,
    equippedNameEffect: participant.equippedNameEffect || null,
    joinedAt: serverTimestamp()
  });
  await setDoc(partRef, data);
}

// Voice Room: Leave voice room
export async function leaveVoiceRoom(districtId: string, uid: string) {
  try {
    if (!districtId || !uid) return;
    const partRef = doc(db, 'districts', districtId, 'voiceRooms', 'active', 'participants', uid);
    await deleteDoc(partRef);
  } catch (e) {
    // Non-blocking
  }
}

// Voice Room: Update mic / speaking state or seat
export async function updateVoiceState(
  districtId: string,
  uid: string,
  updates: Partial<Pick<VoiceParticipant, 'isSpeaking' | 'isMuted' | 'role' | 'seatIndex'>>
) {
  try {
    if (!districtId || !uid) return;
    const partRef = doc(db, 'districts', districtId, 'voiceRooms', 'active', 'participants', uid);
    const cleanUpdates = sanitizeForFirestore(updates);
    if (Object.keys(cleanUpdates).length > 0) {
      await setDoc(partRef, cleanUpdates, { merge: true });
    }
  } catch (e) {
    // Non-blocking
  }
}

// Voice Room: Take an empty seat (0-7)
export async function takeVoiceSeat(
  districtId: string,
  uid: string,
  seatIndex: number,
  profile?: UserProfile | null
) {
  try {
    if (!districtId || !uid) {
      console.warn('[takeVoiceSeat] Missing districtId or uid');
      return;
    }
    const partRef = doc(db, 'districts', districtId, 'voiceRooms', 'active', 'participants', uid);
    const updates: Record<string, any> = {
      uid,
      seatIndex,
      role: 'speaker',
      isSpeaking: false,
      isMuted: false
    };

    if (profile) {
      updates.displayName = profile.displayName || 'MahaChat User';
      updates.photoURL = profile.photoURL || '';
      updates.isPremium = profile.subscriptionStatus === 'active' && !!profile.subscriptionEnd && new Date(profile.subscriptionEnd).getTime() > Date.now();
      updates.vipLevel = profile.vipLevel || null;
      updates.equippedSeatFrame = profile.equippedSeatFrame || (profile.vipLevel ? `vip_seat_level_${profile.vipLevel}` : null);
      updates.equippedBadge = profile.equippedBadge || (profile.vipLevel ? `VIP ${profile.vipLevel}` : null);
      updates.equippedNameEffect = profile.equippedNameEffect || null;
      updates.joinedAt = serverTimestamp();
    }

    await setDoc(partRef, sanitizeForFirestore(updates), { merge: true });
  } catch (e) {
    console.error('Error taking voice seat:', e);
  }
}

// Voice Room: Leave current seat to become listener in audience
export async function leaveVoiceSeat(
  districtId: string,
  uid: string
) {
  try {
    if (!districtId || !uid) return;
    const partRef = doc(db, 'districts', districtId, 'voiceRooms', 'active', 'participants', uid);
    await setDoc(partRef, {
      seatIndex: null,
      role: 'listener',
      isSpeaking: false,
      isMuted: true
    }, { merge: true });
  } catch (e) {
    console.error('Error leaving voice seat:', e);
  }
}

// Voice Room: Subscribe to participants
export function subscribeToVoiceParticipants(
  districtId: string,
  callback: (participants: VoiceParticipant[]) => void
) {
  if (!districtId) {
    callback([]);
    return () => {};
  }
  const partsRef = collection(db, 'districts', districtId, 'voiceRooms', 'active', 'participants');
  return onSnapshot(partsRef, (snapshot) => {
    const list: VoiceParticipant[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      list.push({
        ...data,
        uid: data.uid || docSnap.id,
        vipLevel: Number(data.vipLevel) || 0
      } as VoiceParticipant);
    });
    callback(list);
  }, (err) => {
    console.warn('Voice room listener error:', err);
    callback([]);
  });
}

// Send in-room live stream message / event
export async function sendVoiceRoomLiveMessage(
  districtId: string,
  message: Omit<VoiceRoomStreamMessage, 'id' | 'createdAt'>
) {
  try {
    const messagesCol = collection(db, 'districts', districtId, 'voiceRooms', 'active', 'messages');
    await addDoc(messagesCol, {
      ...message,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.warn('Error sending voice room message:', e);
  }
}

// Subscribe to real-time in-room voice chat messages
export function subscribeToVoiceRoomLiveMessages(
  districtId: string,
  callback: (messages: VoiceRoomStreamMessage[]) => void
) {
  const messagesCol = collection(db, 'districts', districtId, 'voiceRooms', 'active', 'messages');
  const q = query(messagesCol, orderBy('createdAt', 'desc'), limit(25));
  return onSnapshot(q, (snapshot) => {
    const list: VoiceRoomStreamMessage[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        type: data.type || 'chat',
        senderId: data.senderId,
        senderName: data.senderName || 'सदस्य',
        senderPhoto: data.senderPhoto,
        text: data.text,
        level: data.level || 1,
        giftIcon: data.giftIcon,
        giftName: data.giftName,
        giftMultiplier: data.giftMultiplier,
        recipientName: data.recipientName,
        createdAt: data.createdAt
      });
    });
    // Return in chronological order
    callback(list.reverse());
  }, (err) => {
    console.warn('Voice room messages listener error:', err);
    callback([]);
  });
}

// Clean the in-room chat (moderation action seen in screenshot)
export async function cleanVoiceRoomChatStream(districtId: string, moderatorName: string) {
  try {
    const messagesCol = collection(db, 'districts', districtId, 'voiceRooms', 'active', 'messages');
    await addDoc(messagesCol, {
      type: 'system',
      senderId: 'system',
      senderName: moderatorName,
      text: `🔥 ${moderatorName} 🔥 cleaned the chat`,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.warn('Error cleaning chat stream:', e);
  }
}

// Update voice participant charm score when gifts are sent
export async function addVoiceParticipantCharm(districtId: string, uid: string, points: number) {
  try {
    const partRef = doc(db, 'districts', districtId, 'voiceRooms', 'active', 'participants', uid);
    const snap = await getDoc(partRef);
    if (snap.exists()) {
      const current = snap.data()?.charmScore || 0;
      await setDoc(partRef, { charmScore: current + points }, { merge: true });
    }
  } catch (e) {
    console.warn('Error updating charm:', e);
  }
}

// Sign out
export async function signOutUser() {
  if (auth.currentUser) {
    await updateUserPresence(auth.currentUser.uid, false);
  }
  await fbSignOut(auth);
}
