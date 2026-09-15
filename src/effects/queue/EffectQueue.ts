// MahaChat Client-Side Effect Priority Queue
// Ensures zero UI freeze, maintains Legendary > Epic > Rare > Common priority ordering,
// and gracefully manages concurrent gift/entrance events.

import { QueuedGiftEffect, VisualEffectModel } from '../types';
import { effectsSettings } from '../settings/EffectsSettingsManager';
import { effectAudio } from '../audio/EffectAudioPlayer';

type QueueListener = (currentEffect: QueuedGiftEffect | null, queueLength: number) => void;

class EffectQueueManager {
  private queue: QueuedGiftEffect[] = [];
  private currentPlaying: QueuedGiftEffect | null = null;
  private timer: any = null;
  private listeners: Set<QueueListener> = new Set();
  private maxQueueSize: number = 8; // Drop low-priority items if flooded

  public enqueue(
    effect: VisualEffectModel,
    details: {
      senderId: string;
      senderName: string;
      senderPhoto?: string;
      recipientId: string;
      recipientName: string;
      recipientPhoto?: string;
      seatIndex?: number | null;
      comboCount?: number;
    }
  ) {
    const settings = effectsSettings.getSettings();
    if (!settings.effectsEnabled) return;
    if (settings.giftAnimationLevel === 'off' && effect.effectType === 'gift') return;

    const queuedItem: QueuedGiftEffect = {
      id: `${effect.effectId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      effect,
      senderId: details.senderId,
      senderName: details.senderName,
      senderPhoto: details.senderPhoto,
      recipientId: details.recipientId,
      recipientName: details.recipientName,
      recipientPhoto: details.recipientPhoto,
      seatIndex: details.seatIndex,
      comboCount: details.comboCount || 1,
      timestamp: Date.now(),
      priority: effect.priority || 50
    };

    // If currently playing something of lower priority and new item is Legendary (priority >= 90),
    // we can finish previous fast or insert at head
    if (this.currentPlaying && queuedItem.priority >= 90 && this.currentPlaying.priority < 70) {
      // Fast forward the low-tier effect
      this.finishCurrent();
      this.queue.unshift(queuedItem);
    } else {
      // Priority-based insertion (higher priority first; for same priority, FIFO by timestamp)
      let insertIdx = this.queue.length;
      for (let i = 0; i < this.queue.length; i++) {
        if (queuedItem.priority > this.queue[i].priority) {
          insertIdx = i;
          break;
        }
      }
      this.queue.splice(insertIdx, 0, queuedItem);
    }

    // Trim queue if overwhelmed to protect device memory
    if (this.queue.length > this.maxQueueSize) {
      // Remove lowest priority items from the end
      this.queue = this.queue.slice(0, this.maxQueueSize);
    }

    this.notify();
    this.processNext();
  }

  private processNext() {
    if (this.currentPlaying) return; // Busy
    if (this.queue.length === 0) return;

    const next = this.queue.shift()!;
    this.currentPlaying = next;

    // Play sound if enabled
    const settings = effectsSettings.getSettings();
    if (settings.soundEnabled && next.effect.soundPreset) {
      effectAudio.playPreset(next.effect.soundPreset);
    }

    this.notify();

    // Determine duration based on Tier & User settings
    let displayDuration = next.effect.duration || 2500;
    if (settings.giftAnimationLevel === 'reduced') {
      displayDuration = Math.min(displayDuration, 1600);
    }

    this.timer = setTimeout(() => {
      this.finishCurrent();
    }, displayDuration);
  }

  public finishCurrent() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.currentPlaying = null;
    this.notify();
    // Schedule next immediately without blocking UI thread
    setTimeout(() => this.processNext(), 50);
  }

  public clear() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.queue = [];
    this.currentPlaying = null;
    this.notify();
  }

  public getCurrent(): QueuedGiftEffect | null {
    return this.currentPlaying;
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public subscribe(listener: QueueListener): () => void {
    this.listeners.add(listener);
    listener(this.currentPlaying, this.queue.length);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.currentPlaying, this.queue.length));
  }
}

export const effectQueue = new EffectQueueManager();
