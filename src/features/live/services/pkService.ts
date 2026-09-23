import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { LIVE_CONFIG } from '../config/liveConfig';
import { sendLiveMessage } from './streamService';

export interface PKBattle {
  id: string;
  hostAStreamId: string;
  hostAUid: string;
  hostAName: string;
  hostAPhotoURL?: string;
  hostADistrict?: string;
  hostAScore: number;

  hostBStreamId: string;
  hostBUid: string;
  hostBName: string;
  hostBPhotoURL?: string;
  hostBDistrict?: string;
  hostBScore: number;

  status: 'invited' | 'active' | 'ended' | 'rejected';
  durationSeconds: number;
  startedAt?: any;
  endsAt?: any;
  winnerUid?: string | 'draw' | null;
  createdAt: any;
}

/**
 * Host A invites Host B to a PK Battle
 */
export async function createPKInvite(
  hostA: { streamId: string; uid: string; name: string; photoURL?: string; district?: string },
  hostB: { streamId: string; uid: string; name: string; photoURL?: string; district?: string }
): Promise<PKBattle> {
  const battleRef = doc(collection(db, 'pk_battles'));
  const battleId = battleRef.id;

  const newBattle: Omit<PKBattle, 'id'> = {
    hostAStreamId: hostA.streamId,
    hostAUid: hostA.uid,
    hostAName: hostA.name,
    hostAPhotoURL: hostA.photoURL || '',
    hostADistrict: hostA.district || 'महाराष्ट्र',
    hostAScore: 0,

    hostBStreamId: hostB.streamId,
    hostBUid: hostB.uid,
    hostBName: hostB.name,
    hostBPhotoURL: hostB.photoURL || '',
    hostBDistrict: hostB.district || 'महाराष्ट्र',
    hostBScore: 0,

    status: 'invited',
    durationSeconds: LIVE_CONFIG.PK_DURATION_SEC,
    createdAt: serverTimestamp(),
  };

  await setDoc(battleRef, newBattle);

  // Link active battle to inviter stream
  await updateDoc(doc(db, 'live_streams', hostA.streamId), {
    isPkActive: false,
    activePkId: battleId,
  }).catch(() => {});

  // Link active battle to target stream so they see the invite
  await updateDoc(doc(db, 'live_streams', hostB.streamId), {
    isPkActive: false,
    activePkId: battleId,
  }).catch(() => {});

  return {
    id: battleId,
    ...newBattle,
    createdAt: new Date(),
  };
}

/**
 * Host B accepts or rejects incoming PK invite
 */
export async function respondToPKInvite(
  battleId: string,
  accept: boolean
): Promise<void> {
  const battleRef = doc(db, 'pk_battles', battleId);
  const snap = await getDoc(battleRef);
  if (!snap.exists()) return;

  const battle = snap.data() as PKBattle;

  if (!accept) {
    await updateDoc(battleRef, { status: 'rejected' });
    await updateDoc(doc(db, 'live_streams', battle.hostAStreamId), { activePkId: null }).catch(() => {});
    await updateDoc(doc(db, 'live_streams', battle.hostBStreamId), { activePkId: null }).catch(() => {});
    return;
  }

  // Accept -> Activate PK Battle
  const durationSec = LIVE_CONFIG.PK_DURATION_SEC;
  const now = Date.now();
  const endsAtTimestamp = Timestamp.fromMillis(now + durationSec * 1000);

  await updateDoc(battleRef, {
    status: 'active',
    startedAt: serverTimestamp(),
    endsAt: endsAtTimestamp,
  });

  // Mark both streams with active PK
  await updateDoc(doc(db, 'live_streams', battle.hostAStreamId), {
    isPkActive: true,
    activePkId: battleId,
  }).catch(() => {});

  await updateDoc(doc(db, 'live_streams', battle.hostBStreamId), {
    isPkActive: true,
    activePkId: battleId,
  }).catch(() => {});

  // Send announcements to both chats
  await sendLiveMessage(
    battle.hostAStreamId,
    { uid: 'system', displayName: 'PK रेफ्री' },
    `⚔️ ${battle.hostAName} विरुद्ध ${battle.hostBName} PK महामुकाबला सुरू झाला आहे!`,
    'system'
  ).catch(() => {});

  await sendLiveMessage(
    battle.hostBStreamId,
    { uid: 'system', displayName: 'PK रेफ्री' },
    `⚔️ ${battle.hostBName} विरुद्ध ${battle.hostAName} PK महामुकाबला सुरू झाला आहे!`,
    'system'
  ).catch(() => {});
}

/**
 * Real-time listener for a PK battle
 */
export function subscribeToPKBattle(
  battleId: string,
  callback: (battle: PKBattle | null) => void
): () => void {
  const battleRef = doc(db, 'pk_battles', battleId);
  return onSnapshot(battleRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() } as PKBattle);
    } else {
      callback(null);
    }
  }, (err) => {
    console.warn('subscribeToPKBattle error:', err);
  });
}

/**
 * Real-time listener for incoming PK invites targeting a host
 */
export function subscribeToIncomingPKInvites(
  hostUid: string,
  callback: (invites: PKBattle[]) => void
): () => void {
  const q = query(
    collection(db, 'pk_battles'),
    where('hostBUid', '==', hostUid),
    where('status', '==', 'invited'),
    limit(5)
  );

  return onSnapshot(q, (snap) => {
    const invites = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as PKBattle[];
    callback(invites);
  }, (err) => {
    console.warn('subscribeToIncomingPKInvites error:', err);
    callback([]);
  });
}

/**
 * Adds score points to Team A or Team B during PK Battle
 */
export async function addPKScore(
  battleId: string,
  side: 'A' | 'B',
  points: number = 10
): Promise<void> {
  const battleRef = doc(db, 'pk_battles', battleId);
  await updateDoc(battleRef, {
    [side === 'A' ? 'hostAScore' : 'hostBScore']: increment(points),
  }).catch((err) => console.warn('addPKScore error:', err));
}

/**
 * Concludes a PK Battle and declares the winner
 */
export async function endPKBattle(
  battleId: string,
  winnerUid: string | 'draw'
): Promise<void> {
  const battleRef = doc(db, 'pk_battles', battleId);
  const snap = await getDoc(battleRef);
  if (!snap.exists()) return;

  const battle = snap.data() as PKBattle;

  await updateDoc(battleRef, {
    status: 'ended',
    winnerUid,
  });

  // Reset stream states
  await updateDoc(doc(db, 'live_streams', battle.hostAStreamId), {
    isPkActive: false,
    activePkId: null,
  }).catch(() => {});

  await updateDoc(doc(db, 'live_streams', battle.hostBStreamId), {
    isPkActive: false,
    activePkId: null,
  }).catch(() => {});

  const winnerText = winnerUid === 'draw'
    ? 'महामुकाबला बरोबरीत (Draw) संपला!'
    : winnerUid === battle.hostAUid
      ? `🏆 ${battle.hostAName} विजयी झाले!`
      : `🏆 ${battle.hostBName} विजयी झाले!`;

  await sendLiveMessage(
    battle.hostAStreamId,
    { uid: 'system', displayName: 'PK रेफ्री' },
    winnerText,
    'system'
  ).catch(() => {});

  await sendLiveMessage(
    battle.hostBStreamId,
    { uid: 'system', displayName: 'PK रेफ्री' },
    winnerText,
    'system'
  ).catch(() => {});
}
