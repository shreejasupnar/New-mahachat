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
  onSnapshot,
  orderBy,
  limit,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { GameMatchSession, GameQueueDoc, GameUserStats, PlayerMatchInfo, MatchChatMessage } from '../types';

export interface ChallengeEntryResult {
  success: boolean;
  transactionId?: string;
  newBalance?: number;
  error?: string;
}

/**
 * 1. Deduct exactly 30 coins for 1v1 Challenge Entry
 * Calls backend API with idempotency check
 */
export async function enterGameChallenge(
  userId: string,
  matchId: string,
  gameId: string,
  gameName: string,
  knownCoins?: number
): Promise<ChallengeEntryResult> {
  try {
    const res = await fetch('/api/gamezone/enter-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, matchId, gameId, gameName, knownCoins })
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'सर्व्हरशी संपर्क होऊ शकला नाही' };
  }
}

/**
 * 2. Refund 30 coins automatically if matchmaking is cancelled or failed
 */
export async function refundGameChallenge(
  userId: string,
  matchId: string,
  gameId: string,
  reason: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const res = await fetch('/api/gamezone/refund-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, matchId, gameId, reason })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 3. Complete Game Match on Server & Record XP / Stats
 */
export async function completeGameMatch(params: {
  matchId: string;
  gameId: string;
  player1Uid: string;
  player2Uid: string;
  winnerUid?: string;
  isDraw?: boolean;
  score1: number;
  score2: number;
  durationSeconds: number;
}) {
  try {
    const res = await fetch('/api/gamezone/complete-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await res.json();
  } catch (err: any) {
    console.warn('Error completing match on server:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 4. Fetch User Game Stats from Backend
 */
export async function fetchUserGameStats(userId: string): Promise<GameUserStats | null> {
  try {
    const res = await fetch(`/api/gamezone/stats?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    return data.stats || null;
  } catch (err) {
    return null;
  }
}

/**
 * 5. Fetch Real Authenticated Player Leaderboard
 */
export async function fetchGameLeaderboard(): Promise<GameUserStats[]> {
  try {
    const res = await fetch('/api/gamezone/leaderboard');
    const data = await res.json();
    return data.leaderboard || [];
  } catch (err) {
    return [];
  }
}

/**
 * ========================================================
 * REAL-TIME FIRESTORE MATCHMAKING & SESSION SYNCHRONIZATION
 * ========================================================
 */

/**
 * Search for an available waiting opponent in gameQueue or register self
 */
export async function joinMatchmakingQueue(
  player: PlayerMatchInfo,
  gameId: string,
  matchId: string
): Promise<{ matchCreated: boolean; session?: GameMatchSession; queueId: string }> {
  const queueCol = collection(db, 'gameQueue');

  // Look for any existing real player in the queue for this gameId who isn't self
  const q = query(
    queueCol,
    where('gameId', '==', gameId),
    where('status', '==', 'waiting'),
    orderBy('queuedAt', 'asc'),
    limit(5)
  );

  const snapshot = await getDocs(q);
  const eligibleDocs = snapshot.docs.filter((d) => {
    const data = d.data() as GameQueueDoc;
    return data.uid !== player.uid;
  });

  if (eligibleDocs.length > 0) {
    // Match found with real opponent!
    const opponentDoc = eligibleDocs[0];
    const opponentData = opponentDoc.data() as GameQueueDoc;

    const matchedSessionId = matchId;
    const sessionDocRef = doc(db, 'gameMatches', matchedSessionId);

    const opponentPlayer: PlayerMatchInfo = {
      uid: opponentData.uid,
      displayName: opponentData.displayName,
      photoURL: opponentData.photoURL,
      district: opponentData.district,
      vipLevel: opponentData.vipLevel,
      rating: opponentData.rating || 1200,
      score: 0,
      ready: true,
      lastActive: Date.now(),
      coinsDeducted: true
    };

    const newSession: GameMatchSession = {
      matchId: matchedSessionId,
      gameId,
      category: 'board', // updated by game catalog
      status: 'opponent_found',
      player1: opponentPlayer,
      player2: player,
      turnUid: opponentPlayer.uid,
      createdAt: Date.now(),
      startedAt: Date.now(),
      moves: [],
      gameState: {}
    };

    // Write match session
    await setDoc(sessionDocRef, newSession);

    // Update opponent's queue doc to notify them
    await updateDoc(opponentDoc.ref, {
      status: 'matched',
      matchId: matchedSessionId
    });

    return {
      matchCreated: true,
      session: newSession,
      queueId: opponentDoc.id
    };
  }

  // No waiting player found yet, place self in queue
  const myQueueRef = doc(db, 'gameQueue', `${player.uid}_${gameId}`);
  const queueEntry: GameQueueDoc = {
    id: myQueueRef.id,
    uid: player.uid,
    gameId,
    displayName: player.displayName,
    photoURL: player.photoURL,
    district: player.district,
    vipLevel: player.vipLevel,
    rating: player.rating || 1200,
    status: 'waiting',
    matchId,
    queuedAt: Date.now()
  };

  await setDoc(myQueueRef, queueEntry);

  return {
    matchCreated: false,
    queueId: myQueueRef.id
  };
}

/**
 * Remove self from matchmaking queue
 */
export async function leaveMatchmakingQueue(uid: string, gameId: string) {
  try {
    const queueRef = doc(db, 'gameQueue', `${uid}_${gameId}`);
    await deleteDoc(queueRef);
  } catch (err) {
    console.warn('Error deleting queue record:', err);
  }
}

/**
 * Subscribe to matchmaking queue document updates
 */
export function subscribeToQueueEntry(
  uid: string,
  gameId: string,
  onMatched: (matchedMatchId: string) => void
) {
  const queueRef = doc(db, 'gameQueue', `${uid}_${gameId}`);
  return onSnapshot(queueRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data() as GameQueueDoc;
      if (data.status === 'matched' && data.matchId) {
        onMatched(data.matchId);
      }
    }
  });
}

/**
 * Subscribe to live 1v1 match document
 */
export function subscribeToMatchSession(
  matchId: string,
  onUpdate: (session: GameMatchSession) => void
) {
  const docRef = doc(db, 'gameMatches', matchId);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data() as GameMatchSession;
      onUpdate(data);
    }
  });
}

/**
 * Update Match Session (moves, score, turn, status)
 */
export async function updateMatchSession(
  matchId: string,
  updates: Partial<GameMatchSession>
) {
  try {
    const docRef = doc(db, 'gameMatches', matchId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Date.now()
    });
  } catch (err) {
    console.warn('Error updating match session:', err);
  }
}

/**
 * Send real-time move in match
 */
export async function sendMatchMove(
  matchId: string,
  playerUid: string,
  action: string,
  data: any,
  nextTurnUid?: string,
  updatedGameState?: any,
  playerScoreUpdate?: { player1Score?: number; player2Score?: number }
) {
  const docRef = doc(db, 'gameMatches', matchId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;

  const current = snap.data() as GameMatchSession;
  const newMove = {
    playerUid,
    action,
    data,
    timestamp: Date.now()
  };

  const moves = [...(current.moves || []), newMove];
  const payload: any = {
    moves,
    gameState: updatedGameState !== undefined ? updatedGameState : current.gameState
  };

  if (nextTurnUid) {
    payload.turnUid = nextTurnUid;
  }

  if (playerScoreUpdate) {
    if (playerScoreUpdate.player1Score !== undefined && current.player1) {
      payload['player1.score'] = playerScoreUpdate.player1Score;
    }
    if (playerScoreUpdate.player2Score !== undefined && current.player2) {
      payload['player2.score'] = playerScoreUpdate.player2Score;
    }
  }

  await updateDoc(docRef, payload);
}

/**
 * Conclude Match Session
 */
export async function finalizeMatchSession(
  matchId: string,
  winnerUid?: string,
  isDraw: boolean = false,
  reason: string = 'Game ended normally'
) {
  const docRef = doc(db, 'gameMatches', matchId);
  await updateDoc(docRef, {
    status: 'finished',
    winnerUid: winnerUid || null,
    isDraw,
    reason,
    endedAt: Date.now()
  });
}

/**
 * Send real-time chat message between players in 1v1 match
 */
export async function sendMatchChatMessage(
  matchId: string,
  senderUid: string,
  senderName: string,
  text: string,
  isQuickPhrase: boolean = false,
  vipLevel?: number
) {
  try {
    const docRef = doc(db, 'gameMatches', matchId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;

    const current = snap.data() as GameMatchSession;
    const newMsg: MatchChatMessage = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderUid,
      senderName,
      text: text.trim(),
      timestamp: Date.now(),
      isQuickPhrase,
      vipLevel
    };

    const currentList = current.chatMessages || [];
    const chatMessages = [...currentList.slice(-29), newMsg];

    await updateDoc(docRef, {
      chatMessages,
      lastChatAt: Date.now()
    });
  } catch (err) {
    console.warn('Error sending match chat message:', err);
  }
}

