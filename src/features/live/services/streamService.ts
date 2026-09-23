import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  limit, 
  onSnapshot, 
  serverTimestamp, 
  increment,
  addDoc
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export interface LiveStream {
  id: string;
  hostUid: string;
  hostName: string;
  hostPhotoURL?: string;
  hostDistrict?: string;
  title: string;
  category: 'chitchat' | 'singing' | 'district' | 'gaming' | 'shayari';
  status: 'live' | 'ended';
  viewerCount: number;
  likesCount: number;
  totalGiftsReceived: number;
  createdAt: any;
  endedAt?: any;
  lastHeartbeatAt?: any;
  livekitRoomName: string;
  isPkActive?: boolean;
  activePkId?: string | null;
  isAudioOnly?: boolean;
}

export interface LiveMessage {
  id: string;
  streamId: string;
  senderUid: string;
  senderName: string;
  senderPhotoURL?: string;
  senderDistrict?: string;
  senderIsVip?: boolean;
  senderVipLevel?: number;
  senderBadge?: string;
  senderBubble?: string;
  text: string;
  type: 'chat' | 'system' | 'gift' | 'like';
  giftName?: string;
  giftIcon?: string;
  createdAt: any;
}

export interface LiveParticipant {
  id: string;
  streamId: string;
  userId: string;
  name: string;
  photoURL?: string;
  district?: string;
  isVip?: boolean;
  vipLevel?: number;
  joinedAt: any;
  role: 'host' | 'guest' | 'viewer';
}

/**
 * Cleans up any leftover, stale or orphaned live streams created by this host
 */
export async function cleanupHostPreviousStreams(hostUid: string): Promise<void> {
  if (!hostUid) return;
  try {
    const q = query(
      collection(db, 'live_streams'),
      where('hostUid', '==', hostUid)
    );
    const snap = await getDocs(q);
    const tasks: Promise<any>[] = [];
    snap.forEach((docSnap) => {
      // Mark as ended immediately and schedule deletion
      tasks.push(
        updateDoc(docSnap.ref, {
          status: 'ended',
          viewerCount: 0,
          endedAt: serverTimestamp(),
        }).then(() => deleteDoc(docSnap.ref)).catch(() => deleteDoc(docSnap.ref).catch(() => {}))
      );
    });
    await Promise.all(tasks);
  } catch (err) {
    console.warn('cleanupHostPreviousStreams error:', err);
  }
}

/**
 * Creates a new Live Stream in Firestore
 */
export async function createLiveStream(params: {
  hostUid: string;
  hostName: string;
  hostPhotoURL?: string;
  hostDistrict?: string;
  title: string;
  category?: 'chitchat' | 'singing' | 'district' | 'gaming' | 'shayari';
  isAudioOnly?: boolean;
}): Promise<LiveStream> {
  // First, clean up any previous orphaned streams for this host to prevent duplicate live cards
  await cleanupHostPreviousStreams(params.hostUid).catch(() => {});

  const streamRef = doc(collection(db, 'live_streams'));
  const streamId = streamRef.id;

  const newStream: Omit<LiveStream, 'id'> = {
    hostUid: params.hostUid,
    hostName: params.hostName,
    hostPhotoURL: params.hostPhotoURL || '',
    hostDistrict: params.hostDistrict || 'महाराष्ट्र',
    title: params.title.trim() || 'माझा थेट संवाद (Live Stream)',
    category: params.category || 'chitchat',
    status: 'live',
    viewerCount: 1, // host counts initially
    likesCount: 0,
    totalGiftsReceived: 0,
    createdAt: serverTimestamp(),
    lastHeartbeatAt: serverTimestamp(),
    livekitRoomName: `live_${streamId}`,
    isPkActive: false,
    activePkId: null,
    isAudioOnly: !!params.isAudioOnly,
  };

  await setDoc(streamRef, newStream);

  return {
    id: streamId,
    ...newStream,
    createdAt: new Date(),
  };
}

/**
 * Real-time listener for active live streams list
 * Strictly filters out ended, closed, or non-live broadcasts
 */
export function subscribeToLiveStreams(
  callback: (streams: LiveStream[]) => void
): () => void {
  // Query live streams collection without requiring composite indexes
  const q = query(
    collection(db, 'live_streams'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const rawStreams: LiveStream[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as LiveStream[];

    // CRITICAL: Filter out ANY stream that is not strictly 'live'
    // Ended streams, streams with endedAt, or streams with status !== 'live' MUST NOT SHOW!
    const activeStreams = rawStreams
      .filter((s) => s && s.status === 'live' && !s.endedAt)
      .sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0));

    callback(activeStreams);
  }, (err) => {
    console.warn('subscribeToLiveStreams error:', err);
    callback([]);
  });
}

/**
 * Real-time listener for a single live stream
 */
export function subscribeToLiveStream(
  streamId: string,
  callback: (stream: LiveStream | null) => void
): () => void {
  const streamRef = doc(db, 'live_streams', streamId);
  return onSnapshot(streamRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() } as LiveStream);
    } else {
      callback(null);
    }
  }, (err) => {
    console.warn('subscribeToLiveStream error:', err);
  });
}

/**
 * Ends a live stream (Host only)
 * Sets status to 'ended', zeroes viewers, records end time, and cleans up document
 */
export async function endLiveStream(streamId: string): Promise<void> {
  if (!streamId) return;
  const streamRef = doc(db, 'live_streams', streamId);
  try {
    // 1. Immediately update status to 'ended' so all active viewers/listeners get notified instantly
    await updateDoc(streamRef, {
      status: 'ended',
      viewerCount: 0,
      endedAt: serverTimestamp(),
    });

    // 2. Remove document so it never shows up anywhere in discovery or active feeds
    setTimeout(async () => {
      try {
        await deleteDoc(streamRef);
      } catch (delErr) {
        console.warn('Document delete note:', delErr);
      }
    }, 1000);
  } catch (err) {
    console.warn('endLiveStream updateDoc failed, attempting fallback direct delete:', err);
    try {
      await deleteDoc(streamRef);
    } catch (_) {}
  }
}

/**
 * Increments live stream likes with optimistic float animation trigger
 */
export async function sendStreamLike(streamId: string, count: number = 1): Promise<void> {
  const streamRef = doc(db, 'live_streams', streamId);
  await updateDoc(streamRef, {
    likesCount: increment(count),
  }).catch((err) => console.warn('sendStreamLike error:', err));
}

/**
 * Adds viewer presence to a live stream
 */
export async function joinLiveStream(
  streamId: string,
  user: { 
    uid: string; 
    displayName?: string; 
    photoURL?: string;
    district?: string;
    isVip?: boolean;
    vipLevel?: number;
  }
): Promise<void> {
  const participantRef = doc(db, 'live_streams', streamId, 'participants', user.uid);
  await setDoc(participantRef, {
    userId: user.uid,
    name: user.displayName || 'मित्र (User)',
    photoURL: user.photoURL || '',
    district: user.district || '',
    isVip: !!user.isVip,
    vipLevel: user.vipLevel || 0,
    joinedAt: serverTimestamp(),
    role: 'viewer'
  }, { merge: true });

  const streamRef = doc(db, 'live_streams', streamId);
  await updateDoc(streamRef, {
    viewerCount: increment(1)
  }).catch(() => {});

  // If VIP user, announce royal entrance in chat
  if (user.isVip || (user.vipLevel && user.vipLevel > 0)) {
    const messagesCol = collection(db, 'live_streams', streamId, 'messages');
    await addDoc(messagesCol, {
      streamId,
      senderUid: user.uid,
      senderName: user.displayName || 'मित्र',
      senderPhotoURL: user.photoURL || '',
      senderDistrict: user.district || '',
      senderIsVip: true,
      senderVipLevel: user.vipLevel || 1,
      text: `👑 शाही पालखी आगमन: ${user.displayName || 'मित्र'} (VIP ${user.vipLevel || 1}) मंचावर दाखल झाले आहेत!`,
      type: 'system',
      createdAt: serverTimestamp(),
    }).catch(() => {});
  }
}

/**
 * Removes viewer presence from a live stream
 */
export async function leaveLiveStream(
  streamId: string,
  userId: string
): Promise<void> {
  try {
    const streamRef = doc(db, 'live_streams', streamId);
    await updateDoc(streamRef, {
      viewerCount: increment(-1)
    });
  } catch {}
}

/**
 * Sends a real-time message in the live chat
 */
export async function sendLiveMessage(
  streamId: string,
  sender: { 
    uid: string; 
    displayName?: string; 
    photoURL?: string; 
    district?: string;
    isVip?: boolean;
    vipLevel?: number;
    equippedBadge?: string;
    equippedBubble?: string;
  },
  text: string,
  type: 'chat' | 'system' | 'gift' | 'like' = 'chat',
  giftMeta?: { giftName: string; giftIcon: string }
): Promise<void> {
  const messagesCol = collection(db, 'live_streams', streamId, 'messages');
  await addDoc(messagesCol, {
    streamId,
    senderUid: sender.uid,
    senderName: sender.displayName || 'मित्र',
    senderPhotoURL: sender.photoURL || '',
    senderDistrict: sender.district || '',
    senderIsVip: !!sender.isVip,
    senderVipLevel: sender.vipLevel || 0,
    senderBadge: sender.equippedBadge || null,
    senderBubble: sender.equippedBubble || null,
    text: text.trim(),
    type,
    giftName: giftMeta?.giftName || null,
    giftIcon: giftMeta?.giftIcon || null,
    createdAt: serverTimestamp(),
  });
}

/**
 * Subscribes to real-time chat messages for a live stream
 */
export function subscribeToLiveMessages(
  streamId: string,
  callback: (messages: LiveMessage[]) => void
): () => void {
  const messagesCol = collection(db, 'live_streams', streamId, 'messages');
  const q = query(messagesCol, orderBy('createdAt', 'desc'), limit(60));

  return onSnapshot(q, (snapshot) => {
    const messages: LiveMessage[] = snapshot.docs
      .map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      .reverse() as LiveMessage[];
    callback(messages);
  }, (err) => {
    console.warn('subscribeToLiveMessages error:', err);
    callback([]);
  });
}

/**
 * Subscribes to online participants list in a live stream
 */
export function subscribeToLiveParticipants(
  streamId: string,
  callback: (participants: LiveParticipant[]) => void
): () => void {
  const participantsCol = collection(db, 'live_streams', streamId, 'participants');
  const q = query(participantsCol, orderBy('joinedAt', 'desc'), limit(30));

  return onSnapshot(q, (snapshot) => {
    const participants: LiveParticipant[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      streamId,
      ...docSnap.data(),
    })) as LiveParticipant[];
    callback(participants);
  }, (err) => {
    console.warn('subscribeToLiveParticipants error:', err);
    callback([]);
  });
}
