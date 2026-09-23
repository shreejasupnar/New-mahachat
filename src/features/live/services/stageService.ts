import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { sendLiveMessage } from './streamService';

export interface StageRequest {
  id: string;
  streamId: string;
  userId: string;
  name: string;
  photoURL?: string;
  district?: string;
  createdAt: any;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface StageGuest {
  id: string;
  userId: string;
  name: string;
  photoURL?: string;
  district?: string;
  isMuted: boolean;
  isVideoOff: boolean;
  slotIndex: number; // 1, 2, or 3 (host is slot 0)
  joinedAt: any;
}

/**
 * Viewer requests to join the stage as a guest speaker
 */
export async function requestStageAccess(
  streamId: string,
  user: { uid: string; displayName?: string; photoURL?: string; district?: string }
): Promise<void> {
  const reqRef = doc(db, 'live_streams', streamId, 'guest_requests', user.uid);
  await setDoc(reqRef, {
    streamId,
    userId: user.uid,
    name: user.displayName || 'मित्र',
    photoURL: user.photoURL || '',
    district: user.district || '',
    createdAt: serverTimestamp(),
    status: 'pending',
  });
}

/**
 * Viewer cancels their stage request
 */
export async function cancelStageRequest(
  streamId: string,
  userId: string
): Promise<void> {
  const reqRef = doc(db, 'live_streams', streamId, 'guest_requests', userId);
  await deleteDoc(reqRef).catch(() => {});
}

/**
 * Real-time listener for pending guest requests (Host uses this)
 */
export function subscribeToStageRequests(
  streamId: string,
  callback: (requests: StageRequest[]) => void
): () => void {
  const requestsCol = collection(db, 'live_streams', streamId, 'guest_requests');
  const q = query(requestsCol, where('status', '==', 'pending'), orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as StageRequest[];
    callback(requests);
  }, (err) => {
    console.warn('subscribeToStageRequests error:', err);
    callback([]);
  });
}

/**
 * Host accepts a guest request and assigns them a stage slot
 */
export async function acceptStageRequest(
  streamId: string,
  request: StageRequest,
  slotIndex: number
): Promise<void> {
  // 1. Add to stage_guests
  const guestRef = doc(db, 'live_streams', streamId, 'stage_guests', request.userId);
  await setDoc(guestRef, {
    userId: request.userId,
    name: request.name,
    photoURL: request.photoURL || '',
    district: request.district || '',
    isMuted: false,
    isVideoOff: false,
    slotIndex,
    joinedAt: serverTimestamp(),
  });

  // 2. Mark request accepted
  const reqRef = doc(db, 'live_streams', streamId, 'guest_requests', request.userId);
  await updateDoc(reqRef, { status: 'accepted' });

  // 3. Send system notification in live chat
  await sendLiveMessage(
    streamId,
    { uid: 'system', displayName: 'यजमान' },
    `${request.name} मंचावर (Stage) जोडले गेले आहेत!`,
    'system'
  );
}

/**
 * Host declines a guest request
 */
export async function rejectStageRequest(
  streamId: string,
  userId: string
): Promise<void> {
  const reqRef = doc(db, 'live_streams', streamId, 'guest_requests', userId);
  await updateDoc(reqRef, { status: 'rejected' }).catch(() => {});
}

/**
 * Host or Guest removes participant from the stage
 */
export async function removeGuestFromStage(
  streamId: string,
  userId: string,
  guestName?: string
): Promise<void> {
  const guestRef = doc(db, 'live_streams', streamId, 'stage_guests', userId);
  await deleteDoc(guestRef).catch(() => {});

  const reqRef = doc(db, 'live_streams', streamId, 'guest_requests', userId);
  await deleteDoc(reqRef).catch(() => {});

  if (guestName) {
    await sendLiveMessage(
      streamId,
      { uid: 'system', displayName: 'सिस्टम' },
      `${guestName} मंचावरून बाहेर पडले.`,
      'system'
    ).catch(() => {});
  }
}

/**
 * Host toggles a guest's mute state
 */
export async function toggleGuestMute(
  streamId: string,
  userId: string,
  isMuted: boolean
): Promise<void> {
  const guestRef = doc(db, 'live_streams', streamId, 'stage_guests', userId);
  await updateDoc(guestRef, { isMuted });
}

/**
 * Real-time listener for current active stage guests
 */
export function subscribeToStageGuests(
  streamId: string,
  callback: (guests: StageGuest[]) => void
): () => void {
  const guestsCol = collection(db, 'live_streams', streamId, 'stage_guests');
  const q = query(guestsCol, orderBy('slotIndex', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const guests = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as StageGuest[];
    callback(guests);
  }, (err) => {
    console.warn('subscribeToStageGuests error:', err);
    callback([]);
  });
}
