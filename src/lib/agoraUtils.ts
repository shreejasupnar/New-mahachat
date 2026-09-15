/**
 * Agora RTC Utility Functions
 *
 * Provides deterministic UID mapping between application user IDs (e.g. Firebase alphanumeric UIDs)
 * and Agora RTC 32-bit unsigned integer UIDs (1 to 2^31 - 1).
 *
 * Agora RTC officially recommends numeric UIDs for optimal compatibility and security across
 * web and native clients, avoiding ERR_NO_AUTHORIZED (code 110) mismatches.
 */

export function getAgoraNumericUid(uid: string | number | null | undefined): number {
  if (typeof uid === 'number' && !isNaN(uid) && uid > 0) {
    return (uid >>> 0) % 2147483647 || 1;
  }
  if (!uid) {
    return 1;
  }
  const str = String(uid).trim();
  // If purely numeric digits and fits in standard range
  if (/^\d+$/.test(str)) {
    const parsed = parseInt(str, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return (parsed >>> 0) % 2147483647 || 1;
    }
  }
  // Deterministic 31-bit positive integer hash (DJB2 variant)
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  const pos = Math.abs(hash) % 2147483647;
  return pos === 0 ? 1 : pos;
}
