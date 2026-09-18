import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { CoinTransaction, SendGiftRequest, SendGiftResponse, UserWallet } from '../types/wallet';

/**
 * Send virtual gift via the secure backend API
 * Never trusts the client for coin deduction
 */
export async function sendVirtualGift(req: SendGiftRequest): Promise<SendGiftResponse> {
  try {
    let idToken = '';
    if (auth.currentUser) {
      try {
        idToken = await auth.currentUser.getIdToken();
      } catch (tokenErr) {
        console.warn('Could not get fresh idToken:', tokenErr);
      }
    }

    const res = await fetch('/api/wallet/send-gift', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify({
        ...req,
        senderEmail: auth.currentUser?.email || '',
        senderPhoto: auth.currentUser?.photoURL || ''
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'भेट पाठवताना तांत्रिक अडचण आली.'
      };
    }

    return {
      success: true,
      transactionId: data.transactionId,
      newSenderCoins: data.newSenderCoins,
      totalCost: data.totalCost,
      gift: data.gift
    };
  } catch (err: any) {
    console.error('Error in sendVirtualGift:', err);
    return {
      success: false,
      error: err.message || 'सर्व्हरशी संपर्क होऊ शकला नाही. कृपया इंटरनेट तपासा.'
    };
  }
}

/**
 * Record an immutable coin transaction in Firestore
 */
export async function recordCoinTransaction(
  transaction: Omit<CoinTransaction, 'id' | 'createdAt'> & { id?: string }
): Promise<string> {
  const txnId = transaction.id || `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const timestamp = new Date().toISOString();

  const record: CoinTransaction = {
    ...transaction,
    id: txnId,
    createdAt: timestamp
  };

  try {
    // 1. Write to user's private subcollection
    const userTxnRef = doc(db, 'users', transaction.userId, 'transactions', txnId);
    await setDoc(userTxnRef, {
      ...record,
      serverTime: serverTimestamp()
    });

    // 2. Write to system-wide ledger
    const globalTxnRef = doc(db, 'transactions', txnId);
    await setDoc(globalTxnRef, {
      ...record,
      serverTime: serverTimestamp()
    });
  } catch (err) {
    console.warn('[WalletService] Ledger write note:', err);
  }

  return txnId;
}

/**
 * Fetch transaction history for a user
 */
export async function getUserTransactionHistory(
  userId: string,
  limitCount: number = 25
): Promise<CoinTransaction[]> {
  if (!userId) return [];

  // Try fetching from backend API first
  try {
    const res = await fetch(`/api/wallet/transactions?userId=${encodeURIComponent(userId)}&limit=${limitCount}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.transactions) && data.transactions.length > 0) {
        return data.transactions;
      }
    }
  } catch (e) {
    // fallback to direct Firestore
  }

  // Fallback to Firestore subcollection query
  try {
    const colRef = collection(db, 'users', userId, 'transactions');
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);

    const list: CoinTransaction[] = [];
    snap.forEach((d) => {
      list.push(d.data() as CoinTransaction);
    });
    return list;
  } catch (err) {
    console.warn('[WalletService] Could not fetch transactions from Firestore:', err);
    return [];
  }
}

/**
 * Fetch authoritative user wallet stats
 */
export async function getUserWalletStats(userId: string): Promise<UserWallet | null> {
  if (!userId) return null;
  try {
    const res = await fetch(`/api/wallet/balance?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.wallet) {
        return data.wallet;
      }
    }
  } catch {}

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const d = userDoc.data();
      return {
        userId,
        coinBalance: Number(d.coins) || 0,
        lifetimeCoinsPurchased: Number(d.lifetimeCoinsPurchased || d.totalRecharged) || 0,
        lifetimeCoinsSpent: Number(d.lifetimeCoinsSpent) || 0,
        lifetimeCoinsReceived: Number(d.lifetimeCoinsReceived) || 0
      };
    }
  } catch {}

  return null;
}
