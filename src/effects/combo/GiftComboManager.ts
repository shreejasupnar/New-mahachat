// MahaChat Progressive Gift Combo Manager
// Tracks consecutive gifts without animation restarts; scales intensity across milestones (x2, x5, x10, x20, x50, x100)

export interface ComboState {
  key: string; // `${senderId}_${recipientId}_${giftId}`
  count: number;
  lastUpdated: number;
  milestone: 'base' | 'glow' | 'particles' | 'banner' | 'screen_pulse' | 'cinematic' | 'legendary';
}

class GiftComboManager {
  private activeCombos: Map<string, ComboState> = new Map();
  private comboTimeoutMs: number = 6000; // 6 seconds window

  public registerGift(senderId: string, recipientId: string, giftId: string): number {
    const key = `${senderId}_${recipientId}_${giftId}`;
    const now = Date.now();
    const existing = this.activeCombos.get(key);

    let newCount = 1;
    if (existing && now - existing.lastUpdated <= this.comboTimeoutMs) {
      newCount = existing.count + 1;
    }

    const milestone = this.getMilestoneForCount(newCount);

    this.activeCombos.set(key, {
      key,
      count: newCount,
      lastUpdated: now,
      milestone
    });

    return newCount;
  }

  public getMilestoneForCount(count: number): ComboState['milestone'] {
    if (count >= 100) return 'legendary';
    if (count >= 50) return 'cinematic';
    if (count >= 20) return 'screen_pulse';
    if (count >= 10) return 'banner';
    if (count >= 5) return 'particles';
    if (count >= 2) return 'glow';
    return 'base';
  }

  public getCombo(senderId: string, recipientId: string, giftId: string): ComboState | null {
    const key = `${senderId}_${recipientId}_${giftId}`;
    const combo = this.activeCombos.get(key);
    if (!combo) return null;
    if (Date.now() - combo.lastUpdated > this.comboTimeoutMs) {
      this.activeCombos.delete(key);
      return null;
    }
    return combo;
  }

  public reset(senderId: string, recipientId: string, giftId: string) {
    const key = `${senderId}_${recipientId}_${giftId}`;
    this.activeCombos.delete(key);
  }
}

export const giftComboManager = new GiftComboManager();
