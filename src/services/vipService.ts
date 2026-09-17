import { doc, getDoc, updateDoc, setDoc, collection } from 'firebase/firestore';
import { db, sanitizeForFirestore } from '../lib/firebase';
import { RechargePackage, RechargeTransactionRecord } from '../types/vip';
import { calculateVipStatus, getVipTier } from '../data/vipData';

export interface RechargeResult {
  success: boolean;
  coinsAdded: number;
  newCoins: number;
  newExp: number;
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
  transactionId: string;
  error?: string;
}

/**
 * Process a real recharge package purchase for a user in Firestore
 */
export async function processUserRecharge(
  userId: string,
  pkg: RechargePackage,
  paymentMethod: string = 'GOOGLE_PAY',
  paymentDetails?: {
    orderId?: string;
    paymentId?: string;
    signature?: string;
    utrNumber?: string;
    googlePayOrderId?: string;
    googlePayTransactionId?: string;
  }
): Promise<RechargeResult> {
  if (!userId) {
    throw new Error('User ID is required for recharge');
  }

  // Prevent duplicate submissions of the same UPI UTR
  const cleanUtr = paymentDetails?.utrNumber?.trim().replace(/\s+/g, '');
  if (paymentMethod === 'UPI' && cleanUtr) {
    const duplicateCheckRef = doc(db, 'recharges', `upi_${cleanUtr}`);
    const duplicateSnap = await getDoc(duplicateCheckRef);
    if (duplicateSnap.exists()) {
      throw new Error('हा UPI UTR / Reference नंबर आधीच वापरला गेला आहे. कृपया नवीन व्यवहार करा.');
    }
  }

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  let currentCoins = 0;
  let currentExp = 0;
  let currentTotalRecharged = 0;
  let currentVipLevel = 0;

  if (userSnap.exists()) {
    const data = userSnap.data();
    currentCoins = Number(data.coins) || 0;
    currentExp = Number(data.vipExp) || 0;
    currentTotalRecharged = Number(data.totalRecharged) || 0;
    currentVipLevel = Number(data.vipLevel) || 0;
  }

  const totalCoinsToAdd = pkg.coins + pkg.bonusCoins;
  const newCoins = currentCoins + totalCoinsToAdd;
  const newExp = currentExp + pkg.vipExp;
  const newTotalRecharged = currentTotalRecharged + pkg.inrPrice;

  // Calculate new VIP status based on new accumulated EXP
  const newStatus = calculateVipStatus(newExp, newCoins, newTotalRecharged);
  const leveledUp = newStatus.level > currentVipLevel;

  const transactionId = cleanUtr 
    ? `upi_${cleanUtr}` 
    : (paymentDetails?.paymentId || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);

  // Automatically equip matching VIP frame / badge / bubble if leveled up!
  const updates: Record<string, any> = {
    coins: newCoins,
    vipExp: newExp,
    totalRecharged: newTotalRecharged,
    vipLevel: newStatus.level,
    lastRechargedAt: new Date().toISOString()
  };

  if (leveledUp && newStatus.currentTier) {
    // Equip VIP badge code e.g. "VIP 1", "VIP 2", etc.
    updates.equippedBadge = newStatus.currentTier.badgeCode;
    updates.equippedSeatFrame = `vip_seat_level_${newStatus.level}`;
  }

  // Update user profile in Firestore
  await updateDoc(userRef, sanitizeForFirestore(updates));

  // Log transaction record in Firestore 'recharges' collection for auditing & persistence
  try {
    const recordRef = doc(db, 'recharges', transactionId);
    const record: RechargeTransactionRecord = {
      id: transactionId,
      userId,
      packageId: pkg.id,
      inrPrice: pkg.inrPrice,
      coinsGranted: pkg.coins,
      bonusCoinsGranted: pkg.bonusCoins,
      expGranted: pkg.vipExp,
      paymentMethod,
      transactionRef: cleanUtr || paymentDetails?.googlePayTransactionId || paymentDetails?.paymentId || `TXN_${Date.now()}`,
      googlePayOrderId: paymentDetails?.googlePayOrderId || paymentDetails?.orderId,
      googlePayTransactionId: paymentDetails?.googlePayTransactionId || paymentDetails?.paymentId,
      createdAt: new Date().toISOString(),
      status: 'completed'
    };
    await setDoc(recordRef, sanitizeForFirestore(record));
  } catch (err) {
    console.warn('[VipService] Warning logging recharge transaction:', err);
  }

  return {
    success: true,
    coinsAdded: totalCoinsToAdd,
    newCoins,
    newExp,
    previousLevel: currentVipLevel,
    newLevel: newStatus.level,
    leveledUp,
    transactionId
  };
}

/**
 * Notice: All free sources of coins have been permanently removed.
 * Coins can only be acquired via Google Pay / UPI merchant recharge.
 */
export async function claimDailyVipCoins(
  _userId: string,
  _vipLevel: number
): Promise<{ success: boolean; coinsAwarded: number; message: string }> {
  return {
    success: false,
    coinsAwarded: 0,
    message: 'मोफत नाणी मिळवण्याचे पर्याय बंद करण्यात आले आहेत. नाणी फक्त Google Pay / UPI रिचार्जद्वारे विकत घेता येतील.'
  };
}
